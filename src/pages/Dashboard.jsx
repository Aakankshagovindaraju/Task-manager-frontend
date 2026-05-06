import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTasks, createTask, deleteTask, completeTask, getStats } from '../services/api'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo' })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        getTasks(filter ? { status: filter } : {}),
        getStats()
      ])
      setTasks(tasksRes.data)
      setStats(statsRes.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createTask(form)
      setForm({ title: '', description: '', priority: 'medium', status: 'todo' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleComplete = async (id) => {
    await completeTask(id)
    fetchData()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    fetchData()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
  const statusColor = { todo: '#6b7280', in_progress: '#3b82f6', done: '#22c55e' }

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Task Manager</h1>
        <div style={styles.navRight}>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total || 0, color: '#3b82f6' },
            { label: 'Completed', value: stats.completed || 0, color: '#22c55e' },
            { label: 'Pending', value: stats.pending || 0, color: '#f59e0b' },
            { label: 'In Progress', value: stats.in_progress || 0, color: '#8b5cf6' },
          ].map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Task</h3>
            <form onSubmit={handleCreate}>
              <input
                style={styles.input}
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                style={styles.input}
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div style={styles.formRow}>
                <select
                  style={styles.select}
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  style={styles.select}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <button style={styles.submitBtn} type="submit">Create Task</button>
            </form>
          </div>
        )}

        <div style={styles.filterRow}>
          {['', 'todo', 'in_progress', 'done'].map((f) => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === '' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {tasks.length === 0 ? (
          <div style={styles.empty}>No tasks yet. Create your first task!</div>
        ) : (
          <div style={styles.taskList}>
            {tasks.map((task) => (
              <div key={task.id} style={{ ...styles.taskCard, opacity: task.completed ? 0.6 : 1 }}>
                <div style={styles.taskTop}>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.taskActions}>
                    {!task.completed && (
                      <button style={styles.doneBtn} onClick={() => handleComplete(task.id)}>✓</button>
                    )}
                    <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>✕</button>
                  </div>
                </div>
                {task.description && <div style={styles.taskDesc}>{task.description}</div>}
                <div style={styles.taskMeta}>
                  <span style={{ ...styles.badge, background: priorityColor[task.priority] + '20', color: priorityColor[task.priority] }}>
                    {task.priority}
                  </span>
                  <span style={{ ...styles.badge, background: statusColor[task.status] + '20', color: statusColor[task.status] }}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.completed && <span style={{ ...styles.badge, background: '#dcfce7', color: '#16a34a' }}>completed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '16px', color: '#666' },
  navbar: { background: '#fff', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' },
  logo: { fontSize: '20px', fontWeight: '600', color: '#1d4ed8' },
  navRight: { display: 'flex', gap: '10px' },
  addBtn: { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  logoutBtn: { padding: '8px 16px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' },
  statCard: { background: '#fff', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e5e7eb' },
  statNum: { fontSize: '28px', fontWeight: '700' },
  statLabel: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
  formCard: { background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e5e7eb' },
  formTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '1rem' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' },
  select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', width: '100%' },
  submitBtn: { width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '1rem' },
  filterBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#374151' },
  filterActive: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  empty: { textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '15px' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  taskCard: { background: '#fff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e5e7eb' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  taskTitle: { fontSize: '15px', fontWeight: '500', color: '#111827' },
  taskActions: { display: 'flex', gap: '6px' },
  doneBtn: { padding: '4px 8px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  taskDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '8px' },
  taskMeta: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' },
}