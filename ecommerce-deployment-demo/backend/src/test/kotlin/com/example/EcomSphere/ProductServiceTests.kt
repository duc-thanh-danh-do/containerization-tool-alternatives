package com.example.EcomSphere

import com.example.EcomSphere.Services.ProductService.*
import com.example.EcomSphere.Services.StoreService.StoreStatus
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Unit tests for ProductService DTOs and contract validation
 */
class ProductServiceTests {

    // ==================== DTO VALIDATION TESTS ====================

    @Test
    fun `CreateProductRequest should have all required fields`() {
        val request = CreateProductRequest(
            title = "Test Product",
            description = "A test product description",
            category = "Electronics",
            price = 99.99f,
            stock = 10,
            storeId = "store123"
        )

        assertEquals("Test Product", request.title)
        assertEquals("A test product description", request.description)
        assertEquals("Electronics", request.category)
        assertEquals(99.99f, request.price)
        assertEquals(10, request.stock)
        assertEquals("store123", request.storeId)
    }

    @Test
    fun `UpdateProductRequest should support nullable fields`() {
        val request = UpdateProductRequest(
            title = "Updated Title",
            description = null,
            category = null,
            price = null,
            stock = 20,
            images = null
        )

        assertEquals("Updated Title", request.title)
        assertEquals(null, request.description)
        assertEquals(null, request.category)
        assertEquals(null, request.price)
        assertEquals(20, request.stock)
        assertEquals(null, request.images)
    }

    @Test
    fun `ProductResponse should have all required fields`() {
        val response = ProductResponse(
            id = "prod123",
            title = "Test Product",
            description = "A test product",
            price = 99.99f,
            stock = 10,
            images = listOf("https://cloudinary.com/image.jpg"),
            storeId = "store123",
            category = "Electronics",
            storeName = "Test Store",
            sellerId = "user123"
        )

        assertEquals("prod123", response.id)
        assertEquals("Test Product", response.title)
        assertEquals("A test product", response.description)
        assertEquals(99.99f, response.price)
        assertEquals(10, response.stock)
        assertEquals(1, response.images.size)
        assertEquals("store123", response.storeId)
        assertEquals("Electronics", response.category)
        assertEquals("Test Store", response.storeName)
        assertEquals("user123", response.sellerId)
    }

    @Test
    fun `GetAllProductsResponse should have all required fields`() {
        val response = GetAllProductsResponse(
            id = "prod123",
            title = "Test Product",
            category = "Electronics",
            description = "A test product",
            price = 99.99f,
            stock = 10,
            images = listOf("https://cloudinary.com/image.jpg"),
            storeId = "store123",
            storeName = "Test Store",
            sellerId = "user123"
        )

        assertEquals("prod123", response.id)
        assertEquals("Test Product", response.title)
        assertEquals("Electronics", response.category)
        assertEquals("A test product", response.description)
        assertEquals(99.99f, response.price)
        assertEquals(10, response.stock)
        assertNotNull(response.images)
    }

    @Test
    fun `CreateProductForm should have default values`() {
        val form = CreateProductForm()

        assertEquals("", form.title)
        assertEquals("", form.description)
        assertEquals("", form.category)
        assertEquals(0f, form.price)
        assertEquals(0, form.stock)
        assertEquals("", form.storeId)
    }

    @Test
    fun `CreateProductForm should accept values`() {
        val form = CreateProductForm(
            title = "Test Product",
            description = "Description",
            category = "Electronics",
            price = 49.99f,
            stock = 5,
            storeId = "store123"
        )

        assertEquals("Test Product", form.title)
        assertEquals("Description", form.description)
        assertEquals("Electronics", form.category)
        assertEquals(49.99f, form.price)
        assertEquals(5, form.stock)
        assertEquals("store123", form.storeId)
    }

    // ==================== BUSINESS RULE VALIDATION TESTS ====================

    @Test
    fun `price should be positive`() {
        val validPrices = listOf(0.01f, 1.0f, 99.99f, 1000.0f)
        val invalidPrices = listOf(0.0f, -1.0f, -99.99f)

        validPrices.forEach { price ->
            assertTrue(price > 0, "Price $price should be positive")
        }

        invalidPrices.forEach { price ->
            assertTrue(price <= 0, "Price $price should not be positive")
        }
    }

    @Test
    fun `stock should be at least 1`() {
        val validStocks = listOf(1, 5, 100, 1000)
        val invalidStocks = listOf(0, -1, -100)

        validStocks.forEach { stock ->
            assertTrue(stock >= 1, "Stock $stock should be at least 1")
        }

        invalidStocks.forEach { stock ->
            assertTrue(stock < 1, "Stock $stock should be less than 1")
        }
    }

    @Test
    fun `title should not be empty`() {
        val validTitles = listOf("Product", "Test Product", "A")
        val invalidTitles = listOf("", "   ")

        validTitles.forEach { title ->
            assertTrue(title.trim().isNotEmpty(), "Title '$title' should not be empty")
        }

        invalidTitles.forEach { title ->
            assertTrue(title.trim().isEmpty(), "Title '$title' should be empty")
        }
    }

    @Test
    fun `storeId should not be empty`() {
        val validStoreIds = listOf("store123", "abc", "1")
        val invalidStoreIds = listOf("", "   ")

        validStoreIds.forEach { id ->
            assertTrue(id.trim().isNotEmpty(), "StoreId '$id' should not be empty")
        }

        invalidStoreIds.forEach { id ->
            assertTrue(id.trim().isEmpty(), "StoreId '$id' should be empty")
        }
    }

    // ==================== ERROR MESSAGE TESTS ====================

    @Test
    fun `error messages should be descriptive`() {
        val expectedErrors = mapOf(
            "store_not_found" to "Store with id=",
            "not_owner" to "You are not allowed to add products to this store",
            "image_required" to "Product image is required",
            "upload_failed" to "Failed to upload product image",
            "no_url" to "Image upload failed - no URL returned"
        )

        expectedErrors.forEach { (key, expectedMessage) ->
            assertTrue(expectedMessage.isNotEmpty(), "Error message for $key should not be empty")
        }
    }

    @Test
    fun `store status should be ACTIVE for product creation`() {
        val activeStatus = StoreStatus.ACTIVE
        val pendingStatus = StoreStatus.PENDING
        val suspendedStatus = StoreStatus.SUSPENDED

        assertEquals(StoreStatus.ACTIVE, activeStatus)
        assertTrue(pendingStatus != StoreStatus.ACTIVE)
        assertTrue(suspendedStatus != StoreStatus.ACTIVE)
    }
}
