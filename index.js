const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('content', (req,res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', {
  skip: (req, res) =>  req.method != 'POST'
}))



let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  let info = `
    <p> Phonebook has info for ${persons.length} people </p>
    <p> Request recived at: ${new Date()} </p>` 

  response.set('Content-Type', 'text/html')
  response.send(Buffer.from(info))
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Informations missing' 
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'Name must be unique' 
    })
  }

  const id = String(Math.floor(Math.random() * 1000000))
  const person = {
    id: id,
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})