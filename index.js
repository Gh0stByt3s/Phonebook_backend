const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const Person = require("./models/persons");
const morgan = require("morgan");

// morgan.token("body", function (req) {
//   console.log(req.body);
//   return JSON.stringify(req.body);
// });

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("dist"));
// app.use(morgan(":method :url :response-time ms :body"));

// Fetching all the persons
app.get("/api/persons", (request, response) => {
  Person.find().then((persons) => {
    response.json(persons);
  });
});
// Fetching a single person
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      person ? response.json(person) : response.status(404).end();
    })
    .catch((error) => next(error));
});

// Creating a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// Editing a person
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Deleting a single person
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Middleware handler of requests with unknown endpoint
app.use(unknownEndpoint);

// Middleware handler with result to errors
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
