package com.example.EcomSphere.Services.ReviewService

import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Services.UserService.UserRepository
import com.example.EcomSphere.Services.OrderService.OrderRepository
import com.example.EcomSphere.Services.OrderService.OrderStatus
import org.springframework.stereotype.Service

@Service
class ReviewService(
    private val reviewRepository: ReviewRepository,
    private val userRepository: UserRepository,
    private val orderRepository: OrderRepository
) {

    fun createReview(request: CreateReviewRequest, userId: String): ReviewResponse {
        // Check if user already reviewed this product
        val existingReview = reviewRepository.findByProductIdAndUserId(request.productId, userId)
        if (existingReview != null) {
            throw ForbiddenActionException("You have already reviewed this product")
        }

        // Check if user has a delivered order containing this product
        val deliveredOrders = orderRepository.findByUserIdAndStatus(userId, OrderStatus.DELIVERED)
        val hasPurchased = deliveredOrders.any { order ->
            order.items.any { item -> item.productId == request.productId }
        }
        
        if (!hasPurchased) {
            throw ForbiddenActionException("You can only review products you have purchased and received")
        }

        // Validate rating range
        if (request.rating < 1 || request.rating > 5) {
            throw ForbiddenActionException("Rating must be between 1 and 5")
        }

        val review = Review(
            productId = request.productId,
            userId = userId,
            rating = request.rating,
            reviewText = request.reviewText
        )

        val saved = reviewRepository.save(review)
        return saved.toResponse()
    }

    fun getReviewsByProductId(productId: String): List<ReviewResponse> {
        return reviewRepository.findByProductId(productId).map { it.toResponse() }
    }

    fun getReviewsByUserId(userId: String): List<ReviewResponse> {
        return reviewRepository.findByUserId(userId).map { it.toResponse() }
    }

    fun getAverageRating(productId: String): Double {
        val reviews = reviewRepository.findByProductId(productId)
        if (reviews.isEmpty()) return 0.0
        return reviews.map { it.rating }.average()
    }

    fun canUserReviewProduct(productId: String, userId: String): ReviewEligibility {
        // Check if user already reviewed this product
        val existingReview = reviewRepository.findByProductIdAndUserId(productId, userId)
        if (existingReview != null) {
            return ReviewEligibility(
                canReview = false,
                reason = "You have already reviewed this product",
                hasReviewed = true,
                hasPurchased = true
            )
        }

        // Check if user has a delivered order containing this product
        val deliveredOrders = orderRepository.findByUserIdAndStatus(userId, OrderStatus.DELIVERED)
        val hasPurchased = deliveredOrders.any { order ->
            order.items.any { item -> item.productId == productId }
        }

        if (!hasPurchased) {
            return ReviewEligibility(
                canReview = false,
                reason = "You can only review products you have purchased and received",
                hasReviewed = false,
                hasPurchased = false
            )
        }

        return ReviewEligibility(
            canReview = true,
            reason = null,
            hasReviewed = false,
            hasPurchased = true
        )
    }

    fun updateReview(reviewId: String, request: UpdateReviewRequest, userId: String): ReviewResponse {
        val existing = reviewRepository.findById(reviewId)
            .orElseThrow { ForbiddenActionException("Review not found") }

        if (existing.userId != userId) {
            throw ForbiddenActionException("You are not allowed to edit this review")
        }

        // Validate rating range if provided
        if (request.rating != null && (request.rating < 1 || request.rating > 5)) {
            throw ForbiddenActionException("Rating must be between 1 and 5")
        }

        val updated = existing.copy(
            rating = request.rating ?: existing.rating,
            reviewText = request.reviewText ?: existing.reviewText
        )

        val saved = reviewRepository.save(updated)
        return saved.toResponse()
    }

    fun deleteReview(reviewId: String, userId: String) {
        val existing = reviewRepository.findById(reviewId)
            .orElseThrow { ForbiddenActionException("Review not found") }

        if (existing.userId != userId) {
            throw ForbiddenActionException("You are not allowed to delete this review")
        }

        reviewRepository.deleteById(reviewId)
    }

    private fun Review.toResponse(): ReviewResponse {
        val user = userRepository.findById(this.userId).orElse(null)
        val userName = if (user != null) "${user.firstName} ${user.lastName}" else "Anonymous"
        
        return ReviewResponse(
            id = this.id!!,
            productId = this.productId,
            userId = this.userId,
            userName = userName,
            rating = this.rating,
            reviewText = this.reviewText,
            createdAt = this.createdAt.toString()
        )
    }
}
