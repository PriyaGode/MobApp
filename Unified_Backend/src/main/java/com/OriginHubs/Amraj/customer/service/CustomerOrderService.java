package com.OriginHubs.Amraj.customer.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.OriginHubs.Amraj.customer.dto.CustomerCreateOrderRequest;
import com.OriginHubs.Amraj.customer.dto.CustomerOrderResponse;
import com.OriginHubs.Amraj.customer.dto.CustomerOrderTrackingResponse;
import com.OriginHubs.Amraj.customer.model.OrderStatus;
import com.OriginHubs.Amraj.model.Order;
import com.OriginHubs.Amraj.model.OrderItem;
import com.OriginHubs.Amraj.model.Product;
import com.OriginHubs.Amraj.model.User;
import com.OriginHubs.Amraj.repository.OrderRepository;
import com.OriginHubs.Amraj.repository.ProductRepository;
import com.OriginHubs.Amraj.repository.UserRepository;

@Service
public class CustomerOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.OriginHubs.Amraj.repository.OrderItemRepository orderItemRepository;

    @Autowired
    private com.OriginHubs.Amraj.repository.ImageRepository imageRepository;

    @Autowired
    private PromoCodeService promoCodeService;

    @Transactional
    public CustomerOrderResponse createOrder(CustomerCreateOrderRequest request) {
        // Find user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create order using the Unified model
        Order order = new Order();
        order.setCustomer(user);
        order.setTotalAmount(request.getTotalAmount());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setStatus("PENDING");
        order.setCreatedAt(OffsetDateTime.now());
        order.setIssueFlag(false);
        
        // Handle promo code if provided
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            order.setPromoCode(request.getPromoCode().trim().toUpperCase());
            order.setDiscountAmount(request.getDiscountAmount());
            // Increment promo code usage count
            promoCodeService.incrementUsageCount(request.getPromoCode());
        }

        // Save order first
        order = orderRepository.save(order);

        // Create and save order items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<OrderItem> orderItems = new ArrayList<>();
            for (CustomerCreateOrderRequest.OrderItemDto itemDto : request.getItems()) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemDto.getQuantity());
                orderItem.setPrice(itemDto.getPricePerUnit());
                orderItems.add(orderItem);
            }
            orderItemRepository.saveAll(orderItems);
            order.setOrderItems(orderItems);
        }

        return mapToResponse(order);
    }

    public CustomerOrderResponse getOrderByOrderId(String orderId) {
        // orderId is now numeric, parse it to Long
        try {
            Long id = Long.parseLong(orderId);
            Order order = orderRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            return mapToResponse(order);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + orderId);
        }
    }

    @Transactional(readOnly = true)
    public List<CustomerOrderResponse> getUserOrders(Long userId) {
        try {
            List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
            return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
        } catch (Exception e) {
            // Log the actual error for debugging
            e.printStackTrace();
            throw new RuntimeException("Error fetching orders: " + e.getMessage(), e);
        }
    }

    @Transactional
    public CustomerOrderResponse updateOrderStatus(String orderId, String newStatus) {
        try {
            Long id = Long.parseLong(orderId);
            Order order = orderRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            order.setStatus(newStatus);

            OrderStatus status = OrderStatus.fromString(newStatus);
            if (status == OrderStatus.DELIVERED) {
                order.setDeliveryDate(OffsetDateTime.now());
            }

            order = orderRepository.save(order);
            return mapToResponse(order);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + orderId);
        }
    }

    public CustomerOrderTrackingResponse getOrderTracking(String orderId) {
        try {
            Long id = Long.parseLong(orderId);
            Order order = orderRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            OrderStatus orderStatus = OrderStatus.fromString(order.getStatus());
            LocalDateTime createdAtLocal = order.getCreatedAt() != null ? 
                order.getCreatedAt().toLocalDateTime() : LocalDateTime.now();
            LocalDateTime deliveryDateLocal = order.getDeliveryDate() != null ? 
                order.getDeliveryDate().toLocalDateTime() : null;

            CustomerOrderTrackingResponse tracking = new CustomerOrderTrackingResponse();
            tracking.setOrderId(String.valueOf(order.getId()));
            tracking.setCurrentStatus(orderStatus.name());
            tracking.setOrderDate(createdAtLocal);
            tracking.setEstimatedDelivery(deliveryDateLocal != null ? deliveryDateLocal : createdAtLocal.plusDays(2));
            tracking.setDeliveryAddress(order.getDeliveryAddress());

            // Create tracking statuses
            List<CustomerOrderTrackingResponse.TrackingStatus> statuses = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, hh:mm a");

            // Order Placed
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "1",
                    "Order Placed",
                    createdAtLocal.format(formatter),
                    "shopping-cart",
                    true,
                    orderStatus == OrderStatus.PENDING));

            // Order Confirmed
            boolean confirmedCompleted = orderStatus != OrderStatus.PENDING;
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "2",
                    "Order Confirmed",
                    confirmedCompleted ? createdAtLocal.plusHours(1).format(formatter) : "Awaiting confirmation",
                    "check",
                    confirmedCompleted,
                    orderStatus == OrderStatus.CONFIRMED));

            // Packed at Farm
            boolean packedCompleted = orderStatus == OrderStatus.PROCESSING || 
                                       orderStatus == OrderStatus.OUT_FOR_DELIVERY || 
                                       orderStatus == OrderStatus.DELIVERED;
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "3",
                    "Packed at Farm",
                    packedCompleted ? createdAtLocal.plusHours(12).format(formatter) : "Awaiting processing",
                    "package",
                    packedCompleted,
                    orderStatus == OrderStatus.PROCESSING));

            // Dispatched
            boolean dispatchedCompleted = orderStatus == OrderStatus.OUT_FOR_DELIVERY || 
                                           orderStatus == OrderStatus.DELIVERED;
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "4",
                    "Dispatched",
                    dispatchedCompleted ? createdAtLocal.plusHours(15).format(formatter) : "Awaiting dispatch",
                    "map",
                    dispatchedCompleted,
                    false));

            // Out for Delivery
            boolean outForDeliveryCompleted = orderStatus == OrderStatus.DELIVERED;
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "5",
                    "Out for Delivery",
                    orderStatus == OrderStatus.OUT_FOR_DELIVERY ? createdAtLocal.plusHours(24).format(formatter) : 
                        (outForDeliveryCompleted ? createdAtLocal.plusHours(24).format(formatter) : "Awaiting dispatch"),
                    "truck",
                    outForDeliveryCompleted,
                    orderStatus == OrderStatus.OUT_FOR_DELIVERY));

            // Delivered
            statuses.add(new CustomerOrderTrackingResponse.TrackingStatus(
                    "6",
                    "Delivered",
                    deliveryDateLocal != null ? deliveryDateLocal.format(formatter) : "Awaiting delivery",
                    "home",
                    orderStatus == OrderStatus.DELIVERED,
                    false));

            tracking.setStatuses(statuses);

            // Add delivery info if out for delivery
            if (orderStatus == OrderStatus.OUT_FOR_DELIVERY) {
                CustomerOrderTrackingResponse.DeliveryInfo deliveryInfo = new CustomerOrderTrackingResponse.DeliveryInfo();
                deliveryInfo.setDriverName("Rajesh Kumar");
                deliveryInfo.setDriverPhone("+91 98765 43210");
                deliveryInfo.setDriverAvatar("https://api.dicebear.com/7.x/avataaars/png?seed=Rajesh");
                deliveryInfo.setVehicleNumber("MH 02 AB 1234");
                deliveryInfo.setCurrentLatitude(19.0760);
                deliveryInfo.setCurrentLongitude(72.8777);
                deliveryInfo.setEstimatedTimeMinutes(45);
                tracking.setDeliveryInfo(deliveryInfo);
            }

            return tracking;
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + orderId);
        }
    }

    private CustomerOrderResponse mapToResponse(Order order) {
        try {
            LocalDateTime createdAtLocal = order.getCreatedAt() != null ? 
                order.getCreatedAt().toLocalDateTime() : null;
            LocalDateTime updatedAtLocal = order.getUpdatedAt();
            LocalDateTime deliveryDateLocal = order.getDeliveryDate() != null ? 
                order.getDeliveryDate().toLocalDateTime() : null;

            CustomerOrderResponse response = new CustomerOrderResponse();
            response.setId(order.getId());
            response.setOrderId(String.valueOf(order.getId()));  // Use numeric ID as string
            
            // Handle customer/user field
            if (order.getCustomer() != null) {
                response.setUserEmail(order.getCustomer().getEmail());
            }
            
            response.setTotalAmount(order.getTotalAmount());
            
            // Handle status with fallback
            if (order.getStatus() != null) {
                response.setStatus(order.getStatus().toUpperCase());
            } else {
                response.setStatus("PENDING");
            }
            
            response.setOrderDate(createdAtLocal);
            response.setDeliveryDate(deliveryDateLocal);
            response.setDeliveryAddress(order.getDeliveryAddress());
            response.setPromoCode(order.getPromoCode());
            response.setDiscountAmount(order.getDiscountAmount());
            response.setCreatedAt(createdAtLocal);
            response.setUpdatedAt(updatedAtLocal);

            // Map order items
            if (order.getOrderItems() != null) {
                List<CustomerOrderResponse.OrderItemResponse> itemResponses = order.getOrderItems().stream()
                        .map(item -> {
                            CustomerOrderResponse.OrderItemResponse itemResponse = new CustomerOrderResponse.OrderItemResponse();
                            itemResponse.setId(item.getId());
                            if (item.getProduct() != null) {
                                itemResponse.setProductId(item.getProduct().getId());
                                itemResponse.setProductName(item.getProduct().getName());
                                itemResponse.setProductCategory(item.getProduct().getCategory());
                                
                                List<com.OriginHubs.Amraj.model.Image> productImages = imageRepository.findByReferenceTypeAndReferenceId("PRODUCT", item.getProduct().getId());
                                List<String> images = productImages.stream()
                                        .map(img -> img.getFilePath())
                                        .collect(Collectors.toList());
                                itemResponse.setProductImages(images);
                                
                                String primaryImage = productImages.stream()
                                        .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                                        .map(img -> img.getFilePath())
                                        .findFirst()
                                        .orElse(images.isEmpty() ? null : images.get(0));
                                itemResponse.setProductImage(primaryImage);
                            }
                            itemResponse.setQuantity(item.getQuantity());
                            itemResponse.setPricePerUnit(item.getPrice());
                            if (item.getPrice() != null && item.getQuantity() != null) {
                                itemResponse.setTotalPrice(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
                            }
                            return itemResponse;
                        })
                        .collect(Collectors.toList());
                response.setItems(itemResponses);
            }

            return response;
        } catch (Exception e) {
            System.err.println("Error mapping order " + order.getId() + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error mapping order to response: " + e.getMessage(), e);
        }
    }
}
