package com.example.EcomSphere.Services.StoreService

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

enum class StoreStatus {
    PENDING,
    ACTIVE,
    SUSPENDED
}

@Document("stores")
data class Store (
    @Id val id: String? = null,
    @Indexed(unique = true) var name: String,
    val description: String,
    val address: String?,
    val owner: String,
    val phoneNumber: String,
    val status: StoreStatus = StoreStatus.PENDING,
    val avatar: String? = null,
    val cover: String? = null
){
}