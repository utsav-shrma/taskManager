const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => {
        return new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email);
      },
      message: 'Invalid email address'
    }
  },
  password: {
    type: String,
    required: true,
  },
  task:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }
});



const User = mongoose.model('User', userSchema);

module.exports = User;
