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
  [TABS.BROWSE]: 'Browse',
  [TABS.MY_TASKS]: 'My Tasks',
  [TABS.ASSIGNMENTS]: 'My Work',
  [TABS.CREATE]: 'Create',
  [TABS.PROFILE]: 'Profile',
}

export function UserDashboard() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState(TABS.BROWSE)

  const [publishedTasks, setPublishedTasks] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [assignments, setAssignments] = useState(null) // { asOwner, asTaker }

  const [formData, setFormData] = useState({ title: '', description: '', bounty: '' })
  const [formSuccess, setFormSuccess] = useState('')

  const [editingTask, setEditingTask] = useState(null) // task object being edited
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  const [profileForm, setProfileForm] = useState({ username: '', email: '', newPassword: '', currentPassword: '' })
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [balanceForm, setBalanceForm] = useState({ action: 'deposit', amount: '' })
  const [balanceSubmitting, setBalanceSubmitting] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Per-tab keyword search
  const [browseSearch, setBrowseSearch] = useState('')
  const [myTasksSearch, setMyTasksSearch] = useState('')
  const [workSearch, setWorkSearch] = useState('')

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
      const list = res.data || []
      const asTaker = list.filter((a) => a.taker?.id === user?.id)
      const asOwner = list.filter((a) => a.task?.giver?.id === user?.id)
      setAssignments({ asTaker, asOwner })
    } catch {
      setError('Failed to load assignments.')
      setAssignments({ asTaker: [], asOwner: [] })
    } finally {
      setLoading(false)
    }
  }, [user])

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
      setError('')
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
      setError('')
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
      setError('')
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
      setError('')
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
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment.')
    }
  }

  const handleConfirm = async (task) => {
    setError('')
    try {
      // Find the assignment for this task; if assignments are not loaded, fetch them.
      let currentAssignments = assignments
      if (!currentAssignments) {
        const res = await assignmentsAPI.list()
        const list = res.data || []
        const asOwner = list.filter((a) => a.task?.giver?.id === user?.id)
        currentAssignments = { asTaker: [], asOwner }
      }

      const assignment = currentAssignments.asOwner?.find(a => a.task.id === task.id)
      if (!assignment) {
        throw new Error('No assignment found for this task.')
      }

      await assignmentsAPI.confirm(assignment.id)
      loadAssignments()
      loadMyTasks()
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm task.')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setFormSuccess('')
    try {
      const bounty = parseFloat(formData.bounty) || 0
      await tasksAPI.create(formData.title, formData.description, bounty)
      setFormData({ title: '', description: '', bounty: '' })
      setFormSuccess('Task created as DRAFT. Go to "My Tasks" to publish it.')
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    }
  }

  const handleBalanceAction = async (e) => {
    e.preventDefault()
    setError('')
    const amount = parseFloat(balanceForm.amount)
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setBalanceSubmitting(true)
    try {
      const res = balanceForm.action === 'deposit'
        ? await usersAPI.deposit(amount)
        : await usersAPI.withdraw(amount)
      updateUser(null, res.data)
      setBalanceForm({ action: 'deposit', amount: '' })
      setProfileSuccess(`${balanceForm.action === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`)
      setTimeout(() => setProfileSuccess(''), 3000)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${balanceForm.action}.`)
    } finally {
      setBalanceSubmitting(false)
    }
  }

  // Only tasks that the current user created (filtering from the unified list)
  const createdByMe = myTasks.filter((t) => t.giver?.id === user?.id)

  // Keyword-filtered views (case-insensitive match on title)
  const kw = (str, q) => str.toLowerCase().includes(q.toLowerCase().trim())
  const filteredPublished = browseSearch
    ? publishedTasks.filter((t) => kw(t.title, browseSearch))
    : publishedTasks
  const filteredMyTasks = myTasksSearch
    ? createdByMe.filter((t) => kw(t.title, myTasksSearch))
    : createdByMe
  const filteredAsTaker = workSearch
    ? (assignments?.asTaker || []).filter((a) => kw(a.task.title, workSearch))
    : (assignments?.asTaker || [])
  const filteredAsOwner = workSearch
    ? (assignments?.asOwner || []).filter((a) => kw(a.task.title, workSearch))
    : (assignments?.asOwner || [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        {user && (
          <span className="dashboard-meta">
            {user.username} · <strong>${user.balance?.toFixed(2) || '0.00'}</strong>
          </span>
        )}
      </div>

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
          {loading ? (
            <div className="loading-wrap"><span className="spinner" /><span>Loading tasks…</span></div>
          ) : publishedTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔭</span>
              <p>No tasks available right now.</p>
              <p className="empty-sub">Check back soon, or create your own task!</p>
            </div>
          ) : (
            <div>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search tasks by title…"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                />
                {browseSearch && (
                  <button type="button" className="search-clear" onClick={() => setBrowseSearch('')}>✕</button>
                )}
              </div>
              {filteredPublished.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <p>No tasks match "<strong>{browseSearch}</strong>"</p>
                  <p className="empty-sub">Try a different keyword.</p>
                </div>
              ) : (
                <>
                  <p className="section-count">
                    {browseSearch
                      ? <><strong>{filteredPublished.length}</strong> of {publishedTasks.length} task{publishedTasks.length !== 1 ? 's' : ''}</>
                      : <><strong>{publishedTasks.length}</strong> task{publishedTasks.length !== 1 ? 's' : ''} available</>
                    }
                  </p>
                  <div className="task-grid">
                    {filteredPublished.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onAccept={handleAccept}
                        currentUserId={user?.id}
                        currentUserRole={user?.role}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* MY TASKS TAB */}
      {tab === TABS.MY_TASKS && (
        <div>
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
                <div className="btn-row">
                  <button type="submit" className="login-btn">Save Changes</button>
                  <button type="button" className="login-btn login-btn-muted" onClick={handleEditCancel}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading-wrap"><span className="spinner" /><span>Loading your tasks…</span></div>
          ) : createdByMe.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>You haven't created any tasks yet.</p>
              <p className="empty-sub">Switch to <strong>✚ Create Task</strong> to post your first quest!</p>
            </div>
          ) : (
            <>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search your tasks by title…"
                  value={myTasksSearch}
                  onChange={(e) => setMyTasksSearch(e.target.value)}
                />
                {myTasksSearch && (
                  <button type="button" className="search-clear" onClick={() => setMyTasksSearch('')}>✕</button>
                )}
              </div>
              {filteredMyTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <p>No tasks match "<strong>{myTasksSearch}</strong>"</p>
                  <p className="empty-sub">Try a different keyword.</p>
                </div>
              ) : (
                <>
                  <p className="section-count">
                    {myTasksSearch
                      ? <><strong>{filteredMyTasks.length}</strong> of {createdByMe.length} task{createdByMe.length !== 1 ? 's' : ''}</>
                      : <><strong>{createdByMe.length}</strong> task{createdByMe.length !== 1 ? 's' : ''}</>
                    }
                  </p>
                  <div className="task-grid">
                    {filteredMyTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditClick}
                        onPublish={handlePublish}
                        onCancel={handleCancel}
                        onDelete={task.status === 'DRAFT' || task.status === 'CANCELLED' ? handleOwnerDelete : undefined}
                        onConfirm={handleConfirm}
                        currentUserId={user?.id}
                        currentUserRole={user?.role}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* MY WORK TAB */}
      {tab === TABS.ASSIGNMENTS && (
        <div>
          {loading ? (
            <div className="loading-wrap"><span className="spinner" /><span>Loading assignments…</span></div>
          ) : (
            <>
              {(assignments?.asTaker?.length > 0 || assignments?.asOwner?.length > 0) && (
                <div className="search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search assignments by task title…"
                    value={workSearch}
                    onChange={(e) => setWorkSearch(e.target.value)}
                  />
                  {workSearch && (
                    <button type="button" className="search-clear" onClick={() => setWorkSearch('')}>✕</button>
                  )}
                </div>
              )}
              {assignments?.asTaker?.length > 0 ? (
                filteredAsTaker.length === 0 && workSearch ? (
                  <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <p>No assignments match "<strong>{workSearch}</strong>"</p>
                    <p className="empty-sub">Try a different keyword.</p>
                  </div>
                ) : (
                  <div className="task-grid">
                    {filteredAsTaker.map((a) => (
                      <div key={a.id} className="task-card">
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
                )
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">💼</span>
                  <p>You haven't accepted any tasks yet.</p>
                  <p className="empty-sub">Browse available tasks and accept one to get started!</p>
                </div>
              )}

              {assignments?.asOwner?.length > 0 && (
                <div className="work-subsection">
                  <h3 className="section-heading">Tasks You've Assigned</h3>
                  {filteredAsOwner.length === 0 && workSearch ? (
                    <p className="section-count">No assigned tasks match "<strong>{workSearch}</strong>"</p>
                  ) : (
                    <div className="task-grid">
                      {filteredAsOwner.map((a) => (
                        <div key={a.id} className="task-card">
                          <h3 className="task-card-title">{a.task.title}</h3>
                          <p className="task-card-desc">{a.task.description}</p>
                          <div className="task-card-meta">
                            <span className={`task-status task-status-${a.status?.toLowerCase()}`}>
                              {STATUS_LABELS[a.status] || a.status}
                            </span>
                            <span className="task-owner">to {a.taker?.username}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === TABS.PROFILE && (
        <div className="profile-page">
          {profileSuccess && <p className="dashboard-success">{profileSuccess}</p>}

          <section className="profile-section">
            <h3 className="profile-section-title">Account Balance</h3>
            <p className="profile-balance-line">
              Current balance: <strong className="profile-balance-amt">${user?.balance?.toFixed(2) || '0.00'}</strong>
            </p>
            <form onSubmit={handleBalanceAction} className="create-form">
              <div className="radio-row">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="action"
                    value="deposit"
                    checked={balanceForm.action === 'deposit'}
                    onChange={(e) => setBalanceForm((f) => ({ ...f, action: e.target.value }))}
                  />
                  Deposit
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="action"
                    value="withdraw"
                    checked={balanceForm.action === 'withdraw'}
                    onChange={(e) => setBalanceForm((f) => ({ ...f, action: e.target.value }))}
                  />
                  Withdraw
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="balance-amount">Amount ($)</label>
                <input
                  id="balance-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max="10000"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <button type="submit" className="login-btn" disabled={balanceSubmitting}>
                {balanceSubmitting ? 'Processing…' : balanceForm.action === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </form>
          </section>

          <div className="profile-divider" />

          <section className="profile-section">
            <h3 className="profile-section-title">Profile Settings</h3>
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
              <p className="form-hint">Leave blank to keep your current password.</p>
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
          </section>
        </div>
      )}

      {/* CREATE TAB */}
      {tab === TABS.CREATE && (
        <div>
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
            <div className="form-group">
              <label htmlFor="bounty">Bounty ($)</label>
              <input
                id="bounty"
                type="number"
                min="0"
                step="0.01"
                value={formData.bounty}
                onChange={(e) => setFormData((d) => ({ ...d, bounty: e.target.value }))}
                placeholder="0.00"
              />
              <small>Your balance: ${user?.balance?.toFixed(2) || '0.00'}</small>
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
