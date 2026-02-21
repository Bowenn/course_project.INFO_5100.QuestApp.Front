import { useTasks } from '../../context/TasksContext'
import { TaskCard } from '../../components/TaskCard'
import { TASK_STATUS } from '../../data/mockTasks'
import './TakerPages.css'

export function TakerFinishedTasks() {
  const { tasks } = useTasks()
  const finishedTasks = tasks.filter((t) => t.status === TASK_STATUS.DONE)

  return (
    <div className="taker-page">
      <h1>Finished Tasks</h1>
      <p className="page-desc">
        Tasks that have been completed.
      </p>
      <div className="task-grid">
        {finishedTasks.map((task) => (
          <TaskCard key={task.id} task={task} showActions={false} />
        ))}
      </div>
      {finishedTasks.length === 0 && (
        <p className="empty-state">No finished tasks yet.</p>
      )}
    </div>
  )
}
