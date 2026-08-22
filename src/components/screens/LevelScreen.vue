<script setup>
import MascotDisplay from '../MascotDisplay.vue'
import { LEVELS } from '../../utils/constants.js'
import { useMascot } from '../../composables/useMascot.js'
import { useNavigation } from '../../composables/useNavigation.js'
import { useStars } from '../../composables/useStars.js'
import { useQuiz } from '../../composables/useQuiz.js'
import { useAuth } from '../../composables/useAuth.js'

const OPERATOR_LABELS = {
  add: '➕ Penjumlahan',
  subtract: '➖ Pengurangan',
  multiply: '✖️ Perkalian',
  divide: '➗ Pembagian',
  campuran: '🔀 Campuran',
}

const ALLOWED_LEVELS = {
  add: [1, 2, 3, 4],
  subtract: [1, 2, 3, 4],
  multiply: [1, 2, 3, 4],
  divide: [1, 2, 3, 4],
  campuran: [1, 2],
}

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()
const { stars, isLevelUnlocked } = useStars()
const { currentOperator, modeBadgeText, startQuiz } = useQuiz()
const { isLevelAccessible } = useAuth()

function levelLocked(lvl) {
  const allowed = ALLOWED_LEVELS[currentOperator.value] || [1, 2, 3, 4]
  return !allowed.includes(lvl.id) || !isLevelAccessible(currentOperator.value, lvl.id) || !isLevelUnlocked(lvl.id)
}
</script>

<template>
  <div class="screen" style="display:flex;">
    <div class="card">
      <MascotDisplay
        :speech="mascotSpeech"
        :mouth-class="mascotMouthClass"
        @mascot-click="onMascotClick"
      />
      <h2 style="font-size:1.4rem;color:var(--text);">Pilih Level</h2>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0;">
        <span :style="{ fontWeight:700, background:'#FFF0F0', padding:'5px 12px', borderRadius:'16px', fontSize:'0.8rem', color:'var(--primary)' }">
          {{ modeBadgeText }}
        </span>
        <span :style="{ fontWeight:700, background:'#F0E6FF', padding:'5px 12px', borderRadius:'16px', fontSize:'0.8rem', color:'#7C3AED' }">
          {{ OPERATOR_LABELS[currentOperator] }}
        </span>
      </div>
      <div class="level-grid">
        <div v-for="lvl in LEVELS" :key="lvl.id"
          :class="['level-card', { locked: levelLocked(lvl) }]"
          @click="!levelLocked(lvl) && startQuiz(lvl.id)">
          <div class="level-icon">{{ lvl.icon }}</div>
          <div class="level-title">{{ lvl.name }}</div>
          <div class="level-range">🔢 {{ lvl.label }}</div>
          <div class="level-stars">
            <span v-for="s in 3" :key="s"
              :class="['star', { earned: s <= (stars[lvl.id] || 0) }]">
              {{ s <= (stars[lvl.id] || 0) ? '⭐' : '☆' }}
            </span>
          </div>
          <div v-if="levelLocked(lvl)" class="lock-icon">🔒</div>
        </div>
      </div>
      <button class="btn btn-accent" @click="showScreen('screen-type')" style="margin-top:4px;">⬅ Ganti Jenis</button>
    </div>
  </div>
</template>
