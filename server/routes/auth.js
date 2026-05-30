const express = require('express');
const router = express.Router();
const db = require('../db');
const { signToken, authMiddleware } = require('../auth');

const VALID_CODE = '123456';

router.post('/user/login', (req, res) => {
  const { phone, code, name, gender, age, height, education, occupation, occupationLabel } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: '手机号和验证码不能为空' });
  }
  if (code !== VALID_CODE) {
    return res.status(400).json({ error: '验证码错误' });
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

  if (!user) {
    const stmt = db.prepare(`INSERT INTO users (name, phone, gender, age, height, education, occupation, occupation_label, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const result = stmt.run(
      name || '用户' + phone.slice(-4),
      phone,
      gender || 'male',
      age || 25,
      height || 170,
      education || 'bachelor',
      occupation || 'it',
      occupationLabel || '未填写',
      ''
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  const token = signToken({ id: user.id, role: 'user' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      age: user.age,
      height: user.height,
      education: user.education,
      occupation: user.occupation,
      occupationLabel: user.occupation_label,
      avatar: user.avatar,
      tasteTags: user.taste_tags || '',
      pricePref: user.price_pref || '',
      cuisinePref: user.cuisine_pref || '',
      diningStyle: user.dining_style || ''
    }
  });
});

router.post('/merchant/login', (req, res) => {
  const { phone, code, name } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: '手机号和验证码不能为空' });
  }
  if (code !== VALID_CODE) {
    return res.status(400).json({ error: '验证码错误' });
  }

  let merchant = db.prepare('SELECT * FROM merchants WHERE phone = ?').get(phone);

  if (!merchant) {
    const stmt = db.prepare(`INSERT INTO merchants (name, phone, restaurant_id, avatar) VALUES (?, ?, ?, ?)`);
    const result = stmt.run(name || '商家' + phone.slice(-4), phone, null, '');
    merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(result.lastInsertRowid);
  }

  const token = signToken({ id: merchant.id, role: 'merchant', restaurantId: merchant.restaurant_id });
  res.json({
    token,
    merchant: {
      id: merchant.id,
      name: merchant.name,
      phone: merchant.phone,
      restaurantId: merchant.restaurant_id,
      avatar: merchant.avatar
    }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  if (req.user.role === 'user') {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json({
      role: 'user',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        height: user.height,
        education: user.education,
        occupation: user.occupation,
        occupationLabel: user.occupation_label,
        avatar: user.avatar,
        tasteTags: user.taste_tags || '',
        pricePref: user.price_pref || '',
        cuisinePref: user.cuisine_pref || '',
        diningStyle: user.dining_style || ''
      }
    });
  } else if (req.user.role === 'merchant') {
    const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(req.user.id);
    if (!merchant) return res.status(404).json({ error: '商家不存在' });
    res.json({
      role: 'merchant',
      merchant: {
        id: merchant.id,
        name: merchant.name,
        phone: merchant.phone,
        restaurantId: merchant.restaurant_id,
        avatar: merchant.avatar
      }
    });
  }
});

module.exports = router;
