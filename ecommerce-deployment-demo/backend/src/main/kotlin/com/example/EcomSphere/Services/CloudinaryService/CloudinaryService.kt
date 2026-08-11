package com.example.EcomSphere.Services.CloudinaryService

import com.cloudinary.Cloudinary
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

data class CloudinaryUploadResult(
    val url: String,
    val secureUrl: String,
    val publicId: String
)

@Service
class CloudinaryService(
    private val cloudinary: Cloudinary,
    @Value("\${cloudinary.use-mock:true}") private val useMock: Boolean
) {
    fun uploadImage(file: MultipartFile, folder: String = "ecomsphere"): CloudinaryUploadResult {
        require(!file.isEmpty) { "File is empty" }

        if (useMock) {
            val mockId = UUID.randomUUID().toString()
            return CloudinaryUploadResult(
                url = "http://mock-cloudinary.local/$folder/$mockId.jpg",
                secureUrl = "https://mock-cloudinary.local/$folder/$mockId.jpg",
                publicId = "$folder/$mockId"
            )
        }

        try {
            val uploadResult = cloudinary.uploader().upload(
                file.bytes,
                mapOf(
                    "folder" to folder,
                    "resource_type" to "image"
                )
            )

            return CloudinaryUploadResult(
                url = uploadResult["url"]?.toString() ?: "",
                secureUrl = uploadResult["secure_url"]?.toString() ?: "",
                publicId = uploadResult["public_id"]?.toString() ?: ""
            )
        } catch (e: Exception) {
            throw RuntimeException("Failed to upload image to Cloudinary: ${e.message}", e)
        }
    }

    fun deleteByPublicId(publicId: String): Boolean {
        val result = cloudinary.uploader().destroy(
            publicId,
            mapOf("resource_type" to "image")
        )
        return result["result"]?.toString() == "ok"
    }
}
