package com.example.EcomSphere.Services.StoreService

import com.example.EcomSphere.Helper.CustomUserPrincipal
import com.example.EcomSphere.Services.CloudinaryService.CloudinaryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import java.net.URI

@RestController
@RequestMapping("/stores")
class StoreController (
    private val storeService: StoreService,
    private val cloudinaryService: CloudinaryService
){
    @PostMapping()
    fun createStore(@RequestBody request: CreateStoreRequest, authentication: Authentication): ResponseEntity<StoreResponse>{
        val principal = authentication.principal as CustomUserPrincipal
        val owner = principal.id
        val updated = storeService.createStore(request, owner)
        return ResponseEntity
            .created(URI.create("/stores/${updated.id}"))
            .body(updated)
    }

    @GetMapping()
    fun GetStores(): ResponseEntity<List<StoreResponse>>{
        val stores = storeService.getStores()
        return ResponseEntity.ok(stores)
    }

    @GetMapping("/{id}")
    fun getStoreDetails(@PathVariable id: String): ResponseEntity<StoreResponse>{
        val store = storeService.getStoreDetails(id)
        return ResponseEntity.ok(store)
    }

    @GetMapping("/user/{userId}")
    fun getStoreByUser(@PathVariable userId: String): ResponseEntity<StoreResponse> {
        val store = storeService.getStoreByOwner(userId)
        return ResponseEntity.ok(store)
    }

    @GetMapping("/my-store")
    fun getMyStore(authentication: Authentication): ResponseEntity<StoreResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val userId = principal.id
        val store = storeService.getStoreByOwner(userId)
        return ResponseEntity.ok(store)
    }

    @PutMapping("/{id}")
    fun updateStore(@RequestBody request: UpdateStoreRequest, @PathVariable id: String, authentication: Authentication): ResponseEntity<StoreResponse>{
        val principal = authentication.principal as CustomUserPrincipal
        val owner = principal.id
        val updated = storeService.updateStore(request, owner, id)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    fun deleteStore(@PathVariable id: String, authentication: Authentication): ResponseEntity<Unit>{
        val principal = authentication.principal as CustomUserPrincipal
        val owner = principal.id
        storeService.deleteStore(id, owner)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/avatar")
    fun uploadAvatar(
        @PathVariable id: String,
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication
    ): ResponseEntity<StoreResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val owner = principal.id
        
        val uploadResult = cloudinaryService.uploadImage(file, "ecomsphere/stores/avatars")
        val updated = storeService.updateStore(
            UpdateStoreRequest(avatar = uploadResult.secureUrl),
            owner,
            id
        )
        return ResponseEntity.ok(updated)
    }

    @PostMapping("/{id}/cover")
    fun uploadCover(
        @PathVariable id: String,
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication
    ): ResponseEntity<StoreResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val owner = principal.id
        
        val uploadResult = cloudinaryService.uploadImage(file, "ecomsphere/stores/covers")
        val updated = storeService.updateStore(
            UpdateStoreRequest(cover = uploadResult.secureUrl),
            owner,
            id
        )
        return ResponseEntity.ok(updated)
    }
}