package com.example.EcomSphere.Services.PaymentService

import com.example.EcomSphere.MiddleWare.JwtUtil
import com.example.EcomSphere.Services.UserService.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/payments")
class PaymentController(
    private val paymentService: PaymentService,
    private val jwtUtil: JwtUtil,
    private val userRepository: UserRepository
) {
    private fun validateToken(authHeader: String?): String {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw IllegalArgumentException("Invalid or missing Authorization header")
        }
        val token = authHeader.substring(7)
        val email = jwtUtil.verifyAndGetEmail(token)
            ?: throw IllegalArgumentException("Invalid or expired token")
        val user = userRepository.findByEmail(email)
            .orElseThrow { IllegalArgumentException("User not found") }
        return user.id!!
    }

    @PostMapping("/create-payment-intent")
    fun createPaymentIntent(
        @RequestHeader("Authorization") authHeader: String?,
        @RequestBody request: CreatePaymentIntentRequest
    ): ResponseEntity<Any> {
        return try {
            validateToken(authHeader)
            val result = paymentService.createPaymentIntent(request.amount, request.currency)
            ResponseEntity.ok(result)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to create payment intent: ${e.message}"))
        }
    }

    @PostMapping("/confirm-payment")
    fun confirmPayment(
        @RequestHeader("Authorization") authHeader: String?,
        @RequestBody request: ConfirmPaymentRequest
    ): ResponseEntity<Any> {
        return try {
            validateToken(authHeader)
            val result = paymentService.confirmPayment(request.paymentIntentId)
            ResponseEntity.ok(result)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to confirm payment: ${e.message}"))
        }
    }
}
