const express = require('express');
const router = express.Router();
const axios = require('axios');
const { isAuthenticated } = require('../middleware/Authentication');

const GEMINI_MODELS = [
  'gemini-3-flash-preview',       
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-preview'  
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const SYSTEM_PROMPT = `
You are Medicare AI, a helpful medical assistant.
You can give information about symptoms, medications, prevention, and precautions related to illnesses.
You can also recommend doctors from a list, based on their specialty.

Guidelines for Response:
* Use simple language.
* Always use bold for important terms like **Fever**, **Pain**, **Medications**, **Symptoms**, **Precautions**, **When to See a Doctor**, etc.
* Make all section headings and key medical terms bold.
* Use bullet points for lists.
* Give clear, short advice.
* Use quotes for specific instructions.
* Warn about serious problems (like **URGENT: SEE A DOCTOR NOW**).

Response Format:
**Condition:** [Illness Name]
**Symptoms:** * [list]
**Medications:** (if needed) * [list]
**Precautions:** * [list]
**Suggestions:** * [list]
**When to See a Doctor:** * [list]

Doctor type: [Specialty]

IMPORTANT: The "Doctor type:" line MUST be a plain line at the end, with NO bold markers (**), NO bullet points (*, -, •), and NO extra text. Just: Doctor type: SpecialistName

For a given disease, pick the single most appropriate doctor type from EXACTLY this list (copy the name exactly as shown):
General Physician, Cardiologist, Neurologist, Orthopedic, Pulmonologist, Gastroenterologist, Endocrinologist, Nephrologist, Oncologist, Dermatologist, Ophthalmologist, ENT, Rheumatologist, Hematologist, Urologist, Psychiatrist, Pediatrician, Gynecologist, Immunologist, Infectious Disease Specialist

If it's serious, say to see a doctor right away.
If the question is not about health, say: "Sorry it is irrelevant to my purpose. I can't help with that."
`;

router.post('/ai', isAuthenticated, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'AI service not configured. GEMINI_API_KEY missing.' });
    }

    const priorTurns = Array.isArray(history)
      ? history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }))
      : [];

    const body = {
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Understood. I am Medicare AI and will follow these guidelines.' }] },
        ...priorTurns,
        { role: 'user', parts: [{ text: message.trim() }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    let reply = null;
    let lastError = null;

    for (const model of GEMINI_MODELS) {
      try {
        const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        reply =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm not sure how to respond.";
        break; 
      } catch (modelErr) {
        lastError = modelErr;
        if (modelErr.response?.status !== 404 && modelErr.response?.status !== 400) {
          break;
        }
      }
    }

    if (reply === null) {
      const geminiMsg = lastError?.response?.data?.error?.message || lastError?.message || 'Unknown error';
      if (lastError?.response?.status === 429) {
        return res.status(429).json({ success: false, message: 'AI rate limit reached. Please try again in a moment.' });
      }
      return res.status(500).json({
        success: false,
        message: `AI error: ${geminiMsg}`,
      });
    }

    res.json({ success: true, reply });
  } catch (err) {
    const geminiMsg = err.response?.data?.error?.message || err.message;
    if (err.response?.status === 429) {
      return res.status(429).json({ success: false, message: 'AI service rate limit reached. Please try again later.' });
    }
    res.status(500).json({ success: false, message: `Failed to get AI response: ${geminiMsg}` });
  }
});

module.exports = router;
