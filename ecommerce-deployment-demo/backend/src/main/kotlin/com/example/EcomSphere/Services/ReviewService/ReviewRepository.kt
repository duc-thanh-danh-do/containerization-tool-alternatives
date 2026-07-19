package com.example.EcomSphere.Services.ReviewService

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ReviewRepository : MongoRepository<Review, String> {
    fun findByProductId(productId: String): List<Review>
    fun findByUserId(userId: String): List<Review>
    fun findByProductIdAndUserId(productId: String, userId: String): Review?
}
