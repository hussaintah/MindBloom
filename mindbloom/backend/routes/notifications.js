const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'MindBloom <onboarding@resend.dev>';

router.post('/subscribe', async (req, res) => {
  const { userId, email, sleepReminder, morningCheckin, timezone } = req.body;
  if (!userId || !email) return res.status(400).json({ error: 'userId and email required' });
  const { error } = await supabase.from('notification_prefs').upsert({
    user_id: userId, email,
    sleep_reminder: sleepReminder !== false,
    morning_checkin: morningCheckin !== false,
    timezone: timezone || 'UTC'
  }, { onConflict: 'user_id' });
  if (error) return res.status(500).json({ error: error.message });
  await resend.emails.send({ from: FROM_EMAIL, to: email, subject: '🌸 Welcome to MindBloom — Your Wellness Journey Starts Now', html: getWelcomeEmail() });
  res.json({ success: true, message: 'Subscribed to reminders!' });
});

router.post('/test', async (req, res) => {
  const { email, type } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const html = type === 'morning' ? getMorningEmail() : getSleepReminderEmail();
  const subject = type === 'morning' ? '🌅 Good morning! Time for your daily check-in' : '🌙 Time to wind down — sleep reminder';
  const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, id: data?.id });
});

async function sendDailyReminders(type) {
  try {
    const column = type === 'sleep' ? 'sleep_reminder' : 'morning_checkin';
    const { data: users, error } = await supabase.from('notification_prefs').select('email').eq(column, true);
    if (error || !users) return;
    const subject = type === 'morning' ? '🌅 Good morning! Time for your daily check-in' : '🌙 Time to wind down — sleep reminder';
    const html = type === 'morning' ? getMorningEmail() : getSleepReminderEmail();
    for (let i = 0; i < users.length; i += 50) {
      const batch = users.slice(i, i + 50);
      await Promise.allSettled(batch.map(u => resend.emails.send({ from: FROM_EMAIL, to: u.email, subject, html })));
    }
    console.log(`Sent ${users.length} ${type} reminders`);
  } catch (err) {
    console.error('Error sending reminders:', err);
  }
}

function getFooter() {
  const logoUrl = `${process.env.FRONTEND_URL || 'https://mindbloom.app'}/logo.jpeg`;
  return `
  <div style="margin-top:32px; padding-top:20px; border-top:2px solid #e0ede6; text-align:center; font-family:Georgia,serif;">
    <img src="${logoUrl}" alt="Amity University - Centre for Science of Happiness"
      style="height:36px; width:auto; margin:0 auto 12px; display:block;" />
    <p style="color:#4a7c59; font-size:15px; font-weight:bold; margin:0 0 4px;">
      Working for your well-being
    </p>
    <p style="color:#5a7a6a; font-size:13px; margin:0 0 4px;">
      Made by <strong>Centre of Happiness</strong>, Amity University,<br>Noida, Uttar Pradesh, India
    </p>
    <p style="color:#8aaa9a; font-size:12px; margin:0 0 4px;">
      📧
      <a href="mailto:happiness@amity.edu" style="color:#4a7c59; text-decoration:none;">happiness@amity.edu</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:happyness.amity@gmail.com" style="color:#4a7c59; text-decoration:none;">happyness.amity@gmail.com</a>
    </p>
    <p style="color:#8aaa9a; font-size:12px; margin:0;">
      📞 <a href="tel:+918447968032" style="color:#4a7c59; text-decoration:none;">+91 8447968032</a>
    </p>
  </div>`;
}

function getWelcomeEmail() {
  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; background:#fdf8f3; padding:40px; border-radius:16px;">
    <h1 style="color:#2d5a45; font-size:28px; margin-bottom:8px;">Welcome to MindBloom 🌸</h1>
    <p style="color:#5a7a6a; font-size:16px; line-height:1.6;">You've taken the first step toward a healthier, happier you. MindBloom is here to help you track your sleep, understand your mood, and build daily habits that actually stick.</p>
    <div style="background:#e8f5ee; border-radius:12px; padding:20px; margin:24px 0;">
      <p style="color:#2d5a45; font-weight:bold; margin:0 0 8px;">Here's what you can do:</p>
      <ul style="color:#4a6a5a; line-height:2; padding-left:20px; margin:0;">
        <li>Log your sleep every night</li>
        <li>Check in with your mood daily</li>
        <li>Chat with Bloom, your AI companion</li>
        <li>Try guided breathing exercises</li>
      </ul>
    </div>
    <p style="color:#8aaa9a; font-size:14px;">You'll receive gentle reminders to help you stay consistent. You can manage these in your settings anytime.</p>
    <p style="color:#2d5a45; font-size:16px; margin-top:24px;">With care,<br><strong>The MindBloom Team 🌿</strong></p>
    ${getFooter()}
  </div>`;
}

function getSleepReminderEmail() {
  const tips = [
    "Try putting your phone away 30 minutes before bed.",
    "A short 5-minute breathing exercise can help you fall asleep faster.",
    "Keep your room cool — 65-68°F (18-20°C) is ideal for sleep.",
    "Write down one thing you're grateful for before closing your eyes."
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; background:#1a1a2e; padding:40px; border-radius:16px; color:#e8e0f0;">
    <h1 style="color:#a78bfa; font-size:26px;">🌙 Time to wind down</h1>
    <p style="color:#c4b5f5; line-height:1.7;">Your body is ready for rest. A consistent sleep routine is one of the most powerful things you can do for your mental health.</p>
    <div style="background:#2d2b55; border-radius:12px; padding:20px; margin:24px 0; border-left:4px solid #a78bfa;">
      <p style="color:#e8e0f0; margin:0;"><strong>Tonight's tip:</strong> ${tip}</p>
    </div>
    <p style="color:#9ca3af; font-size:14px;">Don't forget to log your sleep in MindBloom tomorrow morning. Sweet dreams! 🌟</p>
    ${getFooter()}
  </div>`;
}

function getMorningEmail() {
  const affirmations = [
    "Today is full of possibility. You've got this.",
    "Every morning is a fresh start. Make it count.",
    "Small steps every day lead to big changes.",
    "You are doing better than you think. Keep going."
  ];
  const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  return `
  <div style="font-family:Georgia,serif; max-width:560px; margin:0 auto; background:#fffbf0; padding:40px; border-radius:16px;">
    <h1 style="color:#d97706; font-size:26px;">🌅 Good morning!</h1>
    <p style="color:#92400e; font-size:18px; font-style:italic; margin:16px 0;">"${affirmation}"</p>
    <p style="color:#78716c; line-height:1.7;">Take 2 minutes to check in with yourself today. How did you sleep? How are you feeling? Your daily log helps you see patterns and feel more in control.</p>
    <div style="background:#fef3c7; border-radius:12px; padding:16px; margin:20px 0;">
      <p style="color:#92400e; margin:0;">☀️ Open MindBloom to log your morning check-in and start your day with intention.</p>
    </div>
    ${getFooter()}
  </div>`;
}

module.exports = router;
module.exports.sendDailyReminders = sendDailyReminders;
