package com.example.EcomSphere.MiddleWare

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) {
    private val key: SecretKey = run {
        val raw: ByteArray =
            if (secret.startsWith("base64:", ignoreCase = true)) {
                Base64.getDecoder().decode(secret.removePrefix("base64:"))
            } else {
                secret.toByteArray(Charsets.UTF_8)
            }

        require(raw.size >= 32) { "JWT secret must be at least 32 bytes for HS256." }
        Keys.hmacShaKeyFor(raw)
    }

    //Generate jwt key
    fun generate(email: String): String {
        val now = Date()
        return Jwts.builder()
            .subject(email)
            .issuedAt(now)
            .expiration(Date(now.time + expirationMs))
            .signWith(key)
            .compact()
    }

    //Verify jwt
    fun verifyAndGetEmail(token: String): String? =
        try {
            Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).payload.subject
        } catch (_: Exception) {
            null
        }
}