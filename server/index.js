const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(express.static(path.join(__dirname, '..')));

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const inviteRoutes = require('./routes/invites');
const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`饭搭子服务已启动: http://localhost:${PORT}`);
});
