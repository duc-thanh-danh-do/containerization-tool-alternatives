package com.example.EcomSphere.Services.ProductService

data class CreateProductRequest(val title: String, val description: String, val category: String, val price: Float, val stock: Int, val storeId: String)
data class UpdateProductRequest(val title: String?, val description: String?, val category: String?, val price: Float?, val stock: Int?, val images: String? )
data class DeleteProductRequest(val id: String)
data class GetProductRequest(val id: String)
data class GetAllProductsResponse(
    val id: String,
    val title: String,
    val category: String,
    val description: String,
    val price: Float,
    val stock: Int,
    val images: List<String>,
    val storeId: String? = null,
    val storeName: String? = null,
    val sellerId: String? = null
)
data class ProductsApiResponse(
    val products: List<GetAllProductsResponse>,
    val total: Int,
    val skip: Int,
    val limit: Int
)
data class ProductResponse(
    val id: String,
    val title: String,
    val description: String,
    val price: Float,
    val stock: Int,
    val images: List<String>,
    val storeId: String,
    val category: String,
    val storeName: String? = null,
    val sellerId: String? = null
)

data class CreateProductForm(
    var title: String = "",
    var description: String = "",
    var category: String = "",
    var price: Float = 0f,
    var stock: Int = 0,
    var storeId: String = ""
)
