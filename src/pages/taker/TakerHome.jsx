import { useTasks } from '../../context/TasksContext'
import { TaskCard } from '../../components/TaskCard'
import { TASK_STATUS } from '../../data/mockTasks'
import './TakerPages.css'

export function TakerHome() {
  const { tasks, pickTask, markTaskDone } = useTasks()
  const allTasks = tasks.filter((t) => t.status !== TASK_STATUS.CANCELLED)

  return (
    <div className="taker-page">
      <h1>Browse All Tasks</h1>
      <p className="page-desc">
        View all available tasks. No login required. Pick a task to accept it.
      </p>
      <div className="task-grid">
        {allTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPick={pickTask}
            onMarkDone={markTaskDone}
          />
        ))}
      </div>
      {allTasks.length === 0 && (
        <p className="empty-state">No tasks available.</p>
      )}
    </div>
  )
}
