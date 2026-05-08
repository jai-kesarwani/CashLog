// Account Section Management
document.addEventListener('DOMContentLoaded', function() {
    // Get current user
    const loggedInUser = localStorage.getItem('loggedInUser');
    let currentUser = null;
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
    }

    // Currency symbols mapping
    const currencySymbols = {
        'USD': '$',
        'INR': '₹',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'RUB': '₽',
        'CNY': '¥',
        'KRW': '₩',
        'SAR': '﷼',
        'AED': 'د.إ',
        'ZAR': 'R',
        'PHP': '₱'
    };

    // Get selected currency from localStorage
    function getSelectedCurrency() {
        return localStorage.getItem('selectedCurrency') || 'INR';
    }

    // Get currency symbol
    function getCurrencySymbol(currency) {
        return currencySymbols[currency] || '₹';
    }

    // Format amount with currency
    function formatCurrency(amount) {
        const currency = getSelectedCurrency();
        const symbol = getCurrencySymbol(currency);
        return `${symbol}${amount.toFixed(2)}`;
    }

    // Load user data and initialize UI
    function loadUser() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            updateProfileUI(currentUser);
        }
    }

    // Central function to update profile UI across the app
    function updateProfileUI(user) {
        if (!user) return;

        // Update profile card name
        const profileNameDisplay = document.getElementById('profile-name-display');
        if (profileNameDisplay) {
            profileNameDisplay.textContent = user.name || 'User';
        }

        // Update personal info section
        const infoName = document.getElementById('info-name');
        const infoEmail = document.getElementById('info-email');
        const infoPhone = document.getElementById('info-phone');
        const infoCountry = document.getElementById('info-country');

        if (infoName) infoName.textContent = user.name || 'Not set';
        if (infoEmail) infoEmail.textContent = user.email || 'Not set';
        if (infoPhone) infoPhone.textContent = user.phone || 'Not set';
        if (infoCountry) infoCountry.textContent = user.country || 'Not set';

        // Update sidebar welcome message
        const welcomeMsg = document.getElementById('welcome-message');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome, ${user.name} 👋`;
        }

        // Update profile picture
        const savedProfilePic = localStorage.getItem('profilePicture');
        if (savedProfilePic) {
            updateProfilePicture(savedProfilePic);
            updateSidebarAvatar(savedProfilePic);
        }

        // Update currency selection
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            const savedCurrency = getSelectedCurrency();
            currencySelect.value = savedCurrency;
        }
    }

    // Update profile picture display
    function updateProfilePicture(imageSrc) {
        const preview = document.getElementById('profile-picture-preview');
        const img = document.getElementById('profile-picture-img');
        const icon = document.getElementById('profile-picture-icon');
        
        if (preview && img && icon) {
            img.src = imageSrc;
            img.style.display = 'block';
            icon.style.display = 'none';
        }
    }

    // Update Sidebar Avatar
    function updateSidebarAvatar(imageSrc) {
        const sidebarAvatar = document.getElementById('user-avatar');
        if (sidebarAvatar) {
            sidebarAvatar.innerHTML = `<img src="${imageSrc}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }

    // Initialize Account Section
    function initAccountSection() {
        loadUser();
    }

    // Edit Profile Modal
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', () => {
            closeModal('edit-profile-modal');
        });
    }

    function openEditProfileModal() {
        if (!currentUser) return;

        // Populate form with current user data
        document.getElementById('edit-name').value = currentUser.name || '';
        document.getElementById('edit-email').value = currentUser.email || '';
        document.getElementById('edit-phone').value = currentUser.phone || '';
        document.getElementById('edit-country').value = currentUser.country || '';

        // Load current profile picture
        const savedProfilePic = localStorage.getItem('profilePicture');
        if (savedProfilePic) {
            const previewImg = document.getElementById('edit-profile-picture-img');
            const icon = document.getElementById('edit-profile-picture-icon');
            previewImg.src = savedProfilePic;
            previewImg.style.display = 'block';
            icon.style.display = 'none';
        }

        // Load saved avatar selection in modal
        const savedAvatar = localStorage.getItem('selectedAvatar');
        if (savedAvatar) {
            const avatarOption = document.querySelector(`#edit-avatar-grid .avatar-option[data-avatar="${savedAvatar}"]`);
            if (avatarOption) {
                avatarOption.classList.add('selected');
            }
        }

        // Show modal
        editProfileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Profile Picture Upload in Edit Modal
    const editUploadBtn = document.getElementById('edit-upload-picture-btn');
    const editFileInput = document.getElementById('edit-profile-picture-upload');

    if (editUploadBtn && editFileInput) {
        editUploadBtn.addEventListener('click', () => {
            editFileInput.click();
        });

        editFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    
                    const previewImg = document.getElementById('edit-profile-picture-img');
                    const icon = document.getElementById('edit-profile-picture-icon');
                    previewImg.src = base64;
                    previewImg.style.display = 'block';
                    icon.style.display = 'none';
                    
                    // Remove selected class from all avatars
                    document.querySelectorAll('#edit-avatar-grid .avatar-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Avatar Selection in Edit Modal
    const editAvatarOptions = document.querySelectorAll('#edit-avatar-grid .avatar-option');
    editAvatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            editAvatarOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const img = option.querySelector('img');
            if (img && img.src) {
                const previewImg = document.getElementById('edit-profile-picture-img');
                const icon = document.getElementById('edit-profile-picture-icon');
                previewImg.src = img.src;
                previewImg.style.display = 'block';
                icon.style.display = 'none';
            }
        });
    });

    // Handle Edit Profile Form Submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('edit-name').value.trim();
            const email = document.getElementById('edit-email').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            const country = document.getElementById('edit-country').value;
            
            const errorDiv = document.getElementById('edit-profile-error');
            const successDiv = document.getElementById('edit-profile-success');
            
            // Validation
            if (!name || !email) {
                errorDiv.textContent = 'Name and Email are required.';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorDiv.textContent = 'Please enter a valid email address.';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                return;
            }
            
            // Phone validation (optional but if provided, should be valid)
            if (phone && phone.length < 10) {
                errorDiv.textContent = 'Phone number should be at least 10 digits.';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                return;
            }
            
            // Update user data
            currentUser.name = name;
            currentUser.email = email;
            currentUser.phone = phone;
            currentUser.country = country;
            
            localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
            
            // Update users array
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Save profile picture
            const previewImg = document.getElementById('edit-profile-picture-img');
            if (previewImg && previewImg.src && previewImg.style.display !== 'none') {
                localStorage.setItem('profilePicture', previewImg.src);
                updateProfilePicture(previewImg.src);
                updateSidebarAvatar(previewImg.src);
            }
            
            // Save avatar selection
            const selectedAvatar = document.querySelector('#edit-avatar-grid .avatar-option.selected');
            if (selectedAvatar) {
                localStorage.setItem('selectedAvatar', selectedAvatar.getAttribute('data-avatar'));
            }
            
            // Update UI across app
            updateProfileUI(currentUser);
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: { user: currentUser }
            }));
            
            // Show success message
            errorDiv.style.display = 'none';
            successDiv.textContent = 'Profile updated successfully!';
            successDiv.style.display = 'block';
            
            // Close modal after delay
            setTimeout(() => {
                closeModal('edit-profile-modal');
                successDiv.style.display = 'none';
            }, 1500);
        });
    }

    // Close modal helper
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Currency Selection
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            const selectedCurrency = e.target.value;
            localStorage.setItem('selectedCurrency', selectedCurrency);
            
            // Update all currency displays across the app
            updateAllCurrencyDisplays();
        });
    }

    // Update All Currency Displays
    function updateAllCurrencyDisplays() {
        const currency = getSelectedCurrency();
        const symbol = getCurrencySymbol(currency);
        
        // Trigger a custom event for other scripts to update their displays
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { currency, symbol }
        }));
        
        // Force re-render of all sections that display currency
        if (window.renderBills) window.renderBills();
        if (window.updateSummaryCards) window.updateSummaryCards();
        if (window.renderTransactionsTable) window.renderTransactionsTable();
        if (window.renderRecentTransactions) window.renderRecentTransactions();
        if (window.renderCategories) window.renderCategories();
        if (window.renderGoals) window.renderGoals();
    }

    // Password Change
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const passwordForm = document.getElementById('password-form');
    const savePasswordBtn = document.getElementById('save-password-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const passwordError = document.getElementById('password-error');
    const passwordSuccess = document.getElementById('password-success');

    if (togglePasswordBtn && passwordForm) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordForm.style.display === 'none') {
                passwordForm.style.display = 'block';
                passwordForm.style.animation = 'slideDown 0.3s ease';
            } else {
                passwordForm.style.display = 'none';
            }
        });
    }

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', () => {
            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Hide previous messages
            passwordError.style.display = 'none';
            passwordSuccess.style.display = 'none';

            // Validation
            if (!oldPassword || !newPassword || !confirmPassword) {
                passwordError.textContent = 'Please fill in all fields.';
                passwordError.style.display = 'block';
                return;
            }

            // Check old password
            const savedPassword = localStorage.getItem('userPassword') || currentUser?.password;
            if (oldPassword !== savedPassword) {
                passwordError.textContent = 'Current password is incorrect.';
                passwordError.style.display = 'block';
                return;
            }

            // Check minimum password length
            if (newPassword.length < 6) {
                passwordError.textContent = 'New password must be at least 6 characters long.';
                passwordError.style.display = 'block';
                return;
            }

            // Check if new passwords match
            if (newPassword !== confirmPassword) {
                passwordError.textContent = 'New passwords do not match.';
                passwordError.style.display = 'block';
                return;
            }

            // Save new password
            localStorage.setItem('userPassword', newPassword);
            if (currentUser) {
                currentUser.password = newPassword;
                localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
                
                // Update users array
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex].password = newPassword;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }

            // Show success message
            passwordSuccess.style.display = 'block';
            
            // Clear form
            document.getElementById('old-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';

            // Hide form after 2 seconds
            setTimeout(() => {
                passwordForm.style.display = 'none';
                passwordSuccess.style.display = 'none';
            }, 2000);
        });
    }

    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', () => {
            passwordForm.style.display = 'none';
            passwordError.style.display = 'none';
            passwordSuccess.style.display = 'none';
            document.getElementById('old-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        });
    }

    // Split Bill Modal Cancel Button
    const cancelBillBtn = document.getElementById('cancel-bill-btn');
    if (cancelBillBtn) {
        cancelBillBtn.addEventListener('click', () => {
            closeModal('bill-modal');
        });
    }

    // Listen for profile updates from other parts of the app
    window.addEventListener('profileUpdated', (e) => {
        if (e.detail.user) {
            currentUser = e.detail.user;
            updateProfileUI(currentUser);
        }
    });

    // Initialize on load
    initAccountSection();
    
    // Expose functions globally
    window.getSelectedCurrency = getSelectedCurrency;
    window.getCurrencySymbol = getCurrencySymbol;
    window.formatCurrency = formatCurrency;
    window.updateProfileUI = updateProfileUI;
    window.loadUser = loadUser;
});

