package com.example.EcomSphere.Services.NotificationService

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

enum class NotificationType {
    ORDER_PLACED,
    ORDER_CONFIRMED,
    ORDER_PROCESSING,
    ORDER_SHIPPED,
    ORDER_DELIVERED,
    ORDER_CANCELLED,
    NEW_ORDER,           // For sellers when they receive a new order
    GENERAL
}

@Document(collection = "notifications")
data class Notification(
    @Id
    val id: String? = null,
    val userId: String,
    val title: String,
    val message: String,
    val type: NotificationType = NotificationType.GENERAL,
    val relatedOrderId: String? = null,
    val isRead: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
)
