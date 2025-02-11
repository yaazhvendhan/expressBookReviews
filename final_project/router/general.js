const express = require('express');
const public_users = express.Router();

// Dummy data for books and users
let books = {
    "1": {
        "title": "Things Fall Apart",
        "author": "Chinua Achebe",
        "reviews": [
            { "reviewer": "John", "review": "An amazing book!" },
            { "reviewer": "Sarah", "review": "A captivating story of tribal life." }
        ]
    },
    "2": {
        "title": "1984",
        "author": "George Orwell",
        "reviews": [
            { "reviewer": "Alice", "review": "A powerful dystopian novel." }
        ]
    }
};

let users = []; // Array to store registered users

// Task 1: Get all books available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4)); // Pretty print with 4 spaces for indentation
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    const book = books[ISBN];

    if (book) {
        res.json(book); // Return book details if found
    } else {
        res.status(404).json({ error: "Book not found" }); // Error message if ISBN is invalid
    }
});

// Task 3: Get books by author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let filteredBooks = [];

    for (let ISBN in books) {
        if (books[ISBN].author === author) {
            filteredBooks.push(books[ISBN]);
        }
    }

    if (filteredBooks.length > 0) {
        res.json(filteredBooks); // Return books if found
    } else {
        res.status(404).json({ error: "Books by this author not found" }); // If no books found
    }
});

// Task 4: Get books by title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let filteredBooks = [];

    for (let ISBN in books) {
        if (books[ISBN].title === title) {
            filteredBooks.push(books[ISBN]);
        }
    }

    if (filteredBooks.length > 0) {
        res.json(filteredBooks); // Return books if found
    } else {
        res.status(404).json({ error: "Books with this title not found" }); // If no books found
    }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    const book = books[ISBN];

    if (book && book.reviews) {
        res.json(book.reviews); // Return reviews if available
    } else {
        res.status(404).json({ error: "No reviews found for this book" }); // If no reviews found
    }
});

// Task 6: Register a new user
public_users.post("/register", function (req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
