const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Make sure to use environment port if deployed on Render

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ======= HOMEPAGE =========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
  try {
    fs.appendFileSync(path.join(__dirname, 'students.txt'), data);
    res.send({ message: 'Account created!' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to create account' });
  }
});

// ======= STUDENT LOGIN =========
app.post('/login', (req, res) => {
  const { name, password } = req.body;
  try {
    const users = fs.readFileSync(path.join(__dirname, 'students.txt'), 'utf8').split('\n');
    const match = users.find(user => user === `${name},${password}`);
    if (match) {
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ error: 'Error reading student data' });
  }
});

// ======= TEACHER LOGIN =========
app.post('/teacher-login', (req, res) => {
  const { id, password } = req.body;
  try {
    const data = fs.readFileSync(path.join(__dirname, 'teachers.txt'), 'utf8').split('\n');
    const match = data.find(line => line === `${id},${password}`);
    res.send({ success: !!match });
  } catch (err) {
    res.status(500).send({ error: 'Error reading teacher data' });
  }
});

// ======= ADD QUESTION =========
app.post('/add-question', (req, res) => {
  const { question } = req.body;
  try {
    fs.appendFileSync(path.join(__dirname, 'questions.txt'), question + '\n');
    res.send({ message: 'Question added' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to add question' });
  }
});

// ======= GET QUESTIONS =========
app.get('/questions', (req, res) => {
  try {
    const questions = fs.readFileSync(path.join(__dirname, 'questions.txt'), 'utf8').split('\n').filter(q => q);
    res.send(questions);
  } catch (err) {
    res.status(500).send({ error: 'Error reading questions' });
  }
});

// ======= DELETE ALL QUESTIONS =========
app.post('/delete-questions', (req, res) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'questions.txt'), '');
    res.send({ message: 'All questions deleted' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete questions' });
  }
});

// ======= DEVELOPER CREATES TEACHER ID =========
app.post('/create-teacher', (req, res) => {
  const { id, password } = req.body;
  try {
    fs.appendFileSync(path.join(__dirname, 'teachers.txt'), `${id},${password}\n`);
    res.send({ message: 'Teacher created' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to create teacher' });
  }
});

// ======= SAVE STUDENT ANSWER =========
app.post('/submit-answer', (req, res) => {
  const { student, question, answer } = req.body;
  const line = `Student: ${student} | Q: ${question} | A: ${answer}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'answers.txt'), line);
    res.send({ message: 'Answer saved' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to save answer' });
  }
});

// ======= GET ANSWERS BY STUDENT =========
app.post('/get-answers', (req, res) => {
  const { student } = req.body;
  try {
    const data = fs.readFileSync(path.join(__dirname, 'answers.txt'), 'utf8').split('\n');
    const filtered = data.filter(line => line.startsWith(`Student: ${student}`));
    res.send(filtered);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch answers' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at https://student-teacher-project.onrender.com`);
});
