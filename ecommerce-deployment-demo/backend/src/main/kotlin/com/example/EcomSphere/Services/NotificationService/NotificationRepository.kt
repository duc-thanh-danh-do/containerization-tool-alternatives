package com.example.EcomSphere.Services.NotificationService

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface NotificationRepository : MongoRepository<Notification, String> {
    fun findByUserIdOrderByCreatedAtDesc(userId: String): List<Notification>
    fun findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId: String): List<Notification>
    fun countByUserIdAndIsReadFalse(userId: String): Long
}
