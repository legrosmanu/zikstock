import { useEffect, useState } from 'react'
import './App.css'

interface HealthResponse {
  status: string;
  message: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <h1>Zikstock</h1>
      <p>Welcome to Zikstock, the musician's resource platform.</p>
      {health ? (
        <div className="status">
          <p>Backend Status: <strong>{health.status}</strong></p>
          <p>{health.message}</p>
        </div>
      ) : (
        <p>Connecting to backend...</p>
      )}
    </div>
  )
}

export default App
