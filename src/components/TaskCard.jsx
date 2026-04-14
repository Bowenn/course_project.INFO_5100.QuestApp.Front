import { STATUS_LABELS } from '../constants/statuses'
import './TaskCard.css'

/**
 * task shape: { id, title, description, status, giver: { id, username }, bounty }
 * currentUserId: the logged-in user's id
 * currentUserRole: the logged-in user's role
 */
export function TaskCard({ task, onAccept, onPublish, onCancel, onDelete, onEdit, onConfirm, currentUserId, currentUserRole, showActions = true }) {
  const isOwner = task.giver?.id === currentUserId
  const isAdmin = currentUserRole === 'ADMIN'
  const canPublish = showActions && (isOwner || isAdmin) && (task.status === 'DRAFT' || task.status === 'CANCELLED')
  const canEdit = showActions && (isOwner || isAdmin) && (task.status === 'DRAFT' || task.status === 'CANCELLED') && !!onEdit
  const canAccept = showActions && !isOwner && task.status === 'PUBLISHED'
  const canCancel = showActions && (isOwner || isAdmin) && task.status !== 'DRAFT' && task.status !== 'COMPLETED'
    && task.status !== 'CANCELLED' && task.status !== 'IN_PROGRESS'
  const canDelete = showActions && (isOwner || isAdmin) && !!onDelete
    && (task.status === 'DRAFT' || task.status === 'CANCELLED')
  const canConfirm = showActions && (isOwner || isAdmin) && task.status === 'COMPLETED' && !!onConfirm

  return (
    <article className="task-card">
      <div className="task-card-head">
        <h3 className="task-card-title">{task.title}</h3>
        {task.bounty > 0 && (
          <span className="task-bounty">${task.bounty.toFixed(2)}</span>
        )}
      </div>
      <p className="task-card-desc" title={task.description}>{task.description}</p>
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
              Accept
            </button>
          )}
          {canConfirm && (
            <button type="button" onClick={() => onConfirm?.(task)} className="task-btn task-btn-success">
              Confirm
            </button>
          )}
          {(canCancel || canDelete) && (
            <button
              type="button"
              onClick={() => (canCancel ? onCancel?.(task) : onDelete?.(task))}
              className="task-btn task-btn-danger"
            >
              {canCancel ? 'Cancel' : 'Delete'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
