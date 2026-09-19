<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = Number(process.env.PORT || 3001);
const root = __dirname;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function normalizePhone(number) {
  if (!number) return '';
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  return digits;
}

function isEnabled() {
  return String(process.env.WHATSAPP_ENABLED || 'false').toLowerCase() === 'true';
}

async function sendViaTwilio(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio WhatsApp credentials are missing.');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:${normalizePhone(to)}`,
    Body: message
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  await axios.post(url, params.toString(), {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

async function sendViaGreenApi(to, message) {
  const instanceId = process.env.GREENAPI_INSTANCE_ID;
  const apiToken = process.env.GREENAPI_API_TOKEN;

  if (!instanceId || !apiToken) {
    throw new Error('Green API credentials are missing.');
  }

  const cleanNumber = normalizePhone(to);
  const url = `https://gate.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;

  await axios.post(url, {
    chatId: `${cleanNumber}@c.us`,
    message: message
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendViaMeta(to, message) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('Meta WhatsApp credentials are missing.');
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'text',
    text: {
      body: message
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

async function sendWhatsAppMessage({ to, message }) {
  if (!isEnabled()) {
    return { skipped: true, reason: 'WHATSAPP_ENABLED is false' };
  }

  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();

  if (provider === 'twilio') {
    await sendViaTwilio(to, message);
    return { provider, sent: true };
  }

  if (provider === 'greenapi') {
    await sendViaGreenApi(to, message);
    return { provider, sent: true };
  }

  if (provider === 'meta') {
    await sendViaMeta(to, message);
    return { provider, sent: true };
  }

  throw new Error(`Unsupported WA provider: ${provider}`);
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Wedding RSVP API',
    provider: process.env.WHATSAPP_PROVIDER || 'not-configured',
    enabled: isEnabled()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.use('/sections', express.static(path.join(root, 'sections')));

app.post('/api/rsvp', async (req, res) => {
  try {
    const payload = req.body || {};
    const guestName = payload.guestName || 'Guest';
    const guestContact = payload.guestContact || '';
    const organizerNumber = process.env.ORGANIZER_WHATSAPP_NUMBER || '919686538203';

    const guestMessage = payload.guestMessage || `Thank you, ${guestName}! Your RSVP has been successfully received.`;
    const organizerMessage = payload.organizerMessage || `New RSVP received from ${guestName}.`;

    const results = [];

    if (guestContact) {
      results.push({
        type: 'guest',
        to: guestContact,
        ...(await sendWhatsAppMessage({ to: guestContact, message: guestMessage }))
      });
    }

    results.push({
      type: 'organizer',
      to: organizerNumber,
      ...(await sendWhatsAppMessage({ to: organizerNumber, message: organizerMessage }))
    });

    res.json({ ok: true, results });
  } catch (error) {
    console.error('RSVP webhook failed:', error.message);
    res.status(500).json({
      ok: false,
      message: 'RSVP saved locally but the WhatsApp API failed.',
      error: error.message
    });
  }
});

app.post('/api/whatsapp/test', async (req, res) => {
  try {
    const { to, message } = req.body || {};
    if (!to || !message) {
      return res.status(400).json({ ok: false, message: 'to and message are required.' });
    }

    const result = await sendWhatsAppMessage({ to, message });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Wedding RSVP API is running at http://localhost:${port}`);
});
=======
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = Number(process.env.PORT || 3001);
const root = __dirname;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function normalizePhone(number) {
  if (!number) return '';
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  return digits;
}

function isEnabled() {
  return String(process.env.WHATSAPP_ENABLED || 'false').toLowerCase() === 'true';
}

async function sendViaTwilio(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio WhatsApp credentials are missing.');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:${normalizePhone(to)}`,
    Body: message
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  await axios.post(url, params.toString(), {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

async function sendViaGreenApi(to, message) {
  const instanceId = process.env.GREENAPI_INSTANCE_ID;
  const apiToken = process.env.GREENAPI_API_TOKEN;

  if (!instanceId || !apiToken) {
    throw new Error('Green API credentials are missing.');
  }

  const cleanNumber = normalizePhone(to);
  const url = `https://gate.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`;

  await axios.post(url, {
    chatId: `${cleanNumber}@c.us`,
    message: message
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sendViaMeta(to, message) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('Meta WhatsApp credentials are missing.');
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'text',
    text: {
      body: message
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

async function sendWhatsAppMessage({ to, message }) {
  if (!isEnabled()) {
    return { skipped: true, reason: 'WHATSAPP_ENABLED is false' };
  }

  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();

  if (provider === 'twilio') {
    await sendViaTwilio(to, message);
    return { provider, sent: true };
  }

  if (provider === 'greenapi') {
    await sendViaGreenApi(to, message);
    return { provider, sent: true };
  }

  if (provider === 'meta') {
    await sendViaMeta(to, message);
    return { provider, sent: true };
  }

  throw new Error(`Unsupported WA provider: ${provider}`);
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Wedding RSVP API',
    provider: process.env.WHATSAPP_PROVIDER || 'not-configured',
    enabled: isEnabled()
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.use('/sections', express.static(path.join(root, 'sections')));

app.post('/api/rsvp', async (req, res) => {
  try {
    const payload = req.body || {};
    const guestName = payload.guestName || 'Guest';
    const guestContact = payload.guestContact || '';
    const organizerNumber = process.env.ORGANIZER_WHATSAPP_NUMBER || '919686538203';

    const guestMessage = payload.guestMessage || `Thank you, ${guestName}! Your RSVP has been successfully received.`;
    const organizerMessage = payload.organizerMessage || `New RSVP received from ${guestName}.`;

    const results = [];

    if (guestContact) {
      results.push({
        type: 'guest',
        to: guestContact,
        ...(await sendWhatsAppMessage({ to: guestContact, message: guestMessage }))
      });
    }

    results.push({
      type: 'organizer',
      to: organizerNumber,
      ...(await sendWhatsAppMessage({ to: organizerNumber, message: organizerMessage }))
    });

    res.json({ ok: true, results });
  } catch (error) {
    console.error('RSVP webhook failed:', error.message);
    res.status(500).json({
      ok: false,
      message: 'RSVP saved locally but the WhatsApp API failed.',
      error: error.message
    });
  }
});

app.post('/api/whatsapp/test', async (req, res) => {
  try {
    const { to, message } = req.body || {};
    if (!to || !message) {
      return res.status(400).json({ ok: false, message: 'to and message are required.' });
    }

    const result = await sendWhatsAppMessage({ to, message });
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Wedding RSVP API is running at http://localhost:${port}`);
});
>>>>>>> ca58e7462bdd81a2cb337fc5c2c7d5a7c400a674
