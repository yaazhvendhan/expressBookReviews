const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Access Token
        const ACCESS_SECRET = process.env.ACCESS_SECRET || "default_access_secret";

        jwt.verify(token, ACCESS_SECRET, (err, user) => {
            if (!err) {
                req.user = user; // Attach user info to the request
                next(); // Proceed to the next middleware or route handler
            } else {
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

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.listen(PORT,()=>console.log("Server is running"));