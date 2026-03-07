import { STATUS_LABELS } from '../constants/statuses'
import './TaskCard.css'

/**
 * task shape: { id, title, description, status, giver: { id, username } }
 * currentUserId: the logged-in user's id
 */
export function TaskCard({ task, onAccept, onPublish, onCancel, onDelete, onEdit, currentUserId, showActions = true }) {
  const isOwner = task.giver?.id === currentUserId
  const canPublish = showActions && isOwner && (task.status === 'DRAFT' || task.status === 'CANCELLED')
  const canEdit = showActions && isOwner && (task.status === 'DRAFT' || task.status === 'CANCELLED') && !!onEdit
  const canAccept = showActions && !isOwner && task.status === 'PUBLISHED'
  const canCancel = showActions && isOwner && task.status !== 'DRAFT' && task.status !== 'COMPLETED'
    && task.status !== 'CANCELLED' && task.status !== 'IN_PROGRESS'
  const canDelete = showActions && isOwner && !!onDelete
    && (task.status === 'DRAFT' || task.status === 'CANCELLED')

  return (
    <article className="task-card">
      <h3 className="task-card-title">{task.title}</h3>
      <p className="task-card-desc">{task.description}</p>
      <div className="task-card-meta">
        <span className={`task-status task-status-${task.status?.toLowerCase()}`}>
          {STATUS_LABELS[task.status] || task.status}
        </span>
        {task.giver?.username && (
          <span className="task-owner">by {task.giver.username}</span>
        )}
      </div>
      {showActions && (
        <div className="task-card-actions">
          {canEdit && (
            <button type="button" onClick={() => onEdit?.(task)} className="task-btn task-btn-secondary">
              Edit
            </button>
          )}
          {canPublish && (
            <button type="button" onClick={() => onPublish?.(task)} className="task-btn task-btn-primary">
              Publish
            </button>
          )}
          {canAccept && (
            <button type="button" onClick={() => onAccept?.(task)} className="task-btn task-btn-primary">
              Accept Task
            </button>
          )}
          {canCancel && (
            <button type="button" onClick={() => onCancel?.(task)} className="task-btn task-btn-danger">
              Cancel
            </button>
          )}
          {canDelete && (
            <button type="button" onClick={() => onDelete?.(task)} className="task-btn task-btn-danger">
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}
