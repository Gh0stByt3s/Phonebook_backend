const express = require("express");

const app = express();
const cors = require("cors");
require("dotenv").config();

const morgan = require("morgan");
const Person = require("./models/persons");

// morgan.token("body", function (req) {
//   console.log(req.body);
//   return JSON.stringify(req.body);
// });

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: "Number not valid" });
  }

  return next(error);
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
    .then((person) =>
      person ? response.json(person) : response.status(404).end()
    )
    .catch((error) => next(error));
});

// Creating a new person
app.post("/api/persons", (request, response, next) => {
  const { body } = request;
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// Editing a person
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
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

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
