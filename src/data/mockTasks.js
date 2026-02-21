/**
 * Mock task data for development.
 * Replace with API calls when backend is ready.
 */

export const TASK_STATUS = {
  OPEN: 'open',
  PICKED: 'picked',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

export const mockTasks = [
  {
    id: '1',
    title: 'Grocery shopping',
    description: 'Pick up milk, bread, and eggs from the store.',
    status: TASK_STATUS.OPEN,
    giverId: 'g1',
    takerId: null,
    createdAt: '2025-02-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Dog walking',
    description: 'Walk the dog for 30 minutes in the park.',
    status: TASK_STATUS.PICKED,
    giverId: 'g1',
    takerId: 't1',
    createdAt: '2025-02-19T14:00:00Z',
  },
  {
    id: '3',
    title: 'Package delivery',
    description: 'Deliver a package to 123 Main St.',
    status: TASK_STATUS.DONE,
    giverId: 'g2',
    takerId: 't1',
    createdAt: '2025-02-18T09:00:00Z',
  },
  {
    id: '4',
    title: 'Tutoring session',
    description: 'Help with math homework for 1 hour.',
    status: TASK_STATUS.OPEN,
    giverId: 'g2',
    takerId: null,
    createdAt: '2025-02-21T08:00:00Z',
  },
]
