package com.popandflow.game.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = PastelMint,
    secondary = PastelSky,
    tertiary = PastelLavender,
    background = BackgroundStart,
    surface = CardBackground,
    onPrimary = SlateDark,
    onSecondary = SlateDark,
    onTertiary = SlateDark,
    onBackground = SlateDark,
    onSurface = SlateDark
)

@Composable
fun PopAndFlowTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
