package com.tutran.backend.api.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.tutran.backend.api.dto.PaymentInfo;
import com.tutran.backend.api.dto.Purchase;
import com.tutran.backend.api.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
