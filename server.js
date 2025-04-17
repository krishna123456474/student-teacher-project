const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const readline = require('readline');


const PORT = process.env.PORT || 3000; // Make sure to use environment port if deployed on Render

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());


// ======= HOMEPAGE =========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======= STUDENT LOGIN PAGE =========
app.get('/student-login', (req, res) => {
  console.log('Request for /student-login');
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
    res.send({ success: true, message: 'Account created!' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to create account' });
  }
});

app.post('/student-login', (req, res) => {
  const { id, password } = req.body;
  // Check the student data (use same logic as in /login)
  fs.readFile(path.join(__dirname, 'students.txt'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send({ error: 'Error reading student data' });
    }
    const students = data.split('\n');
    const match = students.find(student => student === `${id},${password}`);
    if (match) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  });
});

// ======= TEACHER LOGIN =========
app.post('/teacher-login', (req, res) => {
  const { id, password } = req.body;
  try {
    const data = fs.readFileSync(path.join(__dirname, 'teachers.txt'), 'utf8').split('\n');
    const match = data.find(line => line === `${id},${password}`);
    
    if (match) {
      res.send({ success: true });
    } else {
      res.send({ success: false, message: 'Invalid login credentials' });
    }
  } catch (err) {
    console.log(err); // For debugging
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
    const questions = fs.readFileSync(path.join(__dirname, 'questions.txt'), 'utf8')
      .split('\n')
      .filter(q => q);
      res.send({ success: true, questions }); // <-- Yeh sirf array bhej raha hai
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
  const data = `${id},${password}\n`;
  
  fs.appendFile(path.join(__dirname, 'teachers.txt'), data, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).send({ error: 'Error creating teacher' });
    }
    res.send({ message: 'Teacher created successfully!' });
  });
});


// ======= SAVE STUDENT ANSWER =========
app.post('/submit-answers', (req, res) => {
  const { answers } = req.body;
  try {
    answers.forEach(({ student, question, answer }) => {
      const line = `Student: ${student} | Q: ${question} | A: ${answer}\n`;
      fs.appendFileSync(path.join(__dirname, 'answers.txt'), line);
    });
    res.send({ success: true, message: 'Answers saved' }); // ✅ fixed here
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send({ success: false, error: `Failed to save answers. ${err.message}` });
  }
});

const filePath = path.join(__dirname, 'answers.txt');

// ========== POST ANSWER ==========
app.post('/submit-answer', (req, res) => {
  const { student, answer } = req.body;

  if (!student || !answer) {
    return res.status(400).json({ error: 'Student name and answer are required' });
  }

  const line = `student: ${student.toLowerCase()}, answer: ${answer}\n`;

  fs.appendFile(filePath, line, err => {
    if (err) {
      console.error("Write Error:", err);
      return res.status(500).json({ error: 'Failed to save answer' });
    }
    res.json({ message: 'Answer saved successfully' });
  });
});

// ========== GET ANSWERS ==========

app.get('/student-answers/:student', (req, res) => {
  const student = req.params.student.toLowerCase();
  const filePath = path.join(__dirname, 'answers.txt');

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: process.stdout,
    terminal: false
  });

  let filtered = [];
  
  rl.on('line', (line) => {
    if (line.toLowerCase().includes(`student: ${student}`)) {
      filtered.push(line.trim());
    }
  });

  rl.on('close', () => {
    if (filtered.length === 0) {
      return res.json({ message: 'No answers found for this student' });
    }
    res.json({ answers: filtered });
  });

  rl.on('error', (err) => {
    console.error("File read error:", err);
    return res.status(500).json({ error: 'Failed to fetch answers' });
  });
});
// API ENDPOINT TO SAVE ANSWER
app.post('/submit-answer',(req, res) => {
  const answer = req.body.answer ; // assuming answer sent in the request body
  // save the answer to answers.txt
  fs.appendFileSync('answers.txt', answer , +'\n');
  // git command to add , commmit & push
exec ('git add answers.txt && git commit -m "add new answer" && git push origin main',(error, stdout, stderr)=>{

  if (error)
  {
    console.error('Error: ${error.message}') ;
    return res.status(500).send('error saving answer');

  }
  if (stderr)
  {
    console.error('Stderr: ${stderr}');
    return res.status(500).send('Error saving answer');
  }

  console.log('Stdout: ${stdout}');
  res.send('Answer Saved and Pushed to GitHub');

});

});

//start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

