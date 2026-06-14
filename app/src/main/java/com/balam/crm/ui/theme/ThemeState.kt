package com.balam.crm.ui.theme

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

private const val PREFS_NAME = "balam_theme_prefs"
private const val KEY_DARK_MODE = "dark_mode_enabled"

object ThemeState {
    var darkMode by mutableStateOf<Boolean?>(null)
        private set

    fun init(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        darkMode = if (prefs.contains(KEY_DARK_MODE)) prefs.getBoolean(KEY_DARK_MODE, false) else null
    }

    fun toggle(context: Context) {
        val current = darkMode ?: false
        val next = !current
        darkMode = next
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_DARK_MODE, next)
            .apply()
    }
}
