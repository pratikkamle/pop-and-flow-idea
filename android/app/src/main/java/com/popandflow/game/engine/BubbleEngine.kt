package com.popandflow.game.engine

import androidx.compose.ui.graphics.Color
import com.popandflow.game.model.*
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

class BubbleEngine {
    private val idGen = AtomicLong(1)
    private val random = Random(System.currentTimeMillis())

    private val styles = mapOf(
        BubbleType.MINT to BubbleColorStyle(
            baseColor = Color(0xFFA8E6CF),
            lightColor = Color(0xFFE8FBF4),
            glowColor = Color(0x66A8E6CF),
            ringColor = Color(0x9979C7AA)
        ),
        BubbleType.SKY to BubbleColorStyle(
            baseColor = Color(0xFFBAE1FF),
            lightColor = Color(0xFFF2F8FF),
            glowColor = Color(0x66BAE1FF),
            ringColor = Color(0x9988C2F2)
        ),
        BubbleType.PEACH to BubbleColorStyle(
            baseColor = Color(0xFFFFDFBA),
            lightColor = Color(0xFFFFF6ED),
            glowColor = Color(0x66FFDFBA),
            ringColor = Color(0x99F5B982)
        ),
        BubbleType.LAVENDER to BubbleColorStyle(
            baseColor = Color(0xFFDED2F9),
            lightColor = Color(0xFFF8F5FF),
            glowColor = Color(0x66DED2F9),
            ringColor = Color(0x99BEAAEB)
        ),
        BubbleType.LEMON to BubbleColorStyle(
            baseColor = Color(0xFFFFFFBA),
            lightColor = Color(0xFFFFFFED),
            glowColor = Color(0x66FFFFBA),
            ringColor = Color(0x99E2E278)
        ),
        BubbleType.ROSE to BubbleColorStyle(
            baseColor = Color(0xFFFFB3BA),
            lightColor = Color(0xFFFFF0F2),
            glowColor = Color(0x66FFB3BA),
            ringColor = Color(0x99F08B96)
        ),
        BubbleType.RAINBOW_BONUS to BubbleColorStyle(
            baseColor = Color(0xFFE0C3FC),
            lightColor = Color(0xFF8EC5FC),
            glowColor = Color(0x88FFD1FF),
            ringColor = Color(0xCCB388FF)
        ),
        BubbleType.TIME_BONUS to BubbleColorStyle(
            baseColor = Color(0xFFFFE57F),
            lightColor = Color(0xFFFFF9C4),
            glowColor = Color(0x88FFD54F),
            ringColor = Color(0xCCFFB300)
        ),
        BubbleType.MULTIPLIER_STAR to BubbleColorStyle(
            baseColor = Color(0xFFFF80AB),
            lightColor = Color(0xFFFFE0EB),
            glowColor = Color(0x88FF4081),
            ringColor = Color(0xCCF50057)
        )
    )

    fun createBubble(
        width: Float,
        height: Float,
        speedMultiplier: Float = 1.0f,
        forceBonus: Boolean = false,
        isComboRush: Boolean = false
    ): Bubble {
        val type = if (forceBonus) {
            if (isComboRush && random.nextFloat() < 0.45f) {
                BubbleType.TIME_BONUS
            } else if (random.nextFloat() < 0.5f) {
                BubbleType.RAINBOW_BONUS
            } else {
                BubbleType.MULTIPLIER_STAR
            }
        } else {
            val roll = random.nextFloat()
            when {
                roll < 0.05f && isComboRush -> BubbleType.TIME_BONUS
                roll < 0.09f -> BubbleType.RAINBOW_BONUS
                roll < 0.13f -> BubbleType.MULTIPLIER_STAR
                roll < 0.28f -> BubbleType.MINT
                roll < 0.43f -> BubbleType.SKY
                roll < 0.58f -> BubbleType.PEACH
                roll < 0.73f -> BubbleType.LAVENDER
                roll < 0.88f -> BubbleType.LEMON
                else -> BubbleType.ROSE
            }
        }

        val baseRadius = when (type) {
            BubbleType.RAINBOW_BONUS -> random.nextFloat() * 10f + 48f
            BubbleType.TIME_BONUS -> random.nextFloat() * 8f + 42f
            BubbleType.MULTIPLIER_STAR -> random.nextFloat() * 8f + 40f
            else -> random.nextFloat() * 24f + 34f
        }

        val points = when (type) {
            BubbleType.RAINBOW_BONUS -> 50
            BubbleType.TIME_BONUS -> 25
            BubbleType.MULTIPLIER_STAR -> 30
            else -> 10
        }

        val minX = baseRadius + 4f
        val maxX = maxOf(minX + 10f, width - baseRadius - 4f)
        val x = random.nextFloat() * (maxX - minX) + minX
        val y = height + baseRadius + random.nextFloat() * 60f

        val vy = -(random.nextFloat() * 22f + 38f) * speedMultiplier // gentle upward float
        val vx = (random.nextFloat() - 0.5f) * 16f * speedMultiplier

        return Bubble(
            id = idGen.getAndIncrement(),
            type = type,
            x = x,
            y = y,
            radius = baseRadius,
            baseRadius = baseRadius,
            vx = vx,
            vy = vy,
            wobblePhase = random.nextFloat() * 6.28f,
            wobbleSpeed = random.nextFloat() * 1.5f + 1.0f,
            style = styles[type] ?: styles[BubbleType.MINT]!!,
            points = points
        )
    }

