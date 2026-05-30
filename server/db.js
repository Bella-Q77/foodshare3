const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    gender TEXT DEFAULT 'male',
    age INTEGER DEFAULT 25,
    height INTEGER DEFAULT 170,
    education TEXT DEFAULT 'bachelor',
    occupation TEXT DEFAULT 'it',
    occupation_label TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS merchants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    restaurant_id INTEGER,
    avatar TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    rating REAL DEFAULT 4.5,
    address TEXT DEFAULT '',
    distance REAL DEFAULT 1.0,
    emoji TEXT DEFAULT '',
    image TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    items TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );

  CREATE TABLE IF NOT EXISTS invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    pay_type TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    message TEXT DEFAULT '',
    req_gender TEXT DEFAULT 'all',
    req_age_min INTEGER DEFAULT 18,
    req_age_max INTEGER DEFAULT 60,
    req_education TEXT DEFAULT 'all',
    req_height_min INTEGER DEFAULT 140,
    req_height_max INTEGER DEFAULT 210,
    req_occupation TEXT DEFAULT 'all',
    status TEXT DEFAULT 'waiting',
    grabbed_by INTEGER,
    distance REAL DEFAULT 1.0,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    package_rating INTEGER NOT NULL,
    package_comment TEXT DEFAULT '',
    partner_user_id INTEGER,
    partner_rating INTEGER DEFAULT 5,
    partner_comment TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  );
