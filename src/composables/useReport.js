import { ref, computed } from 'vue'
import * as api from '../utils/api.js'
import { useAuth } from './useAuth.js'

const reportResults = ref([])
const reportLoading = ref(false)
const reportFilter = ref('all')

export function useReport() {
  const { currentUser } = useAuth()

  async function loadReport() {
    if (!currentUser.value) return
    reportLoading.value = true
    try {
      reportResults.value = await api.getUserResults(currentUser.value.id)
    } catch {
      reportResults.value = []
    } finally {
      reportLoading.value = false
    }
  }

  const filteredReportResults = computed(() => {
    if (reportFilter.value === 'all') return reportResults.value
    return reportResults.value.filter(r => (r.operator || 'add') === reportFilter.value)
  })

  const reportTotalAttempts = computed(() => filteredReportResults.value.length)

  const reportAverage = computed(() => {
    if (!filteredReportResults.value.length) return 0
    const sum = filteredReportResults.value.reduce((acc, r) => acc + Number(r.percentage || 0), 0)
    return Math.round((sum / filteredReportResults.value.length) * 100) / 100
  })

  const reportBest = computed(() => {
    if (!filteredReportResults.value.length) return 0
    return Math.max(...filteredReportResults.value.map(r => Number(r.percentage || 0)))
  })

  const reportGrade = computed(() => {
    const avg = reportAverage.value
    if (avg >= 90) return { letter: 'A', label: 'Sangat Baik', emoji: '🏆' }
    if (avg >= 80) return { letter: 'B', label: 'Baik', emoji: '🌟' }
    if (avg >= 70) return { letter: 'C', label: 'Cukup', emoji: '👍' }
    if (avg >= 60) return { letter: 'D', label: 'Kurang', emoji: '🙂' }
    return { letter: 'E', label: 'Perlu Latihan', emoji: '💪' }
  })

  function formatReportDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return iso
    }
  }

  function reportModeLabel(mode) {
    return mode === 'challenge' ? '⚡ Tantangan' : '🧘 Latihan'
  }

  function reportModeColor(mode) {
    return mode === 'challenge' ? 'var(--primary)' : 'var(--green)'
  }

  function reportOperatorLabel(op) {
    switch (op || 'add') {
      case 'subtract': return '➖ Pengurangan'
      case 'multiply': return '✖️ Perkalian'
      case 'divide': return '➗ Pembagian'
      default: return '➕ Penjumlahan'
    }
  }

  return {
    reportResults,
    reportLoading,
    reportFilter,
    filteredReportResults,
    loadReport,
    reportTotalAttempts,
    reportAverage,
    reportBest,
    reportGrade,
    formatReportDate,
    reportModeLabel,
    reportModeColor,
    reportOperatorLabel,
  }
}
