require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const peopleService = require('./services/peopleService')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(express.static('dist'))

morgan.token('content', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content', {
  skip: (req) =>  req.method !== 'POST'  && req.method !== 'PUT'
}))
app.use(cors())

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/api/info', (request, response, next) => {
  peopleService.getAll()
    .then(result => {
      let info ='<p> Phonebook:</p>'
      let number = 1
      result.forEach(person => {
        info = info.concat(`<p>${number}- ${person.name}: ${person.number} </p>`)
        number++
      })
      info = info.concat(`<p> Request recived at: ${new Date()} </p>`)
      response.set('Content-Type', 'text/html')
      response.send(Buffer.from(info))
    })
    .catch(error => next(error))
})
app.get('/api/persons', (request, response, next) => {
  peopleService.getAll()
    .then(result => {
      console.log('Retrived phonebook from DB')
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  peopleService.get(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  peopleService.remove(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Informations missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  peopleService.add(person)
    .then(savedPerson => {
      console.log('Person saved!')
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  peopleService.update(request.params.id, { name, number })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(unknownEndpoint)
app.use(errorHandler)