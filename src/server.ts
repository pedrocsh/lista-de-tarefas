import 'dotenv/config'
import express from 'express'
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'

const app = express()
const PORT = process.env.PORT || 3000
const MONGO_CONNECTION = process.env.MONGO_CONNECTION
const MONGO_DB_NAME = process.env.MONGO_DB_NAME

app.use(express.json())

const collections: { tasks?: Collection } = {}

async function connectoToMongo() {
  if (!MONGO_CONNECTION || !MONGO_DB_NAME) {
    throw new Error('Environment variables is missing')
  }

  try {
    const client: MongoClient = new MongoClient(MONGO_CONNECTION)

    await client.connect()

    console.log('💾 Connected to MongoDB')

    const db: Db = client.db(MONGO_DB_NAME)
    const tasksCollection: Collection = db.collection('tasks')

    collections.tasks = tasksCollection
  } catch (error) {
    throw new Error('Failed to connect to mongodb')
  }
}

connectoToMongo()

app.get('/tasks', async (_, response) => {
  const tasks = await collections.tasks?.find({}).toArray()
  return response.json({
    tasks,
  })
})

app.post('/tasks', async (request, response) => {
  const { todo } = request.body

  await collections.tasks?.insertOne({
    todo,
    isCompleted: false,
    created_at: new Date(),
  })

  return response.status(201).json({
    message: 'Task created.',
  })
})

app.patch('/tasks/:id', async (request, response) => {
  const { id } = request.params
  const { isCompleted } = request.body
  const query = { _id: new ObjectId(id) }

  await collections.tasks?.updateOne(query, {
    $set: {
      isCompleted,
    },
  })

  return response.json({
    message: `${id} successfully updated`,
  })
})

app.delete('/tasks/:id', async (request, response) => {
  const { id } = request.params
  const query = { _id: new ObjectId(id) }

  await collections.tasks?.deleteOne(query)

  return response.json({
    message: `${id} removed from tasks.`,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
