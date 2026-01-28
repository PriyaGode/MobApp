package com.OriginHubs.Amraj.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.OriginHubs.Amraj.dto.DeliveryPartnerDto;
import com.OriginHubs.Amraj.model.DeliveryPartner;
import com.OriginHubs.Amraj.repository.DeliveryPartnerRepository;

@RestController
@RequestMapping("/api/admin/delivery-partners")
public class DeliveryPartnerController {
    private final DeliveryPartnerRepository repo;

    public DeliveryPartnerController(DeliveryPartnerRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<DeliveryPartnerDto> list() {
        List<DeliveryPartner> all = repo.findAll();
        return all.stream().map(dp -> new DeliveryPartnerDto(dp.getId(), dp.getName())).collect(Collectors.toList());
    }
}
