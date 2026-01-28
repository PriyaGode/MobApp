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
import com.OriginHubs.Amraj.model.SystemAlert;

@Component
public class AlertWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(AlertWebSocketHandler.class);
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        log.info("Alert WebSocket connection established: {}", sessionId);

        Map<String, Object> welcomeMessage = Map.of(
                "type", "connection",
                "status", "connected",
                "sessionId", sessionId,
                "message", "Connected to system alerts");
        sendMessage(session, welcomeMessage);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        log.info("Alert WebSocket connection closed: {} with status: {}", sessionId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Alert WebSocket transport error for session {}", session.getId(), exception);
        session.close(CloseStatus.SERVER_ERROR);
    }

    public void broadcastNewAlert(SystemAlert alert) {
        Map<String, Object> alertMessage = Map.of(
                "type", "new_alert",
                "alert", alert,
                "timestamp", System.currentTimeMillis());

        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    sendMessage(session, alertMessage);
                }
            } catch (IOException e) {
                log.error("Error broadcasting alert to session {}", session.getId(), e);
            }
        });
    }

    public void broadcastAlertAcknowledged(Long alertId) {
        Map<String, Object> ackMessage = Map.of(
                "type", "alert_acknowledged",
                "alertId", alertId,
                "timestamp", System.currentTimeMillis());

        sessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    sendMessage(session, ackMessage);
                }
            } catch (IOException e) {
                log.error("Error broadcasting acknowledgment to session {}", session.getId(), e);
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

            if ("ping".equals(messageType)) {
                Map<String, Object> pongMessage = Map.of(
                        "type", "pong",
                        "timestamp", System.currentTimeMillis());
                sendMessage(session, pongMessage);
            }
        } catch (Exception e) {
            log.error("Error handling message", e);
        }
    }

    private void sendMessage(WebSocketSession session, Object messageData) throws IOException {
        String jsonMessage = objectMapper.writeValueAsString(messageData);
        session.sendMessage(new TextMessage(jsonMessage));
    }
}
