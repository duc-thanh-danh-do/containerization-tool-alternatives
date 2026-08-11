package com.example.EcomSphere.Services.UserService

import com.example.EcomSphere.Helper.AlreadyASellerException
import com.example.EcomSphere.Helper.EmailAlreadyVerifiedException
import com.example.EcomSphere.Helper.ForbiddenActionException
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service


@Service
class EmailService(
    private val mailSender: JavaMailSender,
    private val userRepository: UserRepository,
    @Value("\${spring.mail.from}") private val from: String,
    @Value("\${app.base-url}") private val baseUrl: String,
) {
    fun sendVerificationEmail(email: String, token: String) {
        val verifyUrl = "$baseUrl/auth/verify-email/$token"

        val message = SimpleMailMessage().apply {
            setFrom(from)
            setTo(email)
            subject = "Verify your email"
            text = """
                Hi,
                
                Please verify your email by clicking the link below:
                $verifyUrl
                
                If you do not want to be a seller, ignore this email.
            """.trimIndent()
        }

        val userRef = userRepository.findByEmail(email)
            .orElseThrow{ForbiddenActionException("User not found")}
        if (userRef.isASeller == true){
            throw AlreadyASellerException("User is already a seller")
        }
        if (userRef.emailConfirm == true)
            throw EmailAlreadyVerifiedException("Email already verified")

        try {
            mailSender.send(message)
        } catch (ex: Exception) {
            ex.printStackTrace()
            // In dev/demo, we don't fail the whole request if email sending breaks.
            // The caller can still proceed.
        }
    }

    fun sendEmail(message: SimpleMailMessage) {
        message.setFrom(from)
        try {
            mailSender.send(message)
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }

    fun resendVerificationEmail(email: String, token: String) {
        val verifyUrl = "$baseUrl/auth/verify-email/$token"

        val message = SimpleMailMessage().apply {
            setFrom(from)
            setTo(email)
            subject = "Verify your email - Resend"
            text = """
                Hi,
                
                Please verify your email by clicking the link below:
                $verifyUrl
                
                If you did not request this, please ignore this email.
            """.trimIndent()
        }

        try {
            mailSender.send(message)
        } catch (ex: Exception) {
            // Silent fail for email resend
        }
    }
}