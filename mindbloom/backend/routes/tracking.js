const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Log sleep
router.post('/sleep', async (req, res) => {
  const { userId, hours, quality, notes, date } = req.body;
  if (!userId || !hours) return res.status(400).json({ error: 'userId and hours required' });

  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert({
      user_id: userId,
      hours: parseFloat(hours),
      quality: quality || 3,
      notes: notes || '',
      date: date || new Date().toISOString().split('T')[0]
    }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// Log mood
router.post('/mood', async (req, res) => {
  const { userId, score, emotion, note, date } = req.body;
  if (!userId || !score) return res.status(400).json({ error: 'userId and score required' });

  const { data, error } = await supabase
    .from('mood_logs')
    .upsert({
      user_id: userId,
      score: parseInt(score),
      emotion: emotion || '',
      note: note || '',
      date: date || new Date().toISOString().split('T')[0]
    }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// Get last 7 days of data
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fromDate = sevenDaysAgo.toISOString().split('T')[0];

  const [sleepRes, moodRes] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('date', fromDate).order('date'),
    supabase.from('mood_logs').select('*').eq('user_id', userId).gte('date', fromDate).order('date')
  ]);

  res.json({
    sleep: sleepRes.data || [],
    mood: moodRes.data || [],
  });
});

// Get today's logs
router.get('/today/:userId', async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  const [sleepRes, moodRes] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', userId).eq('date', today).single(),
    supabase.from('mood_logs').select('*').eq('user_id', userId).eq('date', today).single()
  ]);

  res.json({
    sleep: sleepRes.data || null,
    mood: moodRes.data || null
  });
});

module.exports = router;
