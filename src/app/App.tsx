import { useState, useEffect, useMemo } from 'react';
import { Book, FilterState } from './types/book';
import { storage } from './lib/storage';
import { BookForm } from './components/BookForm';
import { BookCard } from './components/BookCard';
import { FilterPanel } from './components/FilterPanel';
import { ExportImport } from './components/ExportImport';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Plus, Search, BookOpen } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    mainCategory: '',
    subCategory: '',
    tags: [],
    sortBy: 'createdAt',
  });

  // Load books from localStorage on mount
  useEffect(() => {
    const loadedBooks = storage.getBooks();
    setBooks(loadedBooks);
  }, []);

  // Get unique categories and tags
  const categories = useMemo(() => {
    return Array.from(new Set(books.map(b => b.mainCategory))).filter(Boolean);
  }, [books]);

  const subCategories = useMemo(() => {
    if (!filters.mainCategory) return [];
    return Array.from(
      new Set(
        books
          .filter(b => b.mainCategory === filters.mainCategory)
          .map(b => b.subCategory)
      )
    ).filter(Boolean);
  }, [books, filters.mainCategory]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    books.forEach(book => {
      book.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = books;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.mainCategory.toLowerCase().includes(query) ||
          book.subCategory.toLowerCase().includes(query) ||
          book.tags.some(tag => tag.toLowerCase().includes(query)) ||
          book.memo.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.mainCategory) {
      result = result.filter(book => book.mainCategory === filters.mainCategory);
    }

    if (filters.subCategory) {
      result = result.filter(book => book.subCategory === filters.subCategory);
    }

    // Tag filter (show books that have ANY of the selected tags)
    if (filters.tags.length > 0) {
      result = result.filter(book =>
        filters.tags.some(tag => book.tags.includes(tag))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title, 'ko');
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [books, searchQuery, filters]);

  const handleSaveBook = (book: Book) => {
    if (editingBook) {
      storage.updateBook(book.id, book);
      setBooks(books.map(b => (b.id === book.id ? book : b)));
      toast.success('책 정보가 수정되었습니다');
    } else {
      storage.addBook(book);
      setBooks([...books, book]);
      toast.success('새 책이 추가되었습니다');
    }
    setEditingBook(null);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleDeleteBook = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      storage.deleteBook(deleteId);
      setBooks(books.filter(b => b.id !== deleteId));
      toast.success('책이 삭제되었습니다');
      setDeleteId(null);
    }
  };

  const handleImport = (importedBooks: Book[]) => {
    storage.importBooks(importedBooks);
    setBooks(importedBooks);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBook(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl mb-2 tracking-wide">내 책 라이브러리</h1>
          <p className="text-muted-foreground text-lg">
            읽은 책을 정리하고 관리하세요
          </p>

          {/* Stats - 오른쪽 상단에 작게 표시 */}
          <div className="absolute top-0 right-0 flex gap-2">
            <div className="text-center p-2 bg-card rounded-xl border border-primary/20 shadow-sm min-w-[80px]">
              <div className="text-xl font-bold text-primary">{books.length}</div>
              <div className="text-xs text-muted-foreground">전체</div>
            </div>
            <div className="text-center p-2 bg-card rounded-xl border border-primary/20 shadow-sm min-w-[80px]">
              <div className="text-xl font-bold text-primary">{filteredBooks.length}</div>
              <div className="text-xs text-muted-foreground">표시</div>
            </div>
            <div className="text-center p-2 bg-card rounded-xl border border-primary/20 shadow-sm min-w-[80px]">
              <div className="text-xl font-bold text-primary">{books.filter(b => b.completed).length}</div>
              <div className="text-xs text-muted-foreground">완결</div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="책 제목, 분류, 태그, 메모 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-2 border-primary/20 focus:border-primary/40 bg-card shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <ExportImport books={books} onImport={handleImport} />
            <Button onClick={() => setIsFormOpen(true)} className="rounded-2xl px-6 h-12 shadow-md hover:shadow-lg transition-all">
              <Plus className="mr-2 h-5 w-5" />
              책 추가
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          categories={categories}
          subCategories={subCategories}
          allTags={allTags}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Book Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-primary/20 mt-6">
            <div className="p-6 bg-primary/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">책이 없습니다</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              {books.length === 0
                ? '첫 번째 책을 추가해보세요'
                : '검색 조건과 일치하는 책이 없습니다'}
            </p>
            {books.length === 0 && (
              <Button onClick={() => setIsFormOpen(true)} size="lg" className="rounded-2xl px-8">
                <Plus className="mr-2 h-5 w-5" />
                책 추가하기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}

        {/* Book Form Dialog */}
        <BookForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveBook}
          editingBook={editingBook}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>책 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </div>
  );
}