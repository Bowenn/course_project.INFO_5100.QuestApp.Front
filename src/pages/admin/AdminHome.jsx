import { useState, useEffect, useCallback } from 'react'
import { tasksAPI, usersAPI } from '../../services/api'
import { STATUS_LABELS } from '../../constants/statuses'
import './AdminHome.css'

export function AdminHome() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [tasksRes, usersRes] = await Promise.all([
        tasksAPI.list(),
        usersAPI.listAll(),
      ])
      setTasks(tasksRes.data)
      setUsers(usersRes.data)
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) return
    setError('')
    try {
      await tasksAPI.delete(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <span className="spinner" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <p className="admin-sup">Administrator</p>
          <h1>Admin Dashboard</h1>
          <p className="admin-intro">Review tasks, monitor activity, and manage users from one place.</p>
        </div>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <section className="admin-panel">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{tasks.filter((t) => t.status === 'PUBLISHED').length}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{tasks.filter((t) => t.status === 'IN_PROGRESS').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{tasks.filter((t) => t.status === 'COMPLETED').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Users</span>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-head">
          <div>
            <h2>All Tasks</h2>
            <p className="page-desc">Manage every task currently in the system and remove outdated entries.</p>
          </div>
          <span className="section-count">{tasks.length} total</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.giver?.username}</td>
                  <td>
                    <span className={`task-status task-status-${task.status?.toLowerCase()}`}>
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="task-btn task-btn-danger"
                      onClick={() => handleDelete(task)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && <p className="empty-state">No tasks found.</p>}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-head">
          <div>
            <h2>All Users</h2>
            <p className="page-desc">View every registered user and their account role.</p>
          </div>
          <span className="section-count">{users.length} total</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
