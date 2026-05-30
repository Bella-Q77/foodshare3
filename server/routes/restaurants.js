const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../auth');

router.get('/', (req, res) => {
  const restaurants = db.prepare('SELECT * FROM restaurants').all();
  const result = restaurants.map(r => {
    const packages = db.prepare('SELECT * FROM packages WHERE restaurant_id = ?').all(r.id);
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      rating: r.rating,
      address: r.address,
      distance: r.distance,
      emoji: r.emoji,
      image: r.image,
      packages: packages.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        items: p.items,
        active: !!p.active
      }))
    };
  });
  res.json(result);
});

router.get('/:id/packages', (req, res) => {
  const packages = db.prepare('SELECT * FROM packages WHERE restaurant_id = ?').all(req.params.id);
  res.json(packages.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    items: p.items,
    active: !!p.active
  })));
});

router.post('/packages', authMiddleware, (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ error: '仅商家可操作' });
  const { restaurantId, name, price, items } = req.body;
  if (!name || !price) return res.status(400).json({ error: '套餐名称和价格必填' });

  const result = db.prepare('INSERT INTO packages (restaurant_id, name, price, items, active) VALUES (?, ?, ?, ?, 1)')
    .run(restaurantId, name, price, items || '');
  const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid);
  res.json({ id: pkg.id, name: pkg.name, price: pkg.price, items: pkg.items, active: true });
});

router.put('/packages/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ error: '仅商家可操作' });
  const { name, price, items, active } = req.body;
  const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
  if (!pkg) return res.status(404).json({ error: '套餐不存在' });

  db.prepare('UPDATE packages SET name = ?, price = ?, items = ?, active = ? WHERE id = ?')
    .run(name ?? pkg.name, price ?? pkg.price, items ?? pkg.items, active !== undefined ? (active ? 1 : 0) : pkg.active, req.params.id);

  const updated = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
  res.json({ id: updated.id, name: updated.name, price: updated.price, items: updated.items, active: !!updated.active });
});

module.exports = router;
