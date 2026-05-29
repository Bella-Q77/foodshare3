class FoodShareApp {
    constructor() {
        this.currentUser = null;
        this.currentMerchant = null;
        this.role = null; // 'user' or 'merchant'
        this.invites = [...MOCK_DATA.invites];
        this.reviews = [...MOCK_DATA.reviews];
        this.myInvites = [];
        this.myGrabs = [];
        this.currentGrabInvite = null;
        this.currentReviewOrder = null;
        this.editingPackageId = null;
        this.packageRating = 0;
        this.partnerRating = 0;
        this._userAppInitialized = false;
        this._merchantAppInitialized = false;
        this.init();
    }

    init() {
        this.bindRoleSelect();
        this.bindLoginModals();
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

        document.getElementById('doMerchantLogin').addEventListener('click', () => this.merchantLogin(1));
        document.getElementById('doLogin').addEventListener('click', () => this.userLogin(1));

        document.querySelectorAll('[data-merchant]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.merchantLogin(parseInt(btn.dataset.merchant));
            });
        });

        document.querySelectorAll('[data-user]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.userLogin(parseInt(btn.dataset.user));
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modal.id);
            });
        });
    }

    merchantLogin(merchantId) {
        this.currentMerchant = MOCK_DATA.merchants.find(m => m.id === merchantId);
        this.role = 'merchant';
        document.getElementById('roleSelectPage').style.display = 'none';
        document.getElementById('merchantApp').style.display = 'block';
        document.getElementById('merchantAvatar').src = this.currentMerchant.avatar;
        document.getElementById('merchantName').textContent = this.currentMerchant.name;
        this.hideModal('merchantLoginModal');
        this.initMerchantApp();
        this.showToast(`欢迎回来，${this.currentMerchant.name}！`);
    }

    userLogin(userId) {
        this.currentUser = MOCK_DATA.users.find(u => u.id === userId);
        this.role = 'user';
        document.getElementById('roleSelectPage').style.display = 'none';
        document.getElementById('userApp').style.display = 'block';
        document.querySelector('.user-name').textContent = this.currentUser.name;
        document.querySelector('.user-avatar').src = this.currentUser.avatar;
        this.hideModal('userLoginModal');
        this.initUserApp();
        this.showToast(`欢迎回来，${this.currentUser.name}！`);
    }

    // ======== User App Init ========
    initUserApp() {
        if (!this._userAppInitialized) {
            this.bindNavigation();
            this.bindUserMenu();
            this.bindModals();
            this.bindInviteForm();
            this.bindFilters();
            this.bindTabs();
            this.bindReviewForm();
            this._userAppInitialized = true;
        }
        this.renderNearbyInvites();
        this.renderMapMarkers();
        this.renderRestaurants();
        this.renderOrders();
        this.renderMyOrders();
        this.renderReviews();
        this.setDefaultDate();
    }

    // ======== Merchant App Init ========
    initMerchantApp() {
        if (!this._merchantAppInitialized) {
            this.bindMerchantNav();
            this.bindMerchantMenu();
            this.bindMerchantActions();
            this._merchantAppInitialized = true;
        }
        this.renderMerchantDashboard();
        this.renderMerchantPackages();
        this.renderMerchantReviews();
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
    bindInviteForm() {
        const restaurantSelect = document.getElementById('inviteRestaurant');
        const packageSelect = document.getElementById('invitePackage');

        MOCK_DATA.restaurants.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = `${r.emoji} ${r.name} (${r.distance}km)`;
            restaurantSelect.appendChild(opt);
        });

        restaurantSelect.addEventListener('change', () => {
            const rid = parseInt(restaurantSelect.value);
            packageSelect.innerHTML = '<option value="">请选择套餐</option>';
            if (rid) {
                const restaurant = MOCK_DATA.restaurants.find(r => r.id === rid);
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
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === rid);
            const pkg = restaurant.packages.find(p => p.id === pid);
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
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === rid);
            const pkg = restaurant.packages.find(p => p.id === pid);
            if (payType === 'treat') price = pkg.price;
            else if (payType === 'aa') price = pkg.price / 2;
        }
        document.getElementById('totalPrice').textContent = `¥${price.toFixed(2)}`;
    }

    submitInvite() {
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

        const restaurant = MOCK_DATA.restaurants.find(r => r.id === rid);
        const pkg = restaurant.packages.find(p => p.id === pid);
        let price = 0;
        if (payType === 'treat') price = pkg.price;
        else if (payType === 'aa') price = pkg.price / 2;

        if (price > 0) {
            this.pendingAction = 'invite';
            this.pendingInviteData = {
                rid, pid, payType, date, time, message,
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
            document.getElementById('payAmount').textContent = `¥${price.toFixed(2)}`;
            document.getElementById('payDetail').textContent = `${restaurant.name} - ${pkg.name}`;
            this.hideModal('inviteModal');
            this.showModal('payModal');
        } else {
            this.createInvite({
                rid, pid, payType, date, time, message,
                requirements: {
                    gender: document.getElementById('requireGender').value,
                    ageMin: parseInt(document.getElementById('requireAgeMin').value),
                    ageMax: parseInt(document.getElementById('requireAgeMax').value),
                    education: document.getElementById('requireEducation').value,
                    heightMin: parseInt(document.getElementById('requireHeightMin').value),
                    heightMax: parseInt(document.getElementById('requireHeightMax').value),
                    occupation: document.getElementById('requireOccupation').value
                }
            });
        }
    }

    createInvite(data) {
        const newInvite = {
            id: this.invites.length + 1,
            userId: this.currentUser.id,
            restaurantId: data.rid,
            packageId: data.pid,
            payType: data.payType,
            date: data.date,
            time: data.time,
            message: data.message || '期待与你的相遇~',
            requirements: data.requirements,
            status: 'waiting',
            createdAt: new Date().toLocaleString('zh-CN'),
            distance: (Math.random() * 3 + 0.3).toFixed(1)
        };

        this.invites.unshift(newInvite);
        this.myInvites.unshift(newInvite);
        this.hideModal('inviteModal');
        this.hideModal('payModal');
        this.showSuccess('邀约发布成功！', '您的邀约已发布成功，等待有缘人来抢单吧！');
        this.renderNearbyInvites();
        this.renderMapMarkers();
        this.renderOrders();
        this.renderMyOrders();
    }

    // ======== Condition-Based Filtering ========
    userMeetsRequirements(user, requirements) {
        if (requirements.gender !== 'all' && user.gender !== requirements.gender) return false;
        if (user.age < requirements.ageMin || user.age > requirements.ageMax) return false;
        if (requirements.education !== 'all') {
            const reqLevel = EDUCATION_LEVELS.indexOf(requirements.education);
            const userLevel = EDUCATION_LEVELS.indexOf(user.education);
            if (userLevel < reqLevel) return false;
        }
        if (user.height < requirements.heightMin || user.height > requirements.heightMax) return false;
        if (requirements.occupation !== 'all' && user.occupation !== requirements.occupation) return false;
        return true;
    }

    getVisibleInvites() {
        if (!this.currentUser) return [];
        return this.invites.filter(invite => {
            if (invite.status !== 'waiting') return false;
            if (invite.userId === this.currentUser.id) return false;
            return this.userMeetsRequirements(this.currentUser, invite.requirements);
        });
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
        const user = MOCK_DATA.users.find(u => u.id === invite.userId);
        const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
        const pkg = restaurant.packages.find(p => p.id === invite.packageId);
        const payInfo = PAY_TYPE_MAP[invite.payType];

        let grabPrice = 0;
        if (invite.payType === 'aa') grabPrice = pkg.price / 2;
        else if (invite.payType === 'treat') grabPrice = 0;
        else grabPrice = pkg.price;

        const requirementsHtml = this.buildRequirementsHtml(invite.requirements);

        document.getElementById('grabModalBody').innerHTML = `
            <div class="grab-detail">
                <div class="grab-detail-section">
                    <h4>邀约人</h4>
                    <div class="grab-user-card">
                        <img src="${user.avatar}" alt="">
                        <div>
                            <h4>${user.name}</h4>
                            <p>${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.height}cm · ${user.occupationLabel}</p>
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
            </div>
        `;

        document.getElementById('grabPrice').textContent = grabPrice > 0 ? `¥${grabPrice.toFixed(2)}` : '免费';
        this.showModal('grabModal');
    }

    buildRequirementsHtml(req) {
        const tags = [];
        if (req.gender !== 'all') tags.push(req.gender === 'male' ? '限男性' : '限女性');
        if (req.ageMin || req.ageMax) tags.push(`年龄 ${req.ageMin}-${req.ageMax}岁`);
        if (req.education !== 'all') tags.push(EDUCATION_MAP[req.education]);
        if (req.heightMin || req.heightMax) tags.push(`身高 ${req.heightMin}-${req.heightMax}cm`);
        if (req.occupation !== 'all') tags.push(OCCUPATION_MAP[req.occupation]);
        return tags.map(t => `<span class="grab-requirement">${t}</span>`).join('');
    }

    confirmGrabOrder() {
        const invite = this.currentGrabInvite;
        if (!invite) return;

        const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
        const pkg = restaurant.packages.find(p => p.id === invite.packageId);

        let grabPrice = 0;
        if (invite.payType === 'aa') grabPrice = pkg.price / 2;
        else if (invite.payType === 'betreated') grabPrice = pkg.price;

        if (grabPrice > 0) {
            this.pendingAction = 'grab';
            document.getElementById('payAmount').textContent = `¥${grabPrice.toFixed(2)}`;
            document.getElementById('payDetail').textContent = `抢单 - ${restaurant.name} ${pkg.name}`;
            this.hideModal('grabModal');
            this.showModal('payModal');
        } else {
            this.completeGrab();
        }
    }

    completeGrab() {
        const invite = this.currentGrabInvite;
        invite.status = 'matched';
        invite.grabbedBy = this.currentUser.id;
        this.myGrabs.unshift(invite);
        this.hideModal('grabModal');
        this.hideModal('payModal');
        this.showSuccess('抢单成功！', `恭喜！您已成功抢单，请于 ${invite.date} ${invite.time} 前往用餐。`);
        this.renderNearbyInvites();
        this.renderOrders();
        this.renderMyOrders();
    }

    processPayment() {
        this.hideModal('payModal');
        setTimeout(() => {
            if (this.pendingAction === 'invite') {
                this.createInvite(this.pendingInviteData);
            } else if (this.pendingAction === 'grab') {
                this.completeGrab();
            }
        }, 500);
    }

    showSuccess(title, message) {
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successMessage').textContent = message;
        this.showModal('successModal');
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
        const partner = MOCK_DATA.users.find(u => u.id === partnerId);
        document.getElementById('reviewPartnerInfo').innerHTML = `
            <img src="${partner.avatar}" alt="">
            <span>${partner.name}</span>
        `;
        this.showModal('reviewModal');
    }

    submitReview() {
        if (this.packageRating === 0 || this.partnerRating === 0) {
            this.showToast('请完成所有评分');
            return;
        }

        const invite = this.currentReviewOrder;
        const partnerId = invite.userId === this.currentUser.id ? invite.grabbedBy : invite.userId;

        const review = {
            id: this.reviews.length + 1,
            userId: this.currentUser.id,
            restaurantId: invite.restaurantId,
            packageId: invite.packageId,
            packageRating: this.packageRating,
            packageComment: document.getElementById('packageComment').value || '好评',
            partnerUserId: partnerId,
            partnerRating: this.partnerRating,
            partnerComment: document.getElementById('partnerComment').value || '不错的饭搭子',
            createdAt: new Date().toLocaleString('zh-CN')
        };

        this.reviews.unshift(review);
        invite.reviewed = true;
        this.hideModal('reviewModal');
        this.showToast('评价提交成功！');
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
            const user = MOCK_DATA.users.find(u => u.id === review.userId);
            const partner = MOCK_DATA.users.find(u => u.id === review.partnerUserId);
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === review.restaurantId);
            const pkg = restaurant.packages.find(p => p.id === review.packageId);

            return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="review-user">
                            <img src="${user.avatar}" alt="">
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
                                <span>${restaurant.name} · ${pkg ? pkg.name : '套餐'}</span>
                            </div>
                            <div class="review-stars">${this.renderStars(review.packageRating)}</div>
                            <p class="review-comment">${review.packageComment}</p>
                        </div>
                        <div class="review-section">
                            <div class="review-target">
                                <i class="fas fa-user-friends"></i>
                                <span>饭搭子：${partner ? partner.name : '用户'}</span>
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
        const visibleInvites = this.getVisibleInvites();
        document.getElementById('nearbyCount').textContent = visibleInvites.length;

        if (visibleInvites.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无符合条件的邀约</p></div>`;
            return;
        }

        container.innerHTML = visibleInvites.map(invite => {
            const user = MOCK_DATA.users.find(u => u.id === invite.userId);
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
            const pkg = restaurant.packages.find(p => p.id === invite.packageId);
            const payInfo = PAY_TYPE_MAP[invite.payType];

            return `
                <div class="invite-card" onclick="app.showGrabDetail(${invite.id})">
                    <div class="invite-card-header">
                        <div class="invite-user">
                            <img src="${user.avatar}" alt="">
                            <div class="invite-user-info">
                                <span class="invite-user-name">${user.name}</span>
                                <span class="invite-user-meta">${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.occupationLabel}</span>
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
        const visibleInvites = this.getVisibleInvites();

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
            const user = MOCK_DATA.users.find(u => u.id === invite.userId);
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
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
        let restaurants = MOCK_DATA.restaurants;

        if (filter !== 'all') {
            restaurants = restaurants.filter(r => r.category === filter);
        }

        container.innerHTML = restaurants.map(r => {
            const avgRating = this.getRestaurantAvgRating(r.id);
            const reviewCount = this.reviews.filter(rev => rev.restaurantId === r.id).length;

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
        const visibleInvites = this.getVisibleInvites();

        container.innerHTML = visibleInvites.map(invite => {
            const user = MOCK_DATA.users.find(u => u.id === invite.userId);
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
            const pkg = restaurant.packages.find(p => p.id === invite.packageId);
            const payInfo = PAY_TYPE_MAP[invite.payType];
            const requirements = this.buildRequirementsHtml(invite.requirements);

            let displayPrice = '';
            if (invite.payType === 'aa') displayPrice = `¥${(pkg.price / 2).toFixed(0)} <small>/人</small>`;
            else if (invite.payType === 'treat') displayPrice = '免费';
            else displayPrice = `¥${pkg.price}`;

            return `
                <div class="order-card" onclick="app.showGrabDetail(${invite.id})">
                    <div class="order-card-top">
                        <div class="order-user">
                            <img src="${user.avatar}" alt="">
                            <div class="order-user-info">
                                <h4>${user.name}</h4>
                                <p>${user.gender === 'male' ? '男' : '女'} · ${user.age}岁 · ${user.occupationLabel}</p>
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
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无符合您条件的邀约</p></div>';
        }
    }

    renderMyOrders() {
        const invitesList = document.getElementById('myInvitesList');
        const grabsList = document.getElementById('myGrabsList');

        if (this.myInvites.length === 0) {
            invitesList.innerHTML = `<div class="empty-state"><i class="fas fa-paper-plane"></i><p>还没有发起过邀约</p></div>`;
        } else {
            invitesList.innerHTML = this.myInvites.map(invite => {
                const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
                const pkg = restaurant.packages.find(p => p.id === invite.packageId);
                const payInfo = PAY_TYPE_MAP[invite.payType];
                const statusClass = invite.status === 'waiting' ? 'waiting' : 'matched';
                const statusText = invite.status === 'waiting' ? '等待抢单' : '已匹配';

                let actionHtml = '';
                if (invite.status === 'waiting') {
                    actionHtml = `<button class="btn-danger" onclick="app.cancelInvite(${invite.id})">取消</button>`;
                } else if (invite.status === 'matched' && !invite.reviewed) {
                    actionHtml = `<button class="btn-success" onclick="app.openReviewForInvite(${invite.id})">评价</button>`;
                } else if (invite.reviewed) {
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
                const user = MOCK_DATA.users.find(u => u.id === invite.userId);
                const restaurant = MOCK_DATA.restaurants.find(r => r.id === invite.restaurantId);
                const pkg = restaurant.packages.find(p => p.id === invite.packageId);

                let actionHtml = '';
                if (!invite.reviewed) {
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

    cancelInvite(inviteId) {
        this.invites = this.invites.filter(i => i.id !== inviteId);
        this.myInvites = this.myInvites.filter(i => i.id !== inviteId);
        this.showToast('邀约已取消');
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
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);
            restaurant.image = imgUrl;
            this.showToast('图片上传成功！');
        };
        reader.readAsDataURL(file);
    }

    renderMerchantDashboard() {
        const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);
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
        const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);
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
        const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);
        const pkg = restaurant.packages.find(p => p.id === packageId);
        if (!pkg) return;

        this.editingPackageId = packageId;
        document.getElementById('packageModalTitle').textContent = '编辑套餐';
        document.getElementById('pkgName').value = pkg.name;
        document.getElementById('pkgPrice').value = pkg.price;
        document.getElementById('pkgItems').value = pkg.items;
        this.showModal('packageModal');
    }

    savePackage() {
        const name = document.getElementById('pkgName').value.trim();
        const price = parseInt(document.getElementById('pkgPrice').value);
        const items = document.getElementById('pkgItems').value.trim();

        if (!name || !price || !items) {
            this.showToast('请填写完整信息');
            return;
        }

        const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);

        if (this.editingPackageId) {
            const pkg = restaurant.packages.find(p => p.id === this.editingPackageId);
            pkg.name = name;
            pkg.price = price;
            pkg.items = items;
            this.showToast('套餐更新成功！');
        } else {
            const newId = Math.max(...restaurant.packages.map(p => p.id)) + 1;
            restaurant.packages.push({ id: newId, name, price, items, active: true });
            this.showToast('套餐添加成功！');
        }

        this.hideModal('packageModal');
        this.renderMerchantPackages();
        this.renderMerchantDashboard();
    }

    togglePackage(packageId, active) {
        const restaurant = MOCK_DATA.restaurants.find(r => r.id === this.currentMerchant.restaurantId);
        const pkg = restaurant.packages.find(p => p.id === packageId);
        pkg.active = active;
        this.showToast(active ? '套餐已上架' : '套餐已下架');
        this.renderMerchantPackages();
        this.renderMerchantDashboard();
    }

    renderMerchantReviews() {
        const container = document.getElementById('merchantReviewsList');
        const restaurantId = this.currentMerchant.restaurantId;
        const restaurantReviews = this.reviews.filter(r => r.restaurantId === restaurantId);

        if (restaurantReviews.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>暂无顾客评价</p></div>';
            return;
        }

        container.innerHTML = restaurantReviews.map(review => {
            const user = MOCK_DATA.users.find(u => u.id === review.userId);
            const restaurant = MOCK_DATA.restaurants.find(r => r.id === review.restaurantId);
            const pkg = restaurant.packages.find(p => p.id === review.packageId);

            return `
                <div class="review-card">
                    <div class="review-card-header">
                        <div class="review-user">
                            <img src="${user.avatar}" alt="">
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
                                <span>${pkg ? pkg.name : '套餐'}</span>
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
