package com.popandflow.game.model

/**
 * Game Modes available in Pop & Flow.
 */
enum class GameMode(val title: String, val subtitle: String) {
    FLOW(
        title = "Flow Mode",
        subtitle = "Infinite relaxing play, no timer, no stress"
    ),
    COMBO_RUSH(
        title = "Combo Rush",
        subtitle = "30-second timed challenge with combo multipliers"
    )
}

/**
 * Snapshot of the current gameplay stats.
 */
data class GameStats(
    val score: Int = 0,
    val combo: Int = 0,
    val maxCombo: Int = 0,
    val totalPops: Int = 0,
    val bonusPops: Int = 0,
    val remainingTimeSeconds: Float = 30f,
    val isPaused: Boolean = false,
    val isGameOver: Boolean = false,
    val isNewPersonalBest: Boolean = false
)
