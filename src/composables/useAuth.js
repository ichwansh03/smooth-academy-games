import { ref, computed } from 'vue'
import * as api from '../utils/api.js'
import { useNavigation } from './useNavigation.js'
import { useStars } from './useStars.js'

const currentUser = ref(null)
const userOperators = ref([])
const userEntitlements = ref([])
const loginTab = ref('login')
const loginEmail = ref('')
const loginPassword = ref('')
const loginName = ref('')
const loginLoading = ref(false)
const loginError = ref('')

const OPERATOR_IDS = ['add', 'subtract', 'multiply', 'divide', 'hybrid']
const OPERATOR_LABELS = {
  add: '➕ Penjumlahan',
  subtract: '➖ Pengurangan',
  multiply: '✖️ Perkalian',
  divide: '➗ Pembagian',
  hybrid: '🔀 Campuran',
}

function toSessionUser(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
  }
}

export function useAuth() {
  const { showScreen } = useNavigation()
  const { fetchStarsFromApi } = useStars()

  const isLoggedIn = computed(() => currentUser.value !== null)

  const userTier = computed(() => {
    if (!currentUser.value) return 'guest'
    const hasSubscription = userEntitlements.value.some(e => e.source === 'SUBSCRIPTION' && e.active)
    return hasSubscription ? 'premium' : 'guest'
  })

const unlockedOperators = computed(() => {
  // If this returns [], Level 1 will never open for guests.
  if (!currentUser.value) return ['add', 'subtract'] 
  
  if (userOperators.value.length) return [...userOperators.value]
  return ['add', 'subtract']
})

  function isOperatorUnlocked(op) {
    return unlockedOperators.value.includes(op)
  }

  function getMaxLevelForOperator(op) {
    if (!isOperatorUnlocked(op)) return 0
    const ent = userEntitlements.value.find(e => e.operator === op && e.active)
    if (!ent) return 1
    if (ent.maxLevel === null) return 4
    return ent.maxLevel
  }

  function isLevelAccessible(op, levelId) {
    if (!isOperatorUnlocked(op)) return false
    const maxLevel = getMaxLevelForOperator(op)
    return levelId <= maxLevel
  }

  const subscriptionBadge = computed(() => {
    if (!currentUser.value) return '🟡 Guest — ➕➖ Penjumlahan & Pengurangan (Satuan)'
    if (userTier.value === 'guest') {
      const ops = unlockedOperators.value
      const labels = ops.map(o => OPERATOR_LABELS[o] || o).join(', ')
      return '🟡 Guest — ' + labels + ' (Satuan)'
    }
    const ops = unlockedOperators.value
    const labels = ops.length >= OPERATOR_IDS.length
      ? 'Semua Jenis Latihan'
      : ops.map(o => OPERATOR_LABELS[o] || o).join(', ')
    return '👑 Premium — ' + labels
  })

  async function fetchUserOperators(userId) {
    try {
      const ops = await api.getUserOperators(userId)
      userOperators.value = ops
    } catch {
      userOperators.value = []
    }
  }

  async function fetchUserEntitlements(userId) {
    try {
      const ents = await api.getUserEntitlements(userId)
      userEntitlements.value = ents
    } catch {
      userEntitlements.value = []
    }
  }

  function loadSavedUser() {
    try {
      const raw = localStorage.getItem('jarimatika_user')
      if (raw) {
        const u = JSON.parse(raw)
        currentUser.value = u
        fetchStarsFromApi(u.id)
        fetchUserOperators(u.id)
        fetchUserEntitlements(u.id)
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
      await fetchUserOperators(fresh.id)
      await fetchUserEntitlements(fresh.id)
    } catch (err) {
      if (err.status === 404) {
        currentUser.value = null
        userOperators.value = []
        userEntitlements.value = []
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
      await fetchUserOperators(user.id)
      await fetchUserEntitlements(user.id)
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
      await fetchUserOperators(user.id)
      await fetchUserEntitlements(user.id)
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
    userOperators.value = []
    userEntitlements.value = []
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
