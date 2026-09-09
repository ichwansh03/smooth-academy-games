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
const { isLevelAccessible, isLoggedIn } = useAuth()

function levelLocked(lvl) {
  const op = currentOperator.value
  const accessible = isLevelAccessible(op, lvl.id)
  const unlocked = isLevelUnlocked(lvl.id, op)

  // This will print the background math to your console
  console.log(`Level ${lvl.id} | Accessible: ${accessible} | Unlocked: ${unlocked}`)

  // Force Level 1 (Satuan) to always visually unlock
  if (lvl.id == 1) return false 
  
  if (!accessible) return true
  if (!unlocked) return true
  return false
}

function forceStartQuiz(lvl) {
  // 1. Absolute blocker: Guests cannot click Level 2 or higher
  if (lvl.id > 1 && !isLoggedIn.value) {
    mascotSpeech.value = 'Daftar akun atau login dulu untuk membuka level Puluhan! 🔒'
    mascotMouthClass.value = ''
    return 
  }

  // 2. Standard blocker: Logged-in users who haven't passed the previous level
  if (levelLocked(lvl) && lvl.id != 1) {
    mascotSpeech.value = 'Dapatkan 3 bintang di level sebelumnya dulu ya! ⭐'
    mascotMouthClass.value = ''
    return
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
    @click="forceStartQuiz(lvl)"> <!-- CHANGED HERE -->
    
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
