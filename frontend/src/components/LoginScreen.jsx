import { useState } from 'react'

export default function LoginScreen({ onShowRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventEvent?.()
    event.preventDefault()

    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'メールアドレスを入力してください'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'メールアドレスの形式が正しくありません'
    }
    if (!password) nextErrors.password = 'パスワードを入力してください'
    else if (password.length < 8) nextErrors.password = 'パスワードは8文字以上で入力してください'

    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok || data.status !== 'ok') {
        throw new Error(data.message || 'メールアドレスまたはパスワードが正しくありません')
      }
      onLoginSuccess(data)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-content">
      <p className="form-kicker">Welcome back</p>
      <h2>ログイン</h2>

      <form onSubmit={submit} noValidate>
        <label htmlFor="login-email">メールアドレス</label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: '' })) }}
          placeholder="example@mail.com"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="login-password">パスワード</label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })) }}
          placeholder="8文字以上"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        {message && <p className="form-message" role="alert">{message}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <p className="form-switch">
        アカウントをお持ちでない方は
        <button type="button" onClick={onShowRegister}>新規登録</button>
      </p>
    </div>
  )
}
