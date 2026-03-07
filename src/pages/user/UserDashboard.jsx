import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { tasksAPI, assignmentsAPI, usersAPI } from '../../services/api'
import { TaskCard } from '../../components/TaskCard'
import { STATUS_LABELS } from '../../constants/statuses'
import './UserDashboard.css'

const TABS = {
  BROWSE: 'browse',
  MY_TASKS: 'my_tasks',
  ASSIGNMENTS: 'assignments',
  CREATE: 'create',
  PROFILE: 'profile',
}

const TAB_LABELS = {
  [TABS.BROWSE]: 'Browse Tasks',
  [TABS.MY_TASKS]: 'My Tasks',
  [TABS.ASSIGNMENTS]: 'My Work',
  [TABS.CREATE]: 'Create Task',
  [TABS.PROFILE]: 'Profile',
}

export function UserDashboard() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState(TABS.BROWSE)

  const [publishedTasks, setPublishedTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [assignments, setAssignments] = useState(null) // { asOwner, asTaker }

  const [formData, setFormData] = useState({ title: '', description: '' })
  const [formSuccess, setFormSuccess] = useState('')

  const [editingTask, setEditingTask] = useState(null) // task object being edited
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  const [profileForm, setProfileForm] = useState({ username: '', email: '', newPassword: '', currentPassword: '' })
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPublished = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tasksAPI.listPublished()
      setPublishedTasks(res.data)
    } catch {
      setError('Failed to load published tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await tasksAPI.list()
      setMyTasks(res.data)
    } catch {
      setError('Failed to load your tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAssignments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await assignmentsAPI.list()
      setAssignments(res.data)
    } catch {
      setError('Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setError('')
    setFormSuccess('')
    setProfileSuccess('')
    if (tab === TABS.BROWSE) loadPublished()
    else if (tab === TABS.MY_TASKS) loadMyTasks()
    else if (tab === TABS.ASSIGNMENTS) loadAssignments()
    else if (tab === TABS.PROFILE && user) {
      setProfileForm({ username: user.username, email: user.email, newPassword: '', currentPassword: '' })
    }
  }, [tab, loadPublished, loadMyTasks, loadAssignments, user])

  const handleAccept = async (task) => {
    setError('')
    try {
      await tasksAPI.accept(task.id)
      setPublishedTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept task.')
    }
  }

  const handlePublish = async (task) => {
    setError('')
    try {
      await tasksAPI.publish(task.id)
      loadMyTasks()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish task.')
    }
  }

  const handleCancel = async (task) => {
    if (!window.confirm('Cancel this task?')) return
    setError('')
    try {
      await tasksAPI.cancel(task.id)
      loadMyTasks()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel task.')
    }
  }

  const handleOwnerDelete = async (task) => {
    if (!window.confirm(`Permanently delete "${task.title}"? This cannot be undone.`)) return
    setError('')
    try {
      await tasksAPI.delete(task.id)
      setMyTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.')
    }
  }

  const handleEditClick = (task) => {
    setEditingTask(task)
    setEditFormData({ title: task.title, description: task.description || '' })
    setError('')
  }

  const handleEditCancel = () => {
    setEditingTask(null)
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await tasksAPI.update(editingTask.id, { title: editFormData.title, description: editFormData.description })
      setEditingTask(null)
      loadMyTasks()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.')
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setError('')
    setProfileSuccess('')
    setProfileSubmitting(true)
    try {
      // Only send fields that differ from current or have a value
      const payload = {}
      if (profileForm.username !== user.username) payload.username = profileForm.username
      if (profileForm.email !== user.email) payload.email = profileForm.email
      if (profileForm.newPassword) {
        payload.newPassword = profileForm.newPassword
        payload.currentPassword = profileForm.currentPassword
      }
      const res = await usersAPI.updateMe(payload)
      updateUser(res.data.token, res.data.user)
      setProfileForm((f) => ({ ...f, newPassword: '', currentPassword: '' }))
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleAssignmentUpdate = async (assignmentId, status) => {
    setError('')
    try {
      await assignmentsAPI.update(assignmentId, status)
      loadAssignments()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment.')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setFormSuccess('')
    try {
      await tasksAPI.create(formData.title, formData.description)
      setFormData({ title: '', description: '' })
      setFormSuccess('Task created as DRAFT. Go to "My Tasks" to publish it.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    }
  }

  // Only tasks that the current user created (filtering from the unified list)
  const createdByMe = myTasks.filter((t) => t.giver?.id === user?.id)

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {user && (
        <p className="dashboard-user">
          Logged in as <strong>{user.username}</strong>
        </p>
      )}

      <div className="dashboard-tabs">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-btn ${tab === key ? 'tab-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      {/* BROWSE TAB */}
      {tab === TABS.BROWSE && (
        <div>
          <p className="page-desc">Published tasks you can accept.</p>
          {loading ? (
            <p className="dashboard-loading">Loading…</p>
          ) : (
            <>
              <div className="task-grid">
                {publishedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={handleAccept}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
              {publishedTasks.length === 0 && (
                <p className="empty-state">No published tasks available right now.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* MY TASKS TAB */}
      {tab === TABS.MY_TASKS && (
        <div>
          <p className="page-desc">Tasks you created. Publish a DRAFT to make it available.</p>

          {editingTask && (
            <div className="edit-form-container">
              <h3>Edit Task</h3>
              <form onSubmit={handleEditSave} className="create-form">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData((d) => ({ ...d, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData((d) => ({ ...d, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="login-btn" style={{ flex: 1 }}>
                    Save Changes
                  </button>
                  <button type="button" className="login-btn login-btn-muted" style={{ flex: 1 }} onClick={handleEditCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p className="dashboard-loading">Loading…</p>
          ) : (
            <>
              <div className="task-grid">
                {createdByMe.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditClick}
                    onPublish={handlePublish}
                    onCancel={handleCancel}
                    onDelete={task.status === 'DRAFT' || task.status === 'CANCELLED' ? handleOwnerDelete : undefined}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
              {createdByMe.length === 0 && (
                <p className="empty-state">No tasks yet. Use "Create Task" to add one.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* MY WORK TAB */}
      {tab === TABS.ASSIGNMENTS && (
        <div>
          <p className="page-desc">Tasks you accepted from others. Update your progress here.</p>
          {loading ? (
            <p className="dashboard-loading">Loading…</p>
          ) : assignments ? (
            <>
              <div className="task-grid">
                {assignments.asTaker.map((a) => (
                  <div key={a.id} className="assignment-card">
                    <h3 className="task-card-title">{a.task.title}</h3>
                    <p className="task-card-desc">{a.task.description}</p>
                    <div className="task-card-meta">
                      <span className={`task-status task-status-${a.status?.toLowerCase()}`}>
                        {STATUS_LABELS[a.status] || a.status}
                      </span>
                      <span className="task-owner">from {a.task.giver?.username}</span>
                    </div>
                    <div className="task-card-actions">
                      {a.status === 'ASSIGNED' && (
                        <>
                          <button
                            type="button"
                            className="task-btn task-btn-primary"
                            onClick={() => handleAssignmentUpdate(a.id, 'IN_PROGRESS')}
                          >
                            Start Work
                          </button>
                          <button
                            type="button"
                            className="task-btn task-btn-danger"
                            onClick={() => handleAssignmentUpdate(a.id, 'DECLINED')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {a.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          className="task-btn task-btn-success"
                          onClick={() => handleAssignmentUpdate(a.id, 'COMPLETED')}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                    {a.note && <p className="assignment-note">Note: {a.note}</p>}
                  </div>
                ))}
              </div>
              {assignments.asTaker.length === 0 && (
                <p className="empty-state">You have not accepted any tasks yet.</p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === TABS.PROFILE && (
        <div>
          <p className="page-desc">Update your username, email, or password.</p>
          {profileSuccess && <p className="dashboard-success">{profileSuccess}</p>}
          <form onSubmit={handleProfileSave} className="create-form">
            <div className="form-group">
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm((f) => ({ ...f, username: e.target.value }))}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <hr style={{ margin: '1.25rem 0', borderColor: '#e2e8f0' }} />
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
              Leave blank to keep your current password.
            </p>
            <div className="form-group">
              <label htmlFor="profile-current-password">Current Password</label>
              <input
                id="profile-current-password"
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm((f) => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Required to set a new password"
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-new-password">New Password</label>
              <input
                id="profile-new-password"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm((f) => ({ ...f, newPassword: e.target.value }))}
                placeholder="At least 6 characters"
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={profileSubmitting}>
              {profileSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* CREATE TAB */}
      {tab === TABS.CREATE && (
        <div>
          <p className="page-desc">Create a new task. It starts as DRAFT — publish it when ready.</p>
          {formSuccess && <p className="dashboard-success">{formSuccess}</p>}
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                placeholder="Task title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                placeholder="Describe the task…"
                rows={4}
              />
            </div>
            <button type="submit" className="login-btn">
              Create Task
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
