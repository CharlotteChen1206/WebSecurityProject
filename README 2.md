# Setting Up the Repository

I initialized this repository during Phase 1, so I just edited the file on local and push it to github again. Setting up the project is straightforward. To begin, I install dependencies using:

`npm install argon2 body-parser connect-mongo cookie-parser csurf dotenv express express-rate-limit express-session helmet jsonwebtoken mongoose nodemon passport passport-google-oauth20`

All required dependencies, as listed in my package.json, include essential security and authentication libraries such as express, mongoose, jsonwebtoken, passport, csurf, and express-rate-limit.

Next, I created a .env file to store environment variables such as: PORT, MONGO_URI, JWT_SECRET, REFRESH_SECRET, SESSION_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET.

To start the application, I used node server.js.

I did not encounter any major setup issues since I completed all features before moving on to documentation. However, if any issues arise, common troubleshooting steps include verifying that MongoDB is running, dependencies are installed correctly, and the .env file is properly configured.

# Authentication Mechanisms

I implemented two authentication methods: password-based authentication and Google SSO. This dual authentication system allows users the flexibility to choose between traditional login credentials and a quicker Google-based sign-in.

For password-based authentication, I securely hash passwords using argon2 before storing them in the database. Users' credentials are verified upon login, and JWT tokens (accessToken and refreshToken) manage session authentication.

For Google SSO, I used passport-google-oauth20 to integrate OAuth authentication. Users can log in without creating a password, making authentication both secure and convenient.

To enhance security, I implemented rate limiting for login attempts, CSRF protection to prevent unauthorized requests, and secure session management using express-session. These security measures ensure that authentication is not only user-friendly but also resistant to attacks.

## Secure session management
To enhance session security, I configured express-session with the following security measures:

- HttpOnly: true – Prevents JavaScript from accessing session cookies, mitigating XSS attacks.
- secure: true – Ensures cookies are only sent over HTTPS in production.
- sameSite: 'strict' – Prevents CSRF attacks by restricting cookie sharing across sites.
- Session expiration (maxAge: 15 minutes) – Automatically logs users out after inactivity to reduce session hijacking risks.

# Role-Based Access Control

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

# Lessons Learned

The most challenging aspect of this project was testing and debugging security features, particularly token management, CSRF protection, and role-based access.

One of the biggest challenges I faced was ensuring JWT tokens were properly returned upon login. Initially, my login response did not include accessToken and refreshToken, which caused issues with authentication. I resolved this by verifying that res.json() correctly sent the tokens in the response.

Another challenge was CSRF protection. At first, my API requests failed due to missing or invalid CSRF tokens. I had to make sure that each request included the CSRF token, and I also had to properly configure cookie-based CSRF protection.

Lastly, role-based access control required careful tracking of login attempts. Automatically upgrading a user to superuser after three successful logins meant implementing a login count system, which needed extensive testing to ensure it functioned correctly.

Despite these challenges, I was able to successfully implement, test, and debug all authentication and security features. This process significantly strengthened the security of the application, ensuring that authentication is both secure and user-friendly.