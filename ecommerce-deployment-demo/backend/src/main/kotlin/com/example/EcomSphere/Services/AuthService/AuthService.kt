package com.example.EcomSphere.Services.AuthService

import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Helper.NotFoundActionException
import com.example.EcomSphere.MiddleWare.JwtUtil
import com.example.EcomSphere.Services.StoreService.StoreRepository
import com.example.EcomSphere.Services.StoreService.StoreStatus
import com.example.EcomSphere.Services.UserService.User
import com.example.EcomSphere.Services.UserService.UserRepository

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val repo: UserRepository,
    private val jwt: JwtUtil,
    private val storeRepository: StoreRepository,
) {

    private val bcrypt = BCryptPasswordEncoder()

    fun register(req: RegisterRequest) {
        val email = req.email.lowercase()
        if (repo.existsByEmail(email)) throw ForbiddenActionException("Email already in use")
        repo.save(
            User(
                email = email,
                firstName = req.firstName,
                lastName = req.lastName,
                address = req.address,
                passwordHash = bcrypt.encode(req.password),
                isASeller = false,
                emailConfirm = false
            )
        )
    }

    fun login(req: LoginRequest): AuthResponse {
        val user = repo.findByEmail(req.email.lowercase())
            .orElseThrow { ForbiddenActionException("Invalid credentials") }
        if (!bcrypt.matches(req.password, user.passwordHash)) {
            throw ForbiddenActionException("Invalid credentials")
        }
        return AuthResponse(
            token = jwt.generate(user.email),
            userId = user.id!!
        )
    }

    fun verifyEmail(email: String) {
        val user = repo.findByEmail(email.lowercase())
            .orElseThrow { ForbiddenActionException("Invalid credential") }

        user.isASeller = true
        user.emailConfirm = true
        repo.save(user)

        val userId = user.id
        if (userId != null) {
            val stores = storeRepository.findByOwner(userId)
            stores.forEach { store ->
                if (store.status == StoreStatus.PENDING) {
                    storeRepository.save(store.copy(status = StoreStatus.ACTIVE))
                }
            }
        }
    }

    fun checkEmail(email: String): Boolean {
        return repo.findByEmail(email).isPresent
    }
}