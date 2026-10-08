package com.foutaerp.tisseur

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

// Configuration API
object ApiConfig {
    const val BASE_URL = "https://api.fouta-erp.com/api/v1/"
    
    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}

// Interface API
interface ApiService {
    @POST("mobile/auth/login")
    suspend fun login(@Body credentials: LoginRequest): LoginResponse
    
    @GET("mobile/dashboard/tisseur")
    suspend fun getDashboard(@Header("Authorization") token: String): DashboardResponse
    
    @GET("production/ofs")
    suspend fun getOFs(@Header("Authorization") token: String): List<OrdreFabrication>
    
    @POST("production/ofs/{id}/start")
    suspend fun startOF(
        @Header("Authorization") token: String,
        @Path("id") ofId: Int
    ): Response
    
    @POST("production/ofs/{id}/stop")
    suspend fun stopOF(
        @Header("Authorization") token: String,
        @Path("id") ofId: Int,
        @Body data: StopOFRequest
    ): Response
}

// Modèles de données
data class LoginRequest(
    val email: String,
    val password: String,
    val deviceId: String,
    val deviceInfo: Map<String, String>
)

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: User
)

data class User(
    val id: Int,
    val email: String,
    val fonction: String
)

data class OrdreFabrication(
    val id_of: Int,
    val numero_of: String,
    val quantite_a_produire: Int,
    val quantite_produite: Int,
    val statut: String
)

data class DashboardResponse(
    val ofs: List<OrdreFabrication>,
    val alertes: List<Alerte>,
    val notifications: List<Notification>
)

data class Response(
    val success: Boolean,
    val message: String?
)

