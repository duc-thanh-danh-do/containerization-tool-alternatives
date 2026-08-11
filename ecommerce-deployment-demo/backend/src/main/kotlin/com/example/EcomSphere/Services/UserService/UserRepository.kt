package com.example.EcomSphere.Services.UserService

import org.springframework.data.mongodb.repository.MongoRepository
import java.util.*

interface UserRepository : MongoRepository<User, String>{
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
}