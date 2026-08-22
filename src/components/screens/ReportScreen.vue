<script setup>
import { onMounted } from 'vue'
import MascotDisplay from '../MascotDisplay.vue'
import { useMascot } from '../../composables/useMascot.js'
import { useNavigation } from '../../composables/useNavigation.js'
import { useAuth } from '../../composables/useAuth.js'
import { useReport } from '../../composables/useReport.js'

const { mascotSpeech, mascotMouthClass, onMascotClick } = useMascot()
const { showScreen } = useNavigation()
const { currentUser, goToPlay } = useAuth()
const {
  reportLoading,
  reportResults,
  reportFilter,
  filteredReportResults,
  reportAverage,
  reportBest,
  reportTotalAttempts,
  reportGrade,
  formatReportDate,
  reportModeLabel,
  reportModeColor,
  reportOperatorLabel,
  loadReport,
} = useReport()

onMounted(loadReport)
</script>

<template>
  <div class="screen" style="display:flex;">
    <div class="card" style="padding:24px 20px;width:100%;max-width:520px;">
      <MascotDisplay
        :speech="mascotSpeech"
        :mouth-class="mascotMouthClass"
        @mascot-click="onMascotClick"
      />
      <h2 style="font-size:1.5rem;color:var(--text);">📊 Laporan Belajar</h2>
      <p style="font-size:0.9rem;color:#888;font-weight:600;">👤 {{ currentUser.displayName }}</p>

      <div v-if="reportLoading" style="color:#888;font-weight:700;margin:20px 0;">⏳ Memuat laporan...</div>

      <template v-else>
        <div v-if="reportResults.length === 0" style="margin:20px 0;font-weight:700;color:#888;">
          Belum ada latihan. Ayo mulai bermain! 🎮
        </div>

        <template v-else>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0;">
            <button
              v-for="f in [['all','Semua'],['add','➕ Penjumlahan'],['subtract','➖ Pengurangan'],['multiply','✖️ Perkalian'],['divide','➗ Pembagian'],['campuran','🔀 Campuran']]"
              :key="f[0]"
              class="btn"
              :style="reportFilter === f[0]
                ? 'background:var(--primary);color:#fff;border:2px solid var(--primary);padding:6px 12px;font-size:0.8rem;'
                : 'background:#fff;color:var(--text);border:2px solid #E0D8D0;padding:6px 12px;font-size:0.8rem;'"
              @click="reportFilter = f[0]"
            >{{ f[1] }}</button>
          </div>

          <div v-if="filteredReportResults.length === 0" style="margin:16px 0;font-weight:700;color:#888;">
            Belum ada latihan untuk jenis ini. 🎮
          </div>

          <div v-else>
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:12px 0;">
            <div style="flex:1;min-width:110px;background:linear-gradient(135deg,#FFF9E6,#FFECD2);border:3px solid #FFD700;border-radius:18px;padding:12px 10px;text-align:center;">
              <div style="font-size:0.8rem;font-weight:700;color:#888;">Rata-rata</div>
              <div style="font-size:1.6rem;font-weight:900;color:#5D4037;">{{ reportAverage }}%</div>
            </div>
            <div style="flex:1;min-width:110px;background:linear-gradient(135deg,#E8FAF0,#D4F2E4);border:3px solid var(--green);border-radius:18px;padding:12px 10px;text-align:center;">
              <div style="font-size:0.8rem;font-weight:700;color:#888;">Terbaik</div>
              <div style="font-size:1.6rem;font-weight:900;color:#065F46;">{{ reportBest }}%</div>
            </div>
            <div style="flex:1;min-width:110px;background:linear-gradient(135deg,#EEF2FF,#E0E7FF);border:3px solid #A78BFA;border-radius:18px;padding:12px 10px;text-align:center;">
              <div style="font-size:0.8rem;font-weight:700;color:#888;">Total</div>
              <div style="font-size:1.6rem;font-weight:900;color:#4C1D95;">{{ reportTotalAttempts }}</div>
            </div>
          </div>

          <div style="margin:10px 0;text-align:center;">
            <div style="font-size:0.85rem;font-weight:700;color:#888;">Nilai Akhir</div>
            <div style="font-size:3rem;font-weight:900;background:linear-gradient(135deg,#FF6B6B,#FF8E53);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
              {{ reportGrade.letter }}
            </div>
            <div style="font-weight:800;color:var(--text);">{{ reportGrade.emoji }} {{ reportGrade.label }}</div>
          </div>

          <div style="max-height:300px;overflow-y:auto;width:100%;display:flex;flex-direction:column;gap:8px;margin-top:10px;padding-right:4px;">
            <div v-for="(r, idx) in filteredReportResults" :key="r.id || idx"
              style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:#FAF5F0;border-radius:14px;padding:10px 14px;border:2px solid #F0E8E0;">
              <div style="font-weight:800;color:var(--text);font-size:0.95rem;">
                {{ r.level ? r.level.icon + ' ' + r.level.name : 'Level ' + (r.levelId || '?') }}
              </div>
              <div style="font-weight:700;font-size:0.8rem;color:var(--text);">
                <span :style="{ color: reportModeColor(r.mode) }">{{ reportModeLabel(r.mode) }}</span>
                <span style="color:#A78BFA;"> · {{ reportOperatorLabel(r.operator) }}</span>
                · {{ r.correctCount }}/{{ r.totalQuestions }} · {{ Number(r.percentage) }}%
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="color:#FFD700;font-size:0.9rem;">{{ '⭐'.repeat(r.starsEarned) }}</span>
                <span style="font-size:0.75rem;color:#999;">{{ formatReportDate(r.createdAt) }}</span>
              </div>
            </div>
          </div>
          </div>
        </template>
      </template>

      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:14px;">
        <button class="btn btn-accent" @click="showScreen('screen-menu')">⬅ Kembali</button>
        <button class="btn btn-primary" @click="goToPlay()">🎮 Main Lagi</button>
      </div>
    </div>
  </div>
</template>
