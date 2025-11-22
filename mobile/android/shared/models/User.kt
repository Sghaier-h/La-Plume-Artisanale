package com.foutaerp.shared.models

data class User(
    val id: Int,
    val email: String,
    val fonction: String,
    val departement: String?,
    val nom: String?,
    val prenom: String?
)

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

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?,
    val error: String?
)

