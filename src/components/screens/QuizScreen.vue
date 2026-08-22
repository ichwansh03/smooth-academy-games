<script setup>
import MascotDisplay from '../MascotDisplay.vue'
import { TOTAL_QUESTIONS } from '../../utils/constants.js'
import { useMascot } from '../../composables/useMascot.js'
import { useQuiz } from '../../composables/useQuiz.js'

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const OPERATOR_SYMBOLS = { add: '+', subtract: '-', multiply: '×', divide: '÷', campuran: '?' }

const {
  quizCardWiggle,
  quizLevelLabel,
  quizModeLabel,
  quizModeColor,
  progressText,
  isChallenge,
  timerPercentage,
  timerBarClass,
  timerDisplayText,
  timerTextClass,
  handDisplayHtml,
  currentQuestion,
  currentOperator,
  optionClass,
  answered,
  dotClass,
  handleAnswer,
} = useQuiz()
</script>

<template>
  <div class="screen" style="display:flex;">
    <div class="card" style="padding:20px;" :style="{ animation: quizCardWiggle ? 'wiggle 0.4s ease' : '' }">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;flex-wrap:wrap;gap:8px;">
        <span style="font-weight:700;color:var(--text);">{{ quizLevelLabel }}</span>
        <span :style="{ fontWeight: 700, color: quizModeColor }">{{ quizModeLabel }}</span>
        <span style="font-weight:700;color:var(--text);">{{ progressText }}</span>
      </div>
      <div class="progress-dots" style="margin:8px 0;">
        <span v-for="i in TOTAL_QUESTIONS" :key="i" :class="dotClass(i - 1)"></span>
      </div>
      <div v-if="isChallenge" style="width:100%;margin-bottom:8px;">
        <div class="timer-bar-outer">
          <div class="timer-bar-inner" :class="timerBarClass" :style="{ width: timerPercentage + '%' }"></div>
        </div>
        <div :class="timerTextClass">{{ timerDisplayText }}</div>
      </div>
      <div class="hand-display" v-html="handDisplayHtml"></div>
      <p style="font-size:1.3rem;font-weight:700;color:var(--text);margin:4px 0;">
        Berapa hasil {{ currentQuestion?.op === 'add' ? 'penjumlahan' : currentQuestion?.op === 'subtract' ? 'pengurangan' : currentQuestion?.op === 'multiply' ? 'perkalian' : currentQuestion?.op === 'divide' ? 'pembagian' : 'perhitungan' }}nya? 🤔
      </p>
      <div class="options-grid">
        <button v-for="(opt, idx) in currentQuestion ? currentQuestion.options : []" :key="idx"
          :class="optionClass(opt)"
          :disabled="answered"
          @click="handleAnswer(opt)">
          {{ opt }}
        </button>
      </div>
      <div style="margin-top:8px;transform:scale(0.7);">
        <MascotDisplay
          :speech="mascotSpeech"
          :mouth-class="mascotMouthClass"
          @mascot-click="onMascotClick"
        />
      </div>
    </div>
  </div>
</template>
