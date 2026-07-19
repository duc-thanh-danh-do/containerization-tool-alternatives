package com.example.EcomSphere.Services.OrderService

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document("orders")
data class Order(
    @Id val id: String? = null,
    val userId: String,
    val items: List<OrderItem>,
    val shippingAddress: ShippingAddress,
    val paymentMethod: String,
    val status: OrderStatus = OrderStatus.PENDING,
    val subtotal: Double? = 0.0,
    val shippingCost: Double? = 0.0,
    val taxAmount: Double? = 0.0,
    val totalAmount: Double? = 0.0,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

data class OrderItem(
    val productId: String,
    val productTitle: String,
    val productImage: String? = null,
    val quantity: Int,
    val price: Double,
    val sellerId: String? = null
)

data class ShippingAddress(
    val fullName: String = "",
    val addressLine1: String = "",
    val addressLine2: String? = null,
    val city: String = "",
    val postalCode: String = "",
    val country: String = "",
    val phoneNumber: String? = null
)

enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
