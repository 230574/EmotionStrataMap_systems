import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/hello')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.text()
      })
      .then((text) => setMessage(text))
      .catch((err) => {
        console.error(err)
        setError('バックエンドに接続できませんでした。')
      })
  }, [])

  return (
    <main className="app-shell">
      <h1>EmotionStrataMap</h1>
      <p>Backend API response:</p>
      <div className="message-box">{error || message}</div>
    </main>
  )
}

export default App
