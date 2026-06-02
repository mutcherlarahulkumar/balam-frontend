package com.balam.crm

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.balam.crm.data.api.TokenStore
import com.balam.crm.ui.navigation.AppNavigation
import com.balam.crm.ui.theme.BalamCRMTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var tokenStore: TokenStore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BalamCRMTheme {
                AppNavigation(tokenStore = tokenStore)
            }
        }
    }
}
