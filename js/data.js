const EDUCATION_MAP = {
    'all': '不限',
    'high-school': '高中及以上',
    'college': '大专及以上',
    'bachelor': '本科及以上',
    'master': '硕士及以上',
    'phd': '博士及以上'
};

const EDUCATION_LEVELS = ['all', 'high-school', 'college', 'bachelor', 'master', 'phd'];

const OCCUPATION_MAP = {
    'all': '不限',
    'it': '互联网/IT',
    'finance': '金融',
    'education': '教育',
    'medical': '医疗',
    'government': '公务员',
    'art': '文艺/传媒',
    'business': '商业/销售'
};

const PAY_TYPE_MAP = {
    'aa': { label: 'AA制', class: 'aa', icon: 'fas fa-handshake' },
    'treat': { label: '我请客', class: 'treat', icon: 'fas fa-gift' },
    'betreated': { label: '求请客', class: 'betreated', icon: 'fas fa-heart' }
};

const API_BASE = '';

async function api(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, { ...options, headers });
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        return null;
    }
    return res.json();
}
