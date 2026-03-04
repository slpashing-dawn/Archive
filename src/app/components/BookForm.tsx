import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';

interface BookFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  editingBook?: Book | null;
}

export function BookForm({ open, onClose, onSave, editingBook }: BookFormProps) {
  const [title, setTitle] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [rating, setRating] = useState(0);
  const [length, setLength] = useState('');
  const [completed, setCompleted] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [link, setLink] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setMainCategory(editingBook.mainCategory);
      setSubCategory(editingBook.subCategory);
      setRating(editingBook.rating);
      setLength(editingBook.length);
      setCompleted(editingBook.completed);
      setTags(editingBook.tags);
      setLink(editingBook.link);
      setMemo(editingBook.memo);
    } else {
      resetForm();
    }
  }, [editingBook, open]);

  const resetForm = () => {
    setTitle('');
    setMainCategory('');
    setSubCategory('');
    setRating(0);
    setLength('');
    setCompleted(false);
    setTags([]);
    setTagInput('');
    setLink('');
    setMemo('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const book: Book = {
      id: editingBook?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      mainCategory,
      subCategory,
      rating,
      length,
      completed,
      tags,
      link,
      memo,
      createdAt: editingBook?.createdAt || new Date().toISOString()
    };

    onSave(book);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingBook ? '책 수정' : '새 책 추가'}</DialogTitle>
          <DialogDescription>
            {editingBook ? '책 정보를 수정하세요' : '새 책 정보를 입력하세요'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="책 제목을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mainCategory">대분류 *</Label>
              <Input
                id="mainCategory"
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                required
                placeholder="예: 소설, 비문학"
              />
            </div>
            <div>
              <Label htmlFor="subCategory">소분류</Label>
              <Input
                id="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="예: 추리, 판타지"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">평점 (0-5) *</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="length">길이</Label>
              <Input
                id="length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="예: 300페이지, 단편"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="completed"
              checked={completed}
              onCheckedChange={setCompleted}
            />
            <Label htmlFor="completed">완결</Label>
          </div>

          <div>
            <Label htmlFor="tags">태그</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="태그를 입력하고 Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="link">관련 링크</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              placeholder="책에 대한 메모를 입력하세요"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">
              {editingBook ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}