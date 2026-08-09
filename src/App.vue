<script setup>
import MenuScreen from './components/screens/MenuScreen.vue'
import LoginScreen from './components/screens/LoginScreen.vue'
import ModeScreen from './components/screens/ModeScreen.vue'
import TypeScreen from './components/screens/TypeScreen.vue'
import LevelScreen from './components/screens/LevelScreen.vue'
import QuizScreen from './components/screens/QuizScreen.vue'
import ResultScreen from './components/screens/ResultScreen.vue'
import ReportScreen from './components/screens/ReportScreen.vue'
import { useNavigation } from './composables/useNavigation.js'
import { useAuth } from './composables/useAuth.js'

const { currentScreen } = useNavigation()
const { loadSavedUser } = useAuth()

loadSavedUser()
</script>

<template>
  <div>
    <Transition name="slide" mode="out-in">
      <MenuScreen v-if="currentScreen === 'screen-menu'" key="menu" />
      <LoginScreen v-else-if="currentScreen === 'screen-login'" key="login" />
      <ModeScreen v-else-if="currentScreen === 'screen-mode'" key="mode" />
      <TypeScreen v-else-if="currentScreen === 'screen-type'" key="type" />
      <LevelScreen v-else-if="currentScreen === 'screen-level'" key="level" />
      <QuizScreen v-else-if="currentScreen === 'screen-quiz'" key="quiz" />
      <ResultScreen v-else-if="currentScreen === 'screen-result'" key="result" />
      <ReportScreen v-else-if="currentScreen === 'screen-report'" key="report" />
    </Transition>

    <div id="confetti-container" style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:998;"></div>
  </div>
</template>
