
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    title: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    dueDate: {
      type: Date
    },
    status:{
      type: String,
      required: true,
      enum: ['In Progress', 'Pending', 'Completed'],
      default: 'Pending'
    },
    assignedUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
  
  
  })
  const Task = mongoose.model('Task', taskSchema);
  
  module.exports = Task;