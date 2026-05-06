import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Login to your Task Manager</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.switch}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { fontSize: '24px', fontWeight: '600', marginBottom: '4px' },
  sub: { color: '#666', marginBottom: '1.5rem', fontSize: '14px' },
  error: { background: '#fee', color: '#c00', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '13px' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', marginTop: '0.5rem' },
  switch: { textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: '#666' }
}