package com.example.EcomSphere.Services.StoreService

import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Helper.NotFoundActionException
import com.example.EcomSphere.Services.UserService.UserRepository
import org.springframework.stereotype.Service

@Service
class StoreService(
    private val storeRepository: StoreRepository,
    private val userRepository: UserRepository
) {
    private fun Store.toResponse(): StoreResponse =
        StoreResponse(
            id = this.id!!,
            name = this.name,
            description = this.description,
            address = this.address!!,
            owner = this.owner,
            phoneNumber = this.phoneNumber,
            status = this.status,
            avatar = this.avatar,
            cover = this.cover
        )

    fun createStore(req: CreateStoreRequest, owner: String): StoreResponse {
        val user = userRepository.findById(owner)
            .orElseThrow { NotFoundActionException("User with id ${owner} is not available") }

        if (user.isASeller != true || user.emailConfirm != true) {
            throw ForbiddenActionException("User is not allowed to create a store")
        }

        // Check if user already has a store (each seller can only have one store)
        val existingStores = storeRepository.findByOwner(owner)
        if (existingStores.isNotEmpty()) {
            throw ForbiddenActionException("You already have a store. Each seller can only have one store.")
        }

        val store = Store(
            name = req.name,
            description = req.description,
            phoneNumber = req.phoneNumber,
            owner = owner,
            address = req.address
        )

        val saved = storeRepository.save(store)
        return saved.toResponse()
    }

    fun updateStore(req: UpdateStoreRequest, owner: String, id: String): StoreResponse {
        val existing = storeRepository.findById(id)
            .orElseThrow{NotFoundActionException("Store with id ${id} not found")}
        if (existing.owner != owner){
            throw ForbiddenActionException("You are now allow to update store details")
        }else{
            val updated = existing.copy(
                name = req.name ?: existing.name,
                description = req.description ?: existing.description,
                address = req.address ?: existing.address,
                phoneNumber = req.phoneNumber ?: existing.phoneNumber,
                status = req.status ?: existing.status,
                avatar = req.avatar ?: existing.avatar,
                cover = req.cover ?: existing.cover
            )
            val saved = storeRepository.save(updated)
            return saved.toResponse()
        }
    }

    fun deleteStore(id: String, owner: String){
        val store = storeRepository.findById(id)
            .orElseThrow{NotFoundActionException("Store with id ${id} not found")}
        if (store.owner != owner){
            throw ForbiddenActionException("You are not allow to delete this store")
        }else{
            storeRepository.deleteById(id)
        }
    }

    fun getStores(): List<StoreResponse>{
        val stores = storeRepository.findAll()
        return stores.map { it.toResponse() }
    }

    fun getStoreDetails(id: String): StoreResponse{
        val store = storeRepository.findById(id)
            .orElseThrow{NotFoundActionException("Store with id ${id} not found")}
        return store.toResponse()
    }

    fun getStoreByOwner(ownerId: String): StoreResponse {
        val stores = storeRepository.findByOwner(ownerId)
        if (stores.isEmpty()) {
            throw NotFoundActionException("Store for user ${ownerId} not found")
        }
        // Prefer the first ACTIVE store; if none, fall back to the first store
        val activeStore = stores.firstOrNull { it.status == StoreStatus.ACTIVE }
        return (activeStore ?: stores.first()).toResponse()
    }
}