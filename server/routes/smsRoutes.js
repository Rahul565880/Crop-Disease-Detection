const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone number required' });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE;

    if (!accountSid || !authToken || !twilioPhone) {
      return res.status(503).json({ error: 'SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE env vars.' });
    }

    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: '✅ You are now subscribed to Crop Disease Detection alerts! You will receive notifications about disease outbreaks in your area.',
      from: twilioPhone,
      to: phone,
    });

    res.json({ success: true, message: 'SMS subscription successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/send-alert', authenticate, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE;

    if (!accountSid || !authToken || !twilioPhone) {
      return res.status(503).json({ error: 'SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE env vars.' });
    }

    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message.substring(0, 160),
      from: twilioPhone,
      to: phone,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
