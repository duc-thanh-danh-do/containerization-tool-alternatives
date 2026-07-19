package com.example.EcomSphere.Services.ReviewService

import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.annotation.Id
import java.time.Instant

@Document("reviews")
data class Review(
    @Id val id: String? = null,
    val productId: String,
    val userId: String,
    val rating: Int,
    val reviewText: String,
    val createdAt: Instant = Instant.now()
)
