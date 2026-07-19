package com.example.EcomSphere.Services.HealthService

import com.cloudinary.Cloudinary
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class DependencyStatus(
    val status: String,
    val configured: Boolean,
    val mockMode: Boolean? = null,
    val latency: Long? = null,
    val error: String? = null
)

data class HealthResponse(
    val status: String,
    val dependencies: Map<String, DependencyStatus>
)

@RestController
@RequestMapping("/health")
class HealthController(
    private val mongoTemplate: MongoTemplate,
    private val cloudinary: Cloudinary,
    @Value("\${cloudinary.use-mock:true}") private val cloudinaryMockMode: Boolean,
    @Value("\${stripe.use-mock:true}") private val stripeMockMode: Boolean,
    @Value("\${stripe.api-key:}") private val stripeApiKey: String,
    @Value("\${spring.mail.username:}") private val mailUsername: String
) {

    @GetMapping("/deps")
    fun checkDependencies(): ResponseEntity<HealthResponse> {
        val dependencies = mutableMapOf<String, DependencyStatus>()
        var overallHealthy = true

        // Check MongoDB
        dependencies["mongodb"] = checkMongoDB()
        if (dependencies["mongodb"]?.status != "up") {
            overallHealthy = false
        }

        // Check Cloudinary
        dependencies["cloudinary"] = checkCloudinary()

        // Check Stripe
        dependencies["stripe"] = checkStripe()

        // Check Email
        dependencies["email"] = checkEmail()

        val status = if (overallHealthy) "healthy" else "degraded"

        return ResponseEntity.ok(HealthResponse(
            status = status,
            dependencies = dependencies
        ))
    }

    @GetMapping
    fun healthCheck(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("status" to "up"))
    }

    @GetMapping("/live")
    fun livenessCheck(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("status" to "up"))
    }

    @GetMapping("/ready")
    fun readinessCheck(): ResponseEntity<HealthResponse> {
        val mongodb = checkMongoDB()
        val ready = mongodb.status == "up"
        val response = HealthResponse(
            status = if (ready) "ready" else "not_ready",
            dependencies = mapOf("mongodb" to mongodb)
        )

        return if (ready) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response)
        }
    }

    private fun checkMongoDB(): DependencyStatus {
        return try {
            val startTime = System.currentTimeMillis()
            mongoTemplate.db.runCommand(org.bson.Document("ping", 1))
            val latency = System.currentTimeMillis() - startTime

            DependencyStatus(
                status = "up",
                configured = true,
                latency = latency
            )
        } catch (e: Exception) {
            DependencyStatus(
                status = "down",
                configured = true,
                error = e.message
            )
        }
    }

    private fun checkCloudinary(): DependencyStatus {
        val config = cloudinary.config
        val isConfigured = !config.cloudName.isNullOrBlank() &&
                          !config.apiKey.isNullOrBlank() &&
                          !config.apiSecret.isNullOrBlank()

        return if (cloudinaryMockMode) {
            DependencyStatus(
                status = "up",
                configured = isConfigured,
                mockMode = true
            )
        } else {
            if (isConfigured) {
                DependencyStatus(
                    status = "up",
                    configured = true,
                    mockMode = false
                )
            } else {
                DependencyStatus(
                    status = "down",
                    configured = false,
                    mockMode = false,
                    error = "Cloudinary credentials not configured"
                )
            }
        }
    }

    private fun checkStripe(): DependencyStatus {
        val isConfigured = stripeApiKey.isNotBlank() && 
                          !stripeApiKey.contains("mock")

        return DependencyStatus(
            status = "up",
            configured = isConfigured || stripeMockMode,
            mockMode = stripeMockMode
        )
    }

    private fun checkEmail(): DependencyStatus {
        val isConfigured = mailUsername.isNotBlank()

        return DependencyStatus(
            status = if (isConfigured) "up" else "unconfigured",
            configured = isConfigured
        )
    }
}
