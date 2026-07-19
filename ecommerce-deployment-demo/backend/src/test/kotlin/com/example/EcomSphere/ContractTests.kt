package com.example.EcomSphere

import com.example.EcomSphere.Services.AuthService.*
import com.example.EcomSphere.Services.UserService.*
import com.example.EcomSphere.Services.StoreService.*
import com.example.EcomSphere.Services.OrderService.*
import com.example.EcomSphere.Services.ProductService.*
import com.example.EcomSphere.Services.ReviewService.*
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Contract Tests - Validates that DTOs match API_CONTRACT.md
 * 
 * These tests ensure the backend DTOs have the correct structure
 * that matches the documented API contract.
 */
class ContractTests {

    /**
     * Auth Contract: POST /auth/register
     * Request must have: email, password, firstName, lastName, address
     */
    @Test
    fun `RegisterRequest should have all required fields`() {
        val request = RegisterRequest(
            email = "test@example.com",
            password = "SecurePass123",
            firstName = "John",
            lastName = "Doe",
            address = "123 Main St"
        )

        assertEquals("test@example.com", request.email)
        assertEquals("SecurePass123", request.password)
        assertEquals("John", request.firstName)
        assertEquals("Doe", request.lastName)
        assertEquals("123 Main St", request.address)
    }

    /**
     * Auth Contract: POST /auth/login
     * Request must have: email, password
     * Response must have: token
     */
    @Test
    fun `LoginRequest should have email and password`() {
        val request = LoginRequest(
            email = "test@example.com",
            password = "SecurePass123"
        )

        assertEquals("test@example.com", request.email)
        assertEquals("SecurePass123", request.password)
    }

    @Test
    fun `AuthResponse should have token`() {
        val response = AuthResponse(token = "jwt-token-here")
        assertEquals("jwt-token-here", response.token)
    }

    /**
     * User Contract: GET /users
     * Response must have: id, firstName, lastName, email, isASeller, emailConfirm, address
     */
    @Test
    fun `GetUsersResponse should have all required fields`() {
        val response = GetUsersResponse(
            id = "user123",
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            isASeller = false,
            emailConfirm = true,
            address = "123 Main St",
            savedShippingAddress = null,
            savedPaymentMethod = null
        )

        assertEquals("user123", response.id)
        assertEquals("John", response.firstName)
        assertEquals("Doe", response.lastName)
        assertEquals("john@example.com", response.email)
        assertEquals(false, response.isASeller)
        assertEquals(true, response.emailConfirm)
        assertEquals("123 Main St", response.address)
    }

    @Test
    fun `GetUsersResponse should support savedShippingAddress`() {
        val response = GetUsersResponse(
            id = "user123",
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            isASeller = false,
            emailConfirm = true,
            address = "123 Main St",
            savedShippingAddress = SavedShippingAddress(
                fullName = "John Doe",
                addressLine1 = "123 Main St",
                city = "Helsinki",
                postalCode = "00100",
                country = "Finland"
            ),
            savedPaymentMethod = null
        )

        assertNotNull(response.savedShippingAddress)
        assertEquals("John Doe", response.savedShippingAddress?.fullName)
        assertEquals("123 Main St", response.savedShippingAddress?.addressLine1)
        assertEquals("Helsinki", response.savedShippingAddress?.city)
        assertEquals("00100", response.savedShippingAddress?.postalCode)
        assertEquals("Finland", response.savedShippingAddress?.country)
    }

    /**
     * User Contract: PUT /users/checkout-info
     * Request can have: shippingAddress, paymentMethod (both optional)
     */
    @Test
    fun `SaveCheckoutInfoRequest should support optional fields`() {
        val requestWithShipping = SaveCheckoutInfoRequest(
            shippingAddress = SaveShippingAddressRequest(
                fullName = "John Doe",
                addressLine1 = "123 Main St",
                city = "Helsinki",
                postalCode = "00100",
                country = "Finland"
            ),
            paymentMethod = null
        )

        assertNotNull(requestWithShipping.shippingAddress)
        assertEquals(null, requestWithShipping.paymentMethod)

        val requestWithPayment = SaveCheckoutInfoRequest(
            shippingAddress = null,
            paymentMethod = SavePaymentMethodRequest(
                cardLastFour = "4242",
                cardExpiry = "12/25",
                cardType = "visa"
            )
        )

        assertEquals(null, requestWithPayment.shippingAddress)
        assertNotNull(requestWithPayment.paymentMethod)
    }

    /**
     * Store Contract: POST /users/become-seller
     * Request must have: name, phoneNumber, description, address
     */
    @Test
    fun `CreateStoreRequest should have all required fields`() {
        val request = CreateStoreRequest(
            name = "My Store",
            phoneNumber = "+358401234567",
            description = "A great store",
            address = "456 Store St"
        )

        assertEquals("My Store", request.name)
        assertEquals("+358401234567", request.phoneNumber)
        assertEquals("A great store", request.description)
        assertEquals("456 Store St", request.address)
    }

    /**
     * Store Contract: GET /stores/user/{userId}
     * Response must have: id, name, phoneNumber, description, owner, address, status
     */
    @Test
    fun `StoreResponse should have all required fields`() {
        val response = StoreResponse(
            id = "store123",
            name = "My Store",
            phoneNumber = "+358401234567",
            description = "A great store",
            owner = "user123",
            address = "456 Store St",
            status = StoreStatus.ACTIVE
        )

        assertEquals("store123", response.id)
        assertEquals("My Store", response.name)
        assertEquals("+358401234567", response.phoneNumber)
        assertEquals("A great store", response.description)
        assertEquals("user123", response.owner)
        assertEquals("456 Store St", response.address)
        assertEquals(StoreStatus.ACTIVE, response.status)
    }

