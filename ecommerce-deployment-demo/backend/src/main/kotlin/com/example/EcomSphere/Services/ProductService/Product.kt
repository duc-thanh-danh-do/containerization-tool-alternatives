package com.example.EcomSphere.Services.ProductService

import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.annotation.Id

@Document("products")
data class Product(
    @Id val id: String? = null,
    val title: String,
    val description: String,
    val category: String,
    val price: Float,
    val stock: Int,
    val images: String,
    val storeId: String? = null
)


