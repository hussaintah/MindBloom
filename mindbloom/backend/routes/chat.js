const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Bloom, a warm, empathetic mental health companion inside the MindBloom app. You support users with their emotional wellbeing, stress, sleep, and happiness.

Guidelines:
- Be compassionate, non-judgmental, and encouraging
- Keep responses concise (2-4 sentences unless the user needs more)
- Ask one thoughtful follow-up question to keep the conversation going
- For serious mental health concerns (suicide, self-harm), gently encourage professional help and provide hotline info: National Crisis Line: 988
- Draw on CBT and mindfulness principles naturally without being clinical
- Celebrate small wins enthusiastically
- If a user mentions poor sleep or stress, offer a specific, actionable tip
- Never diagnose or prescribe anything

You are part of a wellness app that tracks mood, sleep, and provides breathing exercises.`;

router.post('/', async (req, res) => {
  const { messages, userId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  // Keep last 10 messages for context
  const recentMessages = messages.slice(-10);

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages
      ],
      max_tokens: 400,
      temperature: 0.75,
      stream: true
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullContent = '';
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Groq error:', error);
    res.status(500).json({ error: 'Chat service unavailable' });
  }
});

module.exports = router;
