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

export function useAuth() {
  const { showScreen } = useNavigation()
  const { fetchStarsFromApi } = useStars()

  const isLoggedIn = computed(() => currentUser.value !== null)

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
      await api.getUser(u.id)
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
      currentUser.value = { id: user.id, email: user.email, displayName: user.displayName }
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
      currentUser.value = { id: user.id, email: user.email, displayName: user.displayName }
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
