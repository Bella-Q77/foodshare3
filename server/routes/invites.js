const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../auth');

router.get('/', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  const invites = db.prepare(`SELECT * FROM invites WHERE status = 'waiting' AND user_id != ?`).all(req.user.id);

  const result = invites.map(i => ({
    id: i.id,
    userId: i.user_id,
    restaurantId: i.restaurant_id,
    packageId: i.package_id,
    payType: i.pay_type,
    date: i.date,
    time: i.time,
    message: i.message,
    requirements: {
      gender: i.req_gender,
      ageMin: i.req_age_min,
      ageMax: i.req_age_max,
      education: i.req_education,
      heightMin: i.req_height_min,
      heightMax: i.req_height_max,
      occupation: i.req_occupation
    },
    status: i.status,
    grabbedBy: i.grabbed_by,
    distance: i.distance,
    createdAt: i.created_at
  }));

  res.json(result);
});

router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: '仅用户可发起邀约' });
  const { restaurantId, packageId, payType, date, time, message, requirements } = req.body;

  if (!restaurantId || !packageId || !date || !time) {
    return res.status(400).json({ error: '必填参数缺失' });
  }

  const distance = (Math.random() * 3 + 0.3).toFixed(1);
  const result = db.prepare(`INSERT INTO invites (user_id, restaurant_id, package_id, pay_type, date, time, message, req_gender, req_age_min, req_age_max, req_education, req_height_min, req_height_max, req_occupation, status, distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?)`)
    .run(
      req.user.id,
      restaurantId,
      packageId,
      payType || 'aa',
      date,
      time,
      message || '',
      requirements?.gender || 'all',
      requirements?.ageMin || 18,
      requirements?.ageMax || 60,
      requirements?.education || 'all',
      requirements?.heightMin || 140,
      requirements?.heightMax || 210,
      requirements?.occupation || 'all',
      parseFloat(distance)
    );

  const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(result.lastInsertRowid);
  res.json({
    id: invite.id,
    userId: invite.user_id,
    restaurantId: invite.restaurant_id,
    packageId: invite.package_id,
    payType: invite.pay_type,
    date: invite.date,
    time: invite.time,
    message: invite.message,
    requirements: {
      gender: invite.req_gender,
      ageMin: invite.req_age_min,
      ageMax: invite.req_age_max,
      education: invite.req_education,
      heightMin: invite.req_height_min,
      heightMax: invite.req_height_max,
      occupation: invite.req_occupation
    },
    status: invite.status,
    distance: invite.distance,
    createdAt: invite.created_at
  });
});

router.put('/:id/grab', authMiddleware, (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: '仅用户可抢单' });
  const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id);
  if (!invite) return res.status(404).json({ error: '邀约不存在' });
  if (invite.status !== 'waiting') return res.status(400).json({ error: '该邀约已被抢' });
  if (invite.user_id === req.user.id) return res.status(400).json({ error: '不能抢自己的单' });

  db.prepare(`UPDATE invites SET status = 'matched', grabbed_by = ? WHERE id = ?`).run(req.user.id, req.params.id);
  res.json({ success: true });
});

router.put('/:id/cancel', authMiddleware, (req, res) => {
  const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id);
  if (!invite) return res.status(404).json({ error: '邀约不存在' });
  if (invite.user_id !== req.user.id) return res.status(403).json({ error: '只能取消自己的邀约' });

  db.prepare('DELETE FROM invites WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/my/sent', authMiddleware, (req, res) => {
  const invites = db.prepare('SELECT * FROM invites WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(invites.map(i => ({
    id: i.id,
    userId: i.user_id,
    restaurantId: i.restaurant_id,
    packageId: i.package_id,
    payType: i.pay_type,
    date: i.date,
    time: i.time,
    message: i.message,
    requirements: {
      gender: i.req_gender,
      ageMin: i.req_age_min,
      ageMax: i.req_age_max,
      education: i.req_education,
      heightMin: i.req_height_min,
      heightMax: i.req_height_max,
      occupation: i.req_occupation
    },
    status: i.status,
    grabbedBy: i.grabbed_by,
    distance: i.distance,
    createdAt: i.created_at
  })));
});

router.get('/my/grabs', authMiddleware, (req, res) => {
  const invites = db.prepare('SELECT * FROM invites WHERE grabbed_by = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(invites.map(i => ({
    id: i.id,
    userId: i.user_id,
    restaurantId: i.restaurant_id,
    packageId: i.package_id,
    payType: i.pay_type,
    date: i.date,
    time: i.time,
    message: i.message,
    requirements: {
      gender: i.req_gender,
      ageMin: i.req_age_min,
      ageMax: i.req_age_max,
      education: i.req_education,
      heightMin: i.req_height_min,
      heightMax: i.req_height_max,
      occupation: i.req_occupation
    },
    status: i.status,
    grabbedBy: i.grabbed_by,
    distance: i.distance,
    createdAt: i.created_at
  })));
});

module.exports = router;
