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

      <!-- Logged in: user card + badge -->
      <div v-if="isLoggedIn" style="margin-top:20px;">
        <!-- User profile -->
        <div style="background:linear-gradient(135deg,#F5F7FA,#E4E8EB);border-radius:16px;padding:14px 16px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.2rem;flex-shrink:0;">
              {{ currentUser.displayName.charAt(0).toUpperCase() }}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:800;color:var(--text);font-size:0.95rem;">{{ currentUser.displayName }}</div>
              <div style="font-size:0.75rem;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ currentUser.email }}</div>
            </div>
          </div>
        </div>
        <!-- Subscription badge -->
        <div style="background:#FFF8E6;border:2px solid #FFD700;border-radius:16px;padding:10px 16px;display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <span style="font-size:1.3rem;">{{ currentUser.premium ? '👑' : '🟡' }}</span>
          <span style="font-weight:800;color:var(--text);font-size:0.9rem;flex:1;">{{ currentUser.premium ? 'Premium' : 'Guest' }}</span>
          <span style="font-size:0.75rem;color:#888;font-weight:600;">{{ subscriptionBadge.split('—')[1]?.trim() || 'Semua Jenis' }}</span>
        </div>
        <button class="btn btn-accent" @click="logout()" style="font-size:0.8rem;">⬅ Logout</button>
      </div>

      <!-- Logged out: hint -->
      <div v-else style="margin-top:20px;background:#FFF8E6;border:2px solid #FFD700;border-radius:16px;padding:12px 16px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:1.3rem;">🟡</span>
        <div style="flex:1;">
          <div style="font-weight:800;color:var(--text);font-size:0.9rem;">Guest</div>
          <div style="font-size:0.75rem;color:#888;">Daftar untuk bermain Penjumlahan (Satuan & Puluhan)</div>
        </div>
      </div>
    </div>
  </div>
</template>
