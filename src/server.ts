import express from 'express'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

type Task = {
  id: string
  todo: string
  isCompleted: boolean
  created_at: Date
}

const tasks: Task[] = []

app.get('/tasks', (_, response) => {
  return response.json({
    tasks,
  })
})

app.post('/tasks', (request, response) => {
  const { todo } = request.body

  tasks.push({
    id: crypto.randomBytes(16).toString('hex'),
    todo,
    created_at: new Date(),
    isCompleted: false,
  })

  return response.status(201).json({
    message: 'Task created.',
  })
})

app.patch('/tasks/:id', (request, response) => {
  const { id } = request.params
  const { isCompleted } = request.body

  const indice = tasks.findIndex(task => task.id === id)

  if (indice !== -1) {
    tasks[indice].isCompleted = isCompleted
  }

  return response.json({
    task: tasks[indice],
  })
})

app.delete('/tasks/:id', (request, response) => {
  const { id } = request.params

  const indice = tasks.findIndex(task => task.id === id)

  tasks.splice(indice, 1)

  return response.json({
    message: `${id} removed from tasks.`,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