    @Test
    fun `StoreStatus should have correct values`() {
        val statuses = StoreStatus.values()
        assertTrue(statuses.contains(StoreStatus.PENDING))
        assertTrue(statuses.contains(StoreStatus.ACTIVE))
        assertTrue(statuses.contains(StoreStatus.SUSPENDED))
        assertEquals(3, statuses.size)
    }

    /**
     * Product Contract: GET /products
     * Response items must have: id, title, category, description, price, stock, images
     */
    @Test
    fun `GetAllProductsResponse should have all required fields`() {
        val response = GetAllProductsResponse(
            id = "prod123",
            title = "Test Product",
            category = "Electronics",
            description = "A test product",
            price = 99.99f,
            stock = 10,
            images = listOf("https://example.com/image.jpg"),
            storeId = "store123",
            storeName = "My Store",
            sellerId = "user123"
        )

        assertEquals("prod123", response.id)
        assertEquals("Test Product", response.title)
        assertEquals("Electronics", response.category)
        assertEquals("A test product", response.description)
        assertEquals(99.99f, response.price)
        assertEquals(10, response.stock)
        assertEquals(1, response.images.size)
    }

    /**
     * Order Contract: POST /api/orders
     * Request must have: items, shippingAddress, paymentMethod
     */
    @Test
    fun `CreateOrderRequest should have all required fields`() {
        val request = CreateOrderRequest(
            items = listOf(
                OrderItemRequest(
                    productId = "prod123",
                    productTitle = "Test Product",
                    productImage = "https://example.com/image.jpg",
                    quantity = 2,
                    price = 99.99,
                    sellerId = "user123"
                )
            ),
            shippingAddress = ShippingAddressRequest(
                fullName = "John Doe",
                addressLine1 = "123 Main St",
                addressLine2 = null,
                city = "Helsinki",
                postalCode = "00100",
                country = "Finland",
                phoneNumber = "+358401234567"
            ),
            paymentMethod = "card",
            shippingCost = 5.99,
            taxAmount = 24.00
        )

        assertEquals(1, request.items.size)
        assertEquals("prod123", request.items[0].productId)
        assertEquals(2, request.items[0].quantity)
        assertEquals("John Doe", request.shippingAddress.fullName)
        assertEquals("card", request.paymentMethod)
        assertEquals(5.99, request.shippingCost)
        assertEquals(24.00, request.taxAmount)
    }

    @Test
    fun `OrderStatus should have correct values`() {
        val statuses = OrderStatus.values()
        assertTrue(statuses.contains(OrderStatus.PENDING))
        assertTrue(statuses.contains(OrderStatus.CONFIRMED))
        assertTrue(statuses.contains(OrderStatus.PROCESSING))
        assertTrue(statuses.contains(OrderStatus.SHIPPED))
        assertTrue(statuses.contains(OrderStatus.DELIVERED))
        assertTrue(statuses.contains(OrderStatus.CANCELLED))
        assertEquals(6, statuses.size)
    }

    /**
     * Review Contract: POST /reviews
     * Request must have: productId, rating, reviewText
     */
    @Test
    fun `CreateReviewRequest should have all required fields`() {
        val request = CreateReviewRequest(
            productId = "prod123",
            rating = 5,
            reviewText = "Great product!"
        )

        assertEquals("prod123", request.productId)
        assertEquals(5, request.rating)
        assertEquals("Great product!", request.reviewText)
    }

    @Test
    fun `ReviewResponse should have all required fields`() {
        val response = ReviewResponse(
            id = "review123",
            productId = "prod123",
            userId = "user123",
            userName = "John Doe",
            rating = 5,
            reviewText = "Great product!",
            createdAt = "2024-01-15T10:30:00"
        )

        assertEquals("review123", response.id)
        assertEquals("prod123", response.productId)
        assertEquals("user123", response.userId)
        assertEquals("John Doe", response.userName)
        assertEquals(5, response.rating)
        assertEquals("Great product!", response.reviewText)
        assertEquals("2024-01-15T10:30:00", response.createdAt)
    }

    @Test
    fun `AverageRatingResponse should have all required fields`() {
        val response = AverageRatingResponse(
            productId = "prod123",
            averageRating = 4.5,
            totalReviews = 10
        )

        assertEquals("prod123", response.productId)
        assertEquals(4.5, response.averageRating)
        assertEquals(10, response.totalReviews)
    }

    /**
     * Update requests should support nullable fields
     */
    @Test
    fun `UpdateStoreRequest should support nullable fields`() {
        val request = UpdateStoreRequest(
            name = "Updated Name",
            phoneNumber = null,
            description = null,
            address = null,
            status = null
        )

        assertEquals("Updated Name", request.name)
        assertEquals(null, request.phoneNumber)
        assertEquals(null, request.description)
        assertEquals(null, request.address)
        assertEquals(null, request.status)
    }

    @Test
    fun `UpdateReviewRequest should support nullable fields`() {
        val request = UpdateReviewRequest(
            rating = 4,
            reviewText = null
        )

        assertEquals(4, request.rating)
        assertEquals(null, request.reviewText)
    }
}
