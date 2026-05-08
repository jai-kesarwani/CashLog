document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeToggle = document.getElementById('theme-icon');
    const navItems = document.querySelectorAll('.main-nav li');
    const contentSections = document.querySelectorAll('.content-section');

    // Modal elements
    const transactionModal = document.getElementById('transaction-modal');
    const categoryModal = document.getElementById('category-modal');
    const goalModal = document.getElementById('goal-modal');
    const goalUpdateModal = document.getElementById('goal-update-modal');
    const billModal = document.getElementById('bill-modal');
    const editProfileModal = document.getElementById('edit-profile-modal');
    // const exportModal = document.getElementById('export-modal');
    const addTransactionBtn = document.getElementById('add-transaction');
    const addCategoryBtn = document.getElementById('add-category');
    const addGoalBtn = document.getElementById('add-goal');
    const addBillBtn = document.getElementById('add-bill');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Form elements
    const transactionForm = document.getElementById('transaction-form');
    const categoryForm = document.getElementById('category-form');
    const goalForm = document.getElementById('goal-form');
    const goalUpdateForm = document.getElementById('goal-update-form');
    const billForm = document.getElementById('bill-form');
    
    // Chart elements
    let categoryChart, monthlyChart, incomeExpenseChart, trendsChart;
    
    // Current user
    let currentUser = null;
    let currentGoalId = null;
    
    // Load current user from localStorage
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
    }

    // Sidebar Logout button
    
    const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', () => {
        // Clear login/session
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');

        // Redirect to login
        window.location.href = 'login.html';
    });
}
    
    // App state
    let state = {
        transactions: [],
        categories: [
            { id: 1, name: 'Food', budget: 6000, icon: 'fa-utensils', color: '#FF6384' },
            { id: 2, name: 'Transportation', budget: 3000, icon: 'fa-car', color: '#36A2EB' },
            { id: 3, name: 'Housing', budget: 12000, icon: 'fa-home', color: '#FFCE56' },
            { id: 4, name: 'Entertainment', budget: 2000, icon: 'fa-film', color: '#4BC0C0' },
            { id: 5, name: 'Shopping', budget: 3000, icon: 'fa-shopping-cart', color: '#9966FF' },
            { id: 6, name: 'Income', budget: 0, icon: 'fa-money-bill-wave', color: '#00CC99' },
            { id: 7, name: 'Investment', budget: 20000, icon: 'fa-chart-line', color: '#8A2BE2' }
        ],
        goals: [],
        splitBills: [],
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    };
    
    function updateUserDisplay() {
        if (currentUser) {
            document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name} 👋`;
            document.getElementById('account-name').textContent = currentUser.name;
            document.getElementById('account-email').textContent = currentUser.email;
        }
    }
    
    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        if (type === 'success') {
            toastIcon.className = 'toast-icon fas fa-check-circle';
        } else if (type === 'error') {
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
        } else if (type === 'warning') {
            toastIcon.className = 'toast-icon fas fa-exclamation-triangle';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Listen for name changes
    window.addEventListener('nameChanged', (e) => {
        const newName = e.detail.newName;
        updateUserDisplay();
    });
    
    // Helper function to get currency symbol
    function getCurrencySymbol() {
        if (window.getCurrencySymbol) {
            const currency = window.getSelectedCurrency ? window.getSelectedCurrency() : 'INR';
            return window.getCurrencySymbol(currency);
        }
        return '₹';
    }
    
    // Helper function to format currency
    function formatCurrencyAmount(amount) {
        if (window.formatCurrency) {
            return window.formatCurrency(amount);
        }
        return formatCurrencyAmount(amount);
    }
    
    // Initialize the app
    function init() {
        if (!currentUser) return;
        loadData();
        setupEventListeners();
        renderCategories();
        updateSummaryCards();
        renderRecentTransactions();
        renderTransactionsTable();
        renderCharts();
        renderBills();
        setCurrentMonthYear();
        updateUserDisplay();
        
        // Listen for currency changes
        window.addEventListener('currencyChanged', () => {
            updateSummaryCards();
            renderRecentTransactions();
            renderTransactionsTable();
            renderCategories();
            renderGoals();
            renderBills();
        });
    // end of init
    }
    
    // Initialize on page load
    init();
    
    // Load data from localStorage
    function loadData() {
        const userId = currentUser ? currentUser.id : 'default';
        const savedState = localStorage.getItem(`budgetPlannerState_${userId}`);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            state.transactions = parsed.transactions || [];
            state.categories = parsed.categories || state.categories;
            state.goals = parsed.goals || [];
            state.splitBills = parsed.splitBills || [];
            
            // Convert date strings back to Date objects for transactions
            state.transactions.forEach(trans => {
                trans.date = new Date(trans.date);
            });
            // Convert date strings back to Date objects for goals
            state.goals.forEach(goal => {
                goal.date = new Date(goal.date);
                if (!goal.history) goal.history = [];
                goal.history.forEach(h => {
                    h.date = new Date(h.date);
                });
            });
            // Convert date strings back to Date objects for split bills
            state.splitBills.forEach(bill => {
                if (bill.createdAt && typeof bill.createdAt === 'string') {
                    bill.createdAt = new Date(bill.createdAt);
                }
            });
        }
    }
    
    // Save data to localStorage
    function saveData() {
        if (!currentUser) return;
        const userId = currentUser.id;
        
        // Convert Date objects to strings for serialization
        const transactionsWithStringDates = state.transactions.map(trans => ({
            ...trans,
            date: trans.date.toISOString()
        }));
        
        const goalsWithStringDates = state.goals.map(goal => ({
            ...goal,
            date: goal.date.toISOString(),
            history: goal.history ? goal.history.map(h => ({
                ...h,
                date: h.date.toISOString()
            })) : []
        }));
        
        const splitBillsWithStringDates = state.splitBills.map(bill => ({
            ...bill,
            createdAt: bill.createdAt instanceof Date ? bill.createdAt.toISOString() : bill.createdAt
        }));
        
        const stateToSave = {
            transactions: transactionsWithStringDates,
            categories: state.categories,
            goals: goalsWithStringDates,
            splitBills: splitBillsWithStringDates
        };
        
        localStorage.setItem(`budgetPlannerState_${userId}`, JSON.stringify(stateToSave));
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const section = item.getAttribute('data-section');
                contentSections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(section).classList.add('active');
                
                // Render specific content when section changes
                if (section === 'transactions') {
                    renderTransactionsTable();
                } else if (section === 'budgets') {
                    renderCategories();
                } else if (section === 'reports') {
                    renderCharts();
                } else if (section === 'goals') {
                    renderGoals();
                } else if (section === 'split-bills') {
                    renderBills();
                } else if (section === 'account') {
                    updateUserDisplay();
                }
            });
        });
        
        // Modal open buttons
        if (addTransactionBtn) addTransactionBtn.addEventListener('click', () => openModal('transaction'));
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openModal('category'));
        if (addGoalBtn) addGoalBtn.addEventListener('click', () => openModal('goal'));
        if (addBillBtn) addBillBtn.addEventListener('click', () => openModal('bill'));
        
        // Modal close buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal();
            }
        });
        
        // Form submissions
        if (transactionForm) transactionForm.addEventListener('submit', handleTransactionSubmit);
        if (categoryForm) categoryForm.addEventListener('submit', handleCategorySubmit);
        if (goalForm) goalForm.addEventListener('submit', handleGoalSubmit);
        if (goalUpdateForm) goalUpdateForm.addEventListener('submit', handleGoalUpdateSubmit);
        if (billForm) billForm.addEventListener('submit', handleBillSubmit);
        
        // Bill split type change is now handled in prepareBillModal
        
        // Export buttons
        const downloadPdfBtn = document.getElementById('download-pdf');
        const emailPdfBtn = document.getElementById('email-pdf');
        if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', handleDownloadPDF);
        if (emailPdfBtn) emailPdfBtn.addEventListener('click', handleEmailPDF);
        
        // Report period navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            if (state.currentMonth === 0) {
                state.currentMonth = 11;
                state.currentYear--;
            } else {
                state.currentMonth--;
            }
            setCurrentMonthYear();
            renderCharts();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            if (state.currentMonth === 11) {
                state.currentMonth = 0;
                state.currentYear++;
            } else {
                state.currentMonth++;
            }
            setCurrentMonthYear();
            renderCharts();
        });
        
        // Filter changes
        document.getElementById('transaction-type').addEventListener('change', renderTransactionsTable);
        document.getElementById('transaction-category').addEventListener('change', renderTransactionsTable);
        document.getElementById('transaction-month').addEventListener('change', renderTransactionsTable);
    }
    
    // Toggle between light and dark theme
    function toggleTheme() {
        const body = document.body;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        }
    }
    
    // Open modal
    function openModal(type) {
        closeModal(); // Close any open modal first
        
        if (type === 'transaction') {
            prepareTransactionModal();
            transactionModal.classList.add('active');
            document.body.classList.add('modal-open');
        } else if (type === 'category') {
            prepareCategoryModal();
            categoryModal.classList.add('active');
            document.body.classList.add('modal-open');
        } else if (type === 'goal') {
            prepareGoalModal();
            goalModal.classList.add('active');
            document.body.classList.add('modal-open');
        } else if (type === 'goal-update') {
            goalUpdateModal.classList.add('active');
            document.body.classList.add('modal-open');
        } else if (type === 'bill') {
            prepareBillModal();
            billModal.classList.add('active');
            document.body.classList.add('modal-open');
        } else if (type === 'export') {
            prepareExportModal();
            exportModal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
    
    // Close modal
    function closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
    
    // Prepare transaction modal
    function prepareTransactionModal() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trans-date').value = today;
        
        // Populate category dropdown
        const categorySelect = document.getElementById('trans-category');
        categorySelect.innerHTML = '';
        
        state.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Prepare category modal
    function prepareCategoryModal() {
        document.getElementById('category-name').value = '';
        document.getElementById('category-budget').value = '';
        document.getElementById('category-icon').value = 'fa-utensils';
    }
    
    // Prepare goal modal
    function prepareGoalModal() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthFormatted = nextMonth.toISOString().split('T')[0];
        
        document.getElementById('goal-name').value = '';
        document.getElementById('goal-target').value = '';
        document.getElementById('goal-saved').value = '0';
        document.getElementById('goal-date').value = nextMonthFormatted;
    }
    
    // Handle transaction form submission
    function handleTransactionSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('trans-type').value;
        const amount = parseFloat(document.getElementById('trans-amount').value);
        const description = document.getElementById('trans-description').value;
        const categoryId = parseInt(document.getElementById('trans-category').value);
        const date = new Date(document.getElementById('trans-date').value);
        
        const category = state.categories.find(cat => cat.id === categoryId);
        
        const newTransaction = {
            id: Date.now(),
            type,
            amount,
            description,
            category: category.name,
            categoryId,
            date,
            icon: category.icon
        };
        
        state.transactions.push(newTransaction);
        saveData();
        
        // Update UI
        closeModal();
        updateSummaryCards();
        renderRecentTransactions();
        renderTransactionsTable();
        renderCharts();
        
        // Reset form
        transactionForm.reset();
    }
    
    // Handle category form submission
    function handleCategorySubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('category-name').value;
        const budget = parseFloat(document.getElementById('category-budget').value);
        const icon = document.getElementById('category-icon').value;
        
        // Generate a random color for the category
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#00CC99', '#FF9F40', '#8A2BE2'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const newCategory = {
            id: Date.now(),
            name,
            budget,
            icon,
            color
        };
        
        state.categories.push(newCategory);
        saveData();
        
        // Update UI
        closeModal();
        renderCategories();
        renderCharts();
        
        // Reset form
        categoryForm.reset();
    }
    
    // Handle goal form submission
    function handleGoalSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('goal-name').value;
        const target = parseFloat(document.getElementById('goal-target').value);
        const saved = parseFloat(document.getElementById('goal-saved').value);
        const date = new Date(document.getElementById('goal-date').value);
        
        const newGoal = {
            id: Date.now(),
            name,
            target,
            saved,
            date,
            history: []
        };
        
        // If initial saved amount > 0, add to history
        if (saved > 0) {
            newGoal.history.push({
                date: new Date(),
                amount: saved
            });
        }
        
        state.goals.push(newGoal);
        saveData();
        
        // Update UI
        closeModal();
        renderGoals();
        
        // Reset form
        goalForm.reset();
    }
    
    // Handle goal update form submission
    function handleGoalUpdateSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('goal-update-amount').value);
        const goal = state.goals.find(g => g.id === currentGoalId);
        
        if (!goal) return;
        
        // Add to history
        if (!goal.history) goal.history = [];
        goal.history.push({
            date: new Date(),
            amount: amount
        });
        
        // Update saved amount
        goal.saved += amount;
        
        saveData();
        
        // Update UI
        closeModal();
        renderGoals();
        
        // Reset form
        goalUpdateForm.reset();
        currentGoalId = null;
    }
    
    // Update summary cards
    function updateSummaryCards() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Filter transactions for current month
        const monthlyTransactions = state.transactions.filter(trans => {
            return trans.date.getMonth() === currentMonth && trans.date.getFullYear() === currentYear;
        });
        
        // Calculate totals
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
        
        // Update DOM with currency formatting
        const symbol = getCurrencySymbol();
        document.getElementById('total-balance').textContent = formatCurrencyAmount(balance);
        document.getElementById('monthly-income').textContent = formatCurrencyAmount(income);
        document.getElementById('monthly-expenses').textContent = formatCurrencyAmount(expenses);
        document.getElementById('savings-rate').textContent = `${savingsRate}%`;
        
        // Update change indicator
        const changeElement = document.querySelector('#total-balance + .change');
        if (balance > 0) {
            changeElement.classList.add('positive');
            changeElement.classList.remove('negative');
        } else if (balance < 0) {
            changeElement.classList.add('negative');
            changeElement.classList.remove('positive');
        } else {
            changeElement.classList.remove('positive', 'negative');
        }
    }
    
    // Render recent transactions
    function renderRecentTransactions() {
        const container = document.getElementById('recent-transactions');
        container.innerHTML = '';
        
        // Get 5 most recent transactions
        const recentTransactions = [...state.transactions]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);
        
        if (recentTransactions.length === 0) {
            container.innerHTML = '<p class="no-transactions">No transactions yet. Add your first transaction!</p>';
            return;
        }
        
        recentTransactions.forEach(trans => {
            const transactionEl = document.createElement('div');
            transactionEl.className = 'transaction-item';
            
            const category = state.categories.find(cat => cat.id === trans.categoryId);
            
            transactionEl.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas ${trans.icon || 'fa-money-bill-wave'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${category?.name || trans.category} • ${formatDate(trans.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${trans.type}">
                    ${trans.type === 'income' ? '+' : '-'}${formatCurrencyAmount(trans.amount)}
                </div>
            `;
            
            container.appendChild(transactionEl);
        });
    }
    
    // Render transactions table
    function renderTransactionsTable() {
        const container = document.getElementById('transactions-list');
        container.innerHTML = '';
        
        const typeFilter = document.getElementById('transaction-type').value;
        const categoryFilter = document.getElementById('transaction-category').value;
        const monthFilter = document.getElementById('transaction-month').value;
        
        // Populate category filter
        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect.options.length <= 1) { // Only "All Categories" option
            state.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
        
        // Populate month filter
        const monthSelect = document.getElementById('transaction-month');
        if (monthSelect.options.length <= 1) { // Only "All Months" option
            const months = [];
            state.transactions.forEach(trans => {
                const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
                if (!months.includes(monthYear)) {
                    months.push(monthYear);
                    
                    const option = document.createElement('option');
                    option.value = monthYear;
                    option.textContent = `${getMonthName(trans.date.getMonth())} ${trans.date.getFullYear()}`;
                    monthSelect.appendChild(option);
                }
            });
        }
        
        // Filter transactions
        let filteredTransactions = [...state.transactions];
        
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(trans => trans.type === typeFilter);
        }
        
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(trans => trans.categoryId === parseInt(categoryFilter));
        }
        
        if (monthFilter !== 'all') {
            const [year, month] = monthFilter.split('-').map(Number);
            filteredTransactions = filteredTransactions.filter(trans => {
                return trans.date.getFullYear() === year && trans.date.getMonth() === month;
            });
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => b.date - a.date);
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="no-transactions">No transactions found matching your filters.</td>
                </tr>
            `;
            return;
        }
        
        filteredTransactions.forEach(trans => {
            const row = document.createElement('tr');
            
            const category = state.categories.find(cat => cat.id === trans.categoryId);
            
            row.innerHTML = `
                <td>${formatDate(trans.date)}</td>
                <td>${trans.description}</td>
                <td>
                    <i class="fas ${trans.icon || 'fa-money-bill-wave'}"></i>
                    ${category?.name || trans.category}
                </td>
                <td>
                    <span class="badge ${trans.type === 'income' ? 'income' : 'expense'}">
                        ${trans.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                </td>
                <td class="${trans.type === 'income' ? 'income' : 'expense'}">
                    ${trans.type === 'income' ? '+' : '-'}${formatCurrencyAmount(trans.amount)}
                </td>
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${trans.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${trans.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            container.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                editTransaction(id);
            });
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                deleteTransaction(id);
            });
        });
    }
    
    // Edit transaction
    function editTransaction(id) {
        const transaction = state.transactions.find(trans => trans.id === id);
        if (!transaction) return;
        
        openModal('transaction');
        
        // Fill form with transaction data
        document.getElementById('trans-type').value = transaction.type;
        document.getElementById('trans-amount').value = transaction.amount;
        document.getElementById('trans-description').value = transaction.description;
        document.getElementById('trans-category').value = transaction.categoryId;
        document.getElementById('trans-date').value = transaction.date.toISOString().split('T')[0];
        
        // Modify form submission to handle edit
        transactionForm.removeEventListener('submit', handleTransactionSubmit);
        transactionForm.addEventListener('submit', function handleEditSubmit(e) {
            e.preventDefault();
            
            // Update transaction
            transaction.type = document.getElementById('trans-type').value;
            transaction.amount = parseFloat(document.getElementById('trans-amount').value);
            transaction.description = document.getElementById('trans-description').value;
            transaction.categoryId = parseInt(document.getElementById('trans-category').value);
            transaction.date = new Date(document.getElementById('trans-date').value);
            
            const category = state.categories.find(cat => cat.id === transaction.categoryId);
            if (category) {
                transaction.category = category.name;
                transaction.icon = category.icon;
            }
            
            saveData();
            
            // Update UI
            closeModal();
            updateSummaryCards();
            renderRecentTransactions();
            renderTransactionsTable();
            renderCharts();
            
            // Reset form and event listener
            transactionForm.reset();
            transactionForm.removeEventListener('submit', handleEditSubmit);
            transactionForm.addEventListener('submit', handleTransactionSubmit);
        });
    }
    
    // Delete transaction
    function deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            state.transactions = state.transactions.filter(trans => trans.id !== id);
            saveData();
            
            // Update UI
            updateSummaryCards();
            renderRecentTransactions();
            renderTransactionsTable();
            renderCharts();
        }
    }
    
    // Render budget categories
    function renderCategories() {
        const container = document.getElementById('budget-categories');
        container.innerHTML = '';
        
        if (state.categories.length === 0) {
            container.innerHTML = '<p class="no-categories">No categories yet. Add your first category!</p>';
            return;
        }
        
        // Calculate spent amounts per category
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const categorySpending = {};
        
        state.transactions
            .filter(trans => trans.type === 'expense' && trans.date.getMonth() === currentMonth && trans.date.getFullYear() === currentYear)
            .forEach(trans => {
                if (!categorySpending[trans.categoryId]) {
                    categorySpending[trans.categoryId] = 0;
                }
                categorySpending[trans.categoryId] += trans.amount;
            });
            
        state.categories.forEach(category => {
            if (category.name === 'Income') return; // Skip income category
            
            const spent = categorySpending[category.id] || 0;
            const percentage = category.budget > 0 ? Math.min((spent / category.budget) * 100, 100) : 0;
            const remaining = category.budget - spent;
            
            const categoryEl = document.createElement('div');
            categoryEl.className = 'budget-category';
            categoryEl.innerHTML = `
                <div class="budget-category-header">
                    <div class="budget-icon" style="background-color: ${category.color || '#4361ee'}">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="budget-title">
                        <h3>${category.name}</h3>
                        <p>Budget: ${formatCurrencyAmount(category.budget)}</p>
                    </div>
                </div>
                <div class="budget-amount">
                    Spent: ${formatCurrencyAmount(spent)} / Remaining: ${formatCurrencyAmount(remaining)}
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar" style="width: ${percentage}%; background-color: ${category.color || '#4361ee'}"></div>
                </div>
                <div class="budget-stats">
                    <span>${percentage.toFixed(0)}% of budget</span>
                    <span>${formatCurrencyAmount(remaining)} left</span>
                </div>
                <button class="edit-budget-btn" data-id="${category.id}"><i class="fa-solid fa-pen"></i> Edit</button>
            `;
            
            container.appendChild(categoryEl);
        });

        document.querySelectorAll('.edit-budget-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const categoryId = parseInt(e.target.dataset.id);
                editBudget(categoryId);
            });
        });
    }

    // New function to handle budget editing
    function editBudget(categoryId) {
        const categoryToEdit = state.categories.find(cat => cat.id === categoryId);
        if (!categoryToEdit) {
            alert('Category not found!');
            return;
        }

        const newBudget = parseFloat(prompt(`Enter new budget for ${categoryToEdit.name} (in ₹):`, categoryToEdit.budget.toFixed(2)));

        if (!isNaN(newBudget) && newBudget >= 0) {
            categoryToEdit.budget = newBudget;
            saveData();
            renderCategories();
            renderCharts();
        } else if (newBudget !== null) {
            alert('Invalid input. Please enter a valid number.');
        }
    }
    
    // Render savings goals
    function renderGoals() {
        const container = document.getElementById('savings-goals');
        container.innerHTML = '';
        
        if (state.goals.length === 0) {
            container.innerHTML = '<p class="no-goals">No savings goals yet. Add your first goal!</p>';
            return;
        }
        
        state.goals.forEach(goal => {
            const percentage = (goal.saved / goal.target) * 100;
            const daysLeft = Math.ceil((goal.date - new Date()) / (1000 * 60 * 60 * 24));
            
            const goalEl = document.createElement('div');
            goalEl.className = 'goal-card';
            
            // Build history HTML
            let historyHTML = '';
            if (goal.history && goal.history.length > 0) {
                historyHTML = '<div class="goal-history"><h4>Update History</h4><ul class="goal-history-list">';
                goal.history.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
                    historyHTML += `<li class="goal-history-item"><i class="fas fa-plus-circle"></i>${formatCurrencyAmount(entry.amount)} added on ${formatDate(entry.date)}</li>`;
                });
                historyHTML += '</ul></div>';
            }
            
            goalEl.innerHTML = `
                <div class="goal-header">
                    <div class="goal-title">
                        <h3>${goal.name}</h3>
                        <p>Target: ${formatCurrencyAmount(goal.target)}</p>
                    </div>
                    <span>${daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}</span>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="goal-details">
                    <span class="goal-amount">Saved: ${formatCurrencyAmount(goal.saved)} (${percentage.toFixed(1)}%)</span>
                    <span class="goal-date">${formatDate(goal.date)}</span>
                </div>
                ${historyHTML}
                <div class="goal-actions">
                    <button class="action-btn goal-update-btn" data-id="${goal.id}" title="Update savings"><i class="fas fa-pen"></i></button>
                    <button class="action-btn goal-delete-btn" data-id="${goal.id}" title="Delete goal"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            container.appendChild(goalEl);
        });

        // Add event listeners for new buttons
        document.querySelectorAll('.goal-update-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                updateSavedAmount(id);
            });
        });
        
        document.querySelectorAll('.goal-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteGoal(id);
            });
        });
    }

    // Function to update saved amount to a goal
    function updateSavedAmount(id) {
        const goal = state.goals.find(g => g.id === id);
        if (!goal) return;
        
        currentGoalId = id;
        openModal('goal-update');
    }

    // Function to delete a savings goal
    function deleteGoal(id) {
        if (confirm('Are you sure you want to delete this savings goal?')) {
            state.goals = state.goals.filter(goal => goal.id !== id);
            saveData();
            renderGoals(); // Re-render goals to update the UI
        }
    }
    
    // Render charts
    function renderCharts() {
        renderCategoryChart();
        renderMonthlyChart();
        renderIncomeExpenseChart();
        renderTrendsChart();
        renderTopExpenses();
        renderCategoryBreakdown();
    }
    
    // Render category chart
    function renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Calculate spending by category for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const categorySpending = {};
        
        state.transactions
            .filter(trans => trans.type === 'expense' && trans.date.getMonth() === currentMonth && trans.date.getFullYear() === currentYear)
            .forEach(trans => {
                if (!categorySpending[trans.categoryId]) {
                    categorySpending[trans.categoryId] = 0;
                }
                categorySpending[trans.categoryId] += trans.amount;
            });
            
        const chartData = state.categories
            .filter(cat => cat.name !== 'Income')
            .map(cat => ({
                label: cat.name,
                data: categorySpending[cat.id] || 0,
                backgroundColor: cat.color
            }));
            
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.map(d => d.label),
                datasets: [{
                    data: chartData.map(d => d.data),
                    backgroundColor: chartData.map(d => d.backgroundColor),
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += `₹${context.parsed.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render monthly chart
    function renderMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        // Get all unique month-year combinations
        const monthlyData = {};
        state.transactions.forEach(trans => {
            const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { income: 0, expenses: 0 };
            }
            if (trans.type === 'income') {
                monthlyData[monthYear].income += trans.amount;
            } else {
                monthlyData[monthYear].expenses += trans.amount;
            }
        });
        
        const labels = Object.keys(monthlyData).sort();
        const incomeData = labels.map(key => monthlyData[key].income);
        const expenseData = labels.map(key => monthlyData[key].expenses);
        const formattedLabels = labels.map(key => {
            const [year, month] = key.split('-');
            return `${getMonthName(parseInt(month))} ${year}`;
        });
        
        if (monthlyChart) {
            monthlyChart.destroy();
        }
        
        monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: formattedLabels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: '#4cc9f0',
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        backgroundColor: '#f94144',
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `₹${context.parsed.y.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render income vs expenses chart
    function renderIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
        
        const monthlyData = {};
        const allDates = state.transactions
            .map(trans => `${trans.date.getFullYear()}-${trans.date.getMonth()}`);
        const uniqueDates = [...new Set(allDates)].sort();
        
        uniqueDates.forEach(date => {
            monthlyData[date] = { income: 0, expenses: 0 };
        });
        
        state.transactions.forEach(trans => {
            const monthYear = `${trans.date.getFullYear()}-${trans.date.getMonth()}`;
            if (trans.type === 'income') {
                monthlyData[monthYear].income += trans.amount;
            } else {
                monthlyData[monthYear].expenses += trans.amount;
            }
        });
        
        const labels = uniqueDates.map(date => {
            const [year, month] = date.split('-');
            return `${getMonthName(parseInt(month))} ${year}`;
        });
        
        const incomeData = uniqueDates.map(date => monthlyData[date].income);
        const expenseData = uniqueDates.map(date => monthlyData[date].expenses);
        
        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }
        
        incomeExpenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.2)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#f94144',
                        backgroundColor: 'rgba(249, 65, 68, 0.2)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `₹${context.parsed.y.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render spending trends chart
    function renderTrendsChart() {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        const dailyData = {};
        state.transactions
            .filter(trans => trans.type === 'expense')
            .forEach(trans => {
                const date = trans.date.toISOString().split('T')[0];
                if (!dailyData[date]) {
                    dailyData[date] = 0;
                }
                dailyData[date] += trans.amount;
            });
            
        const labels = Object.keys(dailyData).sort();
        const data = labels.map(key => dailyData[key]);
        
        if (trendsChart) {
            trendsChart.destroy();
        }
        
        trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Daily Spending',
                        data: data,
                        borderColor: '#9966FF',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `₹${context.parsed.y.toFixed(2)}`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render top expenses
    function renderTopExpenses() {
        const container = document.getElementById('top-expenses');
        container.innerHTML = '';
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const expenses = state.transactions.filter(trans => 
            trans.type === 'expense' && 
            trans.date.getMonth() === currentMonth && 
            trans.date.getFullYear() === currentYear
        );
        
        if (expenses.length === 0) {
            container.innerHTML = '<li>No expenses this month</li>';
            return;
        }
        
        const sortedExpenses = expenses.sort((a, b) => b.amount - a.amount).slice(0, 5);
        
        sortedExpenses.forEach(trans => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${trans.description}</span>
                <span>₹${trans.amount.toFixed(2)}</span>
            `;
            container.appendChild(li);
        });
    }
    
    // Render category breakdown
    function renderCategoryBreakdown() {
        const container = document.getElementById('category-breakdown');
        container.innerHTML = '';
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const categorySpending = {};
        state.transactions
            .filter(trans => trans.type === 'expense' && trans.date.getMonth() === currentMonth && trans.date.getFullYear() === currentYear)
            .forEach(trans => {
                const category = state.categories.find(cat => cat.id === trans.categoryId);
                if (!categorySpending[trans.categoryId]) {
                    categorySpending[trans.categoryId] = {
                        name: category ? category.name : 'Uncategorized',
                        amount: 0,
                        color: category ? category.color : '#6c757d'
                    };
                }
                categorySpending[trans.categoryId].amount += trans.amount;
            });
        
        const totalExpenses = Object.values(categorySpending).reduce((sum, cat) => sum + cat.amount, 0);
        
        const categoryArray = Object.values(categorySpending).map(cat => ({
            ...cat,
            percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
        }));
        
        if (categoryArray.length === 0) {
            container.innerHTML = '<li>No expenses this month</li>';
            return;
        }
        
        categoryArray.forEach(category => {
            const li = document.createElement('li');
            
            li.innerHTML = `
                <span>
                    <span class="color-indicator" style="background-color: ${category.color}"></span>
                    ${category.name}
                </span>
                <span>${category.percentage.toFixed(1)}% (₹${category.amount.toFixed(2)})</span>
            `;
            
            container.appendChild(li);
        });
    }
    
    // Set current month/year for reports
    function setCurrentMonthYear() {
        const monthName = getMonthName(state.currentMonth);
        document.getElementById('current-month').textContent = `${monthName} ${state.currentYear}`;
    }
    
    // Helper function to format date
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Helper function to get month name
    function getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }
    
    // Prepare bill modal
    function prepareBillModal() {
        document.getElementById('bill-name').value = '';
        document.getElementById('bill-amount').value = '';
        document.getElementById('bill-split-type').value = 'equal';
        document.getElementById('bill-participants').value = '';
        document.getElementById('unequal-split-container').style.display = 'none';
        document.getElementById('equal-split-preview').style.display = 'block';
        document.getElementById('participant-amounts').innerHTML = '';
        document.getElementById('split-validation-message').style.display = 'none';
        
        // Reset split buttons
        document.getElementById('btn-split-equal').classList.add('active');
        document.getElementById('btn-split-unequal').classList.remove('active');
        
        // Add event listeners for split buttons
        const btnSplitEqual = document.getElementById('btn-split-equal');
        const btnSplitUnequal = document.getElementById('btn-split-unequal');
        const billAmount = document.getElementById('bill-amount');
        const billParticipants = document.getElementById('bill-participants');
        
        // Remove existing listeners to avoid duplicates
        const newBtnSplitEqual = btnSplitEqual.cloneNode(true);
        const newBtnSplitUnequal = btnSplitUnequal.cloneNode(true);
        btnSplitEqual.parentNode.replaceChild(newBtnSplitEqual, btnSplitEqual);
        btnSplitUnequal.parentNode.replaceChild(newBtnSplitUnequal, btnSplitUnequal);
        
        newBtnSplitEqual.addEventListener('click', () => {
            document.getElementById('bill-split-type').value = 'equal';
            newBtnSplitEqual.classList.add('active');
            newBtnSplitUnequal.classList.remove('active');
            document.getElementById('unequal-split-container').style.display = 'none';
            document.getElementById('equal-split-preview').style.display = 'block';
            updateEqualSplitPreview();
        });
        
        newBtnSplitUnequal.addEventListener('click', () => {
            document.getElementById('bill-split-type').value = 'unequal';
            newBtnSplitUnequal.classList.add('active');
            newBtnSplitEqual.classList.remove('active');
            document.getElementById('equal-split-preview').style.display = 'none';
            handleSplitTypeChange();
        });
        
        // Update preview on amount or participants change
        billAmount.addEventListener('input', updateEqualSplitPreview);
        billParticipants.addEventListener('input', () => {
            if (document.getElementById('bill-split-type').value === 'equal') {
                updateEqualSplitPreview();
            } else {
                handleSplitTypeChange();
            }
        });
    }
    
    // Update equal split preview
    function updateEqualSplitPreview() {
        const totalAmount = parseFloat(document.getElementById('bill-amount').value) || 0;
        const participantsStr = document.getElementById('bill-participants').value.trim();
        const friends = participantsStr.split(',').map(p => p.trim()).filter(p => p);
        
        if (!currentUser) return;
        
        // Include user in participants
        const allParticipants = [currentUser.name, ...friends];
        const totalPeople = allParticipants.length;
        const amountPerPerson = totalPeople > 0 ? totalAmount / totalPeople : 0;
        
        const previewContainer = document.getElementById('equal-split-details');
        if (totalAmount > 0 && totalPeople > 0) {
            let previewHTML = '<table>';
            allParticipants.forEach(participant => {
                previewHTML += `
                    <tr>
                        <td>${participant}${participant === currentUser.name ? ' (You)' : ''}</td>
                        <td>${formatCurrencyAmount(amountPerPerson)}</td>
                    </tr>
                `;
            });
            previewHTML += `
                <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>${formatCurrencyAmount(totalAmount)}</strong></td>
                </tr>
            </table>`;
            previewContainer.innerHTML = previewHTML;
        } else {
            previewContainer.innerHTML = '<p style="color: var(--gray-color); font-size: 13px;">Enter bill amount and participants to see split preview.</p>';
        }
    }
    
    // Handle split type change
    function handleSplitTypeChange() {
        const participants = document.getElementById('bill-participants').value.trim();
        const totalAmount = parseFloat(document.getElementById('bill-amount').value) || 0;
        
        if (!currentUser) return;
        
        const friends = participants.split(',').map(p => p.trim()).filter(p => p);
        const allParticipants = [currentUser.name, ...friends];
        
        if (allParticipants.length === 0) {
            document.getElementById('unequal-split-container').style.display = 'none';
            return;
        }
        
        const container = document.getElementById('participant-amounts');
        container.innerHTML = '';
        
        allParticipants.forEach(participant => {
            const div = document.createElement('div');
            div.className = 'participant-amount-item';
            div.innerHTML = `
                <label>${participant}${participant === currentUser.name ? ' (You)' : ''}</label>
                <input type="number" class="participant-amount-input" data-participant="${participant}" min="0" step="0.01" placeholder="Enter amount" required>
            `;
            container.appendChild(div);
        });
        
        document.getElementById('unequal-split-container').style.display = 'block';
        
        // Add validation on input change
        const inputs = container.querySelectorAll('.participant-amount-input');
        inputs.forEach(input => {
            input.addEventListener('input', validateUnequalSplit);
        });
    }
    
    // Validate unequal split
    function validateUnequalSplit() {
        const totalAmount = parseFloat(document.getElementById('bill-amount').value) || 0;
        const inputs = document.querySelectorAll('.participant-amount-input');
        let totalSplit = 0;
        
        inputs.forEach(input => {
            totalSplit += parseFloat(input.value) || 0;
        });
        
        const validationMsg = document.getElementById('split-validation-message');
        const diff = Math.abs(totalSplit - totalAmount);
        
        if (diff > 0.01) {
            validationMsg.style.display = 'block';
            validationMsg.textContent = `⚠️ Amounts must sum up to the total bill. Current: ${formatCurrencyAmount(totalSplit)}, Required: ${formatCurrencyAmount(totalAmount)}`;
        } else {
            validationMsg.style.display = 'none';
        }
    }
    
    // Handle bill form submission
    function handleBillSubmit(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('Please login to add bills');
            return;
        }
        
        const name = document.getElementById('bill-name').value;
        const totalAmount = parseFloat(document.getElementById('bill-amount').value);
        const splitType = document.getElementById('bill-split-type').value;
        const participantsStr = document.getElementById('bill-participants').value.trim();
        
        const friends = participantsStr.split(',').map(p => p.trim()).filter(p => p);
        
        if (friends.length === 0) {
            alert('Please enter at least one friend\'s name');
            return;
        }
        
        // Include user in participants
        const allParticipants = [currentUser.name, ...friends];
        let splitDetails = {};
        
        if (splitType === 'equal') {
            const amountPerPerson = totalAmount / allParticipants.length;
            allParticipants.forEach(p => {
                splitDetails[p] = amountPerPerson;
            });
        } else {
            // Unequal split
            const inputs = document.querySelectorAll('.participant-amount-input');
            let totalSplit = 0;
            
            inputs.forEach(input => {
                const amount = parseFloat(input.value) || 0;
                const participant = input.getAttribute('data-participant');
                splitDetails[participant] = amount;
                totalSplit += amount;
            });
            
            if (Math.abs(totalSplit - totalAmount) > 0.01) {
                document.getElementById('split-validation-message').style.display = 'block';
                return;
            }
        }
        
        // Initialize payment status - default: current user paid (they're creating the bill)
        const paymentStatus = {};
        allParticipants.forEach(p => {
            paymentStatus[p] = p === currentUser.name ? 'paid' : 'unpaid';
        });
        
        const newBill = {
            id: Date.now(),
            name,
            totalAmount,
            splitType,
            participants: allParticipants,
            splitDetails,
            paymentStatus,
            paidBy: currentUser.name, // Default: current user paid
            settled: false,
            createdAt: new Date()
        };
        
        state.splitBills.push(newBill);
        saveData();
        
        closeModal();
        renderBills();
        billForm.reset();
        showToast('Bill added successfully!', 'success');
    }
    
    // Get avatar for a participant (assigns avatars based on name hash)
    function getParticipantAvatar(participantName) {
        const avatars = [
            'avatars/a28e592b-4bee-41c7-9df1-1ac2bd74bb3c.jpeg',
            'avatars/62f23d62-255a-47c4-a59e-9e680d07fa68.jpg',
            'avatars/avatar 3.jpg',
            'avatars/avatar 4.jpg',
            'avatars/avatar 1.jpg'
        ];
        
        // Create a simple hash from the name to consistently assign avatars
        let hash = 0;
        for (let i = 0; i < participantName.length; i++) {
            hash = participantName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % avatars.length;
        return avatars[index];
    }
    
    // Render split bills
    function renderBills() {
        const container = document.getElementById('split-bills-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (state.splitBills.length === 0) {
            container.innerHTML = '<p class="no-bills">No split bills yet. Add your first bill!</p>';
            renderSplitwiseHistory();
            return;
        }
        
        state.splitBills.forEach(bill => {
            const billEl = document.createElement('div');
            billEl.className = 'bill-card';
            
            // Initialize payment status if not exists
            if (!bill.paymentStatus) {
                bill.paymentStatus = {};
                // If someone paid the full bill, mark them as paid
                if (bill.paidBy) {
                    bill.paymentStatus[bill.paidBy] = 'paid';
                    Object.keys(bill.splitDetails).forEach(p => {
                        if (p !== bill.paidBy) {
                            bill.paymentStatus[p] = 'unpaid';
                        }
                    });
                } else {
                    // Default: all unpaid
                    Object.keys(bill.splitDetails).forEach(p => {
                        bill.paymentStatus[p] = 'unpaid';
                    });
                }
            }
            
            // Build participants list with avatars and payment status
            let participantsHTML = '';
            Object.keys(bill.splitDetails).forEach(participant => {
                const avatar = getParticipantAvatar(participant);
                const amount = bill.splitDetails[participant];
                const isPaid = bill.paymentStatus[participant] === 'paid' || bill.settled;
                const isCurrentUser = currentUser && participant === currentUser.name;
                
                participantsHTML += `
                    <div class="participant-item">
                        <div class="participant-info">
                            <div class="participant-avatar">
                                <img src="${avatar}" alt="${participant}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>';">
                            </div>
                            <div class="participant-details">
                                <div class="participant-name">${participant}${isCurrentUser ? ' (You)' : ''}</div>
                                <div class="participant-amount">${formatCurrency(amount)}</div>
                            </div>
                        </div>
                        <div class="participant-status-section">
                            <span class="participant-status ${isPaid ? 'paid' : 'unpaid'}">
                                ${isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            ${!isPaid && !bill.settled && bill.paidBy ? `
                                <button class="btn-secondary mark-paid-btn" data-bill-id="${bill.id}" data-participant="${participant}" data-payer="${bill.paidBy}">
                                    Mark as Paid 
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            // Get currency symbol
            const currency = window.getSelectedCurrency ? window.getSelectedCurrency() : 'INR';
            const symbol = window.getCurrencySymbol ? window.getCurrencySymbol(currency) : '₹';
            
            billEl.innerHTML = `
                <div class="bill-header">
                    <h3>${bill.name}</h3>
                    <span class="bill-status ${bill.settled ? 'settled' : 'pending'}">
                        ${bill.settled ? 'Settled' : 'Pending'}
                    </span>
                </div>
                <div class="bill-info">
                    <p><strong>Total Amount:</strong> ${symbol}${bill.totalAmount.toFixed(2)}</p>
                    <p><strong>Split Type:</strong> ${bill.splitType === 'equal' ? 'Equal' : 'Unequal'}</p>
                    <p><strong>Created:</strong> ${formatDate(bill.createdAt)}</p>
                    ${bill.paidBy ? `<p><strong>Paid By:</strong> ${bill.paidBy}</p>` : ''}
                </div>
                <div class="bill-participants-list scrollable-participants">
                    <h4>Participants</h4>
                    ${participantsHTML}
                </div>
                <div class="bill-actions">
                    ${!bill.settled ? `
                        <button class="btn-primary settle-bill-btn" data-id="${bill.id}">
                            <i class="fas fa-check"></i> Mark as Settled
                        </button>
                    ` : ''}
                    <button class="btn-danger delete-bill-btn" data-id="${bill.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            container.appendChild(billEl);
        });
        
        // Add event listeners
        document.querySelectorAll('.settle-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                settleBill(id);
            });
        });
        
        document.querySelectorAll('.delete-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteBill(id);
            });
        });
        
        // Add event listeners for mark as paid buttons
        document.querySelectorAll('.mark-paid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = parseInt(e.currentTarget.getAttribute('data-bill-id'));
                const participant = e.currentTarget.getAttribute('data-participant');
                const payer = e.currentTarget.getAttribute('data-payer');
                markParticipantAsPaid(billId, participant, payer);
            });
        });
        
        // Render history after bills
        renderSplitwiseHistory();
    }
    
    // Mark participant as paid
    function markParticipantAsPaid(billId, participant, payer) {
        const bill = state.splitBills.find(b => b.id === billId);
        if (bill && bill.paymentStatus) {
            bill.paymentStatus[participant] = 'paid';
            saveData();
            renderBills();
            showToast(`${participant} marked as paid to ${payer}`, 'success');
        }
    }
    
    // Render Splitwise History
    function renderSplitwiseHistory() {
        const container = document.getElementById('splitwise-history-list');
        if (!container) return;
        
        // Aggregate totals per person
        const personTotals = {};
        
        state.splitBills.forEach(bill => {
            if (bill.settled) return; // Skip settled bills
            
            Object.keys(bill.splitDetails).forEach(participant => {
                if (!personTotals[participant]) {
                    personTotals[participant] = {
                        total: 0,
                        avatar: getParticipantAvatar(participant)
                    };
                }
                
                // Only add if participant hasn't paid
                if (!bill.paymentStatus || bill.paymentStatus[participant] !== 'paid') {
                    personTotals[participant].total += bill.splitDetails[participant];
                }
            });
        });
        
        container.innerHTML = '';
        
        if (Object.keys(personTotals).length === 0) {
            container.innerHTML = '<p class="no-history">No outstanding balances yet.</p>';
            return;
        }
        
        // Get currency symbol
        const currency = window.getSelectedCurrency ? window.getSelectedCurrency() : 'INR';
        const symbol = window.getCurrencySymbol ? window.getCurrencySymbol(currency) : '₹';
        
        // Sort by amount (highest first)
        const sortedPeople = Object.keys(personTotals).sort((a, b) => 
            personTotals[b].total - personTotals[a].total
        );
        
        sortedPeople.forEach(person => {
            const total = personTotals[person].total;
            if (total <= 0) return; // Skip if no outstanding balance
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-info">
                    <div class="history-item-avatar">
                        <img src="${personTotals[person].avatar}" alt="${person}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>';">
                    </div>
                    <span class="history-item-name">${person}${currentUser && person === currentUser.name ? ' (You)' : ''}</span>
                </div>
                <span class="history-item-amount">${symbol}${total.toFixed(2)}</span>
            `;
            container.appendChild(historyItem);
        });
    }
    
    // Settle bill
    function settleBill(id) {
        const bill = state.splitBills.find(b => b.id === id);
        if (bill) {
            bill.settled = true;
            saveData();
            renderBills();
        }
    }
    
    // Delete bill
    function deleteBill(id) {
        if (confirm('Are you sure you want to delete this bill?')) {
            state.splitBills = state.splitBills.filter(b => b.id !== id);
            saveData();
            renderBills();
        }
    }
    
    // Get week number for a date
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    // Get start of week
    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }
    
    // Handle download PDF
    function handleDownloadPDF() {
        generatePDF(true);
    }
    
    // Handle email PDF
    function handleEmailPDF() {
        if (!currentUser || !currentUser.email) {
            alert('No email address found. Please update your profile.');
            return;
        }
        
        // In a real application, you would send this to a server
        // For now, we'll just show an alert and still download it
        alert(`PDF would be sent to ${currentUser.email}. For now, downloading it instead.`);
        generatePDF(true);
    }
    
    // Generate PDF
    function generatePDF(download = true) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Income & Expense Report', 14, 20);
        
        // Current week
        const now = new Date();
        const startOfWeek = getStartOfWeek(now);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        doc.setFontSize(12);
        doc.text(`Week: ${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`, 14, 30);
        
        // Group transactions by week
        const weeklyTransactions = {};
        state.transactions.forEach(trans => {
            const weekStart = getStartOfWeek(trans.date);
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyTransactions[weekKey]) {
                weeklyTransactions[weekKey] = {
                    start: weekStart,
                    transactions: []
                };
            }
            weeklyTransactions[weekKey].transactions.push(trans);
        });
        
        let yPos = 45;
        
        // For each week, show transactions
        Object.keys(weeklyTransactions).sort().forEach(weekKey => {
            const weekData = weeklyTransactions[weekKey];
            const weekEnd = new Date(weekData.start);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            doc.setFontSize(14);
            doc.text(`Week: ${formatDate(weekData.start)} - ${formatDate(weekEnd)}`, 14, yPos);
            yPos += 10;
            
            // Calculate totals for this week
            let weekIncome = 0;
            let weekExpenses = 0;
            
            weekData.transactions.forEach(trans => {
                if (trans.type === 'income') {
                    weekIncome += trans.amount;
                } else {
                    weekExpenses += trans.amount;
                }
            });
            
            const weekBalance = weekIncome - weekExpenses;
            
            doc.setFontSize(10);
            doc.text(`Total Income: ₹${weekIncome.toFixed(2)}`, 14, yPos);
            yPos += 7;
            doc.text(`Total Expenses: ₹${weekExpenses.toFixed(2)}`, 14, yPos);
            yPos += 7;
            doc.text(`Net Balance: ₹${weekBalance.toFixed(2)}`, 14, yPos);
            yPos += 10;
            
            // Transactions table header
            if (weekData.transactions.length > 0) {
                doc.setFontSize(9);
                doc.text('Date', 14, yPos);
                doc.text('Description', 50, yPos);
                doc.text('Type', 120, yPos);
                doc.text('Amount', 150, yPos);
                yPos += 7;
                
                // Transactions
                weekData.transactions.forEach(trans => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.text(formatDate(trans.date), 14, yPos);
                    doc.text(trans.description.substring(0, 20), 50, yPos);
                    doc.text(trans.type, 120, yPos);
                    doc.text(`${trans.type === 'income' ? '+' : '-'}₹${trans.amount.toFixed(2)}`, 150, yPos);
                    yPos += 7;
                });
            }
            
            yPos += 10;
        });

          
        // Overall summary
        const allIncome = state.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const allExpenses = state.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netBalance = allIncome - allExpenses;
        
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Overall Summary', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.text(`Total Income: ₹${allIncome.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Expenses: ₹${allExpenses.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Net Balance: ₹${netBalance.toFixed(2)}`, 14, yPos);
        
        if (download) {
            doc.save(`expense-report-${formatDate(new Date()).replace(/\s/g, '-')}.pdf`);
        }
        
        closeModal();
    }
    
    // Open Export Modal
    function openExportModal() {
        prepareExportModal();
        openModal('export');
    }
    
    // Prepare Export Modal
    function prepareExportModal() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate monthly summary
        const monthlyTransactions = state.transactions.filter(trans => 
            trans.date.getMonth() === currentMonth && 
            trans.date.getFullYear() === currentYear
        );
        
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const savings = income - expenses;
        const netBalance = income - expenses;
        
        // Category distribution
        const categorySpending = {};
        monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .forEach(trans => {
                const catName = state.categories.find(c => c.id === trans.categoryId)?.name || trans.category;
                categorySpending[catName] = (categorySpending[catName] || 0) + trans.amount;
            });
        
        // Splitwise summary
        const totalOwed = state.splitBills
            .filter(bill => !bill.settled)
            .reduce((sum, bill) => {
                let owed = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (bill.paymentStatus && bill.paymentStatus[participant] !== 'paid') {
                        owed += bill.splitDetails[participant];
                    } else if (!bill.paymentStatus) {
                        owed += bill.splitDetails[participant];
                    }
                });
                return sum + owed;
            }, 0);
        
        const totalLent = state.splitBills
            .filter(bill => !bill.settled && bill.paidBy === currentUser?.name)
            .reduce((sum, bill) => {
                let lent = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (participant !== currentUser?.name) {
                        lent += bill.splitDetails[participant];
                    }
                });
                return sum + lent;
            }, 0);
        
        // Savings goals
        const totalSaved = state.goals.reduce((sum, goal) => sum + goal.saved, 0);
        const totalTarget = state.goals.reduce((sum, goal) => sum + goal.target, 0);
        
        // Update preview
        const preview = document.getElementById('export-summary');
        if (preview) {
            const symbol = getCurrencySymbol();
            preview.innerHTML = `
                <div class="export-summary-item">
                    <strong>Total Income:</strong> ${symbol}${income.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Total Expenses:</strong> ${symbol}${expenses.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Total Savings:</strong> ${symbol}${savings.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Net Balance:</strong> ${symbol}${netBalance.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Splitwise Owed:</strong> ${symbol}${totalOwed.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Splitwise Lent:</strong> ${symbol}${totalLent.toFixed(2)}
                </div>
                <div class="export-summary-item">
                    <strong>Savings Goals Progress:</strong> ${symbol}${totalSaved.toFixed(2)} / ${symbol}${totalTarget.toFixed(2)}
                </div>
            `;
        }
        
        // Add event listeners
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        const exportCsvBtn = document.getElementById('export-csv-btn');
        const exportShareBtn = document.getElementById('export-share-btn');
        
        if (exportPdfBtn) {
            exportPdfBtn.onclick = () => exportToPDF();
        }
        
        if (exportCsvBtn) {
            exportCsvBtn.onclick = () => exportToCSV();
        }
        
        // Check if Web Share API is available
        if (navigator.share && exportShareBtn) {
            exportShareBtn.style.display = 'inline-block';
            exportShareBtn.onclick = () => shareData();
        }
    }
    
    // Export to PDF
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();
        
        let yPos = 20;
        const symbol = getCurrencySymbol();
        
        // Title
        doc.setFontSize(18);
        doc.text('Monthly Statement', 14, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`${currentMonth} ${currentYear}`, 14, yPos);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos + 7);
        yPos += 15;
        
        // Summary Section
        doc.setFontSize(14);
        doc.text('Summary', 14, yPos);
        yPos += 10;
        doc.setFontSize(11);
        
        const monthlyTransactions = state.transactions.filter(trans => 
            trans.date.getMonth() === now.getMonth() && 
            trans.date.getFullYear() === now.getFullYear()
        );
        
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const savings = income - expenses;
        const netBalance = income - expenses;
        
        doc.text(`Total Income: ${symbol}${income.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Expenses: ${symbol}${expenses.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Savings: ${symbol}${savings.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Net Balance: ${symbol}${netBalance.toFixed(2)}`, 14, yPos);
        yPos += 15;
        
        // Category Distribution
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Category Distribution', 14, yPos);
        yPos += 10;
        doc.setFontSize(11);
        
        const categorySpending = {};
        monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .forEach(trans => {
                const catName = state.categories.find(c => c.id === trans.categoryId)?.name || trans.category;
                categorySpending[catName] = (categorySpending[catName] || 0) + trans.amount;
            });
        
        const totalCategorySpending = Object.values(categorySpending).reduce((a, b) => a + b, 0);
        
        Object.keys(categorySpending).sort((a, b) => categorySpending[b] - categorySpending[a]).forEach(cat => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            const amount = categorySpending[cat];
            const percentage = totalCategorySpending > 0 ? ((amount / totalCategorySpending) * 100).toFixed(1) : 0;
            doc.text(`${cat}: ${symbol}${amount.toFixed(2)} (${percentage}%)`, 14, yPos);
            yPos += 7;
        });
        yPos += 10;
        
        // Splitwise Summary
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Splitwise Summary', 14, yPos);
        yPos += 10;
        doc.setFontSize(11);
        
        const totalOwed = state.splitBills
            .filter(bill => !bill.settled)
            .reduce((sum, bill) => {
                let owed = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (bill.paymentStatus && bill.paymentStatus[participant] !== 'paid') {
                        owed += bill.splitDetails[participant];
                    } else if (!bill.paymentStatus) {
                        owed += bill.splitDetails[participant];
                    }
                });
                return sum + owed;
            }, 0);
        
        const totalLent = state.splitBills
            .filter(bill => !bill.settled && bill.paidBy === currentUser?.name)
            .reduce((sum, bill) => {
                let lent = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (participant !== currentUser?.name) {
                        lent += bill.splitDetails[participant];
                    }
                });
                return sum + lent;
            }, 0);
        
        doc.text(`Total Owed: ${symbol}${totalOwed.toFixed(2)}`, 14, yPos);
        yPos += 7;
        doc.text(`Total Lent: ${symbol}${totalLent.toFixed(2)}`, 14, yPos);
        yPos += 15;
        
        // Savings Goals
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Savings Goal Progress', 14, yPos);
        yPos += 10;
        doc.setFontSize(11);
        
        state.goals.forEach(goal => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            const percentage = goal.target > 0 ? ((goal.saved / goal.target) * 100).toFixed(1) : 0;
            const remaining = goal.target - goal.saved;
            doc.text(`${goal.name}:`, 14, yPos);
            yPos += 7;
            doc.text(`  Saved: ${symbol}${goal.saved.toFixed(2)} / ${symbol}${goal.target.toFixed(2)} (${percentage}%)`, 20, yPos);
            yPos += 7;
            doc.text(`  Remaining: ${symbol}${remaining.toFixed(2)}`, 20, yPos);
            yPos += 10;
        });
        
        // Save PDF
        const fileName = `cashlog-statement-${currentMonth}-${currentYear}.pdf`;
        doc.save(fileName);
        showToast('PDF exported successfully!', 'success');
        closeModal();
    }
    
    // Export to CSV
    function exportToCSV() {
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();
        
        const symbol = getCurrencySymbol();
        let csv = `CashLog Monthly Statement - ${currentMonth} ${currentYear}\n`;
        csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        // Summary
        const monthlyTransactions = state.transactions.filter(trans => 
            trans.date.getMonth() === now.getMonth() && 
            trans.date.getFullYear() === now.getFullYear()
        );
        
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const savings = income - expenses;
        const netBalance = income - expenses;
        
        csv += `SUMMARY\n`;
        csv += `Total Income,${symbol}${income.toFixed(2)}\n`;
        csv += `Total Expenses,${symbol}${expenses.toFixed(2)}\n`;
        csv += `Total Savings,${symbol}${savings.toFixed(2)}\n`;
        csv += `Net Balance,${symbol}${netBalance.toFixed(2)}\n\n`;
        
        // Category Distribution
        csv += `CATEGORY DISTRIBUTION\n`;
        csv += `Category,Amount,Percentage\n`;
        
        const categorySpending = {};
        monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .forEach(trans => {
                const catName = state.categories.find(c => c.id === trans.categoryId)?.name || trans.category;
                categorySpending[catName] = (categorySpending[catName] || 0) + trans.amount;
            });
        
        const totalCategorySpending = Object.values(categorySpending).reduce((a, b) => a + b, 0);
        
        Object.keys(categorySpending).sort((a, b) => categorySpending[b] - categorySpending[a]).forEach(cat => {
            const amount = categorySpending[cat];
            const percentage = totalCategorySpending > 0 ? ((amount / totalCategorySpending) * 100).toFixed(1) : 0;
            csv += `${cat},${symbol}${amount.toFixed(2)},${percentage}%\n`;
        });
        csv += `\n`;
        
        // Splitwise Summary
        csv += `SPLITWISE SUMMARY\n`;
        const totalOwed = state.splitBills
            .filter(bill => !bill.settled)
            .reduce((sum, bill) => {
                let owed = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (bill.paymentStatus && bill.paymentStatus[participant] !== 'paid') {
                        owed += bill.splitDetails[participant];
                    } else if (!bill.paymentStatus) {
                        owed += bill.splitDetails[participant];
                    }
                });
                return sum + owed;
            }, 0);
        
        const totalLent = state.splitBills
            .filter(bill => !bill.settled && bill.paidBy === currentUser?.name)
            .reduce((sum, bill) => {
                let lent = 0;
                Object.keys(bill.splitDetails).forEach(participant => {
                    if (participant !== currentUser?.name) {
                        lent += bill.splitDetails[participant];
                    }
                });
                return sum + lent;
            }, 0);
        
        csv += `Total Owed,${symbol}${totalOwed.toFixed(2)}\n`;
        csv += `Total Lent,${symbol}${totalLent.toFixed(2)}\n\n`;
        
        // Savings Goals
        csv += `SAVINGS GOAL PROGRESS\n`;
        csv += `Goal Name,Target Amount,Saved Amount,Remaining,Percentage\n`;
        
        state.goals.forEach(goal => {
            const remaining = goal.target - goal.saved;
            const percentage = goal.target > 0 ? ((goal.saved / goal.target) * 100).toFixed(1) : 0;
            csv += `${goal.name},${symbol}${goal.target.toFixed(2)},${symbol}${goal.saved.toFixed(2)},${symbol}${remaining.toFixed(2)},${percentage}%\n`;
        });
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `cashlog-statement-${currentMonth}-${currentYear}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('CSV exported successfully!', 'success');
        closeModal();
    }
    
    // Share Data (if Web Share API is available)
    async function shareData() {
        const now = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[now.getMonth()];
        const currentYear = now.getFullYear();
        
        const symbol = getCurrencySymbol();
        let text = `CashLog Monthly Statement - ${currentMonth} ${currentYear}\n\n`;
        
        const monthlyTransactions = state.transactions.filter(trans => 
            trans.date.getMonth() === now.getMonth() && 
            trans.date.getFullYear() === now.getFullYear()
        );
        
        const income = monthlyTransactions
            .filter(trans => trans.type === 'income')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expenses = monthlyTransactions
            .filter(trans => trans.type === 'expense')
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        text += `Total Income: ${symbol}${income.toFixed(2)}\n`;
        text += `Total Expenses: ${symbol}${expenses.toFixed(2)}\n`;
        text += `Net Balance: ${symbol}${(income - expenses).toFixed(2)}\n`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `CashLog Statement - ${currentMonth} ${currentYear}`,
                    text: text
                });
                showToast('Data shared successfully!', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast('Error sharing data', 'error');
                }
            }
        }
    }
    
    // Expose functions globally
    window.updateUserDisplay = updateUserDisplay;
    window.renderBills = renderBills;
    window.updateSummaryCards = updateSummaryCards;
    window.renderRecentTransactions = renderRecentTransactions;
    window.renderTransactionsTable = renderTransactionsTable;
    window.renderCategories = renderCategories;
    window.renderGoals = renderGoals;
});
