const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ======= HOMEPAGE =========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// ======= STUDENT LOGIN PAGE =========
app.get('/student-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student-login.html'));
});

// ======= TEACHER LOGIN PAGE =========
app.get('/teacher-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teacher-login.html'));
});

// ======= DEVELOPER LOGIN PAGE =========
app.get('/developer-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'developer-login.html'));
});

// ======= CREATE TEACHER PAGE (ONLY FOR DEVELOPER) =========
app.get('/developer-create-teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'developer-create-teacher.html'));
});

// ======= STUDENT SIGNUP =========
app.post('/signup', (req, res) => {
  const { name, password } = req.body;
  const data = `${name},${password}\n`;
  fs.appendFileSync('students.txt', data);
  res.send({ message: 'Account created!' });
});

// ======= STUDENT LOGIN =========
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  const users = fs.readFileSync('students.txt', 'utf8').split('\n');
  const match = users.find(user => user === `${name},${password}`);
  if (match) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// ======= TEACHER LOGIN =========
app.post('/teacher-login', (req, res) => {
  const { id, password } = req.body;
  const data = fs.readFileSync('teachers.txt', 'utf8').split('\n');
  const match = data.find(line => line === `${id},${password}`);
  res.send({ success: !!match });
});

// ======= ADD QUESTION =========
app.post('/add-question', (req, res) => {
  const { question } = req.body;
  fs.appendFileSync('questions.txt', question + '\n');
  res.send({ message: 'Question added' });
});

// ======= GET QUESTIONS =========
app.get('/questions', (req, res) => {
  const questions = fs.readFileSync('questions.txt', 'utf8').split('\n').filter(q => q);
  res.send(questions);
});

// ======= DELETE ALL QUESTIONS =========
app.post('/delete-questions', (req, res) => {
  fs.writeFileSync('questions.txt', '');
  res.send({ message: 'All questions deleted' });
});

// ======= DEVELOPER CREATES TEACHER ID =========
app.post('/create-teacher', (req, res) => {
  const { id, password } = req.body;
  fs.appendFileSync('teachers.txt', `${id},${password}\n`);
  res.send({ message: 'Teacher created' });
});

// ======= SAVE STUDENT ANSWER =========
app.post('/submit-answer', (req, res) => {
  const { student, question, answer } = req.body;
  const line = `Student: ${student} | Q: ${question} | A: ${answer}\n`;
  fs.appendFileSync('answers.txt', line);
  res.send({ message: 'Answer saved' });
});

// ======= GET ANSWERS BY STUDENT =========
app.post('/get-answers', (req, res) => {
  const { student } = req.body;
  const data = fs.readFileSync('answers.txt', 'utf8').split('\n');
  const filtered = data.filter(line => line.startsWith(`Student: ${student}`));
  res.send(filtered);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
