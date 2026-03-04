import { FilterState } from '../types/book';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface FilterPanelProps {
  categories: string[];
  subCategories: string[];
  allTags: string[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterPanel({
  categories,
  subCategories,
  allTags,
  filters,
  onFilterChange,
}: FilterPanelProps) {
  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      mainCategory: value === 'all' ? '' : value,
      subCategory: '',
    });
  };

  const handleSubCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      subCategory: value === 'all' ? '' : value,
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sortBy: value as FilterState['sortBy'],
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({
      ...filters,
      tags: newTags,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      mainCategory: '',
      subCategory: '',
      tags: [],
      sortBy: 'createdAt',
    });
  };

  const hasActiveFilters =
    filters.mainCategory || filters.subCategory || filters.tags.length > 0;

  return (
    <div className="space-y-4 p-6 bg-card rounded-2xl border-2 border-primary/20 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">필터</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 rounded-full hover:bg-primary/20"
          >
            초기화
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>대분류</Label>
          <Select
            value={filters.mainCategory || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="rounded-xl border-2 border-primary/20 focus:border-primary/40">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>소분류</Label>
          <Select
            value={filters.subCategory || 'all'}
            onValueChange={handleSubCategoryChange}
            disabled={!filters.mainCategory}
          >
            <SelectTrigger className="rounded-xl border-2 border-primary/20 focus:border-primary/40">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {subCategories.map(sub => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>정렬</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="rounded-xl border-2 border-primary/20 focus:border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">평점순</SelectItem>
              <SelectItem value="title">제목순</SelectItem>
              <SelectItem value="createdAt">최신순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <Label className="mb-2 block">태그 필터</Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer rounded-full px-3 py-1.5 transition-all hover:scale-105"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
                {filters.tags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}