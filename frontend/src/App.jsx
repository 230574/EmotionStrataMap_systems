import { useEffect, useState } from 'react'
import './App.css'
import BrandPanel from './components/BrandPanel'
import LoginScreen from './components/LoginScreen'
import RegisterScreen from './components/RegisterScreen'

function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null
        return response.json()
      })
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    setUser(null)
    setScreen('login')
  }

  function loginSuccess(data) {
    setUser(data.user)
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="loading-card">読み込み中...</div>
      </main>
    )
  }

  if (user) {
    const isAdmin = user.role === 'ADMIN'
    return (
      <main className="auth-page">
        <section className="auth-card success-card">
          <BrandPanel />
          <div className="form-content success-content">
            <p className="form-kicker">Login successful</p>
            <h2>{isAdmin ? '投稿管理画面へ移動できます' : 'マップ画面へ移動できます'}</h2>
            <p>{user.nickname || user.username}さん、ログインしました。</p>
            <button className="secondary-button" type="button" onClick={logout}>ログアウト</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className={`auth-card ${screen === 'register' ? 'register-card' : ''}`}>
        <BrandPanel />
        <div className="form-panel">
          {screen === 'login' ? (
            <LoginScreen
              onShowRegister={() => setScreen('register')}
              onLoginSuccess={loginSuccess}
            />
          ) : (
            <RegisterScreen
              onShowLogin={() => setScreen('login')}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default App
