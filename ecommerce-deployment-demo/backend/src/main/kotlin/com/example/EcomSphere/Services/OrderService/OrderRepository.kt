package com.example.EcomSphere.Services.OrderService

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface OrderRepository : MongoRepository<Order, String> {
    fun findByUserId(userId: String): List<Order>
    
    @Query("{ 'items.sellerId': ?0 }")
    fun findByItemsSellerId(sellerId: String): List<Order>
    
    fun findByStatus(status: OrderStatus): List<Order>
    fun findByUserIdAndStatus(userId: String, status: OrderStatus): List<Order>
}
