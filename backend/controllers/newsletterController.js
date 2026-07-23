const asyncHandler = require('express-async-handler');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// @desc    Subscribe an email to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.json({ success: true, message: "You're already subscribed!" });
  }

  await NewsletterSubscriber.create({ email });
  res.status(201).json({ success: true, message: 'Subscribed successfully! Thank you for joining.' });
});

module.exports = { subscribe };
