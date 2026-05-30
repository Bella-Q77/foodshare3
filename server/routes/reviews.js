const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../auth');

router.get('/', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(reviews.map(r => ({
    id: r.id,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    packageId: r.package_id,
    packageRating: r.package_rating,
    packageComment: r.package_comment,
    partnerUserId: r.partner_user_id,
    partnerRating: r.partner_rating,
    partnerComment: r.partner_comment,
    createdAt: r.created_at
  })));
});

router.get('/merchant/:restaurantId', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC').all(req.params.restaurantId);
  res.json(reviews.map(r => ({
    id: r.id,
    userId: r.user_id,
    restaurantId: r.restaurant_id,
    packageId: r.package_id,
    packageRating: r.package_rating,
    packageComment: r.package_comment,
    partnerUserId: r.partner_user_id,
    partnerRating: r.partner_rating,
    partnerComment: r.partner_comment,
    createdAt: r.created_at
  })));
});

router.post('/', authMiddleware, (req, res) => {
  if (req.user.role !== 'user') return res.status(403).json({ error: '仅用户可提交评价' });
  const { restaurantId, packageId, packageRating, packageComment, partnerUserId, partnerRating, partnerComment } = req.body;

  if (!restaurantId || !packageId || !packageRating) {
    return res.status(400).json({ error: '参数缺失' });
  }

  const result = db.prepare(`INSERT INTO reviews (user_id, restaurant_id, package_id, package_rating, package_comment, partner_user_id, partner_rating, partner_comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user.id, restaurantId, packageId, packageRating, packageComment || '', partnerUserId || null, partnerRating || 5, partnerComment || '');

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.json({
    id: review.id,
    userId: review.user_id,
    restaurantId: review.restaurant_id,
    packageId: review.package_id,
    packageRating: review.package_rating,
    packageComment: review.package_comment,
    partnerUserId: review.partner_user_id,
    partnerRating: review.partner_rating,
    partnerComment: review.partner_comment,
    createdAt: review.created_at
  });
});

router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, gender, age, height, education, occupation, occupation_label, avatar FROM users').all();
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    gender: u.gender,
    age: u.age,
    height: u.height,
    education: u.education,
    occupation: u.occupation,
    occupationLabel: u.occupation_label,
    avatar: u.avatar
  })));
});

module.exports = router;
