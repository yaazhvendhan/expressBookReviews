const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const regd_users = express.Router();

const users = [];
const books = {
    "1": {
        "title": "Things Fall Apart",
        "author": "Chinua Achebe",
        "reviews": []
    },
    "2": {
        "title": "1984",
        "author": "George Orwell",
        "reviews": []
    }
};

const ACCESS_SECRET = process.env.ACCESS_SECRET || "default_access_secret";

regd_users.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Middleware for authentication
function authenticateUser(req, res, next) {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];

        jwt.verify(token, ACCESS_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
}

// Task 7: User Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, ACCESS_SECRET, { expiresIn: '1h' });
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ message: "Login successful", token });
});

// Task 8: Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", authenticateUser, (req, res) => {
    const ISBN = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username;

    if (!books[ISBN]) {
        return res.status(404).json({ message: "Book not found" });
    }

    let existingReview = books[ISBN].reviews.find(r => r.reviewer === username);
    if (existingReview) {
        existingReview.review = review;
    } else {
        books[ISBN].reviews.push({ reviewer: username, review });
    }

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[ISBN].reviews });
});

// Task 9: Delete a Book Review
regd_users.delete("/auth/review/:isbn", authenticateUser, (req, res) => {
    const ISBN = req.params.isbn;
    const username = req.user.username;

    if (!books[ISBN]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const initialLength = books[ISBN].reviews.length;
    books[ISBN].reviews = books[ISBN].reviews.filter(r => r.reviewer !== username);

    if (books[ISBN].reviews.length === initialLength) {
        return res.status(404).json({ message: "No review found for this book from the current user" });
    }

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[ISBN].reviews });
});

module.exports.authenticated = regd_users;
