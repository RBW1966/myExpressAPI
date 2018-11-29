// Nodejs encryption with CTR
const crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
     
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
     
    var hw = encrypt("hello world")
    // outputs hello world
    console.log(decrypt(hw));

/* -----
/
*/
import { json } from "express";

//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();

// define the Express app
const app = express();

// the database
const questions = [{id: 1, title: "Do you like turtles?", answers: [ "Yes", "No", "Maybe"], description: "Fred Desc", author: "Amy J"},{id: 2, title: "Should I stop eating food?", answers: ["Yes", "No", "Hell no"], description: "Joe Desc", author: "Linda M"}];

// enhance your app security with Helmet
app.use(helmet());

// use bodyParser to parse application/json content-type
app.use(bodyParser.json());

// enable all CORS requests
app.use(cors());

// log HTTP requests
app.use(morgan('combined'));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://rbw-test.auth0.com/.well-known/jwks.json'
  }),

  // Validate the audience and the issuer.
  // audience: 'http://myExpressAPI',
  issuer: 'https://rbw-test.auth0.com/',
  algorithms: ['RS256']
});

// retrieve all questions
app.get('/', checkJwt, (req, res) => {
  const qs = questions.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    answers: q.answers,
    author: q.author,
  }));
  res.send(qs);
});
// get a specific question
app.get('/:id', (req, res) => {
  const question = questions.filter(q => (q.id === parseInt(req.params.id)));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();
  res.send(question[0]);
});

// insert a new question
app.post('/', checkJwt, (req, res) => {
  const {title, description} = req.body;
  const newQuestion = {
    id: questions.length + 1,
    title,
    description,
    answers: [],
    author: req.user.name,
  };
  questions.push(newQuestion);
  res.status(200).send();
});

// insert a new answer to a question
app.post('/answer/:id', checkJwt, (req, res) => {
  console.log(req.body);
  const {answer} = req.body;

  const question = questions.filter(q => (q.id === parseInt(req.params.id)));
  if (question.length > 1) return res.status(500).send();
  if (question.length === 0) return res.status(404).send();

  question[0].answers.push(answer);

  res.status(200).send();
});

// // insert a new question
// app.post('/', (req, res) => {
//   const {title, description} = req.body;
//   const newQuestion = {
//     id: questions.length + 1,
//     title,
//     description,
//     answers: [],
//   };
//   questions.push(newQuestion);
//   res.status(200).send();
// });

// // insert a new answer to a question
// app.post('/answer/:id', (req, res) => {
//   const {answer} = req.body;

//   const question = questions.filter(q => (q.id === parseInt(req.params.id)));
//   if (question.length > 1) return res.status(500).send();
//   if (question.length === 0) return res.status(404).send();

//   question[0].answers.push({
//     answer,
//   });

//   res.status(200).send();
// });

// start the server
const port = normalizePort(process.env.PORT);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}