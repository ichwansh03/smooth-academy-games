<script setup>
import MascotDisplay from '../MascotDisplay.vue'
import { useMascot } from '../../composables/useMascot.js'
import { useNavigation } from '../../composables/useNavigation.js'
import { useQuiz } from '../../composables/useQuiz.js'
import { useAuth } from '../../composables/useAuth.js'

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()
const { selectOperator } = useQuiz()
const { isOperatorUnlocked } = useAuth()

const OPERATORS = [
  { id: 'add', label: 'Penjumlahan', emoji: '➕' },
  { id: 'subtract', label: 'Pengurangan', emoji: '➖' },
  { id: 'multiply', label: 'Perkalian', emoji: '✖️' },
  { id: 'divide', label: 'Pembagian', emoji: '➗' },
]
</script>

<template>
  <div class="screen" style="display:flex;">
    <div class="card">
      <MascotDisplay
        :speech="mascotSpeech"
        :mouth-class="mascotMouthClass"
        @mascot-click="onMascotClick"
      />
      <h2 style="font-size:1.6rem;color:var(--text);">Pilih Jenis Latihan</h2>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
<button
          v-for="op in OPERATORS"
          :key="op.id"
          class="btn btn-large"
          :style="isOperatorUnlocked(op.id)
            ? 'min-width:160px;background:linear-gradient(135deg,#FFF7E6,#FFECD2);border:3px solid #FFD700;color:var(--text);'
            : 'min-width:160px;background:linear-gradient(135deg,#F5F5F5,#E8E8E8);border:3px solid #DDD;color:#AAA;cursor:not-allowed;'"
          :disabled="!isOperatorUnlocked(op.id)"
          @click="isOperatorUnlocked(op.id) && selectOperator(op.id)"
        >
          <template v-if="isOperatorUnlocked(op.id)">
            <div style="font-size:1.8rem;">{{ op.emoji }}</div>
            <div style="font-weight:800;font-size:1rem;">{{ op.label }}</div>
          </template>
          <template v-else>
            <div style="font-size:1.8rem;">🔒</div>
            <div style="font-weight:800;font-size:1rem;">{{ op.label }}</div>
            <div style="font-weight:700;color:#A78BFA;font-size:0.7rem;margin-top:2px;">Khusus Premium</div>
          </template>
        </button>
      </div>
      <button class="btn btn-accent" @click="showScreen('screen-mode')" style="margin-top:8px;">⬅ Kembali</button>
    </div>
  </div>
</template>
