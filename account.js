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

    // Initialize Account Section
    function initAccountSection() {
        if (!currentUser) return;

        // Load saved profile picture
        const savedProfilePic = localStorage.getItem('profilePicture');
        if (savedProfilePic) {
            const preview = document.getElementById('profile-picture-preview');
            const img = document.getElementById('profile-picture-img');
            const icon = document.getElementById('profile-picture-icon');
            if (preview && img && icon) {
                img.src = savedProfilePic;
                img.style.display = 'block';
                icon.style.display = 'none';
            }
        }

        // Update all UI elements
        updateProfileUI(currentUser);

        // Load saved currency
        const currencySelect = document.getElementById('currency-select');
        if (currencySelect) {
            const savedCurrency = getSelectedCurrency();
            currencySelect.value = savedCurrency;
        }
    }

    // Central UI Update Function - Updates all profile-related UI elements
    function updateProfileUI(user) {
        if (!user) return;

        // Update Profile Card
        const profileNameDisplay = document.getElementById('profile-name-display');
        if (profileNameDisplay && user.name) {
            profileNameDisplay.textContent = user.name;
        }

        // Update Profile Picture in card
        const profilePreview = document.getElementById('profile-picture-preview');
        const profileImg = document.getElementById('profile-picture-img');
        const profileIcon = document.getElementById('profile-picture-icon');
        const savedProfilePic = localStorage.getItem('profilePicture');
        if (savedProfilePic && profilePreview && profileImg && profileIcon) {
            profileImg.src = savedProfilePic;
            profileImg.style.display = 'block';
            profileIcon.style.display = 'none';
        }

        // Update Personal Info Section
        const infoName = document.getElementById('info-name');
        const infoEmail = document.getElementById('info-email');
        const infoPhone = document.getElementById('info-phone');
        const infoCountry = document.getElementById('info-country');

        if (infoName && user.name) {
            infoName.textContent = user.name;
        }

        if (infoEmail && user.email) {
            infoEmail.textContent = user.email;
        }

        if (infoPhone) {
            infoPhone.textContent = user.phone || 'Not set';
        }

        if (infoCountry) {
            infoCountry.textContent = user.country || 'Not set';
        }

        // Update Sidebar Welcome Message
        const welcomeMsg = document.getElementById('welcome-message');
        if (welcomeMsg && user.name) {
            welcomeMsg.textContent = `Welcome, ${user.name} 👋`;
        }

        // Update Sidebar Avatar
        const sidebarAvatar = document.getElementById('user-avatar');
        if (sidebarAvatar && savedProfilePic) {
            sidebarAvatar.innerHTML = `<img src="${savedProfilePic}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }

    // Load User Data from Storage
    function loadUser() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            updateProfileUI(currentUser);
        }
        return currentUser;
    }

    // Update Profile Card (legacy - kept for compatibility)
    function updateProfileCard() {
        updateProfileUI(currentUser);
    }

    // Update Personal Info Section (legacy - kept for compatibility)
    function updatePersonalInfo() {
        updateProfileUI(currentUser);
    }

    // Edit Profile Button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const cancelEditProfileBtn = document.getElementById('cancel-edit-profile');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', () => {
            // Populate form with current data
            document.getElementById('edit-profile-name').value = currentUser.name || '';
            document.getElementById('edit-profile-email').value = currentUser.email || '';
            document.getElementById('edit-profile-phone').value = currentUser.phone || '';
            document.getElementById('edit-profile-country').value = currentUser.country || '';

            // Load current profile picture in modal
            const savedProfilePic = localStorage.getItem('profilePicture');
            const editPreview = document.getElementById('edit-profile-preview');
            const editImg = document.getElementById('edit-profile-img');
            const editIcon = document.getElementById('edit-profile-icon');

            if (savedProfilePic && editPreview && editImg && editIcon) {
                editImg.src = savedProfilePic;
                editImg.style.display = 'block';
                editIcon.style.display = 'none';
            }

            // Load avatar selection in modal
            const savedAvatar = localStorage.getItem('selectedAvatar');
            document.querySelectorAll('#edit-avatar-grid .avatar-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.getAttribute('data-avatar') === savedAvatar) {
                    opt.classList.add('selected');
                }
            });

            editProfileModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
            document.body.style.overflow = '';
            document.getElementById('edit-profile-error').style.display = 'none';
        });
    }

    // Close modal when clicking outside
    if (editProfileModal) {
        editProfileModal.addEventListener('click', (e) => {
            if (e.target === editProfileModal) {
                editProfileModal.style.display = 'none';
                document.body.style.overflow = '';
                document.getElementById('edit-profile-error').style.display = 'none';
            }
        });
    }

    // Close modal with X button
    const editProfileCloseBtn = editProfileModal ? editProfileModal.querySelector('.close-modal') : null;
    if (editProfileCloseBtn) {
        editProfileCloseBtn.addEventListener('click', () => {
            editProfileModal.style.display = 'none';
            document.body.style.overflow = '';
            document.getElementById('edit-profile-error').style.display = 'none';
        });
    }

    // Edit Profile Form Submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('edit-profile-name').value.trim();
            const email = document.getElementById('edit-profile-email').value.trim();
            const phone = document.getElementById('edit-profile-phone').value.trim();
            const country = document.getElementById('edit-profile-country').value;
            const errorDiv = document.getElementById('edit-profile-error');

            // Validation
            if (!name || !email) {
                errorDiv.textContent = 'Name and email are required.';
                errorDiv.style.display = 'block';
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorDiv.textContent = 'Please enter a valid email address.';
                errorDiv.style.display = 'block';
                return;
            }

            // Phone validation (if provided)
            if (phone && phone.length < 10) {
                errorDiv.textContent = 'Phone number must be at least 10 digits.';
                errorDiv.style.display = 'block';
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
                users[userIndex].name = name;
                users[userIndex].email = email;
                users[userIndex].phone = phone;
                users[userIndex].country = country;
                localStorage.setItem('users', JSON.stringify(users));
            }

            // Update UI immediately with central function
            updateProfileUI(currentUser);

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('nameChanged', {
                detail: { newName: name }
            }));

            // Close modal
            editProfileModal.style.display = 'none';
            document.body.style.overflow = '';
            errorDiv.style.display = 'none';

            // Show success toast
            if (window.showToast) {
                window.showToast('Profile updated successfully!', 'success');
            }
        });
    }

    // Edit Profile Avatar Upload
    const editUploadBtn = document.getElementById('edit-upload-btn');
    const editFileInput = document.getElementById('edit-profile-upload');

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
                    localStorage.setItem('profilePicture', base64);
                    localStorage.removeItem('selectedAvatar');
                    
                    const preview = document.getElementById('edit-profile-preview');
                    const img = document.getElementById('edit-profile-img');
                    const icon = document.getElementById('edit-profile-icon');
                    
                    img.src = base64;
                    img.style.display = 'block';
                    icon.style.display = 'none';
                    
                    // Remove selected class from all avatars
                    document.querySelectorAll('#edit-avatar-grid .avatar-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Update main profile preview
                    updateProfileUI(currentUser);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Edit Profile Avatar Selection
    const editAvatarOptions = document.querySelectorAll('#edit-avatar-grid .avatar-option');
    editAvatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all
            editAvatarOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected to clicked
            option.classList.add('selected');

            const avatarName = option.getAttribute('data-avatar');
            const avatarPath = option.getAttribute('data-avatar-path') || '';
            localStorage.setItem('selectedAvatar', avatarName);
            localStorage.setItem('selectedAvatarPath', avatarPath);
            localStorage.removeItem('profilePicture');

            // Get avatar image source
            const img = option.querySelector('img');
            if (img && img.src) {
                const preview = document.getElementById('edit-profile-preview');
                const previewImg = document.getElementById('edit-profile-img');
                const icon = document.getElementById('edit-profile-icon');

                previewImg.src = img.src;
                previewImg.style.display = 'block';
                icon.style.display = 'none';

                // Store the avatar path
                localStorage.setItem('profilePicture', img.src);

                // Update main profile preview using central function
                updateProfileUI(currentUser);
            }
        });
    });

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

            // Check minimum length
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

    // Initialize on load
    initAccountSection();

    // Expose functions globally for use in other parts of the app
    window.getSelectedCurrency = getSelectedCurrency;
    window.getCurrencySymbol = getCurrencySymbol;
    window.formatCurrency = formatCurrency;
    window.updateProfileUI = updateProfileUI;
    window.loadUser = loadUser;
});

