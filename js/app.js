class FoodShareApp {
    constructor() {
        this.currentUser = null;
        this.currentMerchant = null;
        this.role = null;
        this.restaurants = [];
        this.users = [];
        this.invites = [];
        this.reviews = [];
        this.myInvites = [];
        this.myGrabs = [];
        this.bookmarks = [];
        this.conversations = [];
        this.currentChatPartner = null;
        this.currentGrabInvite = null;
        this.currentReviewOrder = null;
        this.editingPackageId = null;
        this.packageRating = 0;
        this.partnerRating = 0;
        this.ordersView = 'all';
        this._userAppInitialized = false;
        this._merchantAppInitialized = false;
        this.init();
    }

    async init() {
        this.bindRoleSelect();
        this.bindLoginModals();
        await this.tryAutoLogin();
    }

    async tryAutoLogin() {
        const token = localStorage.getItem('token');
        if (!token) return;

        const data = await api('/api/auth/me');
        if (!data) return;

        if (data.role === 'user') {
            this.currentUser = data.user;
            this.role = 'user';
            document.getElementById('roleSelectPage').style.display = 'none';
            document.getElementById('userApp').style.display = 'block';
            document.querySelector('.user-name').textContent = this.currentUser.name;
            this.setUserAvatar();
            await this.initUserApp();
        } else if (data.role === 'merchant') {
            this.currentMerchant = data.merchant;
            this.role = 'merchant';
            document.getElementById('roleSelectPage').style.display = 'none';
            document.getElementById('merchantApp').style.display = 'block';
            document.getElementById('merchantName').textContent = this.currentMerchant.name;
            this.setMerchantAvatar();
            await this.initMerchantApp();
        }
    }

    setUserAvatar() {
        const avatarEl = document.querySelector('#userApp .user-avatar');
        if (this.currentUser.avatar) {
            avatarEl.src = this.currentUser.avatar;
        } else {
            const emoji = this.currentUser.gender === 'female' ? '👩' : '👨';
            const color = this.currentUser.gender === 'female' ? '%23FFB6C1' : '%2387CEEB';
            avatarEl.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='${color}'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E${emoji}%3C/text%3E%3C/svg%3E`;
        }
    }

    setMerchantAvatar() {
        const avatarEl = document.getElementById('merchantAvatar');
        if (this.currentMerchant.avatar) {
            avatarEl.src = this.currentMerchant.avatar;
        } else {
            avatarEl.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFA500'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E👨‍🍳%3C/text%3E%3C/svg%3E";
        }
    }

    getUserAvatar(user) {
        if (user.avatar) return user.avatar;
        const emoji = user.gender === 'female' ? '👩' : '👨';
        const color = user.gender === 'female' ? '%23FFB6C1' : '%2387CEEB';
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='${color}'/%3E%3Ctext x='50' y='65' text-anchor='middle' font-size='40'%3E${emoji}%3C/text%3E%3C/svg%3E`;
    }

    // ======== Role Selection ========
    bindRoleSelect() {
        document.getElementById('selectMerchant').addEventListener('click', () => {
            this.showModal('merchantLoginModal');
        });
        document.getElementById('selectUser').addEventListener('click', () => {
            this.showModal('userLoginModal');
        });
    }

    bindLoginModals() {
        document.getElementById('closeMerchantLogin').addEventListener('click', () => this.hideModal('merchantLoginModal'));
        document.getElementById('closeUserLogin').addEventListener('click', () => this.hideModal('userLoginModal'));

        document.getElementById('doMerchantLogin').addEventListener('click', () => this.doMerchantLogin());
        document.getElementById('doLogin').addEventListener('click', () => this.doUserLogin());

        document.getElementById('merchantSendCode').addEventListener('click', () => {
            this.showToast('验证码已发送，验证码为：123456');
        });
        document.getElementById('sendCodeBtn').addEventListener('click', () => {
            this.showToast('验证码已发送，验证码为：123456');
        });

        document.querySelectorAll('[data-merchant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const mid = parseInt(btn.dataset.merchant);
                const phones = { 1: '13100008888', 2: '13200006666' };
                document.getElementById('merchantPhone').value = phones[mid] || '';
                document.getElementById('merchantCode').value = '123456';
                this.doMerchantLogin();
            });
        });

        document.querySelectorAll('[data-user]').forEach(btn => {
            btn.addEventListener('click', () => {
                const uid = parseInt(btn.dataset.user);
                const phones = { 1: '13800001234', 2: '13900005678', 3: '13600009012' };
                document.getElementById('loginPhone').value = phones[uid] || '';
                document.getElementById('loginCode').value = '123456';
                this.doUserLogin();
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modal.id);
            });
        });
    }

    async doMerchantLogin() {
        const phone = document.getElementById('merchantPhone').value.trim();
        const code = document.getElementById('merchantCode').value.trim();

        if (!phone) { this.showToast('请输入手机号'); return; }
        if (!code) { this.showToast('请输入验证码'); return; }

        const data = await api('/api/auth/merchant/login', {
            method: 'POST',
            body: JSON.stringify({ phone, code })
        });

        if (!data) { this.showToast('登录失败'); return; }
        if (data.error) { this.showToast(data.error); return; }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'merchant');
        this.currentMerchant = data.merchant;
        this.role = 'merchant';
        document.getElementById('roleSelectPage').style.display = 'none';
        document.getElementById('merchantApp').style.display = 'block';
        document.getElementById('merchantName').textContent = this.currentMerchant.name;
        this.setMerchantAvatar();
        this.hideModal('merchantLoginModal');
        await this.initMerchantApp();
        this.showToast(`欢迎回来，${this.currentMerchant.name}！`);
    }

    async doUserLogin() {
        const phone = document.getElementById('loginPhone').value.trim();
        const code = document.getElementById('loginCode').value.trim();

        if (!phone) { this.showToast('请输入手机号'); return; }
        if (!code) { this.showToast('请输入验证码'); return; }

        const data = await api('/api/auth/user/login', {
            method: 'POST',
            body: JSON.stringify({ phone, code })
        });

        if (!data) { this.showToast('登录失败'); return; }
        if (data.error) { this.showToast(data.error); return; }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'user');
        this.currentUser = data.user;
        this.role = 'user';
        document.getElementById('roleSelectPage').style.display = 'none';
        document.getElementById('userApp').style.display = 'block';
        document.querySelector('.user-name').textContent = this.currentUser.name;
        this.setUserAvatar();
        this.hideModal('userLoginModal');
        await this.initUserApp();
        this.showToast(`欢迎回来，${this.currentUser.name}！`);
    }

    // ======== User App Init ========
    async initUserApp() {
        if (!this._userAppInitialized) {
            this.bindNavigation();
            this.bindUserMenu();
            this.bindModals();
            this.bindInviteForm();
            this.bindFilters();
            this.bindTabs();
            this.bindReviewForm();
            this.bindOrdersViewTabs();
            this._userAppInitialized = true;
        }
        this.currentChatPartner = null;
        this.conversations = [];
        document.getElementById('chatMain').innerHTML = `
            <div class="chat-placeholder">
                <i class="fas fa-comments"></i>
                <p>选择一个对话开始聊天</p>
            </div>
        `;
        await this.loadData();
        await this.loadConversations();
        this.renderNearbyInvites();
        this.renderMapMarkers();
        this.renderRestaurants();
        this.renderOrders();
        this.renderMyOrders();
        this.renderReviews();
        this.renderConversations();
        this.setDefaultDate();
    }

    // ======== Merchant App Init ========
    async initMerchantApp() {
        if (!this._merchantAppInitialized) {
            this.bindMerchantNav();
            this.bindMerchantMenu();
            this.bindMerchantActions();
            this._merchantAppInitialized = true;
        }
        await this.loadRestaurants();
        await this.loadReviews();
        this.renderMerchantDashboard();
        this.renderMerchantPackages();
        this.renderMerchantReviews();
    }

    async loadData() {
        const [restaurants, invites, reviews, users, myInvites, myGrabs, bookmarks] = await Promise.all([
            api('/api/restaurants'),
            api('/api/invites'),
            api('/api/reviews'),
            api('/api/reviews/users'),
            api('/api/invites/my/sent'),
            api('/api/invites/my/grabs'),
            api('/api/bookmarks')
        ]);
        this.restaurants = restaurants || [];
        this.invites = invites || [];
        this.reviews = reviews || [];
        this.users = users || [];
        this.myInvites = myInvites || [];
        this.myGrabs = myGrabs || [];
        this.bookmarks = bookmarks || [];
    }

    async loadRestaurants() {
        this.restaurants = (await api('/api/restaurants')) || [];
    }

    async loadReviews() {
        this.reviews = (await api('/api/reviews')) || [];
        this.users = (await api('/api/reviews/users')) || [];
    }

    getUser(userId) {
        if (this.currentUser && this.currentUser.id === userId) return this.currentUser;
        return this.users.find(u => u.id === userId) || { name: '用户', gender: 'male', age: 0, occupationLabel: '' };
    }

    getRestaurant(id) {
        return this.restaurants.find(r => r.id === id) || { name: '餐厅', packages: [], emoji: '' };
    }

    getPackage(restaurantId, packageId) {
        const r = this.getRestaurant(restaurantId);
        return r.packages.find(p => p.id === packageId) || { name: '套餐', price: 0, items: '' };
    }

    // ======== Navigation ========
    bindNavigation() {
        document.querySelectorAll('#userApp .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        document.getElementById('createInviteBtn').addEventListener('click', () => {
            this.populateRestaurantSelect();
            this.showModal('inviteModal');
        });

        document.getElementById('grabOrderBtn').addEventListener('click', () => {
            this.navigateTo('orders');
        });
    }

    navigateTo(page) {
        document.querySelectorAll('#userApp .nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`#userApp [data-page="${page}"]`).classList.add('active');
        document.querySelectorAll('#userApp .page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');
        if (page === 'chat') this.loadConversations();
    }

    bindMerchantNav() {
        document.querySelectorAll('#merchantApp .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.mpage;
                document.querySelectorAll('#merchantApp .nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                document.querySelectorAll('#merchantApp .page').forEach(p => p.classList.remove('active'));
                document.getElementById(`page-${page}`).classList.add('active');
            });
        });
    }

    // ======== User Menu ========
    bindUserMenu() {
        const userMenu = document.getElementById('userMenu');
        const dropdown = document.getElementById('userDropdown');

        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    bindMerchantMenu() {
        const menu = document.getElementById('merchantMenu');
        const dropdown = document.getElementById('merchantDropdown');

        menu.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        document.getElementById('merchantLogoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.currentUser = null;
        this.currentMerchant = null;
        this.role = null;
        document.getElementById('userApp').style.display = 'none';
        document.getElementById('merchantApp').style.display = 'none';
        document.getElementById('roleSelectPage').style.display = 'flex';
        this.showToast('已退出登录');
    }

    // ======== Modals ========
    bindModals() {
        document.getElementById('closeInviteModal').addEventListener('click', () => this.hideModal('inviteModal'));
        document.getElementById('closeGrabModal').addEventListener('click', () => this.hideModal('grabModal'));
        document.getElementById('closePayModal').addEventListener('click', () => this.hideModal('payModal'));
        document.getElementById('successClose').addEventListener('click', () => this.hideModal('successModal'));
        document.getElementById('closeReviewModal').addEventListener('click', () => this.hideModal('reviewModal'));
    }

    showModal(id) {
        document.getElementById(id).classList.add('show');
    }

    hideModal(id) {
        document.getElementById(id).classList.remove('show');
    }

    // ======== Invite Form ========
    populateRestaurantSelect() {
        const restaurantSelect = document.getElementById('inviteRestaurant');
        restaurantSelect.innerHTML = '<option value="">请选择餐厅</option>';
        this.restaurants.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = `${r.emoji} ${r.name} (${r.distance}km)`;
            restaurantSelect.appendChild(opt);
        });
    }

    bindInviteForm() {
        const restaurantSelect = document.getElementById('inviteRestaurant');
        const packageSelect = document.getElementById('invitePackage');

        restaurantSelect.addEventListener('change', () => {
            const rid = parseInt(restaurantSelect.value);
            packageSelect.innerHTML = '<option value="">请选择套餐</option>';
            if (rid) {
                const restaurant = this.getRestaurant(rid);
                restaurant.packages.filter(p => p.active).forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = `${p.name} - ¥${p.price}`;
                    packageSelect.appendChild(opt);
                });
            }
            this.updatePackagePreview();
            this.updateTotalPrice();
        });

        packageSelect.addEventListener('change', () => {
            this.updatePackagePreview();
            this.updateTotalPrice();
        });

        document.querySelectorAll('input[name="payType"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateTotalPrice());
        });

        document.getElementById('submitInvite').addEventListener('click', () => this.submitInvite());
        document.getElementById('confirmGrab').addEventListener('click', () => this.confirmGrabOrder());
        document.getElementById('confirmPay').addEventListener('click', () => this.processPayment());
    }

    updatePackagePreview() {
        const preview = document.getElementById('packagePreview');
        const rid = parseInt(document.getElementById('inviteRestaurant').value);
        const pid = parseInt(document.getElementById('invitePackage').value);

        if (rid && pid) {
            const pkg = this.getPackage(rid, pid);
            preview.innerHTML = `
                <div class="package-preview-name">${pkg.name}</div>
                <div class="package-preview-items">${pkg.items}</div>
                <div class="package-preview-price">¥${pkg.price}</div>
            `;
            preview.classList.add('show');
        } else {
            preview.classList.remove('show');
        }
    }

    updateTotalPrice() {
        const rid = parseInt(document.getElementById('inviteRestaurant').value);
        const pid = parseInt(document.getElementById('invitePackage').value);
        const payType = document.querySelector('input[name="payType"]:checked').value;

        let price = 0;
        if (rid && pid) {
            const pkg = this.getPackage(rid, pid);
            if (payType === 'treat') price = pkg.price;
            else if (payType === 'aa') price = pkg.price / 2;
        }
        document.getElementById('totalPrice').textContent = `¥${price.toFixed(2)}`;
    }

    async submitInvite() {
        const rid = parseInt(document.getElementById('inviteRestaurant').value);
        const pid = parseInt(document.getElementById('invitePackage').value);
        const payType = document.querySelector('input[name="payType"]:checked').value;
        const date = document.getElementById('inviteDate').value;
        const time = document.getElementById('inviteTime').value;
        const message = document.getElementById('inviteMessage').value;

        if (!rid || !pid) {
            this.showToast('请选择餐厅和套餐');
            return;
        }
        if (!date || !time) {
            this.showToast('请选择用餐时间');
            return;
        }

        const pkg = this.getPackage(rid, pid);
        let price = 0;
        if (payType === 'treat') price = pkg.price;
        else if (payType === 'aa') price = pkg.price / 2;

        this.pendingInviteData = {
            restaurantId: rid,
            packageId: pid,
            payType,
            date,
            time,
            message,
            requirements: {
                gender: document.getElementById('requireGender').value,
                ageMin: parseInt(document.getElementById('requireAgeMin').value),
                ageMax: parseInt(document.getElementById('requireAgeMax').value),
                education: document.getElementById('requireEducation').value,
                heightMin: parseInt(document.getElementById('requireHeightMin').value),
                heightMax: parseInt(document.getElementById('requireHeightMax').value),
                occupation: document.getElementById('requireOccupation').value
            }
        };

        if (price > 0) {
            this.pendingAction = 'invite';
            const restaurant = this.getRestaurant(rid);
            document.getElementById('payAmount').textContent = `¥${price.toFixed(2)}`;
            document.getElementById('payDetail').textContent = `${restaurant.name} - ${pkg.name}`;
            this.hideModal('inviteModal');
            this.showModal('payModal');
        } else {
            await this.createInvite();
        }
    }

    async createInvite() {
        const data = await api('/api/invites', {
            method: 'POST',
            body: JSON.stringify(this.pendingInviteData)
        });

        if (!data || data.error) {
            this.showToast(data?.error || '发布失败');
            return;
        }

        this.hideModal('inviteModal');
        this.hideModal('payModal');
        this.showSuccess('邀约发布成功！', '您的邀约已发布成功，等待有缘人来抢单吧！');
        await this.loadData();
        this.renderNearbyInvites();
        this.renderMapMarkers();
        this.renderOrders();
        this.renderMyOrders();
    }

    // ======== Grab Order ========
    showGrabDetail(inviteId) {
        const invite = this.invites.find(i => i.id === inviteId);
        if (!invite) return;

        if (invite.userId === this.currentUser.id) {
            this.showToast('不能抢自己的单哦~');
            return;
        }

        this.currentGrabInvite = invite;
        const user = this.getUser(invite.userId);
        const restaurant = this.getRestaurant(invite.restaurantId);
        const pkg = this.getPackage(invite.restaurantId, invite.packageId);
        const payInfo = PAY_TYPE_MAP[invite.payType];

        let grabPrice = 0;
        if (invite.payType === 'aa') grabPrice = pkg.price / 2;
        else if (invite.payType === 'treat') grabPrice = 0;
        else grabPrice = pkg.price;

        const requirementsHtml = this.buildRequirementsHtml(invite.requirements);
        const tagsHtml = this.buildUserTagsHtml(user);

        document.getElementById('grabModalBody').innerHTML = `
            <div class="grab-detail">
                <div class="grab-detail-section">
                    <h4>邀约人</h4>
                    <div class="grab-user-card">
                        <img src="${this.getUserAvatar(user)}" alt="">
                        <div>
                            <h4>${user.name}</h4>
                            <p>${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.height || ''}cm · ${user.occupationLabel || ''}</p>
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
                <div class="grab-detail-section">
                    <h4>用餐信息</h4>
                    <div class="grab-info-grid">
                        <div class="grab-info-item"><i class="fas fa-store"></i>${restaurant.name}</div>
                        <div class="grab-info-item"><i class="fas fa-utensils"></i>${pkg.name}</div>
                        <div class="grab-info-item"><i class="fas fa-calendar"></i>${invite.date}</div>
                        <div class="grab-info-item"><i class="fas fa-clock"></i>${invite.time}</div>
                        <div class="grab-info-item"><i class="fas fa-money-bill"></i>${payInfo.label}</div>
                        <div class="grab-info-item"><i class="fas fa-map-marker-alt"></i>${invite.distance}km</div>
                    </div>
                </div>
                ${requirementsHtml ? `
                <div class="grab-detail-section">
                    <h4>对TA的要求</h4>
                    <div class="grab-requirements">${requirementsHtml}</div>
                </div>` : ''}
                ${invite.message ? `
                <div class="grab-detail-section">
                    <h4>TA说</h4>
                    <div class="grab-message-box">"${invite.message}"</div>
                </div>` : ''}
                <div class="grab-detail-section">
                    <button class="btn-secondary" onclick="app.openChatWith(${user.id})">
                        <i class="fas fa-comment"></i> 私信TA
                    </button>
                </div>
            </div>
        `;

        document.getElementById('grabPrice').textContent = grabPrice > 0 ? `¥${grabPrice.toFixed(2)}` : '免费';
        this.showModal('grabModal');
    }

    buildRequirementsHtml(req) {
        if (!req) return '';
        const tags = [];
        if (req.gender !== 'all') tags.push(req.gender === 'male' ? '限男性' : '限女性');
        if (req.ageMin || req.ageMax) tags.push(`年龄 ${req.ageMin}-${req.ageMax}岁`);
        if (req.education !== 'all') tags.push(EDUCATION_MAP[req.education]);
        if (req.heightMin || req.heightMax) tags.push(`身高 ${req.heightMin}-${req.heightMax}cm`);
        if (req.occupation !== 'all') tags.push(OCCUPATION_MAP[req.occupation]);
        return tags.map(t => `<span class="grab-requirement">${t}</span>`).join('');
    }

    buildUserTagsHtml(user) {
        const tags = [];
        if (user.tasteTags) {
            user.tasteTags.split(',').forEach(t => tags.push(`<span class="interest-tag taste">${t.trim()}</span>`));
        }
        if (user.pricePref) {
            tags.push(`<span class="interest-tag price">¥${user.pricePref}</span>`);
        }
        if (user.cuisinePref) {
            user.cuisinePref.split(',').forEach(t => tags.push(`<span class="interest-tag cuisine">${t.trim()}</span>`));
        }
        if (user.diningStyle) {
            tags.push(`<span class="interest-tag style">${user.diningStyle}</span>`);
        }
        if (tags.length === 0) return '';
        return `<div class="user-tags">${tags.join('')}</div>`;
    }

    async confirmGrabOrder() {
        const invite = this.currentGrabInvite;
        if (!invite) return;

        const pkg = this.getPackage(invite.restaurantId, invite.packageId);

        let grabPrice = 0;
        if (invite.payType === 'aa') grabPrice = pkg.price / 2;
        else if (invite.payType === 'betreated') grabPrice = pkg.price;

        if (grabPrice > 0) {
            this.pendingAction = 'grab';
            const restaurant = this.getRestaurant(invite.restaurantId);
            document.getElementById('payAmount').textContent = `¥${grabPrice.toFixed(2)}`;
            document.getElementById('payDetail').textContent = `抢单 - ${restaurant.name} ${pkg.name}`;
            this.hideModal('grabModal');
            this.showModal('payModal');
        } else {
            await this.completeGrab();
        }
    }

    async completeGrab() {
        const invite = this.currentGrabInvite;
        const data = await api(`/api/invites/${invite.id}/grab`, { method: 'PUT' });

        if (!data || data.error) {
            this.showToast(data?.error || '抢单失败');
            return;
        }

        this.hideModal('grabModal');
        this.hideModal('payModal');
        this.showSuccess('抢单成功！', `恭喜！您已成功抢单，请于 ${invite.date} ${invite.time} 前往用餐。`);
        await this.loadData();
        this.renderNearbyInvites();
        this.renderOrders();
        this.renderMyOrders();
    }

    async processPayment() {
        this.hideModal('payModal');
        if (this.pendingAction === 'invite') {
            await this.createInvite();
        } else if (this.pendingAction === 'grab') {
            await this.completeGrab();
        }
    }

    showSuccess(title, message) {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
        this.showModal('successModal');
    }

    // ======== Bookmark System ========
    bindOrdersViewTabs() {
        document.querySelectorAll('.orders-filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.orders-filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.ordersView = tab.dataset.view;
                this.renderOrders();
            });
        });
    }

    isBookmarked(inviteId) {
        return this.bookmarks.includes(inviteId);
    }

    async toggleBookmark(inviteId, e) {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (this.isBookmarked(inviteId)) {
            await api(`/api/bookmarks/${inviteId}`, { method: 'DELETE' });
            this.bookmarks = this.bookmarks.filter(id => id !== inviteId);
        } else {
            await api(`/api/bookmarks/${inviteId}`, { method: 'POST' });
            this.bookmarks.push(inviteId);
        }
        this.renderOrders();
        this.renderNearbyInvites();
    }

    // ======== Chat System ========
    async loadConversations() {
        const data = await api('/api/messages/conversations');
        this.conversations = data || [];
        this.renderConversations();
    }

    renderConversations() {
        const container = document.getElementById('conversationList');
        if (!this.conversations || this.conversations.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-comment-slash"></i><p>暂无聊天记录</p></div>';
            return;
        }

        container.innerHTML = this.conversations.map(c => {
            const avatar = this.getUserAvatar({ gender: c.partnerGender, avatar: c.partnerAvatar });
            const time = c.lastTime ? c.lastTime.slice(5, 16) : '';
            return `
                <div class="conversation-item ${this.currentChatPartner === c.partnerId ? 'active' : ''}" onclick="app.openChat(${c.partnerId})">
                    <img src="${avatar}" alt="">
                    <div class="conversation-info">
                        <div class="conversation-name">${c.partnerName}</div>
                        <div class="conversation-last">${c.lastMessage}</div>
                    </div>
                    <span class="conversation-time">${time}</span>
                </div>
            `;
        }).join('');
    }

    async openChat(partnerId) {
        this.currentChatPartner = partnerId;
        const partner = this.getUser(partnerId);
        const chatMain = document.getElementById('chatMain');
        const tagsHtml = this.buildUserTagsHtml(partner);

        chatMain.innerHTML = `
            <div class="chat-header">
                <img src="${this.getUserAvatar(partner)}" alt="">
                <div class="chat-header-info">
                    <h4>${partner.name}</h4>
                    <p>${partner.gender === 'male' ? '男' : '女'} · ${partner.age}岁 · ${partner.occupationLabel || ''}</p>
                    ${tagsHtml}
                </div>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="输入消息..." onkeypress="if(event.key==='Enter')app.sendMessage()">
                <button class="chat-send-btn" onclick="app.sendMessage()"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        await this.loadChatHistory(partnerId);
        this.renderConversations();
    }

    async openChatWith(userId) {
        this.hideModal('grabModal');
        this.navigateTo('chat');
        await this.loadConversations();
        await this.openChat(userId);
    }

    async loadChatHistory(partnerId) {
        const messages = await api(`/api/messages/history/${partnerId}`);
        const container = document.getElementById('chatMessages');
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding:40px"><p>暂无聊天记录，发送消息开始对话吧</p></div>';
            return;
        }

        container.innerHTML = messages.map(msg => {
            const isSent = msg.fromUserId === this.currentUser.id;
            const user = isSent ? this.currentUser : this.getUser(partnerId);
            return `
                <div class="chat-msg ${isSent ? 'sent' : 'received'}">
                    <img src="${this.getUserAvatar(user)}" alt="">
                    <div>
                        <div class="chat-bubble">${this.escapeHtml(msg.content)}</div>
                        <div class="chat-msg-time">${msg.createdAt ? msg.createdAt.slice(5, 16) : ''}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        if (!content || !this.currentChatPartner) return;

        input.value = '';
        const data = await api('/api/messages/send', {
            method: 'POST',
            body: JSON.stringify({ toUserId: this.currentChatPartner, content })
        });

        if (!data || data.error) {
            this.showToast(data?.error || '发送失败');
            return;
        }

        await this.loadChatHistory(this.currentChatPartner);
        await this.loadConversations();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ======== Review System ========
    bindReviewForm() {
        document.querySelectorAll('#packageStars .fa-star').forEach(star => {
            star.addEventListener('click', () => {
                this.packageRating = parseInt(star.dataset.value);
                this.updateStarDisplay('packageStars', this.packageRating);
            });
        });

        document.querySelectorAll('#partnerStars .fa-star').forEach(star => {
            star.addEventListener('click', () => {
                this.partnerRating = parseInt(star.dataset.value);
                this.updateStarDisplay('partnerStars', this.partnerRating);
            });
        });

        document.getElementById('submitReview').addEventListener('click', () => this.submitReview());
    }

    updateStarDisplay(containerId, rating) {
        document.querySelectorAll(`#${containerId} .fa-star`).forEach(star => {
            const val = parseInt(star.dataset.value);
            star.classList.toggle('active', val <= rating);
        });
    }

    openReviewModal(invite) {
        this.currentReviewOrder = invite;
        this.packageRating = 0;
        this.partnerRating = 0;
        this.updateStarDisplay('packageStars', 0);
        this.updateStarDisplay('partnerStars', 0);
        document.getElementById('packageComment').value = '';
        document.getElementById('partnerComment').value = '';

        const partnerId = invite.userId === this.currentUser.id ? invite.grabbedBy : invite.userId;
        const partner = this.getUser(partnerId);
        document.getElementById('reviewPartnerInfo').innerHTML = `
            <img src="${this.getUserAvatar(partner)}" alt="">
            <span>${partner.name}</span>
        `;
        this.showModal('reviewModal');
    }

    async submitReview() {
        if (this.packageRating === 0 || this.partnerRating === 0) {
            this.showToast('请完成所有评分');
            return;
        }

        const invite = this.currentReviewOrder;
        const partnerId = invite.userId === this.currentUser.id ? invite.grabbedBy : invite.userId;

        const data = await api('/api/reviews', {
            method: 'POST',
            body: JSON.stringify({
                restaurantId: invite.restaurantId,
                packageId: invite.packageId,
                packageRating: this.packageRating,
                packageComment: document.getElementById('packageComment').value || '好评',
                partnerUserId: partnerId,
                partnerRating: this.partnerRating,
                partnerComment: document.getElementById('partnerComment').value || '不错的饭搭子'
            })
        });

        if (!data || data.error) {
            this.showToast(data?.error || '提交失败');
            return;
        }

        this.hideModal('reviewModal');
        this.showToast('评价提交成功！');
        await this.loadData();
        this.renderMyOrders();
        this.renderReviews();
    }

    renderReviews() {
        const container = document.getElementById('reviewsList');
        if (this.reviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>暂无评价</p></div>';
            return;
        }

        container.innerHTML = this.reviews.map(review => {
            const user = this.getUser(review.userId);
            const partner = this.getUser(review.partnerUserId);
            const restaurant = this.getRestaurant(review.restaurantId);
            const pkg = this.getPackage(review.restaurantId, review.packageId);

            return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="review-user">
                            <img src="${this.getUserAvatar(user)}" alt="">
                            <div>
                                <h4>${user.name}</h4>
                                <span class="review-time">${review.createdAt}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-card-body">
                        <div class="review-section">
                            <div class="review-target">
                                <i class="fas fa-utensils"></i>
                                <span>${restaurant.name} · ${pkg.name}</span>
                            </div>
                            <div class="review-stars">${this.renderStars(review.packageRating)}</div>
                            <p class="review-comment">${review.packageComment}</p>
                        </div>
                        <div class="review-section">
                            <div class="review-target">
                                <i class="fas fa-user-friends"></i>
                                <span>饭搭子：${partner.name}</span>
                            </div>
                            <div class="review-stars">${this.renderStars(review.partnerRating)}</div>
                            <p class="review-comment">${review.partnerComment}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="fas fa-star ${i <= rating ? 'active' : ''}"></i>`;
        }
        return html;
    }

    // ======== Rendering ========
    renderNearbyInvites() {
        const container = document.getElementById('nearbyInvites');
        const visibleInvites = this.invites;
        document.getElementById('nearbyCount').textContent = visibleInvites.length;

        if (visibleInvites.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无符合条件的邀约</p></div>`;
            return;
        }

        container.innerHTML = visibleInvites.map(invite => {
            const user = this.getUser(invite.userId);
            const restaurant = this.getRestaurant(invite.restaurantId);
            const pkg = this.getPackage(invite.restaurantId, invite.packageId);
            const payInfo = PAY_TYPE_MAP[invite.payType];
            const bookmarked = this.isBookmarked(invite.id);

            return `
                <div class="invite-card" onclick="app.showGrabDetail(${invite.id})">
                    <div class="invite-card-header">
                        <div class="invite-user">
                            <img src="${this.getUserAvatar(user)}" alt="">
                            <div class="invite-user-info">
                                <span class="invite-user-name">${user.name}</span>
                                <span class="invite-user-meta">${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.occupationLabel || ''}</span>
                            </div>
                        </div>
                        <span class="invite-pay-tag ${payInfo.class}">${payInfo.label}</span>
                    </div>
                    <div class="invite-card-body">
                        <div class="invite-restaurant"><i class="fas fa-store"></i>${restaurant.name}</div>
                        <div class="invite-package">${pkg.name} · ¥${pkg.price}</div>
                        ${invite.message ? `<div class="invite-message">"${invite.message}"</div>` : ''}
                    </div>
                    <div class="invite-card-footer">
                        <span class="invite-time"><i class="fas fa-clock"></i>${invite.date} ${invite.time}</span>
                        <span class="invite-distance"><i class="fas fa-location-arrow"></i> ${invite.distance}km</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderMapMarkers() {
        const container = document.getElementById('nearbyMarkers');
        const visibleInvites = this.invites;

        const positions = [
            { top: '25%', left: '30%' },
            { top: '35%', left: '65%' },
            { top: '60%', left: '25%' },
            { top: '20%', left: '75%' },
            { top: '70%', left: '60%' },
            { top: '45%', left: '15%' },
            { top: '55%', left: '80%' },
        ];

        container.innerHTML = visibleInvites.map((invite, idx) => {
            const user = this.getUser(invite.userId);
            const restaurant = this.getRestaurant(invite.restaurantId);
            const payInfo = PAY_TYPE_MAP[invite.payType];
            const pos = positions[idx % positions.length];

            return `
                <div class="map-marker ${invite.payType}" style="top:${pos.top};left:${pos.left}" onclick="app.showGrabDetail(${invite.id})">
                    <div class="marker-icon"><i class="${payInfo.icon}"></i></div>
                    <div class="marker-label">${user.name} · ${restaurant.name.split('·')[0]}</div>
                </div>
            `;
        }).join('');
    }

    renderRestaurants(filter = 'all') {
        const container = document.getElementById('restaurantGrid');
        let restaurants = this.restaurants;

        if (filter !== 'all') {
            restaurants = restaurants.filter(r => r.category === filter);
        }

        container.innerHTML = restaurants.map(r => {
            const reviewCount = this.reviews.filter(rev => rev.restaurantId === r.id).length;
            const avgRating = this.getRestaurantAvgRating(r.id);

            return `
                <div class="restaurant-card">
                    <div class="restaurant-img">${r.image ? `<img src="${r.image}" alt="${r.name}" style="width:100%;height:100%;object-fit:cover;">` : r.emoji}</div>
                    <div class="restaurant-info">
                        <div class="restaurant-name">
                            ${r.name}
                            <span class="restaurant-rating"><i class="fas fa-star"></i> ${avgRating || r.rating}${reviewCount > 0 ? ` (${reviewCount}条评价)` : ''}</span>
                        </div>
                        <div class="restaurant-address"><i class="fas fa-map-marker-alt"></i>${r.address} · ${r.distance}km</div>
                        <div class="restaurant-packages">
                            <h4>双人套餐</h4>
                            ${r.packages.filter(p => p.active).map(p => `
                                <div class="package-item">
                                    <span class="package-name">${p.name}</span>
                                    <span class="package-price">¥${p.price}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getRestaurantAvgRating(restaurantId) {
        const restaurantReviews = this.reviews.filter(r => r.restaurantId === restaurantId);
        if (restaurantReviews.length === 0) return null;
        const avg = restaurantReviews.reduce((sum, r) => sum + r.packageRating, 0) / restaurantReviews.length;
        return avg.toFixed(1);
    }

    renderOrders() {
        const container = document.getElementById('ordersGrid');
        let visibleInvites = this.invites;

        if (this.ordersView === 'bookmarked') {
            visibleInvites = visibleInvites.filter(i => this.isBookmarked(i.id));
        }

        container.innerHTML = visibleInvites.map(invite => {
            const user = this.getUser(invite.userId);
            const restaurant = this.getRestaurant(invite.restaurantId);
            const pkg = this.getPackage(invite.restaurantId, invite.packageId);
            const payInfo = PAY_TYPE_MAP[invite.payType];
            const requirements = this.buildRequirementsHtml(invite.requirements);
            const bookmarked = this.isBookmarked(invite.id);
            const tagsHtml = this.buildUserTagsHtml(user);

            let displayPrice = '';
            if (invite.payType === 'aa') displayPrice = `¥${(pkg.price / 2).toFixed(0)} <small>/人</small>`;
            else if (invite.payType === 'treat') displayPrice = '免费';
            else displayPrice = `¥${pkg.price}`;

            return `
                <div class="order-card" onclick="app.showGrabDetail(${invite.id})">
                    <button class="bookmark-btn ${bookmarked ? 'bookmarked' : ''}" onclick="app.toggleBookmark(${invite.id}, event)" title="${bookmarked ? '取消收藏' : '收藏邀约'}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                    <div class="order-card-top">
                        <div class="order-user">
                            <img src="${this.getUserAvatar(user)}" alt="">
                            <div class="order-user-info">
                                <h4>${user.name}</h4>
                                <p>${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.occupationLabel || ''}</p>
                                ${tagsHtml}
                            </div>
                        </div>
                        <span class="invite-pay-tag ${payInfo.class}">${payInfo.label}</span>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-row"><i class="fas fa-store"></i>${restaurant.name}</div>
                        <div class="order-detail-row"><i class="fas fa-utensils"></i>${pkg.name}</div>
                        <div class="order-detail-row"><i class="fas fa-calendar-alt"></i>${invite.date} ${invite.time}</div>
                        <div class="order-detail-row"><i class="fas fa-map-marker-alt"></i>距你 ${invite.distance}km</div>
                        ${invite.message ? `<div class="order-detail-row"><i class="fas fa-comment"></i>"${invite.message}"</div>` : ''}
                        ${requirements ? `<div class="order-requirements">${requirements}</div>` : ''}
                    </div>
                    <div class="order-card-bottom">
                        <span class="order-price">${displayPrice}</span>
                        <button class="btn-primary btn-small">立即抢单</button>
                    </div>
                </div>
            `;
        }).join('');

        if (visibleInvites.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>${this.ordersView === 'bookmarked' ? '暂无收藏的邀约' : '暂无符合您条件的邀约'}</p></div>`;
        }
    }

    renderMyOrders() {
        const invitesList = document.getElementById('myInvitesList');
        const grabsList = document.getElementById('myGrabsList');

        if (this.myInvites.length === 0) {
            invitesList.innerHTML = `<div class="empty-state"><i class="fas fa-paper-plane"></i><p>还没有发起过邀约</p></div>`;
        } else {
            invitesList.innerHTML = this.myInvites.map(invite => {
                const restaurant = this.getRestaurant(invite.restaurantId);
                const pkg = this.getPackage(invite.restaurantId, invite.packageId);
                const payInfo = PAY_TYPE_MAP[invite.payType];
                const statusClass = invite.status === 'waiting' ? 'waiting' : 'matched';
                const statusText = invite.status === 'waiting' ? '等待抢单' : '已匹配';

                const hasReview = this.reviews.some(r => r.userId === this.currentUser.id && r.restaurantId === invite.restaurantId && r.packageId === invite.packageId);
                let actionHtml = '';
                if (invite.status === 'waiting') {
                    actionHtml = `<button class="btn-danger" onclick="app.cancelInvite(${invite.id})">取消</button>`;
                } else if (invite.status === 'matched' && !hasReview) {
                    actionHtml = `<button class="btn-success" onclick="app.openReviewForInvite(${invite.id})">评价</button>`;
                } else if (hasReview) {
                    actionHtml = `<span class="reviewed-tag">已评价</span>`;
                }

                return `
                    <div class="my-order-item">
                        <div class="my-order-header">
                            <h4>${restaurant.name} · ${pkg.name}</h4>
                            <span class="order-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="my-order-body">
                            <div class="my-order-info">
                                <div><i class="fas fa-calendar"></i> ${invite.date} ${invite.time}</div>
                                <div><i class="fas fa-money-bill"></i> ${payInfo.label} · ¥${pkg.price}</div>
                            </div>
                            <div class="my-order-actions">${actionHtml}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (this.myGrabs.length === 0) {
            grabsList.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer"></i><p>还没有抢过单</p></div>`;
        } else {
            grabsList.innerHTML = this.myGrabs.map(invite => {
                const user = this.getUser(invite.userId);
                const restaurant = this.getRestaurant(invite.restaurantId);
                const pkg = this.getPackage(invite.restaurantId, invite.packageId);

                const hasReview = this.reviews.some(r => r.userId === this.currentUser.id && r.restaurantId === invite.restaurantId && r.packageId === invite.packageId);
                let actionHtml = '';
                if (!hasReview) {
                    actionHtml = `<button class="btn-success" onclick="app.openReviewForGrab(${invite.id})">评价</button>`;
                } else {
                    actionHtml = `<span class="reviewed-tag">已评价</span>`;
                }

                return `
                    <div class="my-order-item">
                        <div class="my-order-header">
                            <h4>${restaurant.name} · ${pkg.name}</h4>
                            <span class="order-status matched">已匹配</span>
                        </div>
                        <div class="my-order-body">
                            <div class="my-order-info">
                                <div><i class="fas fa-user"></i> 邀约人：${user.name}</div>
                                <div><i class="fas fa-calendar"></i> ${invite.date} ${invite.time}</div>
                            </div>
                            <div class="my-order-actions">${actionHtml}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    openReviewForInvite(inviteId) {
        const invite = this.myInvites.find(i => i.id === inviteId);
        if (invite) this.openReviewModal(invite);
    }

    openReviewForGrab(inviteId) {
        const invite = this.myGrabs.find(i => i.id === inviteId);
        if (invite) this.openReviewModal(invite);
    }

    async cancelInvite(inviteId) {
        const data = await api(`/api/invites/${inviteId}/cancel`, { method: 'PUT' });
        if (!data || data.error) {
            this.showToast(data?.error || '取消失败');
            return;
        }
        this.showToast('邀约已取消');
        await this.loadData();
        this.renderNearbyInvites();
        this.renderMapMarkers();
        this.renderOrders();
        this.renderMyOrders();
    }

    // ======== Filters ========
    bindFilters() {
        document.querySelectorAll('.filter-tags .tag').forEach(tag => {
            tag.addEventListener('click', () => {
                document.querySelectorAll('.filter-tags .tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                this.renderRestaurants(tag.dataset.filter);
            });
        });

        document.getElementById('restaurantSearch').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.restaurant-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // ======== Tabs ========
    bindTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            });
        });
    }

    // ======== Merchant Features ========
    bindMerchantActions() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageUpload');

        uploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        document.getElementById('addPackageBtn').addEventListener('click', () => {
            this.editingPackageId = null;
            document.getElementById('packageModalTitle').textContent = '新增套餐';
            document.getElementById('pkgName').value = '';
            document.getElementById('pkgPrice').value = '';
            document.getElementById('pkgItems').value = '';
            this.showModal('packageModal');
        });

        document.getElementById('closePackageModal').addEventListener('click', () => this.hideModal('packageModal'));
        document.getElementById('savePackage').addEventListener('click', () => this.savePackage());
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const imgUrl = ev.target.result;
            document.getElementById('uploadPreview').innerHTML = `<img src="${imgUrl}" alt="店铺图片" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
            this.showToast('图片上传成功！');
        };
        reader.readAsDataURL(file);
    }

    renderMerchantDashboard() {
        if (!this.currentMerchant || !this.currentMerchant.restaurantId) {
            document.getElementById('shopInfo').innerHTML = '<p>暂无关联餐厅</p>';
            return;
        }
        const restaurant = this.getRestaurant(this.currentMerchant.restaurantId);
        const activePackages = restaurant.packages.filter(p => p.active).length;
        document.getElementById('statPackages').textContent = activePackages;

        document.getElementById('shopInfo').innerHTML = `
            <div class="shop-info-item"><strong>店铺名称：</strong>${restaurant.name}</div>
            <div class="shop-info-item"><strong>地址：</strong>${restaurant.address}</div>
            <div class="shop-info-item"><strong>分类：</strong>${restaurant.category}</div>
            <div class="shop-info-item"><strong>评分：</strong>${restaurant.rating}</div>
        `;

        if (restaurant.image) {
            document.getElementById('uploadPreview').innerHTML = `<img src="${restaurant.image}" alt="店铺图片" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        }
    }

    renderMerchantPackages() {
        if (!this.currentMerchant || !this.currentMerchant.restaurantId) return;
        const restaurant = this.getRestaurant(this.currentMerchant.restaurantId);
        const container = document.getElementById('merchantPackagesList');

        container.innerHTML = restaurant.packages.map(pkg => `
            <div class="package-manage-card ${pkg.active ? '' : 'inactive'}">
                <div class="package-manage-info">
                    <h4>${pkg.name}</h4>
                    <p class="package-manage-items">${pkg.items}</p>
                    <span class="package-manage-price">¥${pkg.price}</span>
                </div>
                <div class="package-manage-actions">
                    <span class="package-status-tag ${pkg.active ? 'active' : 'inactive'}">${pkg.active ? '在售' : '已下架'}</span>
                    <button class="btn-small btn-primary" onclick="app.editPackage(${pkg.id})"><i class="fas fa-edit"></i> 编辑</button>
                    ${pkg.active ?
                        `<button class="btn-small btn-danger" onclick="app.togglePackage(${pkg.id}, false)"><i class="fas fa-arrow-down"></i> 下架</button>` :
                        `<button class="btn-small btn-success" onclick="app.togglePackage(${pkg.id}, true)"><i class="fas fa-arrow-up"></i> 上架</button>`
                    }
                </div>
            </div>
        `).join('');
    }

    editPackage(packageId) {
        const restaurant = this.getRestaurant(this.currentMerchant.restaurantId);
        const pkg = restaurant.packages.find(p => p.id === packageId);
        if (!pkg) return;

        this.editingPackageId = packageId;
        document.getElementById('packageModalTitle').textContent = '编辑套餐';
        document.getElementById('pkgName').value = pkg.name;
        document.getElementById('pkgPrice').value = pkg.price;
        document.getElementById('pkgItems').value = pkg.items;
        this.showModal('packageModal');
    }

    async savePackage() {
        const name = document.getElementById('pkgName').value.trim();
        const price = parseInt(document.getElementById('pkgPrice').value);
        const items = document.getElementById('pkgItems').value.trim();

        if (!name || !price || !items) {
            this.showToast('请填写完整信息');
            return;
        }

        if (this.editingPackageId) {
            const data = await api(`/api/restaurants/packages/${this.editingPackageId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, price, items })
            });
            if (!data || data.error) {
                this.showToast(data?.error || '更新失败');
                return;
            }
            this.showToast('套餐更新成功！');
        } else {
            const data = await api('/api/restaurants/packages', {
                method: 'POST',
                body: JSON.stringify({ restaurantId: this.currentMerchant.restaurantId, name, price, items })
            });
            if (!data || data.error) {
                this.showToast(data?.error || '添加失败');
                return;
            }
            this.showToast('套餐添加成功！');
        }

        this.hideModal('packageModal');
        await this.loadRestaurants();
        this.renderMerchantPackages();
        this.renderMerchantDashboard();
    }

    async togglePackage(packageId, active) {
        const data = await api(`/api/restaurants/packages/${packageId}`, {
            method: 'PUT',
            body: JSON.stringify({ active })
        });
        if (!data || data.error) {
            this.showToast(data?.error || '操作失败');
            return;
        }
        this.showToast(active ? '套餐已上架' : '套餐已下架');
        await this.loadRestaurants();
        this.renderMerchantPackages();
        this.renderMerchantDashboard();
    }

    renderMerchantReviews() {
        if (!this.currentMerchant || !this.currentMerchant.restaurantId) return;
        const container = document.getElementById('merchantReviewsList');
        const restaurantReviews = this.reviews.filter(r => r.restaurantId === this.currentMerchant.restaurantId);

        if (restaurantReviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>暂无顾客评价</p></div>';
            return;
        }

        container.innerHTML = restaurantReviews.map(review => {
            const user = this.getUser(review.userId);
            const pkg = this.getPackage(review.restaurantId, review.packageId);

            return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="review-user">
                            <img src="${this.getUserAvatar(user)}" alt="">
                            <div>
                                <h4>${user.name}</h4>
                                <span class="review-time">${review.createdAt}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-card-body">
                        <div class="review-section">
                            <div class="review-target">
                                <i class="fas fa-utensils"></i>
                                <span>${pkg.name}</span>
                            </div>
                            <div class="review-stars">${this.renderStars(review.packageRating)}</div>
                            <p class="review-comment">${review.packageComment}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ======== Utilities ========
    setDefaultDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('inviteDate').value = tomorrow.toISOString().split('T')[0];
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }
}

const app = new FoodShareApp();
