<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Modern Login & Signup</title>

<style>
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Segoe UI',sans-serif;
}

body{
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    background:linear-gradient(
        135deg,
        #667eea,
        #764ba2,
        #6a11cb,
        #2575fc
    );
    background-size:400% 400%;
    animation:gradientMove 12s ease infinite;
    overflow:auto;
    padding:20px 0;
}

@keyframes gradientMove{
    0%{background-position:0% 50%;}
    50%{background-position:100% 50%;}
    100%{background-position:0% 50%;}
}

.container{
    width:400px;
    backdrop-filter:blur(15px);
    background:rgba(255,255,255,0.1);
    border:1px solid rgba(255,255,255,0.2);
    box-shadow:0 8px 32px rgba(0,0,0,0.2);
    border-radius:20px;
    padding:35px;
    color:white;
    margin:auto;
}

.form-box{
    display:none;
}

.form-box.active{
    display:block;
}

h2{
    text-align:center;
    margin-bottom:25px;
    font-size:2rem;
}

.input-group{
    margin-bottom:18px;
}

.input-group label{
    display:block;
    margin-bottom:6px;
    font-size:13px;
    color:rgba(255,255,255,0.8);
}

.input-group input,
.input-group select{
    width:100%;
    padding:14px;
    border:none;
    outline:none;
    border-radius:10px;
    background:rgba(255,255,255,0.15);
    color:white;
    font-size:15px;
}

.input-group input::placeholder{
    color:rgba(255,255,255,0.7);
}

.input-group select option{
    color:black;
}

.btn{
    width:100%;
    padding:14px;
    border:none;
    border-radius:10px;
    cursor:pointer;
    font-size:16px;
    font-weight:bold;
    background:white;
    color:#6a11cb;
    transition:.3s;
}

.btn:hover{
    transform:translateY(-3px);
    box-shadow:0 5px 15px rgba(255,255,255,.3);
}

.btn:disabled{
    opacity:0.6;
    cursor:not-allowed;
}

.switch{
    text-align:center;
    margin-top:20px;
}

.switch a{
    color:#fff;
    font-weight:bold;
    text-decoration:none;
    cursor:pointer;
}

.switch a:hover{
    text-decoration:underline;
}

.message{
    text-align:center;
    margin-top:15px;
    font-size:14px;
    padding:10px;
    border-radius:8px;
}

.message.success{
    color:#00ff00;
    background:rgba(0,255,0,0.1);
}

.message.error{
    color:#ff6b6b;
    background:rgba(255,107,107,0.1);
}

@media(max-width:500px){
    .container{
        width:90%;
        padding:25px;
    }
}
</style>
</head>
<body>

<div class="container">

    <!-- Login Form -->
    <div class="form-box active" id="loginForm">
        <h2>Login</h2>

        <div class="input-group">
            <label>Email Address</label>
            <input type="email" id="loginEmail" placeholder="Enter your email" required>
        </div>

        <div class="input-group">
            <label>Password</label>
            <input type="password" id="loginPassword" placeholder="Enter your password" required>
        </div>

        <button class="btn" id="loginBtn" onclick="handleLogin()">Login</button>

        <div class="message" id="loginMessage"></div>

        <div class="switch">
            Don't have an account?
            <a onclick="showSignup()">Sign Up</a>
        </div>
    </div>

    <!-- Signup Form -->
    <div class="form-box" id="signupForm">
        <h2>Create Account</h2>

        <div class="input-group">
            <label>Full Name</label>
            <input type="text" id="signupName" placeholder="Enter your name" required>
        </div>

        <div class="input-group">
            <label>Email Address</label>
            <input type="email" id="signupEmail" placeholder="Enter your email" required>
        </div>

        <div class="input-group">
            <label>Gender</label>
            <select id="signupGender">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div class="input-group">
            <label>Date of Birth</label>
            <input type="date" id="signupDOB">
        </div>

        <div class="input-group">
            <label>Password</label>
            <input type="password" id="signupPassword" placeholder="Minimum 6 characters" required>
        </div>

        <div class="input-group">
            <label>Confirm Password</label>
            <input type="password" id="signupConfirmPassword" placeholder="Re-enter your password" required>
        </div>

        <button class="btn" id="signupBtn" onclick="handleSignup()">Sign Up</button>

        <div class="message" id="signupMessage"></div>

        <div class="switch">
            Already have an account?
            <a onclick="showLogin()">Login</a>
        </div>
    </div>

</div>

<script>

// API BASE URL
const API_URL =  window.location.origin

// Toggle between Login and Signup
function showSignup(){
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("signupForm").classList.add("active");
    clearMessages();
}

function showLogin(){
    document.getElementById("signupForm").classList.remove("active");
    document.getElementById("loginForm").classList.add("active");
    clearMessages();
}

// Clear all messages
function clearMessages(){
    document.getElementById("loginMessage").innerHTML = "";
    document.getElementById("signupMessage").innerHTML = "";
}

// Handle Signup
async function handleSignup(){
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const gender = document.getElementById("signupGender").value;
    const dateOfBirth = document.getElementById("signupDOB").value;

    const messageEl = document.getElementById("signupMessage");
    const btnEl = document.getElementById("signupBtn");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage(messageEl, "All fields are required!", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage(messageEl, "Passwords do not match!", "error");
        return;
    }

    if (password.length < 6) {
        showMessage(messageEl, "Password must be at least 6 characters!", "error");
        return;
    }

    // Disable button while processing
    btnEl.disabled = true;
    btnEl.textContent = "Creating Account...";

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword,
                gender,
                dateOfBirth
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(messageEl, data.message, "success");
            // Clear form
            document.getElementById("signupName").value = "";
            document.getElementById("signupEmail").value = "";
            document.getElementById("signupPassword").value = "";
            document.getElementById("signupConfirmPassword").value = "";
            document.getElementById("signupGender").value = "";
            document.getElementById("signupDOB").value = "";
            
            // Switch to login after 2 seconds
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            showMessage(messageEl, data.message, "error");
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage(messageEl, "Network error. Make sure server is running!", "error");
    } finally {
        btnEl.disabled = false;
        btnEl.textContent = "Sign Up";
    }
}

// Handle Login
async function handleLogin(){
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const messageEl = document.getElementById("loginMessage");
    const btnEl = document.getElementById("loginBtn");

    // Validation
    if (!email || !password) {
        showMessage(messageEl, "Email and password are required!", "error");
        return;
    }

    // Disable button while processing
    btnEl.disabled = true;
    btnEl.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
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

        if (data.success) {
            showMessage(messageEl, `Welcome back, ${data.user.name}!`, "success");
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Clear form
            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";

            // Redirect after 1.5 seconds (change URL as needed)
            setTimeout(() => {
                alert('Login successful! Redirecting to dashboard...');
                // window.location.href = '/dashboard'; // Uncomment when you have a dashboard
            }, 1500);
        } else {
            showMessage(messageEl, data.message, "error");
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage(messageEl, "Network error. Make sure server is running!", "error");
    } finally {
        btnEl.disabled = false;
        btnEl.textContent = "Login";
    }
}

// Helper function to show messages
function showMessage(element, text, type){
    element.innerHTML = text;
    element.className = `message ${type}`;
}

</script>

</body>
</html>
