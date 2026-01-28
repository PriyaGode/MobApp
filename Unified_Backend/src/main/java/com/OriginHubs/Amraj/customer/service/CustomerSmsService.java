package com.OriginHubs.Amraj.customer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerSmsService {

    @Autowired
    private ClickSendService clickSendService;

    public void sendSms(String phone, String message) {
        var response = clickSendService.sendSms(phone, message);

        if (!(boolean) response.get("success")) {
            throw new RuntimeException("Failed to send SMS: " + response.get("message"));
        }
    }
}
