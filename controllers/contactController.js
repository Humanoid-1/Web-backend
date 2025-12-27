import Contact from '../models/Contact.js';

export const submitContactForm = async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Clean inputs
  const cleaned = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim()
  };

  try {
    console.log("Received contact form:", cleaned);

    const newContact = new Contact(cleaned);
    await newContact.save();

    return res.status(201).json({ message: 'Thank you for contacting us!' });
  } catch (error) {
    console.error('Contact form error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({ error: 'This email has already been used.' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
