package com.popandflow.game.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.popandflow.game.model.GameMode
import com.popandflow.game.ui.theme.*

@Composable
fun HomeScreen(
    bestFlowScore: Int,
    bestRushScore: Int,
    lifetimePops: Int,
    onStartGame: (GameMode) -> Unit,
    onOpenSettings: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF9FBFC),
                        Color(0xFFF0F5FA),
                        Color(0xFFE8F2F8)
                    )
                )
            )
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header with Settings action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Subtle badge
                Text(
                    text = "v1.0 · Relax & Focus",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateLight
                )
                IconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.8f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings",
                        tint = SlateDark
                    )
                }
            }

            // Title lockup with glowing soft pastel bubbles
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(vertical = 16.dp)
            ) {
                // Playful bubble icon arrangement
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(PastelMint)
                    )
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(PastelSky)
                    )
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .clip(CircleShape)
                            .background(PastelPeach)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Pop & Flow",
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = SlateDark
                )

                Text(
                    text = "Satisfying pastel bubble popping",
                    style = MaterialTheme.typography.bodyLarge,
                    color = SlateMedium,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Game Mode Launch Cards
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Mode 1: Flow Mode
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(24.dp))
                        .clip(RoundedCornerShape(24.dp))
                        .clickable { onStartGame(GameMode.FLOW) },
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(PastelMintLight, PastelMint)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = SlateDark,
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Flow Mode",
                                style = MaterialTheme.typography.titleLarge,
                                color = SlateDark
                            )
                            Text(
                                text = "Endless relaxing play · No timer",
                                style = MaterialTheme.typography.bodySmall,
                                color = SlateMedium
                            )
                            if (bestFlowScore > 0) {
                                Text(
                                    text = "Best: $bestFlowScore pts",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SlateLight,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    }
                }

                // Mode 2: Combo Rush
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(24.dp))
                        .clip(RoundedCornerShape(24.dp))
                        .clickable { onStartGame(GameMode.COMBO_RUSH) },
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(PastelSkyLight, PastelSky)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Timer,
                                contentDescription = null,
                                tint = SlateDark,
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Combo Rush",
                                style = MaterialTheme.typography.titleLarge,
                                color = SlateDark
                            )
                            Text(
                                text = "30-second challenge · Multipliers",
                                style = MaterialTheme.typography.bodySmall,
                                color = SlateMedium
                            )
                            if (bestRushScore > 0) {
                                Text(
                                    text = "Best: $bestRushScore pts",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SlateLight,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Bottom stats & offline indicator
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Text(
                    text = "$lifetimePops bubbles popped · 100% Offline & Private",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateLight
                )
            }
        }
    }
}
