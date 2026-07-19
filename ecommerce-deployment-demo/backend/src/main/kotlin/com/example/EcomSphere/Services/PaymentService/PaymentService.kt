package com.example.EcomSphere.Services.PaymentService

import com.stripe.Stripe
import com.stripe.model.PaymentIntent
import com.stripe.param.PaymentIntentCreateParams
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import jakarta.annotation.PostConstruct
import java.util.UUID

@Service
class PaymentService(
    @Value("\${stripe.api-key}") private val stripeApiKey: String,
    @Value("\${stripe.use-mock:true}") private val useMock: Boolean
) {
    @PostConstruct
    fun init() {
        if (!useMock) {
            Stripe.apiKey = stripeApiKey
        }
    }

    fun createPaymentIntent(amount: Double, currency: String): PaymentIntentResponse {
        // Convert amount to cents (Stripe uses smallest currency unit)
        val amountInCents = (amount * 100).toLong()
        
        if (useMock) {
            return createMockPaymentIntent(amountInCents, currency)
        }
        
        return createRealPaymentIntent(amountInCents, currency)
    }

    private fun createMockPaymentIntent(amountInCents: Long, currency: String): PaymentIntentResponse {
        val mockPaymentIntentId = "pi_mock_${UUID.randomUUID().toString().replace("-", "").take(24)}"
        val mockClientSecret = "${mockPaymentIntentId}_secret_mock${UUID.randomUUID().toString().replace("-", "").take(24)}"
        
        return PaymentIntentResponse(
            clientSecret = mockClientSecret,
            paymentIntentId = mockPaymentIntentId,
            amount = amountInCents,
            currency = currency
        )
    }

    private fun createRealPaymentIntent(amountInCents: Long, currency: String): PaymentIntentResponse {
        val params = PaymentIntentCreateParams.builder()
            .setAmount(amountInCents)
            .setCurrency(currency)
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build()

        val paymentIntent = PaymentIntent.create(params)
        
        return PaymentIntentResponse(
            clientSecret = paymentIntent.clientSecret,
            paymentIntentId = paymentIntent.id,
            amount = paymentIntent.amount,
            currency = paymentIntent.currency
        )
    }

    fun confirmPayment(paymentIntentId: String): PaymentConfirmationResponse {
        if (useMock || paymentIntentId.startsWith("pi_mock_")) {
            return confirmMockPayment(paymentIntentId)
        }
        
        return confirmRealPayment(paymentIntentId)
    }

    private fun confirmMockPayment(paymentIntentId: String): PaymentConfirmationResponse {
        // Mock payment always succeeds
        return PaymentConfirmationResponse(
            paymentIntentId = paymentIntentId,
            status = "succeeded",
            amount = 0,
            currency = "usd"
        )
    }

    private fun confirmRealPayment(paymentIntentId: String): PaymentConfirmationResponse {
        val paymentIntent = PaymentIntent.retrieve(paymentIntentId)
        
        return PaymentConfirmationResponse(
            paymentIntentId = paymentIntent.id,
            status = paymentIntent.status,
            amount = paymentIntent.amount,
            currency = paymentIntent.currency
        )
    }
}
