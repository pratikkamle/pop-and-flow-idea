package com.popandflow.game.model

/**
 * User-configurable settings persisted in local storage.
 */
data class GameSettings(
    val soundEnabled: Boolean = true,
    val hapticEnabled: Boolean = true,
    val reducedMotion: Boolean = false,
    val bubbleDensity: BubbleDensity = BubbleDensity.NORMAL,
    val bubbleSpeed: BubbleSpeed = BubbleSpeed.BALANCED
)

enum class BubbleDensity(val label: String, val maxBubbles: Int) {
    COZY("Cozy", 8),
    NORMAL("Standard", 11),
    DENSE("Abundant", 14)
}


enum class BubbleSpeed(val label: String, val multiplier: Float) {
    GENTLE("Gentle", 0.7f),
    BALANCED("Balanced", 1.0f),
    LIVELY("Lively", 1.35f)
}
