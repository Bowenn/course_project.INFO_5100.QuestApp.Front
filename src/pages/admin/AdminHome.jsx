import { useTasks } from '../../context/TasksContext'
import { TaskCard } from '../../components/TaskCard'
import './AdminHome.css'

export function AdminHome() {
  const { tasks } = useTasks()

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <p className="page-desc">
        Overview of all tasks on the platform.
      </p>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-value">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {tasks.filter((t) => t.status === 'open').length}
          </span>
          <span className="stat-label">Open</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {tasks.filter((t) => t.status === 'picked').length}
          </span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {tasks.filter((t) => t.status === 'done').length}
          </span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      <h2>All Tasks</h2>
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} showActions={false} />
        ))}
      </div>
    </div>
  )
}
