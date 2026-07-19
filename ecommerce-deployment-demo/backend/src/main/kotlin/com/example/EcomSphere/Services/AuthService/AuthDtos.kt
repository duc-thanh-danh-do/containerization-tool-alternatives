package com.example.EcomSphere.Services.AuthService

data class RegisterRequest(val firstName: String, val email: String, val password: String, val lastName: String, val address: String)
data class LoginRequest(val email: String, val password: String)
data class EmailVerifyRequest(val email: String)
data class AuthResponse(val token: String, val userId: String)