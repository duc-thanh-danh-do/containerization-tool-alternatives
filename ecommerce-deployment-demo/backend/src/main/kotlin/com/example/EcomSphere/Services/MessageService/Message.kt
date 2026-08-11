package com.example.EcomSphere.Services.MessageService

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

enum class MessageStatus {
    SENT,
    DELIVERED,
    SEEN
}

@Document("messages")
data class Message(
    @Id val id: String? = null,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val receiverId: String,
    val content: String,
    val isRead: Boolean = false,
    val status: MessageStatus = MessageStatus.SENT,
    val seenAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Document("conversations")
data class Conversation(
    @Id val id: String? = null,
    val participants: List<String>,
    val participantNames: Map<String, String> = emptyMap(),
    val orderId: String? = null,
    val lastMessage: String? = null,
    val lastMessageAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
