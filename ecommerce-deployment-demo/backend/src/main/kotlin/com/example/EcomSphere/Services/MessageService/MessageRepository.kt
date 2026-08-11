package com.example.EcomSphere.Services.MessageService

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface MessageRepository : MongoRepository<Message, String> {
    fun findByConversationIdOrderByCreatedAtAsc(conversationId: String): List<Message>
    fun findByReceiverIdAndIsReadFalse(receiverId: String): List<Message>
    fun countByConversationIdAndReceiverIdAndIsReadFalse(conversationId: String, receiverId: String): Long
}

@Repository
interface ConversationRepository : MongoRepository<Conversation, String> {
    fun findByParticipantsContaining(userId: String): List<Conversation>
    fun findByParticipantsContainingAndOrderId(userId: String, orderId: String): Conversation?
}
