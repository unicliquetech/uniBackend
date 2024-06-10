const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  documents: [{ type: String }]
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;