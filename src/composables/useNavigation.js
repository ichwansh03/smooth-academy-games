import { ref } from 'vue'
import { useMascot } from './useMascot.js'

const currentScreen = ref('screen-menu')

const SCREEN_SPEECH = {
  'screen-menu': 'Halo! Ayo belajar <strong>Jarimatika</strong> bersamaku! 🖐️✨',
  'screen-login': 'Halo! Ayo daftar atau masuk! 😊',
  'screen-mode': 'Pilih mode bermainmu ya! 😊',
  'screen-type': 'Pilih jenis latihan yang mau dimainkan! 🎯',
  'screen-level': 'Pilih level bintangmu! ⭐',
  'screen-report': 'Ini laporan belajarmu! 📊',
}

export function useNavigation() {
  const { mascotSpeech } = useMascot()

  function showScreen(screenId) {
    currentScreen.value = screenId
    const speech = SCREEN_SPEECH[screenId]
    if (speech) mascotSpeech.value = speech
  }

  return { currentScreen, showScreen }
}
