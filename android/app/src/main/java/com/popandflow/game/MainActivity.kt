package com.popandflow.game

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.popandflow.game.model.GameMode
import com.popandflow.game.ui.screens.GameScreen
import com.popandflow.game.ui.screens.HomeScreen
import com.popandflow.game.ui.screens.SettingsScreen
import com.popandflow.game.ui.theme.PopAndFlowTheme
import com.popandflow.game.viewmodel.GameViewModel

enum class Screen {
    HOME,
    GAME,
    SETTINGS
}

class MainActivity : ComponentActivity() {
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PopAndFlowTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var currentScreen by remember { mutableStateOf(Screen.HOME) }
                    val settings by viewModel.settings.collectAsState()

                    Crossfade(targetState = currentScreen, label = "ScreenTransition") { screen ->
                        when (screen) {
                            Screen.HOME -> HomeScreen(
                                bestFlowScore = viewModel.getBestScore(GameMode.FLOW),
                                bestRushScore = viewModel.getBestScore(GameMode.COMBO_RUSH),
                                lifetimePops = viewModel.getLifetimePops(),
                                onStartGame = { mode ->
                                    viewModel.selectMode(mode)
                                    currentScreen = Screen.GAME
                                },
                                onOpenSettings = {
                                    currentScreen = Screen.SETTINGS
                                }
                            )

                            Screen.GAME -> GameScreen(
                                viewModel = viewModel,
                                onNavigateHome = {
                                    currentScreen = Screen.HOME
                                }
                            )

                            Screen.SETTINGS -> SettingsScreen(
                                settings = settings,
                                onSettingsChanged = { newSettings ->
                                    viewModel.updateSettings(newSettings)
                                },
                                onBack = {
                                    currentScreen = Screen.HOME
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        // Safely pause gameplay when app goes to background
        viewModel.pauseGame()
    }
}
