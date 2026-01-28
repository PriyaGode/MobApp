package com.OriginHubs.Amraj.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    // Maximum file size: 10MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    // Allowed file types
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
            "application/pdf");

    /**
     * Get human-readable file size
     */
    public static String getReadableFileSize(long size) {
        if (size < 1024)
            return size + " B";
        int exp = (int) (Math.log(size) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.2f %sB", size / Math.pow(1024, exp), pre);
    }

    @Value("${file.upload.dir:uploads/tickets}")
    private String uploadDir;

    @Value("${file.upload.base-url:http://localhost:8080/uploads/tickets}")
    private String baseUrl;

    /**
     * Store uploaded file and return the file URL
     */
    public String storeFile(MultipartFile file, Long ticketId) throws IOException {
        // Validate file
        validateFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, String.valueOf(ticketId));
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Store file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        logger.info("File stored successfully: {} for ticket: {}", uniqueFilename, ticketId);

        // Return file URL
        return baseUrl + "/" + ticketId + "/" + uniqueFilename;
    }

    /**
     * Validate file size and type
     */
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds maximum limit of 10MB. File size: %.2f MB",
                            file.getSize() / (1024.0 * 1024.0)));
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File type cannot be determined");
        }

        if (!isAllowedFileType(contentType)) {
            throw new IllegalArgumentException(
                    "File type not allowed. Only images (JPEG, PNG, GIF, WebP) and PDF documents are supported. " +
                            "Uploaded type: " + contentType);
        }

        logger.info("File validation passed: {} ({})", file.getOriginalFilename(), contentType);
    }

    /**
     * Delete file from storage
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract relative path from URL
            String relativePath = fileUrl.replace(baseUrl + "/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: {}", fileUrl);
            } else {
                logger.warn("File not found for deletion: {}", fileUrl);
            }
        } catch (IOException e) {
            logger.error("Error deleting file: {}", fileUrl, e);
            throw new RuntimeException("Failed to delete file: " + fileUrl, e);
        }
    }

    /**
     * Check if file type is allowed
     */
    private boolean isAllowedFileType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase()) ||
                ALLOWED_DOCUMENT_TYPES.contains(contentType.toLowerCase());
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }

    /**
     * TODO: Integrate with cloud storage (AWS S3, Azure Blob, Google Cloud Storage)
     * 
     * Example for AWS S3:
     * 1. Add AWS SDK dependency to pom.xml
     * 2. Configure AWS credentials
     * 3. Use AmazonS3 client to upload files
     * 4. Return S3 object URL
     * 
     * Example for Azure Blob:
     * 1. Add Azure Storage SDK dependency
     * 2. Configure Azure Storage connection string
     * 3. Use BlobServiceClient to upload files
     * 4. Return Blob URL
     */
}
