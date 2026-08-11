package com.example.EcomSphere.Services.AuthService

import com.example.EcomSphere.MiddleWare.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/auth")
class AuthController(
    private val auth: AuthService,
    private val jwtUtil: JwtUtil
) {

    @PostMapping("/register")
    fun register(@RequestBody req: RegisterRequest): ResponseEntity<Unit> =
        runCatching { ResponseEntity.ok(auth.register(req)) }
            .getOrElse { throw ResponseStatusException(HttpStatus.BAD_REQUEST, it.message) }

    @PostMapping("/login")
    fun login(@RequestBody req: LoginRequest): ResponseEntity<AuthResponse> =
        runCatching { ResponseEntity.ok(auth.login(req)) }
            .getOrElse { throw ResponseStatusException(HttpStatus.UNAUTHORIZED, it.message) }

    @GetMapping("/verify-email/{token}")
    fun emailVerify(@PathVariable token: String): ResponseEntity<String> {
        val email = jwtUtil.verifyAndGetEmail(token)
            ?: return ResponseEntity.badRequest().body("Invalid or expired token")

        auth.verifyEmail(email)

        return ResponseEntity.ok("Email verified successfully.")
    }

    @GetMapping("/check-email/{email}")
    fun checkEmail(@PathVariable email: String): ResponseEntity<Map<String, Boolean>> {
        val exists = auth.checkEmail(email)
        return ResponseEntity.ok(mapOf("exists" to exists))
    }

}