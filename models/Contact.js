import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number"
    ]
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true
  }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema, 'contactUs');
