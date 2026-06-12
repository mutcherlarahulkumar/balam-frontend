package com.balam.crm.data.api

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.balam.crm.data.model.Agent
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenStore @Inject constructor(@ApplicationContext private val context: Context) {

    private val gson = Gson()

    private val prefs: SharedPreferences = try {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        EncryptedSharedPreferences.create(
            "balam_secure_prefs",
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        context.getSharedPreferences("balam_prefs_fallback", Context.MODE_PRIVATE)
    }

    fun getToken(): String? = try {
        prefs.getString(KEY_TOKEN, null)
    } catch (e: Exception) {
        null
    }

    fun saveToken(token: String) {
        try {
            prefs.edit().putString(KEY_TOKEN, token).apply()
        } catch (_: Exception) {
        }
    }

    fun getAgent(): Agent? = try {
        prefs.getString(KEY_AGENT, null)?.let { gson.fromJson(it, Agent::class.java) }
    } catch (e: Exception) {
        null
    }

    fun saveAgent(agent: Agent) {
        try {
            prefs.edit().putString(KEY_AGENT, gson.toJson(agent)).apply()
        } catch (_: Exception) {
        }
    }

    fun clear() {
        try {
            prefs.edit().remove(KEY_TOKEN).remove(KEY_AGENT).apply()
        } catch (_: Exception) {
        }
    }

    fun isLoggedIn(): Boolean = getToken() != null

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_AGENT = "agent_json"
    }
}
