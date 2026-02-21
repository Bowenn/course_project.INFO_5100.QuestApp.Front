import { useTasks } from '../../context/TasksContext'
import { TaskCard } from '../../components/TaskCard'
import { TASK_STATUS } from '../../data/mockTasks'
import './TakerPages.css'

export function TakerPickedTasks() {
  const { tasks, markTaskDone } = useTasks()
  const pickedTasks = tasks.filter((t) => t.status === TASK_STATUS.PICKED)

  return (
    <div className="taker-page">
      <h1>My Picked Tasks</h1>
      <p className="page-desc">
        Tasks you have accepted. Mark them done when completed.
      </p>
      <div className="task-grid">
        {pickedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMarkDone={markTaskDone}
          />
        ))}
      </div>
      {pickedTasks.length === 0 && (
        <p className="empty-state">You have no picked tasks.</p>
      )}
    </div>
  )
}
