const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../auth');

router.get('/', authMiddleware, (req, res) => {
  const bookmarks = db.prepare('SELECT invite_id FROM bookmarks WHERE user_id = ?').all(req.user.id);
  res.json(bookmarks.map(b => b.invite_id));
});

router.post('/:inviteId', authMiddleware, (req, res) => {
  const inviteId = parseInt(req.params.inviteId);
  try {
    db.prepare('INSERT INTO bookmarks (user_id, invite_id) VALUES (?, ?)').run(req.user.id, inviteId);
    res.json({ success: true, bookmarked: true });
  } catch (e) {
    res.json({ success: true, bookmarked: true });
  }
});

router.delete('/:inviteId', authMiddleware, (req, res) => {
  const inviteId = parseInt(req.params.inviteId);
  db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND invite_id = ?').run(req.user.id, inviteId);
  res.json({ success: true, bookmarked: false });
});

module.exports = router;
