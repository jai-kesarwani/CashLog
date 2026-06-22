document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // DOM Elements
    const signupForm = document.getElementById('signup-form-element');
    const signinForm = document.getElementById('signin-form-element');
    const showSigninLink = document.getElementById('show-signin');
    const showSignupLink = document.getElementById('show-signup');
    const signupFormDiv = document.getElementById('signup-form');
    const signinFormDiv = document.getElementById('signin-form');
    
    // Toggle between sign in and sign up
    if (showSigninLink) {
        showSigninLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupFormDiv.classList.remove('active');
            signinFormDiv.classList.add('active');
            clearErrorMessages();
        });
    }
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            signinFormDiv.classList.remove('active');
            signupFormDiv.classList.add('active');
            clearErrorMessages();
        });
    }
    
    // Sign up handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrorMessages();
            
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            // Validation
            if (!name || !email || !password || !confirmPassword) {
                showError('Please fill in all fields.');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters long.');
                return;
            }
            
            // Call backend API to register
            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    showError(data.message || 'Registration failed');
                    return;
                }
                
                // Store token and user info
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('loggedInUser', JSON.stringify(data.data.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Registration error:', error);
                showError('Connection error. Please try again.');
            }
        });
    }
    
    // Sign in handler
    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrorMessages();
            
            const email = document.getElementById('signin-email').value.trim();
            const password = document.getElementById('signin-password').value;
            
            // Validation
            if (!email || !password) {
                showError('Please fill in all fields.');
                return;
            }
            
            // Call backend API to login
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    showError(data.message || 'Login failed');
                    return;
                }
                
                // Store token and user info
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('loggedInUser', JSON.stringify(data.data.user));
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to home page
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Login error:', error);
                showError('Connection error. Please try again.');
            }
        });
    }
    
    // Helper function to show error messages
    function showError(message) {
        const signupError = document.getElementById('signup-error-message');
        const signinError = document.getElementById('signin-error-message');
        
        if (signupFormDiv.classList.contains('active') && signupError) {
            signupError.textContent = message;
            signupError.style.display = 'block';
        } else if (signinFormDiv.classList.contains('active') && signinError) {
            signinError.textContent = message;
            signinError.style.display = 'block';
        }
    }
    
    // Helper function to clear error messages
    function clearErrorMessages() {
        const signupError = document.getElementById('signup-error-message');
        const signinError = document.getElementById('signin-error-message');
        
        if (signupError) {
            signupError.style.display = 'none';
            signupError.textContent = '';
        }
        if (signinError) {
            signinError.style.display = 'none';
            signinError.textContent = '';
        }
    }
});

