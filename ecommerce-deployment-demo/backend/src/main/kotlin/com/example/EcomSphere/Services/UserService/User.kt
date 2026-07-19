package com.example.EcomSphere.Services.UserService

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document

@Document("users")
data class User(
    @Id val id: String? = null,
    @Indexed(unique = true) var email: String,
    var lastName: String,
    var passwordHash: String,
    var isASeller: Boolean? = null,
    var emailConfirm: Boolean? = null,
    var address: String,
    var firstName: String,
    var savedShippingAddress: SavedShippingAddress? = null,
    var savedPaymentMethod: SavedPaymentMethod? = null
)

data class SavedShippingAddress(
    val fullName: String,
    val addressLine1: String,
    val city: String,
    val postalCode: String,
    val country: String
)

data class SavedPaymentMethod(
    val cardLastFour: String,
    val cardExpiry: String,
    val cardType: String? = null
)