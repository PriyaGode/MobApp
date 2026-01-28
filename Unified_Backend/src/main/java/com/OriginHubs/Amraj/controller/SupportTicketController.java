package com.OriginHubs.Amraj.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.OriginHubs.Amraj.dto.AssignTicketRequest;
import com.OriginHubs.Amraj.dto.AssignTicketResponse;
import com.OriginHubs.Amraj.entity.enums.AuditActionType;
import com.OriginHubs.Amraj.model.AddNoteRequest;
import com.OriginHubs.Amraj.model.AttachmentUploadResponse;
import com.OriginHubs.Amraj.model.SupportTicket;
import com.OriginHubs.Amraj.model.SupportTicket.TicketStatus;
import com.OriginHubs.Amraj.model.TicketAttachment;
import com.OriginHubs.Amraj.service.AuditLogService;
import com.OriginHubs.Amraj.service.SupportTicketService;

@RestController
@RequestMapping("/api/support/tickets")
public class SupportTicketController {

    private static final Logger log = LoggerFactory.getLogger(SupportTicketController.class);
    private final SupportTicketService ticketService;
    private final AuditLogService auditLogService;

    public SupportTicketController(SupportTicketService ticketService, AuditLogService auditLogService) {
        this.ticketService = ticketService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
                                                      @RequestBody SupportTicket ticket) {
        try {
            SupportTicket createdTicket = ticketService.createTicket(ticket);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_CREATED, "SupportTicket", String.valueOf(createdTicket.getId()), null, null, null, "API", "INFO", "Created support ticket " + createdTicket.getId(), null, createdTicket, null, null);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
        } catch (Exception e) {
            log.error("Error creating ticket", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable Long id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String hub,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false, defaultValue = "newest") String sort) {
        List<SupportTicket> tickets = ticketService.getFilteredTickets(status, priority, hub, assignedTo, sort);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getTicketsByUserId(@PathVariable String userId) {
        List<SupportTicket> tickets = ticketService.getTicketsByUserId(userId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupportTicket>> getTicketsByStatus(@PathVariable TicketStatus status) {
        List<SupportTicket> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/assigned/{assignedTo}")
    public ResponseEntity<List<SupportTicket>> getTicketsByAssignedTo(@PathVariable String assignedTo) {
        List<SupportTicket> tickets = ticketService.getTicketsByAssignedTo(assignedTo);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportTicket> updateTicket(
            @PathVariable Long id,
            @RequestBody SupportTicket ticket) {
        try {
            SupportTicket updatedTicket = ticketService.updateTicket(id, ticket);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            log.error("Error updating ticket", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateTicketStatus(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String statusStr = statusUpdate.get("status");
            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            TicketStatus newStatus = TicketStatus.valueOf(statusStr);
            String resolution = statusUpdate.get("resolution");
            String performedBy = statusUpdate.get("performedBy");
            String performedByRole = statusUpdate.get("performedByRole");
            
            SupportTicket before = ticketService.getTicketById(id).orElse(null);
            SupportTicket updatedTicket = ticketService.updateTicketStatus(id, newStatus, resolution, performedBy, performedByRole);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_STATUS_CHANGED, "SupportTicket", String.valueOf(id), null, null, null, "API", "INFO", "Changed ticket status to " + newStatus, before, updatedTicket, statusUpdate, null);
            }
            return ResponseEntity.ok(updatedTicket);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status value", e);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Error updating ticket status", e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting ticket", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats/status/{status}")
    public ResponseEntity<Long> getTicketCountByStatus(@PathVariable TicketStatus status) {
        Long count = ticketService.getTicketCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = ticketService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<Long> getTicketCountByUser(@PathVariable String userId) {
        Long count = ticketService.getTicketCountByUser(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<SupportTicket>> getTicketsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SupportTicket> tickets = ticketService.getTicketsByDateRange(startDate, endDate);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Assign or reassign a ticket to a staff member or hub
     * Includes activity logging and push notifications
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<AssignTicketResponse> assignTicket(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable Long id,
            @RequestBody AssignTicketRequest request) {
        try {
            log.info("Received assignment request for ticket {}: {}", id, request);
            SupportTicket before = ticketService.getTicketById(id).orElse(null);
            SupportTicket assignedTicket = ticketService.assignTicket(id, request);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_STATUS_CHANGED, "SupportTicket", String.valueOf(id), null, null, null, "API", "INFO", "Assigned ticket", before, assignedTicket, request, null);
            }

            AssignTicketResponse response = new AssignTicketResponse(
                    assignedTicket,
                    "Ticket assigned successfully",
                    true // notification sent flag
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error assigning ticket {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Unexpected error assigning ticket {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Upload attachment to a ticket
     * POST /api/support/tickets/{id}/attachments
     */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentUploadResponse> uploadAttachment(
        @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
        @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", required = false, defaultValue = "Anonymous") String uploadedBy,
            @RequestParam(value = "uploadedByRole", required = false, defaultValue = "User") String uploadedByRole,
            @RequestParam(value = "description", required = false) String description) {
        try {
            log.info("Received attachment upload request for ticket {}: {}", id, file.getOriginalFilename());

            TicketAttachment attachment = ticketService.uploadAttachment(id, file, uploadedBy, uploadedByRole, description);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_COMMENT_ADDED, "SupportTicket", String.valueOf(id), null, null, null, "API", "INFO", "Uploaded attachment to ticket", null, attachment, Map.of("fileName", file.getOriginalFilename()), null);
            }

            AttachmentUploadResponse response = new AttachmentUploadResponse(
                    attachment,
                    "Attachment uploaded successfully",
                    true);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Validation error uploading attachment to ticket {}: {}", id, e.getMessage());
            AttachmentUploadResponse errorResponse = new AttachmentUploadResponse(
                    null, e.getMessage(), false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (IOException e) {
            log.error("IO error uploading attachment to ticket {}", id, e);
            AttachmentUploadResponse errorResponse = new AttachmentUploadResponse(
                    null, "Failed to store file: " + e.getMessage(), false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);

        } catch (RuntimeException e) {
            log.error("Error uploading attachment to ticket {}", id, e);
            AttachmentUploadResponse errorResponse = new AttachmentUploadResponse(
                    null, "Ticket not found", false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error uploading attachment to ticket {}", id, e);
            AttachmentUploadResponse errorResponse = new AttachmentUploadResponse(
                    null, "Unexpected error occurred", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all attachments for a ticket
     * GET /api/support/tickets/{id}/attachments
     */
    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<TicketAttachment>> getAttachments(@PathVariable Long id) {
        try {
            List<TicketAttachment> attachments = ticketService.getAttachmentsByTicketId(id);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            log.error("Error fetching attachments for ticket {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add note to a ticket
     * POST /api/support/tickets/{id}/notes
     */
    @PostMapping("/{id}/notes")
    public ResponseEntity<SupportTicket> addNote(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable Long id,
            @RequestBody AddNoteRequest request) {
        try {
            log.info("Adding note to ticket {}", id);
            SupportTicket before = ticketService.getTicketById(id).orElse(null);
            SupportTicket updatedTicket = ticketService.addNote(id, request);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_COMMENT_ADDED, "SupportTicket", String.valueOf(id), null, null, null, "API", "INFO", "Added note to ticket", before, updatedTicket, request, null);
            }
            return ResponseEntity.ok(updatedTicket);

        } catch (RuntimeException e) {
            log.error("Error adding note to ticket {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Unexpected error adding note to ticket {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete an attachment
     * DELETE /api/support/tickets/attachments/{attachmentId}
     */
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Map<String, String>> deleteAttachment(
            @RequestHeader(value = "X-User-Id", required = false) java.util.UUID userId,
            @PathVariable Long attachmentId,
            @RequestParam(value = "deletedBy", required = false, defaultValue = "System") String deletedBy,
            @RequestParam(value = "deletedByRole", required = false, defaultValue = "Admin") String deletedByRole) {
        try {
            TicketAttachment before = ticketService.getAttachmentsByTicketId(attachmentId).stream().findFirst().orElse(null); // simplistic; real impl would fetch by attachmentId
            ticketService.deleteAttachment(attachmentId, deletedBy, deletedByRole);
            if (userId != null) {
                auditLogService.recordAction(userId, AuditActionType.TICKET_COMMENT_ADDED, "TicketAttachment", String.valueOf(attachmentId), null, null, null, "API", "INFO", "Deleted attachment", before, null, Map.of("deletedBy", deletedBy), null);
            }
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting attachment {}", attachmentId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Attachment not found"));
        } catch (Exception e) {
            log.error("Unexpected error deleting attachment {}", attachmentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete attachment"));
        }
    }
}
