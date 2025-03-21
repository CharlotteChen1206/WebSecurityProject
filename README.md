# Phase 1
## Setup Instructions
1. Generate SSL Certificate: used OpenSSL to generate a self-signed certificate key.pem and cert.pem
2.  Install https: In the existing Express application, install the https module using npm
3. Add HTTPS Configuration: import https by 
const https = require('https');
const fs = require('fs');
4. Configure SSL in the Server: loaded the SSL files using Node.js's fs module, integrated the SSL options with the HTTPS server
5. Run the HTTPS Server: started the server to listen on a secure HTTPS connection

## SSL Configuration & Lessons Learned
For this project, I decided to use OpenSSL instead of Let’s Encrypt to generate an SSL certificate. While Let’s Encrypt, combined with Certbot, is an excellent option for production websites due to its automatic renewal and support from all modern browsers, it requires a real domain name to issue a certificate. Since my project runs on localhost and does not have a public domain name, I opted for OpenSSL to create a self-signed certificate. This allows me to test HTTPS functionality locally.
I understand that when using a self-signed certificate, browsers will display a "not secure" warning when accessing the webpage. However, this is acceptable for a local development environment, as the goal is to practice implementing HTTPS and securing a web application, rather than deploying it to a live production environment.

The headers added by Helmet significantly enhance the security of the app by mitigating common web vulnerabilities:
- X-Content-Type-Options prevents the browser from interpreting files as a different MIME type, which protects against MIME type attacks.
- X-Frame-Options prevents the app from being embedded in an iframe, mitigating clickjacking attacks.
- Content-Security-Policy (CSP) controls the sources from which content like scripts and images can be loaded, reducing the risk of cross-site scripting (XSS) attacks.
- Strict-Transport-Security (HSTS) ensures that all communications with the server use HTTPS, enhancing the confidentiality and integrity of user data.

Setting up HTTPS was straightforward, as configuring the SSL certificate and integrating it into the server code allowed me to establish a secure connection. However, the most challenging part was verifying that Helmet was functioning correctly. I initially attempted to use curl to test the headers, but I encountered persistent issues connecting to the server. After troubleshooting with various tools, I switched to Postman, which successfully allowed me to inspect the response headers and confirm that Helmet was working as intended. This change in approach helped me overcome the problem efficiently.

## Caching Strategies
1. GET /quests:
- Purpose: Returns the current list of quests.
- Cache strategy: Cache the list for 5 minutes with stale-while-revalidate to improve performance.

2. GET /quests/:id:
- Purpose: Returns the details of a specific quest.
- Cache strategy: Cache individual quest data for 5 minutes.

3. POST /quests:
- Purpose: Allows users to create a new quest.
- Security consideration: Implement role-based access control to ensure only authorized users can create quests.

4. PUT /quests/:id/complete:
- Purpose: Marks a quest as completed.
- Security consideration: Validate the user's permission to modify the quest.

5. GET /quests/history:
- Purpose: Returns a history of completed quests.
- Cache strategy: Use longer cache durations (e.g., 10 minutes) since historical data changes less frequently.

# Phase 2
## Setting Up the Repository

I initialized this repository during Phase 1, so I just edited the file on local and push it to github again. Setting up the project is straightforward. To begin, I install dependencies using:

`npm install argon2 body-parser connect-mongo cookie-parser csurf dotenv express express-rate-limit express-session helmet jsonwebtoken mongoose nodemon passport passport-google-oauth20`

All required dependencies, as listed in my package.json, include essential security and authentication libraries such as express, mongoose, jsonwebtoken, passport, csurf, and express-rate-limit.

Next, I created a .env file to store environment variables such as: PORT, MONGO_URI, JWT_SECRET, REFRESH_SECRET, SESSION_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET.

To start the application, I used node server.js.

I did not encounter any major setup issues since I completed all features before moving on to documentation. However, if any issues arise, common troubleshooting steps include verifying that MongoDB is running, dependencies are installed correctly, and the .env file is properly configured.

## Authentication Mechanisms

I implemented two authentication methods: password-based authentication and Google SSO. This dual authentication system allows users the flexibility to choose between traditional login credentials and a quicker Google-based sign-in.

For password-based authentication, I securely hash passwords using argon2 before storing them in the database. Users' credentials are verified upon login, and JWT tokens (accessToken and refreshToken) manage session authentication.

For Google SSO, I used passport-google-oauth20 to integrate OAuth authentication. Users can log in without creating a password, making authentication both secure and convenient.

To enhance security, I implemented rate limiting for login attempts, CSRF protection to prevent unauthorized requests, and secure session management using express-session. These security measures ensure that authentication is not only user-friendly but also resistant to attacks.

### Secure session management
To enhance session security, I configured express-session with the following security measures:

