package com.balam.crm.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Navy = Color(0xFF1A3C5E)
val NavyLight = Color(0xFF2D6A9F)
val BgLight = Color(0xFFF0F4F8)
val SuccessGreen = Color(0xFF2E7D32)
val WarningOrange = Color(0xFFE65100)
val DangerRed = Color(0xFFC62828)
val MaturedBlue = Color(0xFF1565C0)
val ClaimedPurple = Color(0xFF6A1B9A)
val SurrenderedBrown = Color(0xFF6D4C41)
val NeutralSlate = Color(0xFF546E7A)
val LapsedGray = Color(0xFF78909C)
val ActivitiesTeal = Color(0xFF00838F)

private val LightColors = lightColorScheme(
    primary = Navy,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD3E4F5),
    onPrimaryContainer = Color(0xFF0B2A45),
    secondary = NavyLight,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD6E7F5),
    onSecondaryContainer = Color(0xFF12395C),
    background = BgLight,
    onBackground = Color(0xFF16212C),
    surface = Color.White,
    onSurface = Color(0xFF16212C),
    surfaceVariant = Color(0xFFE2EAF1),
    onSurfaceVariant = Color(0xFF45525E),
    outline = Color(0xFF74828F),
    error = DangerRed,
    onError = Color.White
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF9BC4E8),
    onPrimary = Color(0xFF0B2A45),
    primaryContainer = Color(0xFF1A3C5E),
    onPrimaryContainer = Color(0xFFD3E4F5),
    secondary = Color(0xFFA8CBE9),
    onSecondary = Color(0xFF12395C),
    secondaryContainer = Color(0xFF2D6A9F),
    onSecondaryContainer = Color(0xFFD6E7F5),
    background = Color(0xFF101820),
    onBackground = Color(0xFFE1E7ED),
    surface = Color(0xFF18222C),
    onSurface = Color(0xFFE1E7ED),
    surfaceVariant = Color(0xFF2A3641),
    onSurfaceVariant = Color(0xFFBBC7D2),
    outline = Color(0xFF85919D),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005)
)

private val AppTypography = Typography().let { base ->
    base.copy(
        headlineSmall = base.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
        titleLarge = base.titleLarge.copy(fontWeight = FontWeight.SemiBold),
        titleMedium = base.titleMedium.copy(fontWeight = FontWeight.SemiBold, letterSpacing = 0.1.sp),
        titleSmall = base.titleSmall.copy(fontWeight = FontWeight.Medium),
        labelLarge = base.labelLarge.copy(fontWeight = FontWeight.SemiBold)
    )
}

@Composable
fun BalamTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = AppTypography,
        content = content
    )
}
