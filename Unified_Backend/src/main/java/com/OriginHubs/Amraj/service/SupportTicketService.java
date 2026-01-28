package com.OriginHubs.Amraj.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.OriginHubs.Amraj.dto.AssignTicketRequest;
import com.OriginHubs.Amraj.model.AddNoteRequest;
import com.OriginHubs.Amraj.model.SupportTicket;
import com.OriginHubs.Amraj.model.SupportTicket.TicketPriority;
import com.OriginHubs.Amraj.model.SupportTicket.TicketStatus;
import com.OriginHubs.Amraj.model.TicketAttachment;
import com.OriginHubs.Amraj.repository.SupportTicketRepository;
import com.OriginHubs.Amraj.repository.TicketAttachmentRepository;

@Service
public class SupportTicketService {

    private static final Logger log = LoggerFactory.getLogger(SupportTicketService.class);
    private final SupportTicketRepository ticketRepository;
    private final TicketActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;
    private final TicketAttachmentRepository attachmentRepository;

    public SupportTicketService(
            SupportTicketRepository ticketRepository,
            TicketActivityLogService activityLogService,
            NotificationService notificationService,
            FileStorageService fileStorageService,
            TicketAttachmentRepository attachmentRepository) {
        this.ticketRepository = ticketRepository;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
        this.attachmentRepository = attachmentRepository;
    }

    @Transactional
    public SupportTicket createTicket(SupportTicket ticket) {
        log.info("Creating new support ticket for user: {}", ticket.getUserId());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        // Generate ticket number using count + 1
        long count = ticketRepository.count() + 1;
        ticket.setTicketNumber(String.format("TK-%05d", count));
        
        return ticketRepository.save(ticket);
    }

    public Optional<SupportTicket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(SupportTicket::getUpdatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<SupportTicket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<SupportTicket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status)
                .stream()
                .sorted(Comparator.comparing(SupportTicket::getUpdatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<SupportTicket> getTicketsByAssignedTo(String assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo)
                .stream()
                .sorted(Comparator.comparing(SupportTicket::getUpdatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long id, TicketStatus newStatus) {
        return updateTicketStatus(id, newStatus, null, null, null);
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long id, TicketStatus newStatus, String resolution, String performedBy, String performedByRole) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        // If closing the ticket and resolution is provided, archive old resolution and set new one
        if (newStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (resolution != null && !resolution.trim().isEmpty()) {
                // Archive current resolution to history before setting new one
                archiveResolution(ticket, performedBy, performedByRole);
                ticket.setResolution(resolution);
            }
        }
        
        // If reopening a closed ticket, clear current resolution but keep history
        if (oldStatus == TicketStatus.CLOSED && newStatus != TicketStatus.CLOSED) {
            // Don't clear resolution - keep it visible as the last resolution
            // It's already in history from when it was closed
            ticket.setResolvedAt(null);
        }

        SupportTicket savedTicket = ticketRepository.save(ticket);

        // Log status change activity
        activityLogService.logStatusChange(
                id,
                performedBy != null ? performedBy : "System",
                performedByRole,
                oldStatus.toString(),
                newStatus.toString(),
                resolution != null ? "Resolution: " + resolution : null
        );

        log.info("Updated ticket {} status from {} to {}", id, oldStatus, newStatus);
        return savedTicket;
    }

    /**
     * Archive the current resolution to resolution history
     */
    private void archiveResolution(SupportTicket ticket, String performedBy, String performedByRole) {
        String currentResolution = ticket.getResolution();
        if (currentResolution == null || currentResolution.trim().isEmpty()) {
            return;
        }

        // Build resolution history entry
        String timestamp = ticket.getResolvedAt() != null 
            ? ticket.getResolvedAt().toString() 
            : LocalDateTime.now().toString();
        String resolver = performedBy != null ? performedBy : "System";
        String role = performedByRole != null ? performedByRole : "Unknown";
        
        // Format: [timestamp|resolver|role] resolution text
        String historyEntry = String.format("[%s|%s|%s] %s", 
            timestamp, resolver, role, currentResolution);

        // Append to existing history
        String existingHistory = ticket.getResolutionHistory();
        if (existingHistory == null || existingHistory.trim().isEmpty()) {
            ticket.setResolutionHistory(historyEntry);
        } else {
            ticket.setResolutionHistory(existingHistory + "\n###RESOLUTION_SEPARATOR###\n" + historyEntry);
        }

        log.info("Archived resolution for ticket {}", ticket.getId());
    }

    @Transactional
    public SupportTicket updateTicket(Long id, SupportTicket updatedTicket) {
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        if (updatedTicket.getSubject() != null) {
            ticket.setSubject(updatedTicket.getSubject());
        }
        if (updatedTicket.getDescription() != null) {
            ticket.setDescription(updatedTicket.getDescription());
        }
        if (updatedTicket.getStatus() != null) {
            ticket.setStatus(updatedTicket.getStatus());
        }
        if (updatedTicket.getPriority() != null) {
            ticket.setPriority(updatedTicket.getPriority());
        }
        if (updatedTicket.getCategory() != null) {
            ticket.setCategory(updatedTicket.getCategory());
        }
        if (updatedTicket.getAssignedTo() != null) {
            ticket.setAssignedTo(updatedTicket.getAssignedTo());
        }
        if (updatedTicket.getResolution() != null) {
            ticket.setResolution(updatedTicket.getResolution());
        }

        ticket.setUpdatedAt(LocalDateTime.now());

        log.info("Updated ticket {}", id);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("Ticket not found with id: " + id);
        }
        log.info("Deleting ticket {}", id);
        ticketRepository.deleteById(id);
    }

    public Long getTicketCountByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }

    public Long getTicketCountByUser(String userId) {
        return ticketRepository.countByUserId(userId);
    }

    public List<SupportTicket> getTicketsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return ticketRepository.findByCreatedAtBetween(startDate, endDate);
    }

    public List<SupportTicket> getFilteredTickets(String status, String priority, String hub, String assignedTo,
            String sort) {
        List<SupportTicket> tickets = ticketRepository.findAll();

        // Apply filters
        if (status != null && !status.isEmpty()) {
            TicketStatus ticketStatus = TicketStatus.valueOf(status.toUpperCase());
            tickets = tickets.stream()
                    .filter(t -> t.getStatus() == ticketStatus)
                    .collect(Collectors.toList());
        }

        if (priority != null && !priority.isEmpty()) {
            TicketPriority ticketPriority = TicketPriority.valueOf(priority.toUpperCase());
            tickets = tickets.stream()
                    .filter(t -> t.getPriority() == ticketPriority)
                    .collect(Collectors.toList());
        }

        if (hub != null && !hub.isEmpty()) {
            tickets = tickets.stream()
                    .filter(t -> t.getHubRegion() != null && t.getHubRegion().equalsIgnoreCase(hub))
                    .collect(Collectors.toList());
        }

        if (assignedTo != null && !assignedTo.isEmpty()) {
            tickets = tickets.stream()
                    .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().equalsIgnoreCase(assignedTo))
                    .collect(Collectors.toList());
        }

        // Apply sorting - use updatedAt for "newest" to track changes, createdAt for "oldest"
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "newest":
                    // Sort by updatedAt first (to show recently modified tickets at top), then by createdAt
                    tickets.sort(Comparator
                        .comparing((SupportTicket t) -> t.getUpdatedAt() != null ? t.getUpdatedAt() : t.getCreatedAt())
                        .reversed());
                    break;
                case "oldest":
                    tickets.sort(Comparator.comparing(SupportTicket::getCreatedAt));
                    break;
                case "priority":
                    // HIGH > URGENT > MEDIUM > LOW
                    tickets.sort((t1, t2) -> {
                        int p1 = getPriorityOrder(t1.getPriority());
                        int p2 = getPriorityOrder(t2.getPriority());
                        return Integer.compare(p2, p1); // Descending
                    });
                    break;
                default:
                    // Default to newest (by updatedAt)
                    tickets.sort(Comparator
                        .comparing((SupportTicket t) -> t.getUpdatedAt() != null ? t.getUpdatedAt() : t.getCreatedAt())
                        .reversed());
            }
        } else {
            // If no sort specified, default to newest (by updatedAt)
            tickets.sort(Comparator
                .comparing((SupportTicket t) -> t.getUpdatedAt() != null ? t.getUpdatedAt() : t.getCreatedAt())
                .reversed());
        }

        return tickets;
    }

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("open", ticketRepository.countByStatus(TicketStatus.OPEN));
        stats.put("inProgress", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        stats.put("closed", ticketRepository.countByStatus(TicketStatus.CLOSED));
        stats.put("total", ticketRepository.count());
        return stats;
    }

    /**
     * Assign or reassign a ticket with full audit logging and notifications
     */
    @Transactional
    public SupportTicket assignTicket(Long ticketId, AssignTicketRequest request) {
        log.info("Assigning ticket {} to {}", ticketId, request.getAssignedTo());

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        String oldAssignee = ticket.getAssignedTo();
        String oldPriority = ticket.getPriority() != null ? ticket.getPriority().toString() : null;

        boolean isReassignment = oldAssignee != null && !oldAssignee.isEmpty();
        boolean priorityChanged = request.getPriority() != null &&
                !request.getPriority().equals(ticket.getPriority());

        // Update ticket
        ticket.setAssignedTo(request.getAssignedTo());

        // Update assignedToName if provided
        if (request.getAssignedToName() != null && !request.getAssignedToName().isEmpty()) {
            ticket.setAssignedToName(request.getAssignedToName());
        }

        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }

        // Update status to IN_PROGRESS if it's OPEN
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);

            // Log status change
            activityLogService.logStatusChange(
                    ticketId,
                    request.getPerformedBy() != null ? request.getPerformedBy() : "System",
                    request.getPerformedByRole(),
                    "OPEN",
                    "IN_PROGRESS",
                    "Status changed due to assignment");
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        SupportTicket savedTicket = ticketRepository.save(ticket);

        // Log assignment activity
        activityLogService.logAssignment(
                ticketId,
                request.getPerformedBy() != null ? request.getPerformedBy() : "System",
                request.getPerformedByRole(),
                oldAssignee,
                request.getAssignedTo(),
                request.getComment());

        // Log priority change if it occurred
        if (priorityChanged) {
            activityLogService.logPriorityChange(
                    ticketId,
                    request.getPerformedBy() != null ? request.getPerformedBy() : "System",
                    request.getPerformedByRole(),
                    oldPriority,
                    request.getPriority().toString(),
                    request.getComment());
        }

        // Send notifications
        try {
            if (isReassignment) {
                notificationService.sendReassignmentNotification(
                        savedTicket,
                        request.getAssignedTo(),
                        oldAssignee,
                        request.getPerformedBy() != null ? request.getPerformedBy() : "System",
                        request.getComment());
            } else {
                notificationService.sendAssignmentNotification(
                        savedTicket,
                        request.getAssignedTo(),
                        request.getPerformedBy() != null ? request.getPerformedBy() : "System");
            }

            // Notify about priority change if applicable
            if (priorityChanged) {
                notificationService.sendPriorityChangeNotification(
                        savedTicket,
                        request.getAssignedTo(),
                        oldPriority,
                        request.getPriority().toString());
            }
        } catch (Exception e) {
            log.error("Failed to send notification for ticket assignment: {}", ticketId, e);
            // Continue even if notification fails
        }

        log.info("Ticket {} successfully assigned to {}", ticketId, request.getAssignedTo());
        return savedTicket;
    }

    /**
     * Upload attachment to a ticket
     */
    @Transactional
    public TicketAttachment uploadAttachment(
            Long ticketId,
            MultipartFile file,
            String uploadedBy,
            String uploadedByRole,
            String description) throws IOException {

        log.info("Uploading attachment to ticket: {}", ticketId);

        // Verify ticket exists
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // Validate and store file
        fileStorageService.validateFile(file);
        String fileUrl = fileStorageService.storeFile(file, ticketId);

        // Create attachment record
        TicketAttachment attachment = new TicketAttachment(
                ticketId,
                file.getOriginalFilename(),
                fileUrl,
                file.getContentType(),
                file.getSize(),
                uploadedBy,
                uploadedByRole);
        attachment.setDescription(description);

        TicketAttachment savedAttachment = attachmentRepository.save(attachment);

        // Log activity
        activityLogService.logAttachmentAdded(
                ticketId,
                uploadedBy,
                uploadedByRole,
                file.getOriginalFilename(),
                FileStorageService.getReadableFileSize(file.getSize()));

        // Update ticket's updatedAt timestamp
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        log.info("Attachment uploaded successfully: {} for ticket: {}",
                file.getOriginalFilename(), ticketId);

        return savedAttachment;
    }

    /**
     * Add note to a ticket
     */
    @Transactional
    public SupportTicket addNote(Long ticketId, AddNoteRequest request) {
        log.info("Adding note to ticket: {}", ticketId);

        // Verify ticket exists
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        // Append note to existing notes
        String existingNotes = ticket.getNotes() != null ? ticket.getNotes() : "";
        String timestamp = LocalDateTime.now().toString();
        String newNote = String.format("[%s] %s (%s): %s\n",
                timestamp,
                request.getPerformedBy(),
                request.getPerformedByRole(),
                request.getNote());

        ticket.setNotes(existingNotes + newNote);
        ticket.setUpdatedAt(LocalDateTime.now());

        SupportTicket savedTicket = ticketRepository.save(ticket);

        // Log activity
        activityLogService.logNoteAdded(
                ticketId,
                request.getPerformedBy(),
                request.getPerformedByRole(),
                request.getNote());

        log.info("Note added successfully to ticket: {}", ticketId);

        return savedTicket;
    }

    /**
     * Get all attachments for a ticket
     */
    public List<TicketAttachment> getAttachmentsByTicketId(Long ticketId) {
        return attachmentRepository.findByTicketIdOrderByUploadedAtDesc(ticketId);
    }

    /**
     * Delete an attachment
     */
    @Transactional
    public void deleteAttachment(Long attachmentId, String deletedBy, String deletedByRole) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found with id: " + attachmentId));

        // Delete file from storage
        try {
            fileStorageService.deleteFile(attachment.getFileUrl());
        } catch (Exception e) {
            log.error("Failed to delete file from storage: {}", attachment.getFileUrl(), e);
        }

        // Delete attachment record
        attachmentRepository.deleteById(attachmentId);

        // Log activity
        activityLogService.logAttachmentAdded(
                attachment.getTicketId(),
                deletedBy,
                deletedByRole,
                "Deleted: " + attachment.getFileName(),
                "");

        log.info("Attachment deleted successfully: {}", attachmentId);
    }

    private int getPriorityOrder(TicketPriority priority) {
        switch (priority) {
            case URGENT:
                return 4;
            case HIGH:
                return 3;
            case MEDIUM:
                return 2;
            case LOW:
                return 1;
            default:
                return 0;
        }
    }
}
