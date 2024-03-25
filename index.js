const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

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

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//GET ALL
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  let start_time = new Date()
  //let start_time = new Date().toLocaleString()
  //console.log(response)
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${start_time}`)
  
})

//GET specific ID
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {    
      response.json(person)  
    } else {    
      response.status(404).end()  
    }
})

//DELETE
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

//POST Add a resource

/*
const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}
*/

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  
  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  else {
    const person = persons.find(person => person.name === body.name)
    if (person) {    
      return response.status(400).json({ 
        error: 'name must be unique'
      }) 
    } 
  }


  
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  
  
  

  const person = {
    name: body.name,
    number: String(body.number),
    id: getRandomInt(1000),
  }

  persons = persons.concat(person)

  response.json(person)
})

// END POST Add a resource




const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
