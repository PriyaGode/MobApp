package com.OriginHubs.Amraj.customer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class ClickSendService {

    @Value("${clicksend.username}")
    private String username;

    @Value("${clicksend.apiKey}")
    private String apiKey;

    public Map<String, Object> sendSms(String phone, String message) {
        Map<String, Object> responseMap = new HashMap<>();

        try {
            if (phone == null || phone.trim().isEmpty()) {
                responseMap.put("success", false);
                responseMap.put("status", HttpStatus.BAD_REQUEST.value());
                responseMap.put("message", "Phone number is required");
                return responseMap;
            }

            if (message == null || message.trim().isEmpty()) {
                responseMap.put("success", false);
                responseMap.put("status", HttpStatus.BAD_REQUEST.value());
                responseMap.put("message", "Message cannot be empty");
                return responseMap;
            }

            String jsonBody = String.format(
                    "{\"messages\":[{\"source\":\"java-app\",\"body\":\"%s\",\"to\":\"%s\"}]}",
                    message, phone
            );

            String auth = username + ":" + apiKey;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://rest.clicksend.com/v3/sms/send"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + encodedAuth)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());



            System.out.println("ClickSend raw response: " + response.body());

            responseMap.put("success", response.statusCode() == 200);
            responseMap.put("status", response.statusCode());
            responseMap.put("body", response.body());
            responseMap.put("message", response.statusCode() == 200 ? "SMS sent successfully" : "Failed to send SMS");

        } catch (Exception e) {
            e.printStackTrace();
            responseMap.put("success", false);
            responseMap.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            responseMap.put("message", "Error sending SMS: " + e.getMessage());
        }

        return responseMap;
    }
}
