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
 
//auth middleware
app.use(authenticateToken);

// handling users

// read all users for admin

//add auth for admin here
app.get('/user', async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

//read specefic user
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update (PUT) route
app.put('/user/:id', async (req, res) => {
  try {

    // add auth for admin that admin can update all users but normal user can edit his only

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update User' });
  }
});

// Delete (DELETE) route
// add auth for admin only
app.delete('/user/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndDelete(req.params.id);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete User' });
  }
});


//handling taks

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

//read specefic
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


//default route
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

