export interface Book {
  id: string;
  title: string;
  mainCategory: string;
  subCategory: string;
  rating: number;
  length: string;
  completed: boolean;
  tags: string[];
  link: string;
  memo: string;
  createdAt: string;
}

export interface FilterState {
  mainCategory: string;
  subCategory: string;
  tags: string[];
  sortBy: 'rating' | 'title' | 'createdAt';
}
