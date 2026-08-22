import { ref, computed } from 'vue'
import * as api from '../utils/api.js'
import { useNavigation } from './useNavigation.js'
import { useStars } from './useStars.js'

const currentUser = ref(null)
const loginTab = ref('login')
const loginEmail = ref('')
const loginPassword = ref('')
const loginName = ref('')
const loginLoading = ref(false)
const loginError = ref('')

const OPERATOR_IDS = ['add', 'subtract', 'multiply', 'divide', 'campuran']
const OPERATOR_LABELS = {
  add: '➕ Penjumlahan',
  subtract: '➖ Pengurangan',
  multiply: '✖️ Perkalian',
  divide: '➗ Pembagian',
  campuran: '🔀 Campuran',
}

function toSessionUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    premium: !!u.premium,
    premiumOperators: u.premiumOperators || null,
  }
}

export function useAuth() {
  const { showScreen } = useNavigation()
  const { fetchStarsFromApi } = useStars()

  const isLoggedIn = computed(() => currentUser.value !== null)

  const userTier = computed(() => (currentUser.value && currentUser.value.premium) ? 'premium' : 'guest')

  const unlockedOperators = computed(() => {
    const u = currentUser.value
    if (!u || !u.premium) return ['add']
    const list = (u.premiumOperators || '').split(',').map(s => s.trim()).filter(Boolean)
    return list.length ? list : OPERATOR_IDS
  })

  function isOperatorUnlocked(op) {
    return unlockedOperators.value.includes(op)
  }

  function isLevelAccessible(op, levelId) {
    if (!isOperatorUnlocked(op)) return false
    if (!currentUser.value || !currentUser.value.premium) return levelId <= 2
    return true
  }

  const subscriptionBadge = computed(() => {
    const u = currentUser.value
    if (!u) return '🟡 Guest — ➕ Penjumlahan (Satuan & Puluhan)'
    if (!u.premium) return '🟡 Guest — ➕ Penjumlahan (Satuan & Puluhan)'
    const ops = unlockedOperators.value
    const labels = ops.length >= OPERATOR_IDS.length
      ? 'Semua Jenis Latihan'
      : ops.map(o => OPERATOR_LABELS[o] || o).join(', ')
    return '👑 Premium — ' + labels
  })

  function loadSavedUser() {
    try {
      const raw = localStorage.getItem('jarimatika_user')
      if (raw) {
        const u = JSON.parse(raw)
        currentUser.value = u
        fetchStarsFromApi(u.id)
        validateSavedUser(u)
        return true
      }
    } catch { /* ignore */ }
    return false
  }

  async function validateSavedUser(u) {
    try {
      const fresh = await api.getUser(u.id)
      currentUser.value = toSessionUser(fresh)
      localStorage.setItem('jarimatika_user', JSON.stringify(currentUser.value))
      fetchStarsFromApi(fresh.id)
    } catch (err) {
      if (err.status === 404) {
        currentUser.value = null
        localStorage.removeItem('jarimatika_user')
        showScreen('screen-menu')
      }
    }
  }

  async function handleRegister() {
    const email = loginEmail.value.trim()
    const password = loginPassword.value
    const displayName = loginName.value.trim()
    if (!email || !password || !displayName) {
      loginError.value = 'Isi email, password, dan nama panggilan!'
      return
    }
    if (password.length < 4) {
      loginError.value = 'Password minimal 4 karakter!'
      return
    }
    loginLoading.value = true
    loginError.value = ''
    try {
      const user = await api.registerUser(email, password, displayName)
      currentUser.value = toSessionUser(user)
      localStorage.setItem('jarimatika_user', JSON.stringify(currentUser.value))
      await fetchStarsFromApi(user.id)
      showScreen('screen-mode')
    } catch (err) {
      if (err.status === 409) {
        loginError.value = 'Email sudah terdaftar, silakan login.'
      } else if (err.status) {
        loginError.value = 'Gagal (kode ' + err.status + '). Cek console untuk detail.'
      } else {
        loginError.value = 'Tidak bisa hubungi server. Jalankan backend dulu!'
        console.error('Register error:', err)
      }
    } finally {
      loginLoading.value = false
    }
  }

  async function handleLogin() {
    const email = loginEmail.value.trim()
    const password = loginPassword.value
    if (!email || !password) {
      loginError.value = 'Isi email dan password!'
      return
    }
    loginLoading.value = true
    loginError.value = ''
    try {
      const user = await api.loginUser(email, password)
      currentUser.value = toSessionUser(user)
      localStorage.setItem('jarimatika_user', JSON.stringify(currentUser.value))
      await fetchStarsFromApi(user.id)
      showScreen('screen-mode')
    } catch (err) {
      if (err.status === 401) {
        loginError.value = 'Email atau password salah.'
      } else if (err.status) {
        loginError.value = 'Gagal (kode ' + err.status + '). Cek console.'
      } else {
        loginError.value = 'Tidak bisa hubungi server. Jalankan backend dulu!'
        console.error('Login error:', err)
      }
    } finally {
      loginLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('jarimatika_user')
    showScreen('screen-menu')
  }

  function goToPlay() {
    if (isLoggedIn.value) {
      showScreen('screen-mode')
    } else {
      showScreen('screen-login')
    }
  }

  return {
    currentUser,
    isLoggedIn,
    userTier,
    unlockedOperators,
    isOperatorUnlocked,
    isLevelAccessible,
    subscriptionBadge,
    loginTab,
    loginEmail,
    loginPassword,
    loginName,
    loginLoading,
    loginError,
    loadSavedUser,
    handleRegister,
    handleLogin,
    logout,
    goToPlay,
  }
}
