import { useEffect, useState } from 'react'
import './App.css'

const initialForm = {
  username: '',
  nickname: '',
  password: '',
}

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null
        return response.json()
      })
      .then((data) => setUser(data?.user ?? null))
      .finally(() => setLoading(false))
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    const endpoint = mode === 'login' ? '/api/login' : '/api/register'
    const payload = mode === 'login'
      ? { username: form.username, password: form.password }
      : form

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || data.status !== 'ok') {
        throw new Error(data.message || '認証に失敗しました。')
      }

      if (mode === 'register') {
        setMode('login')
        setForm((current) => ({ ...initialForm, username: current.username }))
        setMessage('登録が完了しました。ログインしてください。')
      } else {
        setUser(data.user)
        setForm(initialForm)
        setMessage('')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function logout() {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    setUser(null)
    setMode('login')
  }

  if (loading) {
    return (
      <main className="auth-page">
        <div className="loading-card" aria-live="polite">読み込み中...</div>
      </main>
    )
  }

  if (user) {
    return (
      <main className="dashboard-page">
        <header className="dashboard-header">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">EmotionStrataMap</p>
            <h1>マイページ</h1>
          </div>
          <button className="logout-button" type="button" onClick={logout}>ログアウト</button>
        </header>

        <section className="welcome-card">
          <div>
            <p className="welcome-label">ようこそ</p>
            <h2>{user.nickname || user.username}</h2>
            <p>EmotionStrataMapへログインしています。</p>
          </div>
          <div className="role-badge">{user.role === 'ADMIN' ? '管理者' : '一般ユーザー'}</div>
        </section>

        <section className="action-grid" aria-label="主な機能">
          <article>
            <span className="action-icon">＋</span>
            <h3>感情を記録</h3>
            <p>今の気持ちと場所を投稿します。</p>
          </article>
          <article>
            <span className="action-icon">◎</span>
            <h3>地図を見る</h3>
            <p>地域ごとの感情の分布を確認します。</p>
          </article>
          <article>
            <span className="action-icon">▥</span>
            <h3>投稿履歴</h3>
            <p>これまでの記録を振り返ります。</p>
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-panel">
          <div className="brand-symbol" aria-hidden="true">
            <span className="symbol-ring ring-one" />
            <span className="symbol-ring ring-two" />
            <span className="symbol-core" />
          </div>
          <div>
            <p className="brand-kicker">Emotion</p>
            <h1>StrataMap</h1>
            <p className="brand-copy">感情を、場所とともに。</p>
          </div>
        </div>

        <div className="form-panel">
          <div className="mode-tabs" role="tablist" aria-label="認証モード">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setMessage('') }}
            >ログイン</button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setMessage('') }}
            >新規登録</button>
          </div>

          <div className="form-heading">
            <p>{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
            <h2>{mode === 'login' ? 'ログイン' : 'アカウント登録'}</h2>
          </div>

          <form onSubmit={submit}>
            <label>
              ユーザー名
              <input
                name="username"
                value={form.username}
                onChange={updateField}
                placeholder="ユーザー名を入力"
                autoComplete="username"
                required
              />
            </label>

            {mode === 'register' && (
              <label>
                ニックネーム
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={updateField}
                  placeholder="表示名を入力"
                  autoComplete="nickname"
                  maxLength={20}
                />
              </label>
            )}

            <label>
              パスワード
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="8文字以上で入力"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
              />
            </label>

            {message && <p className="form-message" role="status">{message}</p>}

            <button className="submit-button" type="submit" disabled={submitting}>
              {submitting ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default App
