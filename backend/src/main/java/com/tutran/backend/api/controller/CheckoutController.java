package com.tutran.backend.api.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.tutran.backend.api.dto.PaymentInfo;
import com.tutran.backend.api.dto.Purchase;
import com.tutran.backend.api.dto.PurchaseResponse;
import com.tutran.backend.api.service.CheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutService checkoutService;

    @Autowired
    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/purchase")
    public PurchaseResponse placeOrder(@RequestBody Purchase purchase) {
        return this.checkoutService.placeOrder(purchase);
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<String> createPaymentIntent(@RequestBody PaymentInfo paymentInfo) throws StripeException {
        PaymentIntent paymentIntent = this.checkoutService.createPaymentIntent(paymentInfo);
        return new ResponseEntity<>(paymentIntent.toJson(), HttpStatus.OK);
    }
}
