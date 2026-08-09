import { ref, computed, nextTick } from 'vue'
import { TOTAL_QUESTIONS, LEVELS } from '../utils/constants.js'
import { getRandomEncouragement, getRandomComfort } from '../utils/helpers.js'
import { generateQuestions } from '../utils/questions.js'
import { renderHandsForNumber } from '../utils/hands.js'
import { spawnConfetti, spawnMiniConfetti } from '../utils/effects.js'
import * as api from '../utils/api.js'
import { useAuth } from './useAuth.js'
import { useStars } from './useStars.js'
import { useMascot } from './useMascot.js'
import { useNavigation } from './useNavigation.js'

const currentMode = ref('practice')
const currentLevelId = ref(1)
const currentQuestionIndex = ref(0)
const correctCount = ref(0)
const questions = ref([])
const timerSeconds = ref(30)
const timerInterval = ref(null)
const answered = ref(false)
const selectedOption = ref(null)
const quizCardWiggle = ref(false)
const starsEarned = ref(0)

export function useQuiz() {
  const { currentUser, isLoggedIn } = useAuth()
  const { stars, saveLocalStars, fetchStarsFromApi } = useStars()
  const { mascotSpeech, mascotMouthClass } = useMascot()
  const { showScreen } = useNavigation()

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

  const correctAnswer = computed(() => {
    const q = currentQuestion.value
    return q ? q.correctAnswer : null
  })

  const progressText = computed(() => {
    return 'Soal ' + (currentQuestionIndex.value + 1) + '/' + TOTAL_QUESTIONS
  })

  const isChallenge = computed(() => currentMode.value === 'challenge')

  const timerPercentage = computed(() => (timerSeconds.value / 30) * 100)

  const timerBarClass = computed(() => {
    if (timerSeconds.value <= 5) return 'timer-bar-inner danger'
    if (timerSeconds.value <= 15) return 'timer-bar-inner warning'
    return 'timer-bar-inner'
  })

  const timerDisplayText = computed(() => {
    if (timerSeconds.value <= 5) return '⚠️ ' + timerSeconds.value + ' detik!'
    return '⏱ ' + timerSeconds.value + ' detik'
  })

  const timerTextClass = computed(() => {
    return timerSeconds.value <= 5 ? 'timer-text danger' : 'timer-text'
  })

  const handDisplayHtml = computed(() => {
    const q = currentQuestion.value
    if (!q) return ''
    return renderHandsForNumber(q.a) +
      '<span class="operator-symbol">+</span>' +
      renderHandsForNumber(q.b) +
      '<span class="equals-symbol">=</span>' +
      '<span class="question-mark">?</span>'
  })

  const resultStarsList = computed(() => {
    const earned = starsEarned.value
    return [1, 2, 3].map(i => ({ earned: i <= earned, delay: 0.1 + (i - 1) * 0.3 }))
  })

  const scoreText = computed(() => {
    return '✅ ' + correctCount.value + ' / ' + TOTAL_QUESTIONS + ' Benar (' + Math.round((correctCount.value / TOTAL_QUESTIONS) * 100) + '%)'
  })

  const resultTitle = computed(() => {
    if (starsEarned.value >= 3) return '🎉 Luar Biasa!'
    if (starsEarned.value >= 2) return '🌟 Bagus!'
    if (starsEarned.value >= 1) return '👍 Cukup Baik!'
    return '💪 Tetap Semangat!'
  })

  const resultMessage = computed(() => {
    if (starsEarned.value >= 3) return 'Kamu mendapatkan 3 bintang! Level berikutnya terbuka! 🚀'
    if (starsEarned.value >= 2) return 'Dapat 2 bintang! Tingkatkan lagi untuk membuka level berikutnya! ⭐'
    if (starsEarned.value >= 1) return '1 bintang! Ayo coba lagi untuk hasil lebih baik! 🌈'
    return 'Jangan menyerah! Latihan lagi ya, pasti bisa! 💪'
  })

  const canGoNextLevel = computed(() => starsEarned.value >= 3 && currentLevelId.value < 4)

  const modeBadgeText = computed(() => {
    return currentMode.value === 'practice' ? '🧘 Mode Latihan' : '⚡ Mode Tantangan (30dtk)'
  })

  const quizLevelLabel = computed(() => {
    const level = LEVELS.find(l => l.id === currentLevelId.value)
    return level ? '⭐ ' + level.name : ''
  })

  const quizModeLabel = computed(() => {
    return currentMode.value === 'practice' ? '🧘 Latihan' : '⚡ Tantangan'
  })

  const quizModeColor = computed(() => {
    return currentMode.value === 'practice' ? 'var(--green)' : 'var(--primary)'
  })

  function selectMode(mode) {
    currentMode.value = mode
    showScreen('screen-level')
  }

  function startQuiz(levelId) {
    currentLevelId.value = levelId
    currentQuestionIndex.value = 0
    correctCount.value = 0
    questions.value = generateQuestions(levelId, TOTAL_QUESTIONS)
    answered.value = false
    selectedOption.value = null
    timerSeconds.value = 30
    clearTimer()
    showScreen('screen-quiz')
    mascotSpeech.value = 'Ayo, pasti bisa! 💪'
    mascotMouthClass.value = 'happy'
    nextTick(renderQuestion)
  }

  function renderQuestion() {
    if (currentQuestionIndex.value >= TOTAL_QUESTIONS) {
      endQuiz()
      return
    }
    answered.value = false
    selectedOption.value = null
    timerSeconds.value = 30
    clearTimer()
    mascotSpeech.value = 'Ayo, yang ini berapa ya? 🤔'
    mascotMouthClass.value = 'happy'
    if (isChallenge.value) {
      startTimer()
    }
  }

  function optionClass(opt) {
    let cls = 'btn btn-option'
    if (!answered.value) return cls
    if (opt === correctAnswer.value) cls += ' correct'
    if (opt === selectedOption.value && opt !== correctAnswer.value) cls += ' wrong'
    return cls
  }

  function dotClass(index) {
    if (index < currentQuestionIndex.value) {
      const q = questions.value[index]
      return q && q.userCorrect ? 'progress-dot done' : 'progress-dot wrong-dot'
    }
    if (index === currentQuestionIndex.value && !answered.value) {
      return 'progress-dot current'
    }
    return 'progress-dot'
  }

  function handleAnswer(selectedValue) {
    if (answered.value) return
    answered.value = true
    selectedOption.value = selectedValue
    clearTimer()

    const q = currentQuestion.value
    const isCorrect = selectedValue === q.correctAnswer
    q.userCorrect = isCorrect

    if (isCorrect) {
      correctCount.value++
      mascotSpeech.value = getRandomEncouragement()
      mascotMouthClass.value = 'cheer'
      nextTick(() => {
        const btn = document.querySelector('.btn-option.correct')
        if (btn) spawnMiniConfetti(btn)
      })
    } else {
      mascotSpeech.value = getRandomComfort()
      mascotMouthClass.value = ''
      quizCardWiggle.value = true
      setTimeout(() => { quizCardWiggle.value = false }, 400)
    }

    setTimeout(() => {
      currentQuestionIndex.value++
      if (currentQuestionIndex.value >= TOTAL_QUESTIONS) {
        endQuiz()
      } else {
        renderQuestion()
      }
    }, 1600)
  }

  function startTimer() {
    clearTimer()
    timerSeconds.value = 30
    timerInterval.value = setInterval(() => {
      timerSeconds.value--
      if (timerSeconds.value <= 0) {
        clearTimer()
        if (!answered.value) handleTimeout()
      }
    }, 1000)
  }

  function clearTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  function handleTimeout() {
    if (answered.value) return
    answered.value = true
    selectedOption.value = -1
    const q = currentQuestion.value
    q.userCorrect = false
    mascotSpeech.value = 'Waktunya habis! ⏰ Yuk lanjut!'
    mascotMouthClass.value = ''
    setTimeout(() => {
      currentQuestionIndex.value++
      if (currentQuestionIndex.value >= TOTAL_QUESTIONS) endQuiz()
      else renderQuestion()
    }, 1600)
  }

  async function endQuiz() {
    clearTimer()
    const correct = correctCount.value
    const percentage = Math.round((correct / TOTAL_QUESTIONS) * 100)

    let earned = 0
    if (percentage >= 90) earned = 3
    else if (percentage >= 70) earned = 2
    else if (percentage >= 50) earned = 1
    starsEarned.value = earned

    const prevStars = stars.value[currentLevelId.value] || 0
    if (earned > prevStars) {
      stars.value[currentLevelId.value] = earned
      saveLocalStars(stars.value)
    }

    if (isLoggedIn.value) {
      const payload = {
        userId: currentUser.value.id,
        levelId: currentLevelId.value,
        mode: currentMode.value,
        totalQuestions: TOTAL_QUESTIONS,
        correctCount: correct,
      }
      try {
        console.log('[quiz] saving result', payload)
        await api.submitQuizResult(payload)
        console.log('[quiz] result saved OK')
        await fetchStarsFromApi(currentUser.value.id)
      } catch (err) {
        console.error('[quiz] save result FAILED:', err.status || '', err.message || err)
      }
    }

    showScreen('screen-result')

    if (earned >= 3) {
      mascotSpeech.value = 'KAMU HEBAT SEKALI! 🎉🌟✨'
      mascotMouthClass.value = 'cheer'
      nextTick(() => spawnConfetti())
    } else if (earned >= 2) {
      mascotSpeech.value = 'Bagus! Tingkatkan lagi ya! ⭐'
      mascotMouthClass.value = 'happy'
    } else if (earned >= 1) {
      mascotSpeech.value = 'Coba lagi ya, kamu pasti bisa! 💪'
      mascotMouthClass.value = ''
    } else {
      mascotSpeech.value = 'Jangan menyerah! Ayo latihan! 🌈'
      mascotMouthClass.value = ''
    }
  }

  function retryLevel() {
    startQuiz(currentLevelId.value)
  }

  function goToNextLevel() {
    if (currentLevelId.value < 4) {
      currentLevelId.value++
      startQuiz(currentLevelId.value)
    }
  }

  return {
    currentMode,
    currentLevelId,
    starsEarned,
    quizCardWiggle,
    currentQuestion,
    correctAnswer,
    progressText,
    isChallenge,
    timerPercentage,
    timerBarClass,
    timerDisplayText,
    timerTextClass,
    handDisplayHtml,
    resultStarsList,
    scoreText,
    resultTitle,
    resultMessage,
    canGoNextLevel,
    modeBadgeText,
    quizLevelLabel,
    quizModeLabel,
    quizModeColor,
    selectMode,
    startQuiz,
    optionClass,
    dotClass,
    handleAnswer,
    retryLevel,
    goToNextLevel,
  }
}
