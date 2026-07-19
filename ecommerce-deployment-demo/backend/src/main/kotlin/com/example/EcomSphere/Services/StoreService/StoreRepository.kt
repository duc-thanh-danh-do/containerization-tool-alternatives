package com.example.EcomSphere.Services.StoreService

import org.springframework.data.mongodb.repository.MongoRepository

interface StoreRepository: MongoRepository<Store, String> {
    fun findByOwner(owner: String): List<Store>
}