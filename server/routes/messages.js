const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../auth');

router.get('/conversations', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const conversations = db.prepare(`
    SELECT DISTINCT
      CASE WHEN from_user_id = ? THEN to_user_id ELSE from_user_id END as partner_id
    FROM messages
    WHERE from_user_id = ? OR to_user_id = ?
  `).all(userId, userId, userId);

  const result = conversations.map(c => {
    const partner = db.prepare('SELECT id, name, gender, age, occupation_label, avatar FROM users WHERE id = ?').get(c.partner_id);
    const lastMsg = db.prepare(`
      SELECT * FROM messages
      WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, c.partner_id, c.partner_id, userId);

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerGender: partner.gender,
      partnerAge: partner.age,
      partnerOccupation: partner.occupation_label,
      partnerAvatar: partner.avatar,
      lastMessage: lastMsg ? lastMsg.content : '',
      lastTime: lastMsg ? lastMsg.created_at : ''
    };
  });

  result.sort((a, b) => b.lastTime.localeCompare(a.lastTime));
  res.json(result);
});

router.get('/history/:partnerId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const partnerId = parseInt(req.params.partnerId);

  const messages = db.prepare(`
    SELECT * FROM messages
    WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)
    ORDER BY created_at ASC
  `).all(userId, partnerId, partnerId, userId);

  res.json(messages.map(m => ({
    id: m.id,
    fromUserId: m.from_user_id,
    toUserId: m.to_user_id,
    content: m.content,
    createdAt: m.created_at
  })));
});

router.post('/send', authMiddleware, (req, res) => {
  const { toUserId, content } = req.body;
  if (!toUserId || !content || !content.trim()) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  const result = db.prepare('INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)')
    .run(req.user.id, toUserId, content.trim());

  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.json({
    id: msg.id,
    fromUserId: msg.from_user_id,
    toUserId: msg.to_user_id,
    content: msg.content,
    createdAt: msg.created_at
  });
});

module.exports = router;
