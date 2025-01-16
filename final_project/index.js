const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
if (!token) {
    return res.status(401).send('Access Denied');
}

jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
        return res.status(403).send('Invalid token');
    }
    req.user = decoded; // Attach user data to request
    next(); // Proceed to the next middleware
});
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
