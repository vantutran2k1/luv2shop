package com.tutran.backend.api.service;

import com.tutran.backend.api.dto.Purchase;
import com.tutran.backend.api.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
