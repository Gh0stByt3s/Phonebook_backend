require("dotenv").config();
const { log } = require("console");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/persons");
const app = express();

// morgan.token("body", function (req) {
//   console.log(req.body);
//   return JSON.stringify(req.body);
// });

app.use(express.json());
app.use(morgan("tiny"));
// app.use(morgan(":method :url :response-time ms :body"));
app.use(cors());
app.use(express.static("dist"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/info", (request, response) => {
  response.send(`<div>
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  </div>`);
});

// Fetching all the persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// Fetching a single person
app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

// Creating a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;
  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.random() * 50,
  });
  const personName = persons.map((person) => person.name.toLowerCase());

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number missing" });
  }

  if (personName.includes(body.name.toLowerCase())) {
    return response
      .status(400)
      .json({ error: "name already exists in the phonebook" });
  }

  persons = persons.concat(person);
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// Deleting a single person
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
