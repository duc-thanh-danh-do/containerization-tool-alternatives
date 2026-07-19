package com.example.EcomSphere.Services.ProductService

import com.example.EcomSphere.Config.WebClientConfig
import com.example.EcomSphere.Helper.ForbiddenActionException
import com.example.EcomSphere.Services.CloudinaryService.CloudinaryService
import com.example.EcomSphere.Services.StoreService.StoreRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile


@Service
class ProductService(
    @Value("\${external.api}") private val baseUrl: String,
    private val productRepository: ProductRepository,
    private val webClientConfig: WebClientConfig,
    private val storeRepository: StoreRepository,
    private val cloudinaryService: CloudinaryService
){

    private fun Product.toResponse(): ProductResponse {
        val store = this.storeId?.let { id ->
            storeRepository.findById(id).orElse(null)
        }
        return ProductResponse(
            id = this.id!!,
            title = this.title,
            description = this.description,
            price = this.price,
            stock = this.stock,
            images = listOf(this.images),
            storeId = this.storeId ?: "",
            category = this.category,
            storeName = store?.name,
            sellerId = store?.owner
        )
    }

    fun getAllProductsExternal(): List<GetAllProductsResponse> {
        val response = webClientConfig.webClient().get()
            .uri{ uriBuilder ->
                uriBuilder
                    .path("/products")
                    .queryParam("limit", 120)
                    .queryParam("skip", 0)
                    .build()
            }
            .retrieve()
            .bodyToMono(ProductsApiResponse::class.java)
            .block()

        return response?.products ?: emptyList()
    }

    fun getAllProductInternal(): List<GetAllProductsResponse>{
        val products = productRepository.findAll()

        return products.map { product ->
            val store = product.storeId?.let { id ->
                storeRepository.findById(id).orElse(null)
            }
            GetAllProductsResponse(
                id = product.id!!,
                title = product.title,
                description = product.description,
                price = product.price,
                stock = product.stock,
                images = listOf(product.images),
                category = product.category,
                storeId = product.storeId ?: "",
                storeName = store?.name,
                sellerId = store?.owner
            )
        }
    }

    fun getProductById(id: String): ProductResponse {
        val product = productRepository.findById(id)
            .orElseThrow { ForbiddenActionException("Product with id=$id not found") }
        return product.toResponse()
    }

    fun addProduct(
        request: CreateProductRequest,
        userId: String,
        image: MultipartFile?
    ): ProductResponse {

        val store = storeRepository.findById(request.storeId)
            .orElseThrow { ForbiddenActionException("Store with id=${request.storeId} not found") }

        if (store.owner != userId) {
            throw ForbiddenActionException("You are not allowed to add products to this store")
        }

        if (image == null || image.isEmpty) {
            throw ForbiddenActionException("Product image is required")
        }

        val uploaded = try {
            cloudinaryService.uploadImage(image, folder = "products/${request.storeId}")
        } catch (e: Exception) {
            throw ForbiddenActionException("Failed to upload product image: ${e.message}")
        }

        if (uploaded.secureUrl.isBlank()) {
            throw ForbiddenActionException("Image upload failed - no URL returned")
        }

        val product = Product(
            title = request.title,
            description = request.description,
            price = request.price,
            stock = request.stock,
            images = uploaded.secureUrl,
            storeId = request.storeId,
            category = request.category
        )

        val saved = productRepository.save(product)
        return saved.toResponse()
    }


    fun updateProduct(id: String, request: UpdateProductRequest, userId: String): ProductResponse{
        val existing = productRepository.findById(id)
            .orElseThrow { ForbiddenActionException("Product with id=$id not found") }

        val storeId = existing.storeId ?: throw ForbiddenActionException("Store associated with this product was not found")
        val store = storeRepository.findById(storeId)
            .orElseThrow { ForbiddenActionException("Store associated with this product was not found") }

        if (store.owner != userId) {
            throw ForbiddenActionException("You are not allowed to edit this product")
        }

        val updated = existing.copy(
            title = request.title ?: existing.title,
            description = request.description ?: existing.description,
            price = request.price ?: existing.price,
            stock = request.stock ?: existing.stock,
            images = request.images ?: existing.images,
            category = request.category ?: existing.category
        )

        val saved = productRepository.save(updated)
        return saved.toResponse()
    }

    fun deleteProduct(id: String, userId: String) {
        val productRef = productRepository.findById(id)
            .orElseThrow{ ForbiddenActionException("Product not found") }

        val storeId = productRef.storeId ?: throw ForbiddenActionException("Store associated with this product was not found")
        val store = storeRepository.findById(storeId)
            .orElseThrow { ForbiddenActionException("Store associated with this product was not found") }

        if (store.owner != userId) {
            throw ForbiddenActionException("You are not allowed to delete this product")
        }

        productRepository.deleteById(id)
    }
}