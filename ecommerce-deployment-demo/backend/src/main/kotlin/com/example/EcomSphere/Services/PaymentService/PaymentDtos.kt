package com.example.EcomSphere.Services.PaymentService

data class CreatePaymentIntentRequest(
    val amount: Double,
    val currency: String = "usd"
)

data class PaymentIntentResponse(
    val clientSecret: String,
    val paymentIntentId: String,
    val amount: Long,
    val currency: String
)

data class ConfirmPaymentRequest(
    val paymentIntentId: String
)

data class PaymentConfirmationResponse(
    val paymentIntentId: String,
    val status: String,
    val amount: Long,
    val currency: String
)
