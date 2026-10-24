package com.popandflow.game.data

import android.content.Context
import android.content.SharedPreferences
import com.popandflow.game.model.BubbleDensity
import com.popandflow.game.model.BubbleSpeed
import com.popandflow.game.model.GameSettings

/**
 * Handles offline persistence of game high scores and user preferences.
 */
class GamePreferences(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("pop_and_flow_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_BEST_SCORE_FLOW = "best_score_flow"
        private const val KEY_BEST_SCORE_RUSH = "best_score_rush"
        private const val KEY_MAX_COMBO = "max_combo"
        private const val KEY_TOTAL_POPS = "total_lifetime_pops"
        private const val KEY_SOUND_ENABLED = "sound_enabled"
        private const val KEY_HAPTIC_ENABLED = "haptic_enabled"
        private const val KEY_REDUCED_MOTION = "reduced_motion"
        private const val KEY_DENSITY = "density_setting"
        private const val KEY_SPEED = "speed_setting"
        private const val KEY_DAILY_DATE = "daily_challenge_date"
        private const val KEY_DAILY_TARGET = "daily_challenge_target"
        private const val KEY_DAILY_SCORE = "daily_challenge_score"
        private const val KEY_DAILY_COMPLETED = "daily_challenge_completed"
        private const val KEY_DAILY_STREAK = "daily_challenge_streak"
    }

    fun getDailyChallenge(todayDate: String): Triple<Int, Int, Boolean> {
        val savedDate = prefs.getString(KEY_DAILY_DATE, "")
        if (savedDate == todayDate) {
            val target = prefs.getInt(KEY_DAILY_TARGET, 800)
            val score = prefs.getInt(KEY_DAILY_SCORE, 0)
            val completed = prefs.getBoolean(KEY_DAILY_COMPLETED, false)
            return Triple(target, score, completed)
        } else {
            // New day: compute target (650 to 1150)
            val hash = kotlin.math.abs(todayDate.hashCode())
            val target = 650 + (hash % 6) * 100
            prefs.edit()
                .putString(KEY_DAILY_DATE, todayDate)
                .putInt(KEY_DAILY_TARGET, target)
                .putInt(KEY_DAILY_SCORE, 0)
                .putBoolean(KEY_DAILY_COMPLETED, false)
                .apply()
            return Triple(target, 0, false)
        }
    }

    fun recordDailyChallengeScore(todayDate: String, score: Int): Boolean {
        val (target, currentScore, isCompleted) = getDailyChallenge(todayDate)
        if (score > currentScore) {
            val completedNow = !isCompleted && score >= target
            val streak = prefs.getInt(KEY_DAILY_STREAK, 0) + (if (completedNow) 1 else 0)
            prefs.edit()
                .putInt(KEY_DAILY_SCORE, score)
                .putBoolean(KEY_DAILY_COMPLETED, isCompleted || completedNow)
                .putInt(KEY_DAILY_STREAK, streak)
                .apply()
            return completedNow
        }
        return false
    }

    fun getDailyStreak(): Int = prefs.getInt(KEY_DAILY_STREAK, 0)

    fun getFlowBestScore(): Int = prefs.getInt(KEY_BEST_SCORE_FLOW, 0)

    fun getRushBestScore(): Int = prefs.getInt(KEY_BEST_SCORE_RUSH, 0)
    fun getLifetimeMaxCombo(): Int = prefs.getInt(KEY_MAX_COMBO, 0)
    fun getLifetimePops(): Int = prefs.getInt(KEY_TOTAL_POPS, 0)

    fun recordRushScore(score: Int): Boolean {
        val currentBest = getRushBestScore()
        if (score > currentBest) {
            prefs.edit().putInt(KEY_BEST_SCORE_RUSH, score).apply()
            return true
        }
        return false
    }

    fun recordFlowScore(score: Int): Boolean {
        val currentBest = getFlowBestScore()
        if (score > currentBest) {
            prefs.edit().putInt(KEY_BEST_SCORE_FLOW, score).apply()
            return true
        }
        return false
    }

    fun recordCombo(combo: Int) {
        val best = getLifetimeMaxCombo()
        if (combo > best) {
            prefs.edit().putInt(KEY_MAX_COMBO, combo).apply()
        }
    }

    fun incrementLifetimePops(count: Int) {
        val current = getLifetimePops()
        prefs.edit().putInt(KEY_TOTAL_POPS, current + count).apply()
    }

    fun loadSettings(): GameSettings {
        val densityOrdinal = prefs.getInt(KEY_DENSITY, BubbleDensity.NORMAL.ordinal)
        val speedOrdinal = prefs.getInt(KEY_SPEED, BubbleSpeed.BALANCED.ordinal)
        return GameSettings(
            soundEnabled = prefs.getBoolean(KEY_SOUND_ENABLED, true),
            hapticEnabled = prefs.getBoolean(KEY_HAPTIC_ENABLED, true),
            reducedMotion = prefs.getBoolean(KEY_REDUCED_MOTION, false),
            bubbleDensity = BubbleDensity.values().getOrElse(densityOrdinal) { BubbleDensity.NORMAL },
            bubbleSpeed = BubbleSpeed.values().getOrElse(speedOrdinal) { BubbleSpeed.BALANCED }
        )
    }

    fun saveSettings(settings: GameSettings) {
        prefs.edit()
            .putBoolean(KEY_SOUND_ENABLED, settings.soundEnabled)
            .putBoolean(KEY_HAPTIC_ENABLED, settings.hapticEnabled)
            .putBoolean(KEY_REDUCED_MOTION, settings.reducedMotion)
            .putInt(KEY_DENSITY, settings.bubbleDensity.ordinal)
            .putInt(KEY_SPEED, settings.bubbleSpeed.ordinal)
            .apply()
    }
}
