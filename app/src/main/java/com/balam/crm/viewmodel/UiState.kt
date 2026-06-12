package com.balam.crm.viewmodel

import com.google.gson.Gson
import com.google.gson.JsonObject
import retrofit2.HttpException
import java.io.IOException

sealed class UiState<out T> {
    data object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

fun Throwable.friendlyMessage(): String = when (this) {
    is IOException -> "Check your internet connection"
    is HttpException -> {
        try {
            val body = response()?.errorBody()?.string()
            if (body != null) {
                val json = Gson().fromJson(body, JsonObject::class.java)
                val msg = json?.get("message")?.asString ?: json?.get("error")?.asString
                if (!msg.isNullOrBlank()) msg else "Something went wrong"
            } else {
                "Something went wrong"
            }
        } catch (e: Exception) {
            "Something went wrong"
        }
    }
    else -> "Something went wrong"
}
