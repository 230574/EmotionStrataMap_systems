import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// const Hello =() =>{
//   return <h1>こんにちは</h1>;
// };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Hello />
  </StrictMode>,
)
