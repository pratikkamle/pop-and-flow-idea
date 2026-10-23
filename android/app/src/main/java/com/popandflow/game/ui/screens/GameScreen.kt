package com.popandflow.game.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.popandflow.game.model.BubbleType
import com.popandflow.game.model.GameMode
import com.popandflow.game.ui.components.RoundSummaryDialog
import com.popandflow.game.ui.theme.*
import com.popandflow.game.viewmodel.GameViewModel

@Composable
fun GameScreen(
    viewModel: GameViewModel,
    onNavigateHome: () -> Unit
) {
    val stats by viewModel.stats.collectAsState()
    val mode by viewModel.gameMode.collectAsState()
    val settings by viewModel.settings.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFF9FBFC),
                        Color(0xFFF1F6FA),
                        Color(0xFFE5EEF5)
                    )
                )
            )
            .onSizeChanged { size ->
                viewModel.setScreenBounds(size.width.toFloat(), size.height.toFloat())
            }
    ) {
        // High performance custom Canvas for glossy bubbles and particles
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures { offset ->
                        viewModel.onTouchDown(offset.x, offset.y)
                    }
                }
        ) {
            // Draw expanding shockwave ripples
            viewModel.ripples.forEach { ripple ->
                drawCircle(
                    color = ripple.color.copy(alpha = ripple.alpha),
                    radius = ripple.currentRadius,
                    center = Offset(ripple.x, ripple.y),
                    style = Stroke(width = 3.dp.toPx())
                )
            }

            // Draw floating glossy bubbles
            viewModel.bubbles.forEach { bubble ->
                if (!bubble.isPopped) {
                    val center = Offset(bubble.x, bubble.y)

                    // 1. Soft ambient outer glow
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(bubble.style.glowColor, Color.Transparent),
                            center = center,
                            radius = bubble.radius * 1.25f
                        ),
                        radius = bubble.radius * 1.25f,
                        center = center
                    )

                    // 2. Main glossy body with radial gradient
                    val gradientOffset = Offset(
                        bubble.x - bubble.radius * 0.35f,
                        bubble.y - bubble.radius * 0.35f
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                bubble.style.lightColor.copy(alpha = 0.95f),
                                bubble.style.baseColor.copy(alpha = 0.85f),
                                bubble.style.ringColor.copy(alpha = 0.9f)
                            ),
                            center = gradientOffset,
                            radius = bubble.radius * 1.1f
                        ),
                        radius = bubble.radius,
                        center = center
                    )

                    // 3. Delicate rim stroke
                    drawCircle(
                        color = Color.White.copy(alpha = 0.65f),
                        radius = bubble.radius,
                        center = center,
                        style = Stroke(width = 1.8.dp.toPx())
                    )

                    // 4. Curved 3D specular highlight highlight
                    val highlightCenter = Offset(
                        bubble.x - bubble.radius * 0.32f,
                        bubble.y - bubble.radius * 0.32f
                    )
                    drawCircle(
                        color = Color.White.copy(alpha = 0.75f),
                        radius = bubble.radius * 0.22f,
                        center = highlightCenter
                    )

                    // 5. Special bubble inner icon/symbol
                    when (bubble.type) {
                        BubbleType.TIME_BONUS -> {
                            // Small clock indicator inside
                            drawCircle(
                                color = Color(0xFFF57F17),
                                radius = bubble.radius * 0.28f,
                                center = center,
                                style = Stroke(width = 2.dp.toPx())
                            )
                        }
                        BubbleType.MULTIPLIER_STAR -> {
                            drawCircle(
                                color = Color(0xFFD81B60),
                                radius = bubble.radius * 0.26f,
                                center = center
                            )
                        }
                        BubbleType.RAINBOW_BONUS -> {
                            drawCircle(
                                brush = Brush.sweepGradient(
                                    listOf(Color.Red, Color.Yellow, Color.Green, Color.Cyan, Color.Magenta, Color.Red)
                                ),
                                radius = bubble.radius * 0.35f,
                                center = center,
                                style = Stroke(width = 2.dp.toPx())
                            )
                        }
                        else -> Unit
                    }
                }
            }

            // Draw bursting particles
            viewModel.particles.forEach { p ->
                drawCircle(
                    color = p.color.copy(alpha = p.alpha),
                    radius = p.size,
                    center = Offset(p.x, p.y)
                )
            }
        }

        // Perimeter HUD Overlay (keeps >85% playfield unobstructed)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Pause button
                IconButton(
                    onClick = { viewModel.pauseGame() },
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.9f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Pause,
                        contentDescription = "Pause",
                        tint = SlateDark
                    )
                }

                // Middle: Timer (for Rush) or Zen counter (for Flow)
                if (mode == GameMode.COMBO_RUSH) {
                    val seconds = stats.remainingTimeSeconds.toInt()
                    val fraction = ((stats.remainingTimeSeconds - seconds) * 10).toInt()
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (seconds <= 5) Color(0xFFFFEBEE) else Color.White.copy(alpha = 0.9f)
                            )
                            .padding(horizontal = 16.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "${seconds}.${fraction}s",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontFeatureSettings = "tnum"
                            ),
                            color = if (seconds <= 5) Color(0xFFD32F2F) else SlateDark
                        )
                    }
                } else {
                    Text(
                        text = "Flow · ${stats.totalPops} popped",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                        color = SlateMedium
                    )
                }

                // Score cluster
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White.copy(alpha = 0.9f))
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "${stats.score}",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontFeatureSettings = "tnum"
                        ),
                        color = SlateDark
                    )
                }
            }

            // Combo multiplier banner
            if (stats.combo >= 2) {
                val multiplier = when {
                    stats.combo >= 15 -> 4
                    stats.combo >= 10 -> 3
                    stats.combo >= 5 -> 2
                    else -> 1
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(PastelPeach)
                            .padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${stats.combo} Combo! (${multiplier}x)",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = SlateDark
                        )
                    }
                }
            }
        }

        // Pause Modal Overlay
        AnimatedVisibility(
            visible = stats.isPaused,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.45f)),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .clip(RoundedCornerShape(28.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(
                        modifier = Modifier.padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Game Paused",
                            style = MaterialTheme.typography.headlineMedium,
                            color = SlateDark
                        )

                        Text(
                            text = "Take a breath. Ready to flow again?",
                            style = MaterialTheme.typography.bodyMedium,
                            color = SlateMedium
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            onClick = { viewModel.resumeGame() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PastelMint)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, tint = SlateDark)
                            Spacer(Modifier.width(8.dp))
                            Text("Resume", color = SlateDark, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { viewModel.resetGame() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, tint = SlateDark)
                            Spacer(Modifier.width(8.dp))
                            Text("Restart", color = SlateDark, fontWeight = FontWeight.Bold)
                        }

                        TextButton(
                            onClick = onNavigateHome,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Return to Menu", color = SlateMedium)
                        }
                    }
                }
            }
        }

        // Game Over Round Summary Dialog
        if (stats.isGameOver) {
            RoundSummaryDialog(
                stats = stats,
                bestScore = viewModel.getBestScore(mode),
                onReplay = { viewModel.resetGame() },
                onHome = onNavigateHome
            )
        }
    }
}
