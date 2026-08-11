package com.example.EcomSphere.Services.ProductService

import com.example.EcomSphere.Helper.CustomUserPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile


@RestController
@RequestMapping("/products")
class ProductController(
    private val productService: ProductService,
){

    @GetMapping("/external")
    fun getAllProductsExternal(): ResponseEntity<List<GetAllProductsResponse>> {
        val products = productService.getAllProductsExternal()
        return ResponseEntity.ok(products)
    }

    @GetMapping()
    fun getAllProductsInternal(): ResponseEntity<List<GetAllProductsResponse>>{
        val products = productService.getAllProductInternal()
        return ResponseEntity.ok(products)
    }

    @GetMapping("/{id}")
    fun getProductById(@PathVariable id: String): ResponseEntity<ProductResponse> {
        val product = productService.getProductById(id)
        return ResponseEntity.ok(product)
    }

    @PostMapping(consumes = ["multipart/form-data"])
    fun createProduct(
        @ModelAttribute form: CreateProductForm,
        @RequestPart("image") image: MultipartFile,
        authentication: Authentication
    ): ResponseEntity<ProductResponse> {
        val principal = authentication.principal as CustomUserPrincipal
        val sellerId = principal.id

        val req = CreateProductRequest(
            title = form.title,
            description = form.description,
            category = form.category,
            price = form.price,
            stock = form.stock,
            storeId = form.storeId
        )

        return ResponseEntity.ok(productService.addProduct(req, sellerId, image))
    }

    @PutMapping("/{id}")
    fun updateProduct(@PathVariable id: String, @RequestBody request: UpdateProductRequest, authentication: Authentication): ResponseEntity<ProductResponse>{
        val principal = authentication.principal as CustomUserPrincipal
        val sellerId = principal.id
        val updated = productService.updateProduct(id, request, sellerId)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    fun deleteProduct(@PathVariable id: String, authentication: Authentication): ResponseEntity<Unit>{
        val principal = authentication.principal as CustomUserPrincipal
        val sellerId = principal.id
        productService.deleteProduct(id, sellerId)
        return ResponseEntity.noContent().build()
    }
}