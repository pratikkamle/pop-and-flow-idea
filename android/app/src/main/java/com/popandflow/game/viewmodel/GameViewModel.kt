package com.popandflow.game.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.popandflow.game.audio.SoundManager
import com.popandflow.game.data.GamePreferences
import com.popandflow.game.engine.BubbleEngine
import com.popandflow.game.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application) {
    private val engine = BubbleEngine()
    private val prefs = GamePreferences(application)
    private val soundManager = SoundManager(application)

    private val _settings = MutableStateFlow(prefs.loadSettings())
    val settings: StateFlow<GameSettings> = _settings.asStateFlow()

    private val _gameMode = MutableStateFlow(GameMode.FLOW)
    val gameMode: StateFlow<GameMode> = _gameMode.asStateFlow()

    private val _stats = MutableStateFlow(GameStats())
    val stats: StateFlow<GameStats> = _stats.asStateFlow()

    val bubbles = mutableListOf<Bubble>()
    val particles = mutableListOf<PopParticle>()
    val ripples = mutableListOf<PopRipple>()

    private var gameLoopJob: Job? = null
    private var comboResetCountdown = 0f
    private var screenWidth = 1080f
    private var screenHeight = 1920f

    init {
        startGameLoop()
    }

    fun setScreenBounds(width: Float, height: Float) {
        if (width > 0f && height > 0f) {
            screenWidth = width
            screenHeight = height
            ensureBubbleCount()
        }
    }

    fun selectMode(mode: GameMode) {
        _gameMode.value = mode
        resetGame()
    }

    fun resetGame() {
        bubbles.clear()
        particles.clear()
        ripples.clear()
        comboResetCountdown = 0f
        _stats.value = GameStats(
            remainingTimeSeconds = if (_gameMode.value == GameMode.COMBO_RUSH) 30f else 0f
        )
        ensureBubbleCount(initialScatter = true)
    }

    fun pauseGame() {
        _stats.update { it.copy(isPaused = true) }
    }

    fun resumeGame() {
        _stats.update { it.copy(isPaused = false) }
    }

    fun onTouchDown(touchX: Float, touchY: Float) {
        if (_stats.value.isPaused || _stats.value.isGameOver) return

        val hit = engine.hitTest(bubbles, touchX, touchY)
        if (hit != null && !hit.isPopped && !hit.scored) {
            hit.isPopped = true
            hit.scored = true
            engine.spawnPopEffects(hit, particles, ripples, _settings.value.reducedMotion)

            // Calculate combo and points
            val currentCombo = _stats.value.combo + 1
            comboResetCountdown = 1.8f // 1.8 seconds window to chain combos

            val isBonus = hit.type == BubbleType.RAINBOW_BONUS ||
                    hit.type == BubbleType.TIME_BONUS ||
                    hit.type == BubbleType.MULTIPLIER_STAR

            if (isBonus) {
                soundManager.playBonus(_settings.value.soundEnabled, _settings.value.hapticEnabled)
            } else {
                soundManager.playPop(currentCombo, _settings.value.soundEnabled, _settings.value.hapticEnabled)
            }

            // Bonus traits
            var bonusSeconds = 0f
            var comboBoost = 1
            if (hit.type == BubbleType.TIME_BONUS && _gameMode.value == GameMode.COMBO_RUSH) {
                bonusSeconds = 3.0f
            } else if (hit.type == BubbleType.MULTIPLIER_STAR) {
                comboBoost = 2
            }

            val multiplier = when {
                currentCombo >= 15 -> 4
                currentCombo >= 10 -> 3
                currentCombo >= 5 -> 2
                else -> 1
            } * comboBoost

            val earnedScore = hit.points * multiplier

            _stats.update { prev ->
                val newScore = prev.score + earnedScore
                val newMaxCombo = maxOf(prev.maxCombo, currentCombo)
                val newTime = if (_gameMode.value == GameMode.COMBO_RUSH) {
                    (prev.remainingTimeSeconds + bonusSeconds).coerceAtMost(60f)
                } else prev.remainingTimeSeconds

                prev.copy(
                    score = newScore,
                    combo = currentCombo,
                    maxCombo = newMaxCombo,
                    totalPops = prev.totalPops + 1,
                    bonusPops = if (isBonus) prev.bonusPops + 1 else prev.bonusPops,
                    remainingTimeSeconds = newTime
                )
            }
        }
    }

    private fun startGameLoop() {
        gameLoopJob?.cancel()
        gameLoopJob = viewModelScope.launch {
            var lastTime = System.nanoTime()
            while (isActive) {
                val now = System.nanoTime()
                val dt = ((now - lastTime) / 1_000_000_000f).coerceIn(0.001f, 0.05f)
                lastTime = now

                if (!_stats.value.isPaused && !_stats.value.isGameOver) {
                    // Update Combo countdown
                    if (comboResetCountdown > 0f) {
                        comboResetCountdown -= dt
                        if (comboResetCountdown <= 0f) {
                            _stats.update { it.copy(combo = 0) }
                        }
                    }

                    // Combo rush timer
                    if (_gameMode.value == GameMode.COMBO_RUSH) {
                        _stats.update { prev ->
                            val updatedTime = prev.remainingTimeSeconds - dt
                            if (updatedTime <= 0f) {
                                val isBest = prefs.recordRushScore(prev.score)
                                prefs.recordCombo(prev.maxCombo)
                                prefs.incrementLifetimePops(prev.totalPops)
                                prev.copy(
                                    remainingTimeSeconds = 0f,
                                    isGameOver = true,
                                    isNewPersonalBest = isBest
                                )
                            } else {
                                prev.copy(remainingTimeSeconds = updatedTime)
                            }
                        }
                    }

                    // Update physics
                    val speed = _settings.value.bubbleSpeed.multiplier
                    engine.updateBubbles(bubbles, dt, screenWidth, screenHeight, _settings.value.reducedMotion, speed)
                    engine.updateParticlesAndRipples(particles, ripples, dt)
                    ensureBubbleCount()
                }

                delay(16) // ~60fps tick
            }
        }
    }

    private fun ensureBubbleCount(initialScatter: Boolean = false) {
        val targetCount = _settings.value.bubbleDensity.maxBubbles
        while (bubbles.size < targetCount) {
            val b = engine.createBubble(
                screenWidth,
                screenHeight,
                _settings.value.bubbleSpeed.multiplier,
                isComboRush = _gameMode.value == GameMode.COMBO_RUSH
            )
            if (initialScatter) {
                // Pre-populate across the viewport vertically for immediate play
                b.y = (Math.random() * (screenHeight - 100f) + 50f).toFloat()
            }
            bubbles.add(b)
        }
    }

    fun updateSettings(newSettings: GameSettings) {
        _settings.value = newSettings
        prefs.saveSettings(newSettings)
    }

    fun getBestScore(mode: GameMode): Int {
        return if (mode == GameMode.COMBO_RUSH) prefs.getRushBestScore() else prefs.getFlowBestScore()
    }

    fun getLifetimeMaxCombo(): Int = prefs.getLifetimeMaxCombo()
    fun getLifetimePops(): Int = prefs.getLifetimePops()

    override fun onCleared() {
        super.onCleared()
        gameLoopJob?.cancel()
    }
}
