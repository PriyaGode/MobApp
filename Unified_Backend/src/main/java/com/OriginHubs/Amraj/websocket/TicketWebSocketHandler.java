package com.OriginHubs.Amraj.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class TicketWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(TicketWebSocketHandler.class);
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        log.info("WebSocket connection established: {}", sessionId);

        // Send welcome message
        Map<String, Object> welcomeMessage = Map.of(
                "type", "connection",
                "status", "connected",
                "sessionId", sessionId,
                "message", "Connected to support ticket updates");
        sendMessage(session, welcomeMessage);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        log.info("WebSocket connection closed: {} with status: {}", sessionId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error for session {}", session.getId(), exception);
        session.close(CloseStatus.SERVER_ERROR);
    }

    /**
     * Broadcast a ticket update to all connected clients
     */
    public void broadcastTicketUpdate(Long ticketId, String updateType, Object ticketData) {
        Map<String, Object> updateMessage = Map.of(
                "type", "ticket_update",
                "updateType", updateType,
                "ticketId", ticketId,
                "data", ticketData,
                "timestamp", System.currentTimeMillis());

        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    sendMessage(session, updateMessage);
                }
            } catch (IOException e) {
                log.error("Error broadcasting to session {}", session.getId(), e);
            }
        });
    }

    /**
     * Send a message to a specific user's sessions
     */
    public void sendToUser(String userId, Object messageData) {
        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    sendMessage(session, messageData);
                }
            } catch (IOException e) {
                log.error("Error sending to user session {}", session.getId(), e);
            }
        });
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("Received message from {}: {}", session.getId(), payload);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> messageData = objectMapper.readValue(payload, Map.class);
            String messageType = (String) messageData.get("type");

            switch (messageType) {
                case "subscribe":
                    handleSubscribe(session, messageData);
                    break;
                case "unsubscribe":
                    handleUnsubscribe(session, messageData);
                    break;
                case "ping":
                    handlePing(session);
                    break;
                default:
                    log.warn("Unknown message type: {}", messageType);
            }
        } catch (Exception e) {
            log.error("Error handling message", e);
            Map<String, Object> errorMessage = Map.of(
                    "type", "error",
                    "message", "Invalid message format");
            sendMessage(session, errorMessage);
        }
    }

    private void handleSubscribe(WebSocketSession session, Map<String, Object> messageData) throws IOException {
        String userId = (String) messageData.get("userId");
        if (userId == null || userId.isEmpty()) {
            log.warn("Subscribe message received without userId");
            return;
        }
        
        log.info("Session {} subscribed to updates for user: {}", session.getId(), userId);

        Map<String, Object> response = Map.of(
                "type", "subscribed",
                "userId", userId,
                "message", "Successfully subscribed to ticket updates");
        sendMessage(session, response);
    }

    private void handleUnsubscribe(WebSocketSession session, Map<String, Object> messageData) throws IOException {
        String userId = (String) messageData.get("userId");
        if (userId == null || userId.isEmpty()) {
            log.warn("Unsubscribe message received without userId");
            return;
        }
        
        log.info("Session {} unsubscribed from updates for user: {}", session.getId(), userId);

        Map<String, Object> response = Map.of(
                "type", "unsubscribed",
                "userId", userId,
                "message", "Successfully unsubscribed from ticket updates");
        sendMessage(session, response);
    }

    private void handlePing(WebSocketSession session) throws IOException {
        Map<String, Object> pongMessage = Map.of(
                "type", "pong",
                "timestamp", System.currentTimeMillis());
        sendMessage(session, pongMessage);
    }

    private void sendMessage(WebSocketSession session, Object messageData) throws IOException {
        String jsonMessage = objectMapper.writeValueAsString(messageData);
        session.sendMessage(new TextMessage(jsonMessage));
    }
}
