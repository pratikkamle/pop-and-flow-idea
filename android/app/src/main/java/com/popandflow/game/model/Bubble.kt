package com.popandflow.game.model

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color

/**
 * Bubble types in Pop & Flow.
 */
enum class BubbleType {
    MINT,
    SKY,
    PEACH,
    LAVENDER,
    LEMON,
    ROSE,
    RAINBOW_BONUS,   // High points + iridescent effect
    TIME_BONUS,      // +3s in Combo Rush
    MULTIPLIER_STAR  // Multiplier boost
}

/**
 * Visual color palette definitions for each bubble type.
 */
data class BubbleColorStyle(
    val baseColor: Color,
    val lightColor: Color,
    val glowColor: Color,
    val ringColor: Color
)

/**
 * Represents a floating glossy bubble in the game.
 */
data class Bubble(
    val id: Long,
    val type: BubbleType,
    var x: Float,
    var y: Float,
    var radius: Float,
    val baseRadius: Float,
    var vx: Float,
    var vy: Float,
    val wobblePhase: Float,
    val wobbleSpeed: Float,
    val style: BubbleColorStyle,
    val points: Int,
    var isPopped: Boolean = false,
    var popProgress: Float = 0f,
    var scored: Boolean = false,
    var scaleX: Float = 1f,
    var scaleY: Float = 1f,
    var wallSquish: Float = 0f
)





/**
 * Particle emitted when a bubble pops.
 */
data class PopParticle(
    val id: Long,
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val color: Color,
    val size: Float,
    var alpha: Float = 1f,
    var life: Float = 1f
)

/**
 * Expanding ripple shockwave when bubble pops.
 */
data class PopRipple(
    val id: Long,
    val x: Float,
    val y: Float,
    val maxRadius: Float,
    var currentRadius: Float = 0f,
    val color: Color,
    var alpha: Float = 0.8f
)
