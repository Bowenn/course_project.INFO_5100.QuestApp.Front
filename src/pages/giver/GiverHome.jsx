import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../context/TasksContext'
import { TaskCard } from '../../components/TaskCard'
import { TASK_STATUS } from '../../data/mockTasks'
import './GiverHome.css'

export function GiverHome() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, cancelTask } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '' })

  const myTasks = tasks.filter((t) => t.giverId === user?.id)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingTask) {
      updateTask(editingTask.id, formData)
      setEditingTask(null)
    } else {
      createTask(formData, user?.id)
    }
    setFormData({ title: '', description: '' })
    setShowForm(false)
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({ title: task.title, description: task.description })
    setShowForm(true)
  }

  const handleCancel = (task) => {
    if (window.confirm('Cancel this task?')) {
      cancelTask(task.id)
    }
  }

  const canEdit = (task) => task.status === TASK_STATUS.OPEN || task.status === TASK_STATUS.PICKED
  const canCancel = (task) => task.status !== TASK_STATUS.DONE && task.status !== TASK_STATUS.CANCELLED

  return (
    <div className="giver-page">
      <h1>My Tasks (Giver)</h1>
      <p className="page-desc">
        Create, modify, and cancel your tasks.
      </p>

      <button
        type="button"
        className="giver-create-btn"
        onClick={() => {
          setShowForm(!showForm)
          setEditingTask(null)
          setFormData({ title: '', description: '' })
        }}
      >
        {showForm ? 'Cancel' : '+ Create Task'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="giver-form">
          <input
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
            rows={3}
          />
          <button type="submit">
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      )}

      <div className="task-grid">
        {myTasks.map((task) => (
          <div key={task.id} className="giver-task-wrapper">
            <TaskCard task={task} showActions={false} />
            {canEdit(task) && (
              <button
                type="button"
                className="giver-action-btn giver-edit"
                onClick={() => handleEdit(task)}
              >
                Edit
              </button>
            )}
            {canCancel(task) && (
              <button
                type="button"
                className="giver-action-btn giver-cancel"
                onClick={() => handleCancel(task)}
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
      {myTasks.length === 0 && (
        <p className="empty-state">You have no tasks. Create one above.</p>
      )}
    </div>
  )
}
