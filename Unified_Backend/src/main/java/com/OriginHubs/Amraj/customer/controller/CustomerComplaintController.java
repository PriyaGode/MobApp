package com.OriginHubs.Amraj.customer.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.customer.dto.CustomerComplaintRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerComplaintResponse;
import com.OriginHubs.Amraj.model.SupportTicket;
import com.OriginHubs.Amraj.service.SupportTicketService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer/complaints")
public class CustomerComplaintController {

    private final SupportTicketService supportTicketService;

    public CustomerComplaintController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @PostMapping
    public ResponseEntity<CustomerComplaintResponse> createComplaint(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CustomerComplaintRequest request) {
        
        SupportTicket ticket = new SupportTicket();
        ticket.setUserId(userId);
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getMessage());
        ticket.setCategory(request.getCategory() != null ? request.getCategory() : "General");
        ticket.setRaisedByRole(SupportTicket.UserRole.CUSTOMER);

        SupportTicket createdTicket = supportTicketService.createTicket(ticket);

        CustomerComplaintResponse response = new CustomerComplaintResponse(
                createdTicket.getTicketNumber(),
                createdTicket.getSubject(),
                createdTicket.getDescription(),
                createdTicket.getStatus().toString(),
                createdTicket.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CustomerComplaintResponse>> getUserTickets(
            @RequestHeader("X-User-Id") String userId) {
        
        List<SupportTicket> tickets = supportTicketService.getTicketsByUserId(userId);
        
        List<CustomerComplaintResponse> responses = tickets.stream()
                .map(ticket -> new CustomerComplaintResponse(
                        ticket.getTicketNumber(),
                        ticket.getSubject(),
                        ticket.getDescription(),
                        ticket.getStatus().toString(),
                        ticket.getCreatedAt()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
}