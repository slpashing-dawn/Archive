import { Book } from '../types/book';

const STORAGE_KEY = 'bookLibrary';

export const storage = {
  getBooks: (): Book[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load books:', error);
      return [];
    }
  },

  saveBooks: (books: Book[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Failed to save books:', error);
    }
  },

  addBook: (book: Book): void => {
    const books = storage.getBooks();
    books.push(book);
    storage.saveBooks(books);
  },

  updateBook: (id: string, updatedBook: Book): void => {
    const books = storage.getBooks();
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
      books[index] = updatedBook;
      storage.saveBooks(books);
    }
  },

  deleteBook: (id: string): void => {
    const books = storage.getBooks();
    const filtered = books.filter(b => b.id !== id);
    storage.saveBooks(filtered);
  },

  importBooks: (books: Book[]): void => {
    storage.saveBooks(books);
  }
};
