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
  hybrid: '🔀 Campuran',
}

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()
const { getStars, isLevelUnlocked } = useStars()
const { currentOperator, modeBadgeText, startQuiz } = useQuiz()
const { userTier, isOperatorUnlocked, isLevelAccessible } = useAuth()

function levelLocked(lvl) {
  // 1. Satuan (Level 1) is always visually unlocked
  if (lvl.id === 1) return false

  // 2. STRICT GUEST BLOCK: If they are a guest, lock Puluhan, Ratusan, Ribuan
  if (userTier.value === 'guest') return true

  // 3. OPERATION BLOCK: If they are not subscribed to this specific math operation
  if (!isOperatorUnlocked(currentOperator.value)) return true

  // 4. PROGRESSION BLOCK: If they haven't earned 3 stars in the previous level
  if (!isLevelUnlocked(lvl.id, currentOperator.value)) return true

  return false
}

function onLevelClick(lvl) {
  if (levelLocked(lvl)) {
    if (userTier.value === 'guest' && lvl.id > 1) {
      mascotSpeech.value = 'Level ini khusus untuk akun Premium! 👑'
    } else if (!isOperatorUnlocked(currentOperator.value)) {
      mascotSpeech.value = 'Operasi ini belum terbuka untuk akunmu! 🔒'
    } else {
      mascotSpeech.value = 'Dapatkan 3 bintang di level sebelumnya dulu ya! ⭐'
    }
    mascotMouthClass.value = ''
    return // Stops the quiz from starting
  }
  
  startQuiz(lvl.id)
}

function getLevelStars(lvl) {
  return getStars(lvl.id, currentOperator.value)
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
    @click="onLevelClick(lvl)"> <!-- CHANGED HERE -->
    
    <div class="level-icon">{{ lvl.icon }}</div>
    <div class="level-title">{{ lvl.name }}</div>
    <div class="level-range">🔢 {{ lvl.label }}</div>
    <div class="level-stars">
      <span v-for="s in 3" :key="s"
        :class="['star', { earned: s <= getLevelStars(lvl) }]">
        {{ s <= getLevelStars(lvl) ? '⭐' : '☆' }}
      </span>
    </div>
    <div v-if="levelLocked(lvl)" class="lock-icon">🔒</div>
  </div>
</div>
      <button class="btn btn-accent" @click="showScreen('screen-type')" style="margin-top:4px;">⬅ Ganti Jenis</button>
    </div>
  </div>
</template>
