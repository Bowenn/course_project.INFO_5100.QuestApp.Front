import { createContext, useContext, useState, useCallback } from 'react'
import { mockTasks, TASK_STATUS } from '../data/mockTasks'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(mockTasks)

  const pickTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: TASK_STATUS.PICKED, takerId: 'current-taker' }
          : t
      )
    )
  }, [])

  const markTaskDone = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: TASK_STATUS.DONE } : t
      )
    )
  }, [])

  const createTask = useCallback((task, giverId = 'g1') => {
    const newTask = {
      ...task,
      id: String(Date.now()),
      status: TASK_STATUS.OPEN,
      giverId,
      takerId: null,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }, [])

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    )
  }, [])

  const cancelTask = useCallback((taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: TASK_STATUS.CANCELLED } : t
      )
    )
  }, [])

  const value = {
    tasks,
    pickTask,
    markTaskDone,
    createTask,
    updateTask,
    cancelTask,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider')
  }
  return context
}
