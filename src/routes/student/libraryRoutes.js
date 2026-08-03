const express = require('express');
const router = express.Router();
const libraryController = require('../../controllers/student/libraryController');

// Book management
router.get('/books', libraryController.searchBooks);
router.get('/books/:id', libraryController.getBookDetails);
router.post('/books/:id/borrow', libraryController.borrowBook);
router.post('/books/:id/return', libraryController.returnBook);

// My borrowings
router.get('/my-books', libraryController.getMyBooks);
router.get('/history', libraryController.getBorrowingHistory);

// Library info
router.get('/info', libraryController.getLibraryInfo);

module.exports = router;