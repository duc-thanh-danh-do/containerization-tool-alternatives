package com.example.EcomSphere

import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Services.AuthService.AuthService
import com.example.EcomSphere.Services.AuthService.LoginRequest
import com.example.EcomSphere.Services.AuthService.RegisterRequest
import com.example.EcomSphere.Services.UserService.User
import com.example.EcomSphere.Services.UserService.UserRepository
import com.example.EcomSphere.Services.StoreService.StoreRepository
import com.example.EcomSphere.MiddleWare.JwtUtil
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class AuthServiceTests {

    private lateinit var userRepository: UserRepository
    private lateinit var storeRepository: StoreRepository
    private lateinit var jwtUtil: JwtUtil
    private lateinit var authService: AuthService
    private val bcrypt = BCryptPasswordEncoder()

    @BeforeEach
    fun setup() {
        userRepository = mock(UserRepository::class.java)
        storeRepository = mock(StoreRepository::class.java)
        jwtUtil = mock(JwtUtil::class.java)
        authService = AuthService(userRepository, jwtUtil, storeRepository)
    }

    /**
     * Test: Registration with firstName and lastName fields
     * Root cause: Client was sending 'name' instead of 'firstName' and 'lastName'
     * This test verifies the server correctly accepts firstName/lastName fields
     */
    @Test
    fun `register should accept firstName and lastName fields`() {
        // Given
        val request = RegisterRequest(
            firstName = "John",
            lastName = "Doe",
            email = "john.doe@example.com",
            password = "SecurePass123",
            address = "123 Main St"
        )
        `when`(userRepository.existsByEmail("john.doe@example.com")).thenReturn(false)
        `when`(userRepository.save(any(User::class.java))).thenAnswer { it.arguments[0] }

        // When
        authService.register(request)

        // Then
        verify(userRepository).save(argThat { user: User ->
            user.firstName == "John" &&
            user.lastName == "Doe" &&
            user.email == "john.doe@example.com" &&
            user.address == "123 Main St" &&
            user.isASeller == false &&
            user.emailConfirm == false
        })
    }

    /**
     * Test: Registration should fail for duplicate email
     */
    @Test
    fun `register should throw exception for duplicate email`() {
        // Given
        val request = RegisterRequest(
            firstName = "John",
            lastName = "Doe",
            email = "existing@example.com",
            password = "SecurePass123",
            address = "123 Main St"
        )
        `when`(userRepository.existsByEmail("existing@example.com")).thenReturn(true)

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            authService.register(request)
        }
        assertEquals("Email already in use", exception.message)
    }

    /**
     * Test: Registration should lowercase email
     */
    @Test
    fun `register should lowercase email before saving`() {
        // Given
        val request = RegisterRequest(
            firstName = "John",
            lastName = "Doe",
            email = "John.Doe@EXAMPLE.COM",
            password = "SecurePass123",
            address = "123 Main St"
        )
        `when`(userRepository.existsByEmail("john.doe@example.com")).thenReturn(false)
        `when`(userRepository.save(any(User::class.java))).thenAnswer { it.arguments[0] }

        // When
        authService.register(request)

        // Then
        verify(userRepository).existsByEmail("john.doe@example.com")
        verify(userRepository).save(argThat { user: User ->
            user.email == "john.doe@example.com"
        })
    }

    /**
     * Test: Login should return token for valid credentials
     */
    @Test
    fun `login should return token for valid credentials`() {
        // Given
        val hashedPassword = bcrypt.encode("SecurePass123")
        val user = User(
            id = "user123",
            firstName = "John",
            lastName = "Doe",
            email = "john.doe@example.com",
            passwordHash = hashedPassword,
            address = "123 Main St",
            isASeller = false,
            emailConfirm = false
        )
        val request = LoginRequest(email = "john.doe@example.com", password = "SecurePass123")
        
        `when`(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(user))
        `when`(jwtUtil.generate("john.doe@example.com")).thenReturn("mock-jwt-token")

        // When
        val response = authService.login(request)

        // Then
        assertNotNull(response.token)
        assertEquals("mock-jwt-token", response.token)
    }

    /**
     * Test: Login should fail for invalid password
     */
    @Test
    fun `login should throw exception for invalid password`() {
        // Given
        val hashedPassword = bcrypt.encode("CorrectPassword")
        val user = User(
            id = "user123",
            firstName = "John",
            lastName = "Doe",
            email = "john.doe@example.com",
            passwordHash = hashedPassword,
            address = "123 Main St",
            isASeller = false,
            emailConfirm = false
        )
        val request = LoginRequest(email = "john.doe@example.com", password = "WrongPassword")
        
        `when`(userRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(user))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            authService.login(request)
        }
        assertEquals("Invalid credentials", exception.message)
    }

    /**
     * Test: Login should fail for non-existent user
     */
    @Test
    fun `login should throw exception for non-existent user`() {
        // Given
        val request = LoginRequest(email = "nonexistent@example.com", password = "AnyPassword")
        `when`(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty())

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            authService.login(request)
        }
        assertEquals("Invalid credentials", exception.message)
    }

    /**
     * Test: New user should have isASeller = false
     * This ensures the "Become a Seller" link shows for new users
     */
    @Test
    fun `new user should have isASeller set to false`() {
        // Given
        val request = RegisterRequest(
            firstName = "New",
            lastName = "User",
            email = "newuser@example.com",
            password = "SecurePass123",
            address = "456 New St"
        )
        `when`(userRepository.existsByEmail("newuser@example.com")).thenReturn(false)
        `when`(userRepository.save(any(User::class.java))).thenAnswer { it.arguments[0] }

        // When
        authService.register(request)

        // Then
        verify(userRepository).save(argThat { user: User ->
            user.isASeller == false
        })
    }
}
