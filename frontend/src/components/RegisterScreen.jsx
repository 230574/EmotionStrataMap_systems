import { useState } from 'react'

const initialForm = {
  displayName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  termsAgreed: false,
}

export default function RegisterScreen({ onShowLogin }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(event) {
    const { name, value, checked, type } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!form.displayName.trim()) nextErrors.displayName = 'ユーザー名を入力してください'
    if (!form.email.trim()) nextErrors.email = 'メールアドレスを入力してください'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'メールアドレスの形式が正しくありません'
    }
    if (!form.password) nextErrors.password = 'パスワードを入力してください'
    else if (form.password.length < 8) nextErrors.password = 'パスワードは8文字以上で入力してください'
    if (!form.passwordConfirmation) nextErrors.passwordConfirmation = '確認用パスワードを入力してください'
    else if (form.password !== form.passwordConfirmation) {
      nextErrors.passwordConfirmation = 'パスワードが一致しません'
    }
    if (!form.termsAgreed) nextErrors.termsAgreed = '利用規約への同意が必要です'

    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok || data.status !== 'ok') {
        throw new Error(data.message || 'アカウントを作成できませんでした')
      }
      setForm(initialForm)
      setMessage('アカウントを作成しました。ログインしてください。')
      window.setTimeout(onShowLogin, 700)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-content register-content">
      <p className="form-kicker">Create account</p>
      <h2>新規登録</h2>

      <form onSubmit={submit} noValidate>
        <label htmlFor="register-name">ユーザー名</label>
        <input
          id="register-name"
          name="displayName"
          value={form.displayName}
          onChange={update}
          placeholder="表示される名前"
          maxLength={20}
          aria-invalid={Boolean(errors.displayName)}
        />
        {errors.displayName && <p className="field-error">{errors.displayName}</p>}

        <label htmlFor="register-email">メールアドレス</label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          placeholder="example@mail.com"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="register-password">パスワード</label>
        <input
          id="register-password"
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          placeholder="8文字以上"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <label htmlFor="register-password-confirmation">パスワード（確認）</label>
        <input
          id="register-password-confirmation"
          name="passwordConfirmation"
          type="password"
          value={form.passwordConfirmation}
          onChange={update}
          placeholder="もう一度入力"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.passwordConfirmation)}
        />
        {errors.passwordConfirmation && <p className="field-error">{errors.passwordConfirmation}</p>}

        <label className="terms-row">
          <input
            name="termsAgreed"
            type="checkbox"
            checked={form.termsAgreed}
            onChange={update}
          />
          <span>利用規約に同意する</span>
        </label>
        {errors.termsAgreed && <p className="field-error">{errors.termsAgreed}</p>}

        {message && <p className="form-message" role="status">{message}</p>}

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '作成中...' : 'アカウント作成'}
        </button>
      </form>

      <p className="form-switch">
        すでにアカウントをお持ちの方は
        <button type="button" onClick={onShowLogin}>ログイン</button>
      </p>
    </div>
  )
}
