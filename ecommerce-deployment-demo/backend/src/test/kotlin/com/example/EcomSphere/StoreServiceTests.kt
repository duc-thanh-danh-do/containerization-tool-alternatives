package com.example.EcomSphere

import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Helper.NotFoundActionException
import com.example.EcomSphere.Services.StoreService.*
import com.example.EcomSphere.Services.UserService.User
import com.example.EcomSphere.Services.UserService.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class StoreServiceTests {

    private lateinit var storeRepository: StoreRepository
    private lateinit var userRepository: UserRepository
    private lateinit var storeService: StoreService

    @BeforeEach
    fun setup() {
        storeRepository = mock(StoreRepository::class.java)
        userRepository = mock(UserRepository::class.java)
        storeService = StoreService(storeRepository, userRepository)
    }

    /**
     * Test: Seller can only have one store
     * This is a critical business rule enforced in the service
     */
    @Test
    fun `createStore should throw exception if user already has a store`() {
        // Given
        val ownerId = "user123"
        val user = User(
            id = ownerId,
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            passwordHash = "hash",
            address = "123 Main St",
            isASeller = true,
            emailConfirm = true
        )
        val existingStore = Store(
            id = "store123",
            name = "Existing Store",
            description = "Description",
            address = "456 Store St",
            owner = ownerId,
            phoneNumber = "123456789",
            status = StoreStatus.ACTIVE
        )
        val request = CreateStoreRequest(
            name = "New Store",
            description = "New Description",
            address = "789 New St",
            phoneNumber = "987654321"
        )

        `when`(userRepository.findById(ownerId)).thenReturn(Optional.of(user))
        `when`(storeRepository.findByOwner(ownerId)).thenReturn(listOf(existingStore))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            storeService.createStore(request, ownerId)
        }
        assertEquals("You already have a store. Each seller can only have one store.", exception.message)
    }

    /**
     * Test: Non-seller cannot create a store
     */
    @Test
    fun `createStore should throw exception if user is not a seller`() {
        // Given
        val ownerId = "user123"
        val user = User(
            id = ownerId,
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            passwordHash = "hash",
            address = "123 Main St",
            isASeller = false,
            emailConfirm = true
        )
        val request = CreateStoreRequest(
            name = "New Store",
            description = "New Description",
            address = "789 New St",
            phoneNumber = "987654321"
        )

        `when`(userRepository.findById(ownerId)).thenReturn(Optional.of(user))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            storeService.createStore(request, ownerId)
        }
        assertEquals("User is not allowed to create a store", exception.message)
    }

    /**
     * Test: User with unverified email cannot create a store
     */
    @Test
    fun `createStore should throw exception if email is not verified`() {
        // Given
        val ownerId = "user123"
        val user = User(
            id = ownerId,
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            passwordHash = "hash",
            address = "123 Main St",
            isASeller = true,
            emailConfirm = false
        )
        val request = CreateStoreRequest(
            name = "New Store",
            description = "New Description",
            address = "789 New St",
            phoneNumber = "987654321"
        )

        `when`(userRepository.findById(ownerId)).thenReturn(Optional.of(user))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            storeService.createStore(request, ownerId)
        }
        assertEquals("User is not allowed to create a store", exception.message)
    }

    /**
     * Test: Verified seller can create a store
     */
    @Test
    fun `createStore should succeed for verified seller without existing store`() {
        // Given
        val ownerId = "user123"
        val user = User(
            id = ownerId,
            firstName = "John",
            lastName = "Doe",
            email = "john@example.com",
            passwordHash = "hash",
            address = "123 Main St",
            isASeller = true,
            emailConfirm = true
        )
        val request = CreateStoreRequest(
            name = "New Store",
            description = "New Description",
            address = "789 New St",
            phoneNumber = "987654321"
        )

        `when`(userRepository.findById(ownerId)).thenReturn(Optional.of(user))
        `when`(storeRepository.findByOwner(ownerId)).thenReturn(emptyList())
        `when`(storeRepository.save(any(Store::class.java))).thenAnswer { invocation ->
            val store = invocation.arguments[0] as Store
            store.copy(id = "newstore123")
        }

        // When
        val result = storeService.createStore(request, ownerId)

        // Then
        assertNotNull(result)
        assertEquals("New Store", result.name)
        assertEquals("New Description", result.description)
        assertEquals("789 New St", result.address)
        assertEquals("987654321", result.phoneNumber)
        assertEquals(ownerId, result.owner)
    }

    /**
     * Test: getStoreByOwner returns store for valid owner
     */
    @Test
    fun `getStoreByOwner should return store for valid owner`() {
        // Given
        val ownerId = "user123"
        val store = Store(
            id = "store123",
            name = "Test Store",
            description = "Description",
            address = "123 Store St",
            owner = ownerId,
            phoneNumber = "123456789",
            status = StoreStatus.ACTIVE
        )

        `when`(storeRepository.findByOwner(ownerId)).thenReturn(listOf(store))

        // When
        val result = storeService.getStoreByOwner(ownerId)

        // Then
        assertNotNull(result)
        assertEquals("store123", result.id)
        assertEquals("Test Store", result.name)
    }

    /**
     * Test: getStoreByOwner throws exception when no store found
     */
    @Test
    fun `getStoreByOwner should throw exception when no store found`() {
        // Given
        val ownerId = "user123"
        `when`(storeRepository.findByOwner(ownerId)).thenReturn(emptyList())

        // When/Then
        val exception = assertThrows<NotFoundActionException> {
            storeService.getStoreByOwner(ownerId)
        }
        assertEquals("Store for user user123 not found", exception.message)
    }

    /**
     * Test: getStoreByOwner prefers ACTIVE store over PENDING
     */
    @Test
    fun `getStoreByOwner should prefer ACTIVE store over PENDING`() {
        // Given
        val ownerId = "user123"
        val pendingStore = Store(
            id = "pending123",
            name = "Pending Store",
            description = "Description",
            address = "123 Store St",
            owner = ownerId,
            phoneNumber = "123456789",
            status = StoreStatus.PENDING
        )
        val activeStore = Store(
            id = "active123",
            name = "Active Store",
            description = "Description",
            address = "456 Store St",
            owner = ownerId,
            phoneNumber = "987654321",
            status = StoreStatus.ACTIVE
        )

        `when`(storeRepository.findByOwner(ownerId)).thenReturn(listOf(pendingStore, activeStore))

        // When
        val result = storeService.getStoreByOwner(ownerId)

        // Then
        assertEquals("active123", result.id)
        assertEquals("Active Store", result.name)
        assertEquals(StoreStatus.ACTIVE, result.status)
    }

    /**
     * Test: Only store owner can update store
     */
    @Test
    fun `updateStore should throw exception if user is not owner`() {
        // Given
        val storeId = "store123"
        val ownerId = "user123"
        val differentUserId = "user456"
        val store = Store(
            id = storeId,
            name = "Test Store",
            description = "Description",
            address = "123 Store St",
            owner = ownerId,
            phoneNumber = "123456789",
            status = StoreStatus.ACTIVE
        )
        val request = UpdateStoreRequest(
            name = "Updated Name",
            phoneNumber = null,
            description = null,
            address = null,
            status = null
        )

        `when`(storeRepository.findById(storeId)).thenReturn(Optional.of(store))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            storeService.updateStore(request, differentUserId, storeId)
        }
        assertEquals("You are now allow to update store details", exception.message)
    }

    /**
     * Test: Only store owner can delete store
     */
    @Test
    fun `deleteStore should throw exception if user is not owner`() {
        // Given
        val storeId = "store123"
        val ownerId = "user123"
        val differentUserId = "user456"
        val store = Store(
            id = storeId,
            name = "Test Store",
            description = "Description",
            address = "123 Store St",
            owner = ownerId,
            phoneNumber = "123456789",
            status = StoreStatus.ACTIVE
        )

        `when`(storeRepository.findById(storeId)).thenReturn(Optional.of(store))

        // When/Then
        val exception = assertThrows<ForbiddenActionException> {
            storeService.deleteStore(storeId, differentUserId)
        }
        assertEquals("You are not allow to delete this store", exception.message)
    }
}
