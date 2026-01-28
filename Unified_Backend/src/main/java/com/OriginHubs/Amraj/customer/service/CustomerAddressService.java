package com.OriginHubs.Amraj.customer.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.customer.dto.CustomerAddressRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerAddressResponse;
import com.OriginHubs.Amraj.model.Address;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.repository.AddressRepository;
import com.OriginHubs.Amraj.repository.UserRepository;

@Service
public class CustomerAddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CustomerAddressResponse> getUserAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        // Mark first address as default in memory
        if (!addresses.isEmpty()) {
            addresses.get(0).setIsDefault(true);
        }
        return addresses.stream()
                .map(CustomerAddressResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerAddressResponse createAddress(Long userId, CustomerAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = new Address();
        address.setUser(user);
        address.setLabel(request.getLabel());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        // isDefault is @Transient so it won't be saved to DB

        Address savedAddress = addressRepository.save(address);
        return new CustomerAddressResponse(savedAddress);
    }

    @Transactional
    public CustomerAddressResponse updateAddress(Long userId, Long addressId, CustomerAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setLabel(request.getLabel());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        // isDefault is @Transient so it won't be saved to DB

        Address updatedAddress = addressRepository.save(address);
        return new CustomerAddressResponse(updatedAddress);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        addressRepository.delete(address);
        // No need to handle default since it's not in DB
    }

    @Transactional
    public CustomerAddressResponse setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Since isDefault is not in DB, we can't actually set it
        // Just return the address and mark it as default in memory
        address.setIsDefault(true);
        return new CustomerAddressResponse(address);
    }

    public CustomerAddressResponse getDefaultAddress(Long userId) {
        // Since isDefault doesn't exist in DB, just return the first address
        List<Address> addresses = addressRepository.findByUserId(userId);
        if (addresses.isEmpty()) {
            throw new RuntimeException("No addresses found");
        }
        // Return first address as default
        Address firstAddress = addresses.get(0);
        firstAddress.setIsDefault(true);  // Mark it as default in memory
        return new CustomerAddressResponse(firstAddress);
    }
}
