package com.example.EcomSphere.Services.MessageService

import java.time.LocalDateTime

data class SendMessageRequest(
    val receiverId: String,
    val content: String,
    val orderId: String? = null
)

data class MessageResponse(
    val id: String,
    val conversationId: String,
    val senderId: String,
    val senderName: String,
    val receiverId: String,
    val content: String,
    val isRead: Boolean,
    val status: MessageStatus,
    val seenAt: LocalDateTime?,
    val createdAt: LocalDateTime
)

data class ConversationResponse(
    val id: String,
    val participants: List<String>,
    val participantNames: Map<String, String>,
    val orderId: String?,
    val lastMessage: String?,
    val lastMessageAt: LocalDateTime?,
    val unreadCount: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class ConversationWithMessagesResponse(
    val conversation: ConversationResponse,
    val messages: List<MessageResponse>
)
