# Setup Instructions
1. Generate SSL Certificate: used OpenSSL to generate a self-signed certificate key.pem and cert.pem
2.  Install https: In the existing Express application, install the https module using npm
3. Add HTTPS Configuration: import https by 
const https = require('https');
const fs = require('fs');
4. Configure SSL in the Server: loaded the SSL files using Node.js's fs module, integrated the SSL options with the HTTPS server
5. Run the HTTPS Server: started the server to listen on a secure HTTPS connection

# SSL Configuration & Lessons Learned
For this project, I decided to use OpenSSL instead of Let’s Encrypt to generate an SSL certificate. While Let’s Encrypt, combined with Certbot, is an excellent option for production websites due to its automatic renewal and support from all modern browsers, it requires a real domain name to issue a certificate. Since my project runs on localhost and does not have a public domain name, I opted for OpenSSL to create a self-signed certificate. This allows me to test HTTPS functionality locally.
I understand that when using a self-signed certificate, browsers will display a "not secure" warning when accessing the webpage. However, this is acceptable for a local development environment, as the goal is to practice implementing HTTPS and securing a web application, rather than deploying it to a live production environment.

The headers added by Helmet significantly enhance the security of the app by mitigating common web vulnerabilities:
- X-Content-Type-Options prevents the browser from interpreting files as a different MIME type, which protects against MIME type attacks.
- X-Frame-Options prevents the app from being embedded in an iframe, mitigating clickjacking attacks.
- Content-Security-Policy (CSP) controls the sources from which content like scripts and images can be loaded, reducing the risk of cross-site scripting (XSS) attacks.
- Strict-Transport-Security (HSTS) ensures that all communications with the server use HTTPS, enhancing the confidentiality and integrity of user data.

Setting up HTTPS was straightforward, as configuring the SSL certificate and integrating it into the server code allowed me to establish a secure connection. However, the most challenging part was verifying that Helmet was functioning correctly. I initially attempted to use curl to test the headers, but I encountered persistent issues connecting to the server. After troubleshooting with various tools, I switched to Postman, which successfully allowed me to inspect the response headers and confirm that Helmet was working as intended. This change in approach helped me overcome the problem efficiently.

# Caching Strategies
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