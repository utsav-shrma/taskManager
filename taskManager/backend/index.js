const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const authenticateToken = require('./middleware');
const secret = 'my-secret-key';
const User = require('./userModel');
const bcrypt = require('bcrypt');
const Task=require('./taskModel');


mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

// User registration
app.post('/register', async (req, res) => {
  try {
    const { fullName,email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName,email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Failed to register error' });
  }
});

// User login and token generation
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid Password' });
    }

    const accessToken = jwt.sign({ userId: user._id }, secret,{expiresIn:'1d'});
    res.json({ 'access':accessToken });
  } catch (err) {
    console.log('Error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});
 
app.use(authenticateToken);


// Create (POST) route
app.post('/task', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    if(!newTask.user){
      newTask.user=req.user;
    }
    res.status(201).json(newTask);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Read (GET) routes
app.get('/task', async (req, res) => {
  try {
    const task = await Task.find();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/task/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update (PUT) route
app.put('/task/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete (DELETE) route
app.delete('/task/:id', async (req, res) => {
  try {
    const deletedtask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedtask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(deletedtask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

