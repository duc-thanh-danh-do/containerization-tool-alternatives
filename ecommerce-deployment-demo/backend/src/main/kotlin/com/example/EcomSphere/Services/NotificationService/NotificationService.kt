package com.example.EcomSphere.Services.NotificationService

import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {
    fun createNotification(
        userId: String,
        title: String,
        message: String,
        type: NotificationType = NotificationType.GENERAL,
        relatedOrderId: String? = null
    ): Notification {
        val notification = Notification(
            userId = userId,
            title = title,
            message = message,
            type = type,
            relatedOrderId = relatedOrderId
        )
        return notificationRepository.save(notification)
    }

    fun getNotificationsByUserId(userId: String): List<Notification> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
    }

    fun getUnreadNotifications(userId: String): List<Notification> {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
    }

    fun getUnreadCount(userId: String): Long {
        return notificationRepository.countByUserIdAndIsReadFalse(userId)
    }

    fun markAsRead(notificationId: String, userId: String): Notification? {
        val notification = notificationRepository.findById(notificationId).orElse(null) ?: return null
        
        if (notification.userId != userId) {
            throw IllegalArgumentException("Notification does not belong to this user")
        }
        
        val updatedNotification = notification.copy(isRead = true)
        return notificationRepository.save(updatedNotification)
    }

    fun markAllAsRead(userId: String): Int {
        val unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
        unreadNotifications.forEach { notification ->
            notificationRepository.save(notification.copy(isRead = true))
        }
        return unreadNotifications.size
    }

    fun deleteNotification(notificationId: String, userId: String): Boolean {
        val notification = notificationRepository.findById(notificationId).orElse(null) ?: return false
        
        if (notification.userId != userId) {
            throw IllegalArgumentException("Notification does not belong to this user")
        }
        
        notificationRepository.delete(notification)
        return true
    }

    // Helper methods for order-related notifications
    fun notifyOrderStatusChange(
        buyerId: String,
        orderId: String,
        newStatus: String,
        orderShortId: String
    ) {
        val (title, message, type) = when (newStatus.uppercase()) {
            "CONFIRMED" -> Triple(
                "Order Confirmed",
                "Your order #$orderShortId has been confirmed by the seller.",
                NotificationType.ORDER_CONFIRMED
            )
            "PROCESSING" -> Triple(
                "Order Processing",
                "Your order #$orderShortId is now being processed.",
                NotificationType.ORDER_PROCESSING
            )
            "SHIPPED" -> Triple(
                "Order Shipped",
                "Great news! Your order #$orderShortId has been shipped.",
                NotificationType.ORDER_SHIPPED
            )
            "DELIVERED" -> Triple(
                "Order Delivered",
                "Your order #$orderShortId has been delivered. Enjoy!",
                NotificationType.ORDER_DELIVERED
            )
            "CANCELLED" -> Triple(
                "Order Cancelled",
                "Your order #$orderShortId has been cancelled.",
                NotificationType.ORDER_CANCELLED
            )
            else -> Triple(
                "Order Update",
                "Your order #$orderShortId status has been updated to $newStatus.",
                NotificationType.GENERAL
            )
        }

        createNotification(
            userId = buyerId,
            title = title,
            message = message,
            type = type,
            relatedOrderId = orderId
        )
    }

    fun notifyNewOrder(sellerId: String, orderId: String, orderShortId: String, buyerName: String) {
        createNotification(
            userId = sellerId,
            title = "New Order Received",
            message = "You have received a new order #$orderShortId from $buyerName.",
            type = NotificationType.NEW_ORDER,
            relatedOrderId = orderId
        )
    }

    fun Notification.toResponse(): NotificationResponse {
        return NotificationResponse(
            id = this.id!!,
            userId = this.userId,
            title = this.title,
            message = this.message,
            type = this.type.name,
            relatedOrderId = this.relatedOrderId,
            isRead = this.isRead,
            createdAt = this.createdAt
        )
    }
}

data class NotificationResponse(
    val id: String,
    val userId: String,
    val title: String,
    val message: String,
    val type: String,
    val relatedOrderId: String?,
    val isRead: Boolean,
    val createdAt: LocalDateTime
)
