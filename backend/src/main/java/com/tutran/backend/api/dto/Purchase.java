package com.tutran.backend.api.dto;

import com.tutran.backend.api.entity.Address;
import com.tutran.backend.api.entity.Customer;
import com.tutran.backend.api.entity.Order;
import com.tutran.backend.api.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