    fun updateBubbles(
        bubbles: MutableList<Bubble>,
        dt: Float,
        width: Float,
        height: Float,
        reducedMotion: Boolean,
        speedMultiplier: Float = 1.0f
    ) {
        val iterator = bubbles.iterator()
        while (iterator.hasNext()) {
            val bubble = iterator.next()
            if (bubble.isPopped) {
                bubble.popProgress += dt * 5.0f
                if (bubble.popProgress >= 1f) {
                    iterator.remove()
                }
                continue
            }

            // Upward buoyant movement
            bubble.y += bubble.vy * dt
            bubble.x += bubble.vx * dt

            // Sine wobble unless reduced motion
            if (!reducedMotion) {
                val wobble = sin(System.currentTimeMillis() * 0.002f * bubble.wobbleSpeed + bubble.wobblePhase)
                bubble.x += wobble * 0.28f
                bubble.radius = bubble.baseRadius + (wobble * 0.8f)
            }

            // Strict playfield containment
            if (bubble.x - bubble.radius < 4f) {
                bubble.x = bubble.radius + 4f
                bubble.vx = kotlin.math.abs(bubble.vx)
            } else if (bubble.x + bubble.radius > width - 4f) {
                bubble.x = width - bubble.radius - 4f
                bubble.vx = -kotlin.math.abs(bubble.vx)
            }
            bubble.x = bubble.x.coerceIn(bubble.radius + 2f, width - bubble.radius - 2f)

            // When bubble drifts above top screen, cycle back to bottom smoothly
            if (bubble.y + bubble.radius < -15f) {
                bubble.y = height + bubble.radius + random.nextFloat() * 40f
                val minX = bubble.radius + 4f
                val maxX = maxOf(minX + 10f, width - bubble.radius - 4f)
                bubble.x = random.nextFloat() * (maxX - minX) + minX
                bubble.scored = false
            }

        }
    }

    fun spawnPopEffects(
        bubble: Bubble,
        particles: MutableList<PopParticle>,
        ripples: MutableList<PopRipple>,
        reducedMotion: Boolean
    ) {
        // Create expanding shockwave ripple
        ripples.add(
            PopRipple(
                id = idGen.getAndIncrement(),
                x = bubble.x,
                y = bubble.y,
                maxRadius = bubble.baseRadius * 1.8f,
                currentRadius = bubble.radius * 0.5f,
                color = bubble.style.baseColor,
                alpha = 0.85f
            )
        )

        if (reducedMotion) return

        // Create burst particles
        val count = when (bubble.type) {
            BubbleType.RAINBOW_BONUS -> 16
            BubbleType.TIME_BONUS, BubbleType.MULTIPLIER_STAR -> 12
            else -> 8
        }

        for (i in 0 until count) {
            val angle = (6.28318f / count) * i + (random.nextFloat() * 0.4f - 0.2f)
            val speed = random.nextFloat() * 120f + 60f
            particles.add(
                PopParticle(
                    id = idGen.getAndIncrement(),
                    x = bubble.x,
                    y = bubble.y,
                    vx = cos(angle) * speed,
                    vy = sin(angle) * speed,
                    color = bubble.style.baseColor,
                    size = random.nextFloat() * 4f + 3f,
                    alpha = 1f,
                    life = 1f
                )
            )
        }
    }

    fun updateParticlesAndRipples(
        particles: MutableList<PopParticle>,
        ripples: MutableList<PopRipple>,
        dt: Float
    ) {
        // Update ripples
        val rippleIter = ripples.iterator()
        while (rippleIter.hasNext()) {
            val r = rippleIter.next()
            r.currentRadius += (r.maxRadius - r.currentRadius) * dt * 10f + 25f * dt
            r.alpha -= dt * 2.2f
            if (r.alpha <= 0f || r.currentRadius >= r.maxRadius) {
                rippleIter.remove()
            }
        }

        // Update particles
        val partIter = particles.iterator()
        while (partIter.hasNext()) {
            val p = partIter.next()
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.vy += 150f * dt // gentle gravity
            p.alpha -= dt * 2.0f
            if (p.alpha <= 0f) {
                partIter.remove()
            }
        }
    }

    fun hitTest(bubbles: List<Bubble>, touchX: Float, touchY: Float): Bubble? {
        // Search in reverse so topmost-drawn bubbles are tapped first
        for (i in bubbles.indices.reversed()) {
            val b = bubbles[i]
            if (!b.isPopped && !b.scored) {
                val dx = touchX - b.x
                val dy = touchY - b.y
                val distSq = dx * dx + dy * dy
                val tapTolerance = b.radius + 16f // comfortable touch target for mobile fingertips
                if (distSq <= tapTolerance * tapTolerance) {
                    return b
                }
            }
        }
        return null
    }
}

