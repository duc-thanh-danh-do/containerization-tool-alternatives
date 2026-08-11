package com.example.EcomSphere.Services.NotificationService

import com.example.EcomSphere.MiddleWare.JwtUtil
import com.example.EcomSphere.Services.UserService.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = ["http://localhost:5173"])
class NotificationController(
    private val notificationService: NotificationService,
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil
) {
    private fun getUserIdFromToken(authHeader: String?): String {
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

    @GetMapping
    fun getNotifications(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val notifications = notificationService.getNotificationsByUserId(userId)
            ResponseEntity.ok(notifications.map { with(notificationService) { it.toResponse() } })
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to fetch notifications: ${e.message}"))
        }
    }

    @GetMapping("/unread")
    fun getUnreadNotifications(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val notifications = notificationService.getUnreadNotifications(userId)
            ResponseEntity.ok(notifications.map { with(notificationService) { it.toResponse() } })
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to fetch unread notifications: ${e.message}"))
        }
    }

    @GetMapping("/unread/count")
    fun getUnreadCount(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val count = notificationService.getUnreadCount(userId)
            ResponseEntity.ok(mapOf("count" to count))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to fetch unread count: ${e.message}"))
        }
    }

    @PutMapping("/{notificationId}/read")
    fun markAsRead(
        @RequestHeader("Authorization") authHeader: String?,
        @PathVariable notificationId: String
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val notification = notificationService.markAsRead(notificationId, userId)
            if (notification != null) {
                ResponseEntity.ok(with(notificationService) { notification.toResponse() })
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Notification not found"))
            }
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to mark notification as read: ${e.message}"))
        }
    }

    @PutMapping("/read-all")
    fun markAllAsRead(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val count = notificationService.markAllAsRead(userId)
            ResponseEntity.ok(mapOf("message" to "Marked $count notifications as read"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to mark all as read: ${e.message}"))
        }
    }

    @DeleteMapping("/{notificationId}")
    fun deleteNotification(
        @RequestHeader("Authorization") authHeader: String?,
        @PathVariable notificationId: String
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val deleted = notificationService.deleteNotification(notificationId, userId)
            if (deleted) {
                ResponseEntity.ok(mapOf("message" to "Notification deleted"))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Notification not found"))
            }
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Failed to delete notification: ${e.message}"))
        }
    }
}
