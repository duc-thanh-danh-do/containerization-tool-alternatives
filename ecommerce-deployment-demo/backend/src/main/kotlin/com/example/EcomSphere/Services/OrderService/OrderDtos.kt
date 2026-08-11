package com.example.EcomSphere.Services.OrderService

import java.time.LocalDateTime

data class CreateOrderRequest(
    val items: List<OrderItemRequest>,
    val shippingAddress: ShippingAddressRequest,
    val paymentMethod: String,
    val shippingCost: Double = 0.0,
    val taxAmount: Double = 0.0
)

data class OrderItemRequest(
    val productId: String,
    val productTitle: String,
    val productImage: String?,
    val quantity: Int,
    val price: Double,
    val sellerId: String
)

data class ShippingAddressRequest(
    val fullName: String,
    val addressLine1: String,
    val addressLine2: String? = null,
    val city: String,
    val postalCode: String,
    val country: String,
    val phoneNumber: String? = null
)

data class UpdateOrderStatusRequest(
    val status: String
)

data class OrderResponse(
    val id: String,
    val userId: String,
    val items: List<OrderItem>,
    val shippingAddress: ShippingAddress,
    val paymentMethod: String,
    val status: String,
    val subtotal: Double,
    val shippingCost: Double,
    val taxAmount: Double,
    val totalAmount: Double,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
