const MOCK_DATA = {
    users: [
        {
            id: 1,
            name: '小美',
            gender: 'female',
            age: 26,
            height: 165,
            education: 'bachelor',
            occupation: 'it',
            occupationLabel: '互联网产品经理',
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFB6C1'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👩%3C/text%3E%3C/svg%3E",
            phone: '138****1234'
        },
        {
            id: 2,
            name: '大明',
            gender: 'male',
            age: 28,
            height: 178,
            education: 'master',
            occupation: 'finance',
            occupationLabel: '金融分析师',
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2387CEEB'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👨%3C/text%3E%3C/svg%3E",
            phone: '139****5678'
        },
        {
            id: 3,
            name: '小雨',
            gender: 'female',
            age: 24,
            height: 162,
            education: 'bachelor',
            occupation: 'art',
            occupationLabel: '自媒体博主',
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2398FB98'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👩%3C/text%3E%3C/svg%3E",
            phone: '136****9012'
        }
    ],

    merchants: [
        {
            id: 1,
            name: '张老板',
            phone: '131****8888',
            restaurantId: 1,
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFA500'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👨‍🍳%3C/text%3E%3C/svg%3E"
        },
        {
            id: 2,
            name: '李经理',
            phone: '132****6666',
            restaurantId: 2,
            avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23DDA0DD'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👩‍🍳%3C/text%3E%3C/svg%3E"
        }
    ],

    restaurants: [
        {
            id: 1,
            name: '花开半夏·中式餐厅',
            category: 'chinese',
            rating: 4.8,
            address: '朝阳区三里屯太古里北区B1',
            distance: 0.8,
            emoji: '🏮',
            image: '',
            packages: [
                { id: 101, name: '浪漫双人烛光套餐', price: 388, items: '前菜×2、松茸汤、黑椒牛排、红酒焗鲈鱼、甜品×2、饮品×2', active: true },
                { id: 102, name: '精致双人品鉴套餐', price: 268, items: '凉菜拼盘、蟹粉狮子头、清蒸桂鱼、时蔬×2、米饭×2、果盘', active: true }
            ]
        },
        {
            id: 2,
            name: 'La Maison 法式餐厅',
            category: 'western',
            rating: 4.9,
            address: '朝阳区国贸CBD万达广场3F',
            distance: 1.2,
            emoji: '🍷',
            image: '',
            packages: [
                { id: 201, name: '法式浪漫双人晚餐', price: 598, items: '鹅肝酱、法式洋葱汤×2、菲力牛排、香煎鸭胸、提拉米苏×2、红酒一杯×2', active: true },
                { id: 202, name: '轻食双人午餐套餐', price: 328, items: '凯撒沙拉×2、奶油蘑菇汤×2、意面/披萨二选一×2、甜品×2', active: true }
            ]
        },
        {
            id: 3,
            name: '和风物语·日式料理',
            category: 'japanese',
            rating: 4.7,
            address: '海淀区中关村大街银科大厦1F',
            distance: 2.5,
            emoji: '🍣',
            image: '',
            packages: [
                { id: 301, name: '特选双人刺身套餐', price: 458, items: '三文鱼刺身、金枪鱼大腹、甜虾、海胆、寿司拼盘、味增汤×2、抹茶冰淇淋×2', active: true },
                { id: 302, name: '和风双人定食', price: 238, items: '天妇罗拼盘、照烧鸡腿、鳗鱼饭×2、茶碗蒸×2、味增汤×2', active: true }
            ]
        },
        {
            id: 4,
            name: '韩屋村·正宗韩式料理',
            category: 'korean',
            rating: 4.6,
            address: '朝阳区望京SOHO T1',
            distance: 3.1,
            emoji: '🍖',
            image: '',
            packages: [
                { id: 401, name: '韩式烤肉双人套餐', price: 298, items: '特选牛五花、猪梅花、鸡腿肉、蔬菜拼盘、石锅拌饭×2、大酱汤×2、小菜6种', active: true },
                { id: 402, name: '部队锅双人套餐', price: 198, items: '部队锅(大)、炒年糕、紫菜包饭×2、炸鸡×1、可乐×2', active: true }
            ]
        },
        {
            id: 5,
            name: '蜀九香·火锅',
            category: 'hotpot',
            rating: 4.5,
            address: '东城区簋街28号',
            distance: 1.8,
            emoji: '🍲',
            image: '',
            packages: [
                { id: 501, name: '鸳鸯锅双人套餐', price: 258, items: '鸳鸯锅底、肥牛卷、虾滑、毛肚、鸭血、蔬菜拼盘、主食×2、饮品×2', active: true },
                { id: 502, name: '麻辣双人欢聚套餐', price: 188, items: '红油锅底、牛百叶、羊肉卷、午餐肉、豆腐、蔬菜×3、冰粉×2', active: true }
            ]
        },
        {
            id: 6,
            name: '意·鲜生 西餐厅',
            category: 'western',
            rating: 4.4,
            address: '朝阳区蓝色港湾B区',
            distance: 2.0,
            emoji: '🍝',
            image: '',
            packages: [
                { id: 601, name: '意式双人浪漫套餐', price: 368, items: '布鲁斯塔×2、南瓜浓汤×2、黑松露意面、海鲜披萨、提拉米苏×2', active: true },
                { id: 602, name: '轻奢双人下午茶', price: 168, items: '三明治×2、司康×2、马卡龙×4、水果塔×2、饮品×2', active: true }
            ]
        }
    ],

    invites: [
        {
            id: 1,
            userId: 2,
            restaurantId: 1,
            packageId: 101,
            payType: 'treat',
            date: '2026-05-26',
            time: '19:00',
            message: '想找个聊得来的小姐姐一起吃顿好的，聊聊人生~',
            requirements: { gender: 'female', ageMin: 22, ageMax: 30, education: 'bachelor', heightMin: 155, heightMax: 175, occupation: 'all' },
            status: 'waiting',
            createdAt: '2026-05-25 14:30',
            distance: 0.8
        },
        {
            id: 2,
            userId: 1,
            restaurantId: 3,
            packageId: 301,
            payType: 'aa',
            date: '2026-05-26',
            time: '18:30',
            message: '日料爱好者找饭搭子！AA无压力，开心最重要',
            requirements: { gender: 'male', ageMin: 25, ageMax: 35, education: 'college', heightMin: 170, heightMax: 190, occupation: 'all' },
            status: 'waiting',
            createdAt: '2026-05-25 15:00',
            distance: 2.5
        },
        {
            id: 3,
            userId: 3,
            restaurantId: 5,
            packageId: 501,
            payType: 'betreated',
            date: '2026-05-27',
            time: '19:30',
            message: '天冷了想吃火锅，有没有大方的哥哥请客呀~',
            requirements: { gender: 'male', ageMin: 25, ageMax: 38, education: 'bachelor', heightMin: 172, heightMax: 195, occupation: 'all' },
            status: 'waiting',
            createdAt: '2026-05-25 16:20',
            distance: 1.8
        },
        {
            id: 4,
            userId: 2,
            restaurantId: 2,
            packageId: 201,
            payType: 'treat',
            date: '2026-05-28',
            time: '19:00',
            message: '周末法餐，寻找优雅知性的你',
            requirements: { gender: 'female', ageMin: 23, ageMax: 32, education: 'bachelor', heightMin: 158, heightMax: 175, occupation: 'all' },
            status: 'waiting',
            createdAt: '2026-05-25 10:00',
            distance: 1.2
        },
        {
            id: 5,
            userId: 1,
            restaurantId: 4,
            packageId: 401,
            payType: 'aa',
            date: '2026-05-26',
            time: '20:00',
            message: '烤肉配啤酒！轻松愉快交个朋友',
            requirements: { gender: 'all', ageMin: 22, ageMax: 35, education: 'all', heightMin: 140, heightMax: 210, occupation: 'all' },
            status: 'waiting',
            createdAt: '2026-05-25 12:45',
            distance: 3.1
        }
    ],

    reviews: [
        {
            id: 1,
            orderId: 0,
            userId: 1,
            restaurantId: 1,
            packageId: 101,
            packageRating: 5,
            packageComment: '烛光套餐非常浪漫，牛排火候完美！',
            partnerUserId: 2,
            partnerRating: 5,
            partnerComment: '大明很绅士，聊天很愉快~',
            createdAt: '2026-05-24 21:30'
        },
        {
            id: 2,
            userId: 2,
            restaurantId: 1,
            packageId: 101,
            packageRating: 4,
            packageComment: '套餐分量很足，环境也好，就是等位久了点',
            partnerUserId: 1,
            partnerRating: 5,
            partnerComment: '小美很有趣，很开心的一次用餐',
            createdAt: '2026-05-24 21:35'
        }
    ]
};

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
