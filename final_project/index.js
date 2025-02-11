const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated; // Ensure export in auth_users.js
const genl_routes = require('./router/general.js').general; // Ensure export in general.js

const app = express();

// Middleware for JSON requests
app.use(express.json());

// Session middleware
app.use("/customer", session({ 
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true 
}));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Access Token
        const ACCESS_SECRET = process.env.ACCESS_SECRET || "default_access_secret"; // JWT secret key

        jwt.verify(token, ACCESS_SECRET, (err, user) => {
            if (!err) {
                req.user = user; // Attach user data to the request
                next(); // Continue to the next middleware or route handler
            } else {
                console.log('JWT verification failed', err); // Add logging for debugging
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: "Token has expired" });
                }
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Use routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Define the port and start the server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
