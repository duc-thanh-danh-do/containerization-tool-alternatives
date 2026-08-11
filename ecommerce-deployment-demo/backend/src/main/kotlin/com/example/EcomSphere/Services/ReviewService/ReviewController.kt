package com.example.EcomSphere.Services.ReviewService

import com.example.EcomSphere.Helper.CustomUserPrincipal
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/reviews")
class ReviewController(
    private val reviewService: ReviewService
) {

    @PostMapping
    fun createReview(
        @RequestBody request: CreateReviewRequest,
        authentication: Authentication
    ): ResponseEntity<ReviewResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        val created = reviewService.createReview(request, userId)
        return ResponseEntity.ok(created)
    }

    @GetMapping("/product/{productId}")
    fun getReviewsByProduct(@PathVariable productId: String): ResponseEntity<List<ReviewResponse>> {
        val reviews = reviewService.getReviewsByProductId(productId)
        return ResponseEntity.ok(reviews)
    }

    @GetMapping("/product/{productId}/average")
    fun getAverageRating(@PathVariable productId: String): ResponseEntity<AverageRatingResponse> {
        val reviews = reviewService.getReviewsByProductId(productId)
        val averageRating = reviewService.getAverageRating(productId)
        val response = AverageRatingResponse(
            productId = productId,
            averageRating = averageRating,
            totalReviews = reviews.size
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/product/{productId}/eligibility")
    fun checkReviewEligibility(
        @PathVariable productId: String,
        authentication: Authentication
    ): ResponseEntity<ReviewEligibility> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        val eligibility = reviewService.canUserReviewProduct(productId, userId)
        return ResponseEntity.ok(eligibility)
    }

    @GetMapping("/user")
    fun getReviewsByUser(authentication: Authentication): ResponseEntity<List<ReviewResponse>> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        val reviews = reviewService.getReviewsByUserId(userId)
        return ResponseEntity.ok(reviews)
    }

    @PutMapping("/{reviewId}")
    fun updateReview(
        @PathVariable reviewId: String,
        @RequestBody request: UpdateReviewRequest,
        authentication: Authentication
    ): ResponseEntity<ReviewResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        val updated = reviewService.updateReview(reviewId, request, userId)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{reviewId}")
    fun deleteReview(
        @PathVariable reviewId: String,
        authentication: Authentication
    ): ResponseEntity<Unit> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        reviewService.deleteReview(reviewId, userId)
        return ResponseEntity.noContent().build()
    }
}
