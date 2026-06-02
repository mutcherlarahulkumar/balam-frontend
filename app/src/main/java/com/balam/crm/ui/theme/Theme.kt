package com.balam.crm.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Primary = Color(0xFF1a3c5e)
val PrimaryContainer = Color(0xFF2d6a9f)
val Secondary = Color(0xFF2d6a9f)
val Background = Color(0xFFf0f4f8)
val Surface = Color(0xFFFFFFFF)
val OnPrimary = Color(0xFFFFFFFF)
val OnBackground = Color(0xFF1a1a2e)
val OnSurface = Color(0xFF1a1a2e)
val Error = Color(0xFFB00020)

// Status colors
val StatusIF = Color(0xFF2E7D32)
val StatusLA = Color(0xFFC62828)
val StatusPU = Color(0xFF1565C0)
val StatusSU = Color(0xFF6A1B9A)
val StatusMA = Color(0xFF00695C)
val StatusCL = Color(0xFF37474F)
val StatusEX = Color(0xFF4E342E)

// FUP colors
val FUPOverdue = Color(0xFFC62828)
val FUPDue = Color(0xFFE65100)
val FUPPaid = Color(0xFF2E7D32)
val FUPLapsed = Color(0xFF37474F)

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = Color(0xFFD0E8FF),
    onPrimaryContainer = Primary,
    secondary = Secondary,
    onSecondary = OnPrimary,
    background = Background,
    onBackground = OnBackground,
    surface = Surface,
    onSurface = OnSurface,
    error = Error,
    onError = Color.White,
    surfaceVariant = Color(0xFFE8EFF5),
    onSurfaceVariant = Color(0xFF3A4A58)
)

@Composable
fun BalamCRMTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}

fun policyStatusColor(status: String): Color = when (status.uppercase()) {
    "IF" -> StatusIF
    "LA" -> StatusLA
    "PU" -> StatusPU
    "SU" -> StatusSU
    "MA" -> StatusMA
    "CL" -> StatusCL
    "EX" -> StatusEX
    else -> Color.Gray
}

fun fupStatusColor(status: String): Color = when (status.uppercase()) {
    "OVERDUE" -> FUPOverdue
    "DUE" -> FUPDue
    "PAID" -> FUPPaid
    "LAPSED" -> FUPLapsed
    else -> Color.Gray
}
