package com.example.EcomSphere.Services.UserService

data class CreateUserRequest(val firstName: String, val address: String, val phone: String, val email: String, val lastName: String)
data class GetUsersResponse(
    val firstName: String, 
    val lastName: String, 
    val email: String, 
    val id: String?, 
    val isASeller: Boolean, 
    val emailConfirm: Boolean,
    val address: String,
    val savedShippingAddress: SavedShippingAddress? = null,
    val savedPaymentMethod: SavedPaymentMethod? = null
)

data class SaveShippingAddressRequest(
    val fullName: String,
    val addressLine1: String,
    val city: String,
    val postalCode: String,
    val country: String
)

data class SavePaymentMethodRequest(
    val cardLastFour: String,
    val cardExpiry: String,
    val cardType: String? = null
)

data class SaveCheckoutInfoRequest(
    val shippingAddress: SaveShippingAddressRequest? = null,
    val paymentMethod: SavePaymentMethodRequest? = null
)

data class UpdateProfileRequest(
    val firstName: String? = null,
    val lastName: String? = null
)