package com.OriginHubs.Amraj.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.OriginHubs.Amraj.model.TicketAttachment;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    /**
     * Find all attachments for a specific ticket
     */
    List<TicketAttachment> findByTicketIdOrderByUploadedAtDesc(Long ticketId);

    /**
     * Find attachments by uploader
     */
    List<TicketAttachment> findByUploadedByOrderByUploadedAtDesc(String uploadedBy);

    /**
     * Find attachments by file type
     */
    List<TicketAttachment> findByFileTypeOrderByUploadedAtDesc(String fileType);

    /**
     * Count attachments for a ticket
     */
    long countByTicketId(Long ticketId);

    /**
     * Delete all attachments for a ticket
     */
    void deleteByTicketId(Long ticketId);
}
