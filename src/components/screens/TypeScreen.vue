<script setup>
import MascotDisplay from '../MascotDisplay.vue'
import { useMascot } from '../../composables/useMascot.js'
import { useNavigation } from '../../composables/useNavigation.js'

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()

const OPERATORS = [
  { id: 'add', symbol: '+', label: 'Penjumlahan', emoji: '➕' },
  { id: 'subtract', symbol: '-', label: 'Pengurangan', emoji: '➖' },
  { id: 'multiply', symbol: '×', label: 'Perkalian', emoji: '✖️' },
  { id: 'divide', symbol: '÷', label: 'Pembagian', emoji: '➗' },
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
          class="btn btn-secondary btn-large"
          style="min-width:160px;"
          @click="showScreen('screen-level')"
        >
          {{ op.emoji }} {{ op.symbol }}<br><small style="font-weight:400;">{{ op.label }}</small>
        </button>
      </div>
      <button class="btn btn-accent" @click="showScreen('screen-mode')" style="margin-top:8px;">⬅ Kembali</button>
    </div>
  </div>
</template>
