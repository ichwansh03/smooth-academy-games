<script setup>
import MascotDisplay from '../MascotDisplay.vue'
import { useMascot } from '../../composables/useMascot.js'
import { useNavigation } from '../../composables/useNavigation.js'
import { useAuth } from '../../composables/useAuth.js'

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()
const { currentUser, isLoggedIn, subscriptionBadge, logout, goToPlay } = useAuth()
</script>

<template>
  <div class="screen" style="display:flex;">
    <div class="card" style="padding: 32px 20px;">
      <MascotDisplay
        :speech="mascotSpeech"
        :mouth-class="mascotMouthClass"
        @mascot-click="onMascotClick"
      />
      <h1 class="title-main" style="margin-top:8px;">🌟 <span class="highlight">Jarimatika</span> Star Quiz 🌟</h1>
      <p style="color:#777;font-weight:600;">Kuis Matematika Jari yang Seru!</p>
      <div style="margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
        <button class="btn btn-primary btn-large" @click="goToPlay()">🎮 Mulai Bermain!</button>
        <button v-if="isLoggedIn" class="btn btn-secondary btn-large" @click="showScreen('screen-report')">📊 Laporanku</button>
      </div>
      <div v-if="isLoggedIn" style="margin-top:12px;font-size:0.85rem;color:#888;">
        <div style="font-weight:800;color:var(--text);background:#FFF4E6;border:2px solid #FFD700;border-radius:20px;padding:6px 14px;display:inline-block;">
          {{ subscriptionBadge }}
        </div>
        <div style="margin-top:8px;">
          👤 {{ currentUser.displayName }} ({{ currentUser.email }})
          <button class="btn btn-accent" style="padding:6px 16px;font-size:0.8rem;margin-left:8px;" @click="logout()">Logout</button>
        </div>
      </div>
      <div v-else style="margin-top:12px;font-size:0.85rem;color:#888;font-weight:700;">
        {{ subscriptionBadge }} — daftar/masuk untuk bermain
      </div>
    </div>
  </div>
</template>