`);

function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  if (userCount > 0) return;

  const insertUser = db.prepare(`INSERT INTO users (id, name, phone, gender, age, height, education, occupation, occupation_label, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertMerchant = db.prepare(`INSERT INTO merchants (id, name, phone, restaurant_id, avatar) VALUES (?, ?, ?, ?, ?)`);
  const insertRestaurant = db.prepare(`INSERT INTO restaurants (id, name, category, rating, address, distance, emoji) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertPackage = db.prepare(`INSERT INTO packages (id, restaurant_id, name, price, items, active) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertInvite = db.prepare(`INSERT INTO invites (id, user_id, restaurant_id, package_id, pay_type, date, time, message, req_gender, req_age_min, req_age_max, req_education, req_height_min, req_height_max, req_occupation, status, distance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertReview = db.prepare(`INSERT INTO reviews (id, user_id, restaurant_id, package_id, package_rating, package_comment, partner_user_id, partner_rating, partner_comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const seed = db.transaction(() => {
    insertUser.run(1, '小美', '13800001234', 'female', 26, 165, 'bachelor', 'it', '互联网产品经理', '');
    insertUser.run(2, '大明', '13900005678', 'male', 28, 178, 'master', 'finance', '金融分析师', '');
    insertUser.run(3, '小雨', '13600009012', 'female', 24, 162, 'bachelor', 'art', '自媒体博主', '');

    insertMerchant.run(1, '张老板', '13100008888', 1, '');
    insertMerchant.run(2, '李经理', '13200006666', 2, '');

    insertRestaurant.run(1, '花开半夏·中式餐厅', 'chinese', 4.8, '朝阳区三里屯太古里北区B1', 0.8, '🏮');
    insertRestaurant.run(2, 'La Maison 法式餐厅', 'western', 4.9, '朝阳区国贸CBD万达广场3F', 1.2, '🍷');
    insertRestaurant.run(3, '和风物语·日式料理', 'japanese', 4.7, '海淀区中关村大街银科大厦1F', 2.5, '🍣');
    insertRestaurant.run(4, '韩屋村·正宗韩式料理', 'korean', 4.6, '朝阳区望京SOHO T1', 3.1, '🍖');
    insertRestaurant.run(5, '蜀九香·火锅', 'hotpot', 4.5, '东城区簋街28号', 1.8, '🍲');
    insertRestaurant.run(6, '意·鲜生 西餐厅', 'western', 4.4, '朝阳区蓝色港湾B区', 2.0, '🍝');

    insertPackage.run(101, 1, '浪漫双人烛光套餐', 388, '前菜×2、松茸汤、黑椒牛排、红酒焗鲈鱼、甜品×2、饮品×2', 1);
    insertPackage.run(102, 1, '精致双人品鉴套餐', 268, '凉菜拼盘、蟹粉狮子头、清蒸桂鱼、时蔬×2、米饭×2、果盘', 1);
    insertPackage.run(201, 2, '法式浪漫双人晚餐', 598, '鹅肝酱、法式洋葱汤×2、菲力牛排、香煎鸭胸、提拉米苏×2、红酒一杯×2', 1);
    insertPackage.run(202, 2, '轻食双人午餐套餐', 328, '凯撒沙拉×2、奶油蘑菇汤×2、意面/披萨二选一×2、甜品×2', 1);
    insertPackage.run(301, 3, '特选双人刺身套餐', 458, '三文鱼刺身、金枪鱼大腹、甜虾、海胆、寿司拼盘、味增汤×2、抹茶冰淇淋×2', 1);
    insertPackage.run(302, 3, '和风双人定食', 238, '天妇罗拼盘、照烧鸡腿、鳗鱼饭×2、茶碗蒸×2、味增汤×2', 1);
    insertPackage.run(401, 4, '韩式烤肉双人套餐', 298, '特选牛五花、猪梅花、鸡腿肉、蔬菜拼盘、石锅拌饭×2、大酱汤×2、小菜6种', 1);
    insertPackage.run(402, 4, '部队锅双人套餐', 198, '部队锅(大)、炒年糕、紫菜包饭×2、炸鸡×1、可乐×2', 1);
    insertPackage.run(501, 5, '鸳鸯锅双人套餐', 258, '鸳鸯锅底、肥牛卷、虾滑、毛肚、鸭血、蔬菜拼盘、主食×2、饮品×2', 1);
    insertPackage.run(502, 5, '麻辣双人欢聚套餐', 188, '红油锅底、牛百叶、羊肉卷、午餐肉、豆腐、蔬菜×3、冰粉×2', 1);
    insertPackage.run(601, 6, '意式双人浪漫套餐', 368, '布鲁斯塔×2、南瓜浓汤×2、黑松露意面、海鲜披萨、提拉米苏×2', 1);
    insertPackage.run(602, 6, '轻奢双人下午茶', 168, '三明治×2、司康×2、马卡龙×4、水果塔×2、饮品×2', 1);

    insertInvite.run(1, 2, 1, 101, 'treat', '2026-05-26', '19:00', '想找个聊得来的小姐姐一起吃顿好的，聊聊人生~', 'female', 22, 30, 'bachelor', 155, 175, 'all', 'waiting', 0.8, '2026-05-25 14:30');
    insertInvite.run(2, 1, 3, 301, 'aa', '2026-05-26', '18:30', '日料爱好者找饭搭子！AA无压力，开心最重要', 'male', 25, 35, 'college', 170, 190, 'all', 'waiting', 2.5, '2026-05-25 15:00');
    insertInvite.run(3, 3, 5, 501, 'betreated', '2026-05-27', '19:30', '天冷了想吃火锅，有没有大方的哥哥请客呀~', 'male', 25, 38, 'bachelor', 172, 195, 'all', 'waiting', 1.8, '2026-05-25 16:20');
    insertInvite.run(4, 2, 2, 201, 'treat', '2026-05-28', '19:00', '周末法餐，寻找优雅知性的你', 'female', 23, 32, 'bachelor', 158, 175, 'all', 'waiting', 1.2, '2026-05-25 10:00');
    insertInvite.run(5, 1, 4, 401, 'aa', '2026-05-26', '20:00', '烤肉配啤酒！轻松愉快交个朋友', 'all', 22, 35, 'all', 140, 210, 'all', 'waiting', 3.1, '2026-05-25 12:45');

    insertReview.run(1, 1, 1, 101, 5, '烛光套餐非常浪漫，牛排火候完美！', 2, 5, '大明很绅士，聊天很愉快~', '2026-05-24 21:30');
    insertReview.run(2, 2, 1, 101, 4, '套餐分量很足，环境也好，就是等位久了点', 1, 5, '小美很有趣，很开心的一次用餐', '2026-05-24 21:35');
  });

  seed();
}

seedDatabase();

module.exports = db;
