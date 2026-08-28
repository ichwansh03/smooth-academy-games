import { ref } from 'vue'
import * as api from '../utils/api.js'

const stars = ref({})

function starKey(levelId, operator) {
  return `${levelId}-${operator}`
}

export function useStars() {
  function loadLocalStars() {
    try {
      const s = localStorage.getItem('jarimatika_stars')
      if (s) stars.value = JSON.parse(s)
    } catch { /* ignore */ }
  }

  function saveLocalStars(s) {
    try {
      localStorage.setItem('jarimatika_stars', JSON.stringify(s))
    } catch { /* ignore */ }
  }

  async function fetchStarsFromApi(userId) {
    try {
      const results = await api.getUserResults(userId)
      const best = {}
      for (const r of results) {
        const lid = r.level?.id || r.levelId
        const op = r.operator || 'add'
        const s = r.starsEarned
        const key = starKey(lid, op)
        if (s > (best[key] || 0)) best[key] = s
      }
      stars.value = best
      saveLocalStars(best)
    } catch {
      loadLocalStars()
    }
  }

  function getStars(levelId, operator) {
    return stars.value[starKey(levelId, operator)] || 0
  }

  function setStars(levelId, operator, count) {
    const key = starKey(levelId, operator)
    const prev = stars.value[key] || 0
    if (count > prev) {
      stars.value[key] = count
      saveLocalStars(stars.value)
    }
  }

  function isLevelUnlocked(levelId) {
    if (levelId === 1) return true
    // Check if previous level has 3 stars for any operator
    const prevLevel = levelId - 1
    for (const key of Object.keys(stars.value)) {
      if (key.startsWith(prevLevel + '-') && stars.value[key] >= 3) return true
    }
    return false
  }

  return { stars, loadLocalStars, saveLocalStars, fetchStarsFromApi, getStars, setStars, isLevelUnlocked }
}
