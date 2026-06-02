package com.balam.crm.data.api

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.balam.crm.data.model.Agent
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenStore @Inject constructor(@ApplicationContext private val context: Context) {

    private val gson = Gson()

    private val prefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "balam_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveToken(token: String) = prefs.edit().putString(KEY_TOKEN, token).apply()

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun saveAgent(agent: Agent) = prefs.edit().putString(KEY_AGENT, gson.toJson(agent)).apply()

    fun getAgent(): Agent? = prefs.getString(KEY_AGENT, null)?.let {
        try { gson.fromJson(it, Agent::class.java) } catch (e: Exception) { null }
    }

    fun clear() = prefs.edit().remove(KEY_TOKEN).remove(KEY_AGENT).apply()

    fun isLoggedIn(): Boolean = getToken() != null

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_AGENT = "agent_json"
    }
}
