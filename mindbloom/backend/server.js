require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const chatRoutes = require('./routes/chat');
const trackingRoutes = require('./routes/tracking');
const notificationRoutes = require('./routes/notifications');
const { sendDailyReminders } = require('./routes/notifications');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Cron: Daily sleep reminders at 10 PM
cron.schedule('0 22 * * *', async () => {
  console.log('Running nightly sleep reminder cron...');
  await sendDailyReminders('sleep');
}, { timezone: 'UTC' });

// Cron: Morning check-in at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running morning check-in cron...');
  await sendDailyReminders('morning');
}, { timezone: 'UTC' });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MindBloom backend running on port ${PORT}`));
