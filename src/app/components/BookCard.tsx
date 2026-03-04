import { Book } from '../types/book';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pencil, Trash2, ExternalLink, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  return (
    <Card className="h-full flex flex-col shadow-md hover:shadow-xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-card to-card/90">
      <CardHeader className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-relaxed">{book.title}</CardTitle>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(book)}
              className="h-8 w-8 hover:bg-primary/20 rounded-full"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(book.id)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < book.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
          <span className="ml-1">({book.rating})</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="text-sm p-3 bg-muted/50 rounded-lg">
          <div className="text-muted-foreground text-xs mb-1">분류</div>
          <div className="font-medium">{book.mainCategory} › {book.subCategory || '-'}</div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">길이:</span>
            <span className="font-medium">{book.length || '-'}</span>
          </div>
          <div>
            <Badge 
              variant={book.completed ? 'default' : 'secondary'}
              className="rounded-full px-3"
            >
              {book.completed ? '완결' : '미완결'}
            </Badge>
          </div>
        </div>

        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {book.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs rounded-full px-2.5 py-0.5 bg-secondary/50">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {book.memo && (
          <div className="text-sm p-3 bg-accent/30 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">메모</div>
            <p className="line-clamp-3 text-sm leading-relaxed">{book.memo}</p>
          </div>
        )}

        {book.link && (
          <a
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            링크 보기
          </a>
        )}
      </CardContent>
    </Card>
  );
}