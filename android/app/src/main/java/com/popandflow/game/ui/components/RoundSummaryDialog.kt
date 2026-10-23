package com.popandflow.game.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.popandflow.game.model.GameStats
import com.popandflow.game.ui.theme.*

@Composable
fun RoundSummaryDialog(
    stats: GameStats,
    bestScore: Int,
    onReplay: () -> Unit,
    onHome: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(32.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header badge
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(if (stats.isNewPersonalBest) PastelPeach else PastelSky)
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (stats.isNewPersonalBest) "New Personal Best!" else "Round Complete",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = SlateDark
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "${stats.score}",
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 48.sp
                    ),
                    color = SlateDark
                )

                Text(
                    text = "Total Points",
                    style = MaterialTheme.typography.bodyMedium,
                    color = SlateMedium
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Stats breakdown
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${stats.totalPops}",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = SlateDark
                        )
                        Text(
                            text = "Pops",
                            style = MaterialTheme.typography.bodySmall,
                            color = SlateLight
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${stats.maxCombo}x",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = SlateDark
                        )
                        Text(
                            text = "Max Combo",
                            style = MaterialTheme.typography.bodySmall,
                            color = SlateLight
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${stats.bonusPops}",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = SlateDark
                        )
                        Text(
                            text = "Bonus",
                            style = MaterialTheme.typography.bodySmall,
                            color = SlateLight
                        )
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Actions
                Button(
                    onClick = onReplay,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PastelMint)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = SlateDark)
                    Spacer(Modifier.width(8.dp))
                    Text("Play Again", color = SlateDark, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedButton(
                    onClick = onHome,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(Icons.Default.Home, contentDescription = null, tint = SlateDark)
                    Spacer(Modifier.width(8.dp))
                    Text("Main Menu", color = SlateDark, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
