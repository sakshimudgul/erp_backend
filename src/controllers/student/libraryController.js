const { Book, Library, Subject } = require('../../models');
const { ApiResponse } = require('../../utils/apiResponse');
const { parseQueryParams } = require('../../utils/helpers');
const logger = require('../../utils/logger');

// In-memory borrow records (would be a model in real app)
const borrowRecords = [];

const libraryController = {
  // Search books
  searchBooks: async (req, res) => {
    try {
      const { query, category, subjectId, page = 1, limit = 10 } = req.query;

      const where = { isActive: true };
      
      if (query) {
        where[Op.or] = [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { isbn: { [Op.like]: `%${query}%` } }
        ];
      }
      
      if (category) {
        where.category = category;
      }
      
      if (subjectId) {
        where.subjectId = subjectId;
      }

      const { count, rows } = await Book.findAndCountAll({
        where,
        limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: Library,
            as: 'library'
          },
          {
            model: Subject,
            as: 'subject'
          }
        ]
      });

      res.status(200).json(new ApiResponse(true, 'Books retrieved', {
        books: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }, 200));
    } catch (error) {
      logger.error('Search books error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to search books', null, 500));
    }
  },

  // Get book details
  getBookDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const book = await Book.findByPk(id, {
        include: [
          {
            model: Library,
            as: 'library'
          },
          {
            model: Subject,
            as: 'subject'
          }
        ]
      });

      if (!book) {
        return res.status(404).json(new ApiResponse(false, 'Book not found', null, 404));
      }

      // Check if book is available
      const isAvailable = book.availableCopies > 0;

      res.status(200).json(new ApiResponse(true, 'Book details retrieved', {
        book,
        isAvailable
      }, 200));
    } catch (error) {
      logger.error('Get book details error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get book details', null, 500));
    }
  },

  // Borrow book
  borrowBook: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json(new ApiResponse(false, 'Book not found', null, 404));
      }

      if (book.availableCopies <= 0) {
        return res.status(400).json(new ApiResponse(false, 'No copies available', null, 400));
      }

      // Check if user already has this book
      const existingBorrow = borrowRecords.find(
        r => r.bookId === parseInt(id) && r.userId === userId && r.status === 'borrowed'
      );

      if (existingBorrow) {
        return res.status(400).json(new ApiResponse(false, 'You already have this book', null, 400));
      }

      // Create borrow record
      const borrowRecord = {
        id: Date.now(),
        bookId: parseInt(id),
        userId,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'borrowed'
      };

      borrowRecords.push(borrowRecord);

      // Update book availability
      await book.update({
        availableCopies: book.availableCopies - 1
      });

      res.status(200).json(new ApiResponse(true, 'Book borrowed', { borrowRecord }, 200));
    } catch (error) {
      logger.error('Borrow book error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to borrow book', null, 500));
    }
  },

  // Return book
  returnBook: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const borrowRecord = borrowRecords.find(
        r => r.bookId === parseInt(id) && r.userId === userId && r.status === 'borrowed'
      );

      if (!borrowRecord) {
        return res.status(404).json(new ApiResponse(false, 'Borrow record not found', null, 404));
      }

      // Update borrow record
      borrowRecord.status = 'returned';
      borrowRecord.returnDate = new Date();

      // Update book availability
      const book = await Book.findByPk(id);
      if (book) {
        await book.update({
          availableCopies: book.availableCopies + 1
        });
      }

      res.status(200).json(new ApiResponse(true, 'Book returned', null, 200));
    } catch (error) {
      logger.error('Return book error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to return book', null, 500));
    }
  },

  // Get my borrowed books
  getMyBooks: async (req, res) => {
    try {
      const userId = req.userId;

      const myBorrows = borrowRecords.filter(
        r => r.userId === userId && r.status === 'borrowed'
      );

      // Get book details
      const books = [];
      for (const borrow of myBorrows) {
        const book = await Book.findByPk(borrow.bookId);
        if (book) {
          books.push({
            ...borrow,
            book
          });
        }
      }

      res.status(200).json(new ApiResponse(true, 'My books retrieved', { books }, 200));
    } catch (error) {
      logger.error('Get my books error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get my books', null, 500));
    }
  },

  // Get borrowing history
  getBorrowingHistory: async (req, res) => {
    try {
      const userId = req.userId;

      const history = borrowRecords
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

      // Get book details
      const historyWithBooks = [];
      for (const record of history) {
        const book = await Book.findByPk(record.bookId);
        if (book) {
          historyWithBooks.push({
            ...record,
            book
          });
        }
      }

      res.status(200).json(new ApiResponse(true, 'Borrowing history retrieved', { history: historyWithBooks }, 200));
    } catch (error) {
      logger.error('Get borrowing history error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get borrowing history', null, 500));
    }
  },

  // Get library info
  getLibraryInfo: async (req, res) => {
    try {
      const library = await Library.findOne({
        where: { isActive: true },
        include: [
          {
            model: User,
            as: 'librarian',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });

      if (!library) {
        return res.status(404).json(new ApiResponse(false, 'Library not found', null, 404));
      }

      const totalBooks = await Book.count({ where: { libraryId: library.id } });
      const availableBooks = await Book.sum('availableCopies', { where: { libraryId: library.id } });

      const info = {
        ...library.toJSON(),
        statistics: {
          totalBooks,
          availableBooks
        }
      };

      res.status(200).json(new ApiResponse(true, 'Library info retrieved', { info }, 200));
    } catch (error) {
      logger.error('Get library info error:', error);
      res.status(500).json(new ApiResponse(false, 'Failed to get library info', null, 500));
    }
  }
};

module.exports = libraryController;