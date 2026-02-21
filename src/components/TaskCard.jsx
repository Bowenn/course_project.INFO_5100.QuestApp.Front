import { TASK_STATUS } from '../data/mockTasks'
import './TaskCard.css'

export function TaskCard({ task, onPick, onMarkDone, showActions = true }) {
  const canPick = showActions && task.status === TASK_STATUS.OPEN
  const canMarkDone = showActions && task.status === TASK_STATUS.PICKED

  return (
    <article className="task-card">
      <h3 className="task-card-title">{task.title}</h3>
      <p className="task-card-desc">{task.description}</p>
      <div className="task-card-meta">
        <span className={`task-status task-status-${task.status}`}>
          {task.status}
        </span>
      </div>
      {showActions && (
        <div className="task-card-actions">
          {canPick && (
            <button type="button" onClick={() => onPick?.(task)} className="task-btn task-btn-primary">
              Pick Task
            </button>
          )}
          {canMarkDone && (
            <button type="button" onClick={() => onMarkDone?.(task)} className="task-btn task-btn-success">
              Mark Done
            </button>
          )}
        </div>
      )}
    </article>
  )
}