- HttpOnly: true – Prevents JavaScript from accessing session cookies, mitigating XSS attacks.
- secure: true – Ensures cookies are only sent over HTTPS in production.
- sameSite: 'strict' – Prevents CSRF attacks by restricting cookie sharing across sites.
- Session expiration (maxAge: 15 minutes) – Automatically logs users out after inactivity to reduce session hijacking risks.

## Role-Based Access Control

I implemented three user roles:

- User: The default role assigned upon registration.
- Admin: Users with administrative privileges.
- Superuser: Automatically assigned when a user logs in more than three times.

To enforce role-based access, I created a middleware function that checks a user's role before granting access to protected routes:

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};

I then applied this middleware to specific routes:

router.get('/admin', authorize(['admin', 'superuser']), (req, res) => {
    res.json({ message: "Welcome, Admin!" });
});

router.get('/dashboard', authorize(['user', 'admin', 'superuser']), (req, res) => {
    res.json({ message: "Welcome to the dashboard!" });
});

This system ensures that only authorized users can access sensitive resources, improving security while maintaining usability.

## Lessons Learned

The most challenging aspect of this project was testing and debugging security features, particularly token management, CSRF protection, and role-based access.

One of the biggest challenges I faced was ensuring JWT tokens were properly returned upon login. Initially, my login response did not include accessToken and refreshToken, which caused issues with authentication. I resolved this by verifying that res.json() correctly sent the tokens in the response.

Another challenge was CSRF protection. At first, my API requests failed due to missing or invalid CSRF tokens. I had to make sure that each request included the CSRF token, and I also had to properly configure cookie-based CSRF protection.

Lastly, role-based access control required careful tracking of login attempts. Automatically upgrading a user to superuser after three successful logins meant implementing a login count system, which needed extensive testing to ensure it functioned correctly.

Despite these challenges, I was able to successfully implement, test, and debug all authentication and security features. This process significantly strengthened the security of the application, ensuring that authentication is both secure and user-friendly.

# Phase 3
## Instructions
- Clone the repository
1. Create a file and open with Visual Studio Code
2. Start a new terminal and enter `git clone https://github.com/CharlotteChen1206/WebSecurityProject.git`
- Install dependencies
1. Make sure Node.js is installed
2. Initialize the project by creating a package.json file with `npm init -y`
3. Install required packages for your project using `npm install express`
- Run the application: In the terminal, run `node app.js`

## Explanations
- Input validation techniques
The project applies strong input validation using both client-side and server-side methods. On the client side [login.ejs], [signup.ejs], JavaScript functions validate username, email, and password formats before form submission. On the server side, [sanitizer.js] defines custom validation functions like validateUsername, validateEmail, and validatePassword, which are used in routes such as [/auth/register] and [/dashboard/update-profile]. These ensure inputs follow strict patterns, preventing malformed or malicious data from reaching the database.

- Output encoding methods
To mitigate XSS attacks during rendering, I’ve sanitized user inputs using a custom sanitizeInput() function in [sanitizer.js]. This method escapes dangerous characters (<, >, &, ', ", /) by replacing them with their HTML entities, ensuring user-generated content (like bio, username, etc.) is safely displayed in EJS templates such as [dashboard.ejs]. This approach helps prevent malicious scripts from executing in the browser when rendering dynamic data.

- Encryption techniques used
The system uses AES-256-CBC encryption for storing sensitive user fields like email and bio in the database. The encryption key is securely stored in the environment variable SECRET_KEY and verified for correct length. Additionally, passwords are hashed using Argon2, a modern and secure password hashing algorithm, before being saved to the database [User.js]. This ensures that even if the database is compromised, sensitive data remains protected.

- Third-party libraries dependency management
I manage third-party libraries and their security using tools like `npm audit` for detecting vulnerabilities in installed packages. Additionally, I’ve enabled GitHub Dependabot alerts and security updates, which automatically notify and patch vulnerable dependencies in this repository. This helps maintain security and stability across the application by ensuring libraries are up to date and safe.

## Lessons Learned
Initially, I chose to store and retrieve user information from a data.json file during the login process. However, I encountered a problem where newly created accounts would overwrite the existing user data in the file. To resolve this issue, I switched to fetching user data directly from MongoDB, which ensured proper data persistence and avoided conflicts between users.

While testing the registration and login functions, I frequently ran into different bugs that made the debugging process challenging. To improve visibility and streamline testing, I added more console.log statements to display detailed error messages at key points in the backend logic. This change significantly helped me identify and resolve issues more efficiently.

From a development perspective, this experience highlights the importance of choosing the right data storage method for user management and maintaining clear, informative logging. It also emphasizes the value of real-time debugging tools and visibility when working with asynchronous operations like database queries and user authentication.