package com.OriginHubs.Amraj.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.model.SupportTicket;
import com.OriginHubs.Amraj.model.SupportTicket.TicketPriority;
import com.OriginHubs.Amraj.model.SupportTicket.TicketStatus;
import com.OriginHubs.Amraj.model.SupportTicket.UserRole;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.repository.SupportTicketRepository;
import com.OriginHubs.Amraj.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/support/dev")
@CrossOrigin(origins = "*")
public class DevelopmentDataController {

    private static final Logger log = LoggerFactory.getLogger(DevelopmentDataController.class);
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    @PersistenceContext
    private EntityManager entityManager;

    public DevelopmentDataController(SupportTicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/migrate-statuses")
    @Transactional
    public ResponseEntity<String> migrateOldStatuses() {
        try {
            log.info("Starting status migration...");

            // Update PENDING tickets to IN_PROGRESS
            int pendingUpdated = entityManager.createNativeQuery(
                    "UPDATE support_tickets SET status = 'IN_PROGRESS' WHERE status = 'PENDING'").executeUpdate();

            // Update RESOLVED tickets to CLOSED
            int resolvedUpdated = entityManager.createNativeQuery(
                    "UPDATE support_tickets SET status = 'CLOSED', resolved_at = updated_at WHERE status = 'RESOLVED' AND resolved_at IS NULL")
                    .executeUpdate();

            int resolvedAlreadySet = entityManager.createNativeQuery(
                    "UPDATE support_tickets SET status = 'CLOSED' WHERE status = 'RESOLVED'").executeUpdate();

            String message = String.format(
                    "Migration complete: %d PENDING → IN_PROGRESS, %d RESOLVED → CLOSED",
                    pendingUpdated, resolvedUpdated + resolvedAlreadySet);

            log.info(message);
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("Failed to migrate statuses", e);
            return ResponseEntity.internalServerError()
                    .body("Migration failed: " + e.getMessage());
        }
    }

    @PostMapping("/generate-tickets")
    public ResponseEntity<String> generateDummyTickets() {
        try {
            // Get all users from database
            List<User> allUsers = userRepository.findAll();
            
            if (allUsers.isEmpty()) {
                return ResponseEntity.badRequest().body("No users found in database. Please create users first.");
            }
            
            log.info("Found {} users in database", allUsers.size());
            
            List<SupportTicket> tickets = new ArrayList<>();

            // Sample support staff
            String[] staffIds = { "support_001", "support_002", "support_003", "support_004" };
            String[] staffNames = { "Support Agent A", "Support Agent B", "Support Agent C", "Support Agent D" };

            // Sample hubs
            String[] hubs = { "Dallas", "Houston", "Austin", "Miami", "Phoenix", "Denver" };

            // Sample categories
            String[] categories = { "Order Issue", "Delivery Problem", "Payment Issue", "Product Quality",
                    "Account Help", "Technical Support", "Refund Request", "General Inquiry" };

            // Sample subjects and descriptions
            String[][] ticketData = {
                    { "Order not delivered",
                            "I ordered product #12345 three days ago but it hasn't arrived yet. The tracking shows 'Out for Delivery' since yesterday." },
                    { "Wrong item received",
                            "I received a different product than what I ordered. Order #67890 was supposed to be a blue shirt but I got a red one." },
                    { "Payment deducted twice",
                            "My credit card was charged twice for order #11223. Please refund the duplicate charge immediately." },
                    { "Damaged product",
                            "The product arrived damaged. The box was crushed and the item inside is broken. I need a replacement." },
                    { "Account locked",
                            "I can't log into my account. It says 'Account temporarily locked'. Please help me unlock it." },
                    { "App crashing",
                            "The mobile app keeps crashing when I try to place an order. Using iPhone 12 with latest iOS." },
                    { "Refund not received",
                            "I returned a product 10 days ago but haven't received my refund yet. Order #44556." },
                    { "Delivery address wrong",
                            "The delivery partner delivered to the wrong address. I called but they couldn't locate my package." },
                    { "Coupon code not working",
                            "I have a coupon code SAVE20 but it's not applying at checkout. The code should be valid until next month." },
                    { "Missing items in order",
                            "Order #77889 was supposed to have 3 items but only 2 were delivered. One item is missing." },
                    { "Hub not responding",
                            "I'm a delivery partner and the Delhi hub is not answering calls. Need urgent support." },
                    { "Payment not reflecting",
                            "Made a payment 2 hours ago but it's not showing in my account. Transaction ID: TXN123456." },
                    { "Product description mismatch",
                            "The product I received doesn't match the description on the website. Size and color are different." },
                    { "Unable to cancel order",
                            "I'm trying to cancel order #99887 but the cancel button is greyed out. Order is still in 'Processing' status." },
                    { "Delivery delayed",
                            "Order #55443 was promised for 2-day delivery but it's been 5 days now. Please expedite." },
                    { "Hub inventory issue",
                            "Hub Admin here - we have inventory mismatch for product SKU-7766. System shows 50 but we only have 30." },
                    { "COD option not available",
                            "Cash on Delivery option is not showing for my location even though you service this area." },
                    { "Return pickup not scheduled",
                            "I initiated a return 3 days ago but pickup hasn't been scheduled yet. Return ID: RET-9988." },
                    { "Bonus not credited",
                            "Delivery Partner here - My performance bonus for last month hasn't been credited to my account." },
                    { "App not loading orders",
                            "The orders section in the app is not loading. It just shows a blank screen." }
            };

            // Generate 50 tickets
            for (int i = 0; i < 50; i++) {
                SupportTicket ticket = new SupportTicket();

                // Randomly select a user from database
                User randomUser = allUsers.get(random.nextInt(allUsers.size()));
                ticket.setUserId(String.valueOf(randomUser.getId()));
                ticket.setRaisedByName(randomUser.getFullName());
                
                // Map user role to ticket UserRole enum
                if (randomUser.getRole() != null) {
                    try {
                        ticket.setRaisedByRole(UserRole.valueOf(randomUser.getRole().toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        ticket.setRaisedByRole(UserRole.CUSTOMER);
                    }
                } else {
                    ticket.setRaisedByRole(UserRole.CUSTOMER);
                }
                ticket.setRaisedByLocation(null);

                // Random ticket data
                int dataIndex = random.nextInt(ticketData.length);
                ticket.setSubject(ticketData[dataIndex][0]);
                ticket.setDescription(ticketData[dataIndex][1]);

                // Random category
                ticket.setCategory(categories[random.nextInt(categories.length)]);

                // Random hub
                ticket.setHubRegion(hubs[random.nextInt(hubs.length)]);

                // Random priority
                TicketPriority[] priorities = TicketPriority.values();
                ticket.setPriority(priorities[random.nextInt(priorities.length)]);

                // Random status with weighted distribution: OPEN → IN_PROGRESS → CLOSED
                int statusRand = random.nextInt(100);
                if (statusRand < 35) {
                    ticket.setStatus(TicketStatus.OPEN);
                } else if (statusRand < 70) {
                    ticket.setStatus(TicketStatus.IN_PROGRESS);
                    // Assign to support staff
                    int staffIndex = random.nextInt(staffIds.length);
                    ticket.setAssignedTo(staffIds[staffIndex]);
                    ticket.setAssignedToName(staffNames[staffIndex]);
                } else {
                    ticket.setStatus(TicketStatus.CLOSED);
                    int staffIndex = random.nextInt(staffIds.length);
                    ticket.setAssignedTo(staffIds[staffIndex]);
                    ticket.setAssignedToName(staffNames[staffIndex]);
                    ticket.setResolution("Issue resolved and closed. " + getRandomResolution());
                    ticket.setResolvedAt(LocalDateTime.now().minusDays(random.nextInt(10)));
                }

                // Random timestamps (last 30 days)
                int daysAgo = random.nextInt(30);
                LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo).minusHours(random.nextInt(24));
                ticket.setCreatedAt(createdAt);
                ticket.setUpdatedAt(LocalDateTime.now().minusDays(random.nextInt(daysAgo + 1)));

                // Add notes for some tickets
                if (random.nextBoolean() && ticket.getStatus() != TicketStatus.OPEN) {
                    StringBuilder notes = new StringBuilder();
                    notes.append(String.format("[%s - %s] %s\n",
                            createdAt.plusHours(2).toString(),
                            staffNames[random.nextInt(staffNames.length)],
                            getRandomNote()));

                    if (random.nextBoolean()) {
                        notes.append(String.format("[%s - %s] %s\n",
                                createdAt.plusHours(5).toString(),
                                staffNames[random.nextInt(staffNames.length)],
                                getRandomNote()));
                    }

                    ticket.setNotes(notes.toString());
                }

                tickets.add(ticket);
            }

            ticketRepository.saveAll(tickets);

            log.info("Generated {} dummy tickets successfully", tickets.size());
            return ResponseEntity.ok("Successfully generated " + tickets.size() + " dummy tickets");

        } catch (Exception e) {
            log.error("Error generating dummy tickets", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/clear-tickets")
    public ResponseEntity<String> clearAllTickets() {
        try {
            ticketRepository.deleteAll();
            log.info("Cleared all tickets from database");
            return ResponseEntity.ok("All tickets cleared successfully");
        } catch (Exception e) {
            log.error("Error clearing tickets", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    private String getRandomResolution() {
        String[] resolutions = {
                "Customer contacted and issue explained.",
                "Refund processed successfully.",
                "Replacement order placed and dispatched.",
                "Account issue fixed by technical team.",
                "Delivery partner notified and corrective action taken.",
                "Coupon code issue resolved - code reactivated.",
                "Payment verification completed and confirmed.",
                "Hub inventory updated and reconciled."
        };
        return resolutions[random.nextInt(resolutions.length)];
    }

    private String getRandomNote() {
        String[] notes = {
                "Contacted customer via phone - no response.",
                "Escalated to senior support team.",
                "Waiting for warehouse confirmation.",
                "Customer requested callback tomorrow.",
                "Issue requires technical team review.",
                "Hub manager notified about the issue.",
                "Refund initiated - will reflect in 3-5 days.",
                "Replacement order created successfully.",
                "Customer confirmed issue is resolved.",
                "Following up with delivery partner."
        };
        return notes[random.nextInt(notes.length)];
    }
}
