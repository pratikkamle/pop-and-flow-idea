package com.popandflow.game.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.popandflow.game.model.BubbleDensity
import com.popandflow.game.model.BubbleSpeed
import com.popandflow.game.model.GameSettings
import com.popandflow.game.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    settings: GameSettings,
    onSettingsChanged: (GameSettings) -> Unit,
    onBack: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF9FBFC),
                        Color(0xFFF0F5FA),
                        Color(0xFFE8F2F8)
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Top Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color.White)
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = SlateDark)
                }

                Spacer(modifier = Modifier.width(16.dp))

                Text(
                    text = "Settings",
                    style = MaterialTheme.typography.headlineMedium,
                    color = SlateDark
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Sensory Feedback Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Sensory & Tactile",
                        style = MaterialTheme.typography.titleMedium,
                        color = SlateDark
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Sound Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Sound Effects", style = MaterialTheme.typography.bodyLarge, color = SlateDark)
                            Text("Melodic pentatonic pop tones", style = MaterialTheme.typography.bodySmall, color = SlateMedium)
                        }
                        Switch(
                            checked = settings.soundEnabled,
                            onCheckedChange = { onSettingsChanged(settings.copy(soundEnabled = it)) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = PastelMint)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Color(0xFFF1F5F9))

                    // Haptics Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Haptic Feedback", style = MaterialTheme.typography.bodyLarge, color = SlateDark)
                            Text("Gentle vibration when bubbles pop", style = MaterialTheme.typography.bodySmall, color = SlateMedium)
                        }
                        Switch(
                            checked = settings.hapticEnabled,
                            onCheckedChange = { onSettingsChanged(settings.copy(hapticEnabled = it)) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = PastelSky)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Color(0xFFF1F5F9))

                    // Reduced Motion Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Reduced Motion", style = MaterialTheme.typography.bodyLarge, color = SlateDark)
                            Text("Mutes wobbles & particle bursts", style = MaterialTheme.typography.bodySmall, color = SlateMedium)
                        }
                        Switch(
                            checked = settings.reducedMotion,
                            onCheckedChange = { onSettingsChanged(settings.copy(reducedMotion = it)) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = PastelLavender)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Game Feel & Pacing Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "Flow Pacing",
                        style = MaterialTheme.typography.titleMedium,
                        color = SlateDark
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Bubble Density", style = MaterialTheme.typography.bodyMedium, color = SlateDark)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        BubbleDensity.values().forEach { density ->
                            val isSelected = settings.bubbleDensity == density
                            FilterChip(
                                selected = isSelected,
                                onClick = { onSettingsChanged(settings.copy(bubbleDensity = density)) },
                                label = { Text(density.label) },
                                modifier = Modifier.weight(1f),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PastelPeach,
                                    selectedLabelColor = SlateDark
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Float Speed", style = MaterialTheme.typography.bodyMedium, color = SlateDark)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        BubbleSpeed.values().forEach { speed ->
                            val isSelected = settings.bubbleSpeed == speed
                            FilterChip(
                                selected = isSelected,
                                onClick = { onSettingsChanged(settings.copy(bubbleSpeed = speed)) },
                                label = { Text(speed.label) },
                                modifier = Modifier.weight(1f),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PastelMint,
                                    selectedLabelColor = SlateDark
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Privacy & Architecture info
            Text(
                text = "Pop & Flow is completely standalone. It requires zero accounts, zero analytics, and functions completely offline.",
                style = MaterialTheme.typography.bodySmall,
                color = SlateLight
            )
        }
    }
}
