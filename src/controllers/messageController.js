const Message = require('../models/messageModel');

// Get messages for a particular user
const getMessages = async (req, res) => {
  const userId = req.params.userId;
  try {
    const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between a sender and a recipient
const getSenderMessages = async (req, res) => {
    const senderId = req.params.senderId;
    const userId = req.query.userId; // Assuming you're passing the recipient's ID as a query parameter
  
    try {
      const messages = await Message.find({
        $and: [
          { $or: [{ sender: senderId }, { sender: userId }] },
          { $or: [{ recipient: senderId }, { recipient: userId }] },
        ],
      });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// Send a new message
const sendMessage = async (req, res) => {
  const { sender, recipient, content, documents } = req.body;
  const newMessage = new Message({ sender, recipient, content, documents });
  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  const messageId = req.params.messageId;
  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a message as read or unread
const markMessage = async (req, res) => {
  const messageId = req.params.messageId;
  const { read } = req.body;
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { read },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Archive or unarchive a message
const archiveMessage = async (req, res) => {
  const messageId = req.params.messageId;
  const { archived } = req.body;
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { archived },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports={
    getMessages,
    getSenderMessages,
    sendMessage,
    deleteMessage,
    markMessage,
    archiveMessage,
}