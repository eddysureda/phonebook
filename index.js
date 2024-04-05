require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

const app = express()

app.use(express.json())

app.use(express.static('dist'))

//Using CORS middleware to allow external origins. Origin is called external when is not same server and port than server
//In this case Backend run on (localhost:3100) but the requester or origin is the Frontend(localhost:5173).
const cors = require('cors')
app.use(cors())

morgan.token("input", function getInput(req) {
  let input  = {};
  if (req.method === "GET") {
    input = req.query
  } else {
    input = req.body
  }
    console.log(input)
    return JSON.stringify(input)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :input'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//GET ALL
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  let start_time = new Date()
  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${start_time}`)
    //response.json(persons)
  })
  //let start_time = new Date().toLocaleString()
  //console.log(response)
  
})

//GET Person by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

//DELETE a resource

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//POST Add a resource

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson=> {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

// END POST Add a resource

// Update a resource
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  ) 
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

//custom middleware after routes to handle non-existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// este debe ser el último middleware cargado
app.use(errorHandler)




const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
