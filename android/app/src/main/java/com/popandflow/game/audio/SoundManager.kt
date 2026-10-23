package com.popandflow.game.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.CombinedVibration
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.sin

/**
 * Handles audio synthesis and haptic feedback on Android.
 * Uses procedural tone generation for delightful, zero-asset, crisp pop sounds.
 */
class SoundManager(private val context: Context) {
    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    private val audioScope = CoroutineScope(Dispatchers.Default)

    // Pentatonic scale frequencies for melodic pop sensations (C5, D5, E5, G5, A5, C6)
    private val pentatonicPitches = floatArrayOf(
        523.25f, // C5
        587.33f, // D5
        659.25f, // E5
        783.99f, // G5
        880.00f, // A5
        1046.50f // C6
    )

    fun playPop(combo: Int, soundEnabled: Boolean, hapticEnabled: Boolean) {
        if (hapticEnabled) {
            triggerPopHaptic(combo)
        }
        if (soundEnabled) {
            val pitchIndex = (combo.coerceAtLeast(1) - 1) % pentatonicPitches.size
            val baseFreq = pentatonicPitches[pitchIndex]
            playTone(baseFreq, durationMs = 85)
        }
    }

    fun playBonus(soundEnabled: Boolean, hapticEnabled: Boolean) {
        if (hapticEnabled) {
            triggerBonusHaptic()
        }
        if (soundEnabled) {
            audioScope.launch {
                playTone(784f, 70)
                kotlinx.coroutines.delay(60)
                playTone(1046f, 100)
            }
        }
    }

    private fun triggerPopHaptic(combo: Int) {
        vibrator?.let { v ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val amplitude = (50 + (combo * 15)).coerceIn(40, 220)
                v.vibrate(VibrationEffect.createOneShot(20, amplitude))
            } else {
                @Suppress("DEPRECATION")
                v.vibrate(20)
            }
        }
    }

    private fun triggerBonusHaptic() {
        vibrator?.let { v ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val timings = longArrayOf(0, 30, 40, 45)
                val amplitudes = intArrayOf(0, 180, 0, 240)
                v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
            } else {
                @Suppress("DEPRECATION")
                v.vibrate(60)
            }
        }
    }

    private fun playTone(frequency: Float, durationMs: Int) {
        audioScope.launch {
            try {
                val sampleRate = 44100
                val numSamples = (durationMs * sampleRate) / 1000
                val sample = ShortArray(numSamples)
                for (i in 0 until numSamples) {
                    val t = i.toDouble() / sampleRate
                    // Sine wave with exponential volume decay for a percussive bubble "blop"
                    val decay = kotlin.math.exp(-t * 35.0)
                    // Slight pitch bend down to simulate air pressure release
                    val freq = frequency * (1.0 - t * 1.5).coerceAtLeast(0.7)
                    val s = sin(2.0 * Math.PI * freq * t) * decay * 32767 * 0.4
                    sample[i] = s.toInt().toShort()
                }

                val track = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(numSamples * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                track.write(sample, 0, numSamples)
                track.play()
                kotlinx.coroutines.delay(durationMs.toLong() + 30)
                track.release()
            } catch (_: Exception) {
                // Ignore audio write errors if hardware unavailable
            }
        }
    }
}
