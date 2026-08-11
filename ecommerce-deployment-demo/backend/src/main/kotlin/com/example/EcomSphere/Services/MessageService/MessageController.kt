package com.example.EcomSphere.Services.MessageService

import com.example.EcomSphere.MiddleWare.JwtUtil
import com.example.EcomSphere.Services.UserService.UserRepository
import com.example.EcomSphere.Services.StoreService.StoreRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/messages")
class MessageController(
    private val messageService: MessageService,
    private val jwtUtil: JwtUtil,
    private val userRepository: UserRepository,
    private val storeRepository: StoreRepository
) {
    private fun getUserIdFromToken(authHeader: String?): String {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw IllegalArgumentException("Invalid authorization header")
        }
        val token = authHeader.substring(7)
        val email = jwtUtil.verifyAndGetEmail(token)
            ?: throw IllegalArgumentException("Invalid or expired token")
        val user = userRepository.findByEmail(email)
            .orElseThrow { IllegalArgumentException("User not found") }
        return user.id!!
    }

    @PostMapping
    fun sendMessage(
        @RequestHeader("Authorization") authHeader: String?,
        @RequestBody request: SendMessageRequest
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val message = messageService.sendMessage(userId, request)
            ResponseEntity.status(HttpStatus.CREATED).body(with(messageService) { message.toResponse() })
        } catch (e: IllegalArgumentException) {
            val message = e.message ?: ""
            if (message.contains("Authorization") || message.contains("token") || message.contains("User not found")) {
                ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
            } else {
                ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
            }
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to send message: ${e.message}"))
        }
    }

    @GetMapping("/conversations")
    fun getConversations(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val conversations = messageService.getConversations(userId)
            ResponseEntity.ok(conversations)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to fetch conversations: ${e.message}"))
        }
    }

    @GetMapping("/conversations/{conversationId}")
    fun getConversationMessages(
        @RequestHeader("Authorization") authHeader: String?,
        @PathVariable conversationId: String
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val result = messageService.getConversationMessages(conversationId, userId)
            ResponseEntity.ok(result)
        } catch (e: IllegalArgumentException) {
            val message = e.message ?: ""
            if (message.contains("Authorization") || message.contains("token") || message.contains("User not found")) {
                ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
            } else if (message.contains("Access denied")) {
                ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to e.message))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
            }
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to fetch messages: ${e.message}"))
        }
    }

    @GetMapping("/unread-count")
    fun getUnreadCount(
        @RequestHeader("Authorization") authHeader: String?
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val count = messageService.getUnreadCount(userId)
            ResponseEntity.ok(mapOf("unreadCount" to count))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to fetch unread count: ${e.message}"))
        }
    }

    @PutMapping("/conversations/{conversationId}/seen")
    fun markMessagesAsSeen(
        @RequestHeader("Authorization") authHeader: String?,
        @PathVariable conversationId: String
    ): ResponseEntity<Any> {
        return try {
            val userId = getUserIdFromToken(authHeader)
            val count = messageService.markMessagesAsSeen(conversationId, userId)
            ResponseEntity.ok(mapOf("markedAsSeen" to count))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to mark messages as seen: ${e.message}"))
        }
    }

    @GetMapping("/store/{storeId}/seller")
    fun getSellerByStoreId(
        @RequestHeader("Authorization") authHeader: String?,
        @PathVariable storeId: String
    ): ResponseEntity<Any> {
        return try {
            getUserIdFromToken(authHeader) // Verify user is authenticated
            val store = storeRepository.findById(storeId)
                .orElseThrow { IllegalArgumentException("Store not found") }
            val seller = userRepository.findById(store.owner)
                .orElseThrow { IllegalArgumentException("Seller not found") }
            ResponseEntity.ok(mapOf(
                "sellerId" to seller.id,
                "sellerName" to "${seller.firstName} ${seller.lastName}",
                "storeName" to store.name
            ))
        } catch (e: IllegalArgumentException) {
            val message = e.message ?: ""
            if (message.contains("Authorization") || message.contains("token") || message.contains("User not found")) {
                ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
            }
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Failed to fetch seller info: ${e.message}"))
        }
    }
}
