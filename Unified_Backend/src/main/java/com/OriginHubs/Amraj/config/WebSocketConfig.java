package com.OriginHubs.Amraj.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.OriginHubs.Amraj.websocket.AlertWebSocketHandler;
import com.OriginHubs.Amraj.websocket.TicketWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TicketWebSocketHandler ticketWebSocketHandler;
    private final AlertWebSocketHandler alertWebSocketHandler;

    public WebSocketConfig(TicketWebSocketHandler ticketWebSocketHandler, AlertWebSocketHandler alertWebSocketHandler) {
        this.ticketWebSocketHandler = ticketWebSocketHandler;
        this.alertWebSocketHandler = alertWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(ticketWebSocketHandler, "/ws/tickets")
                .setAllowedOrigins("*");
        registry.addHandler(alertWebSocketHandler, "/ws/alerts")
                .setAllowedOrigins("*");
    }
}
