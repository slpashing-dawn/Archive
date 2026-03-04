import { useRef } from 'react';
import { Book } from '../types/book';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Download, Upload, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToJSON, importFromCSV, importFromJSON } from '../lib/export';
import { toast } from 'sonner';

interface ExportImportProps {
  books: Book[];
  onImport: (books: Book[]) => void;
}

export function ExportImport({ books, onImport }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      exportToCSV(books);
      toast.success('CSV 파일로 내보내기 완료');
    } catch (error) {
      toast.error('CSV 내보내기 실패');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(books);
      toast.success('PDF 파일로 내보내기 완료');
    } catch (error) {
      toast.error('PDF 내보내기 실패');
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON(books);
      toast.success('JSON 파일로 내보내기 완료');
    } catch (error) {
      toast.error('JSON 내보내기 실패');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let importedBooks: Book[] = [];
      
      if (file.name.endsWith('.csv')) {
        importedBooks = await importFromCSV(file);
      } else if (file.name.endsWith('.json')) {
        importedBooks = await importFromJSON(file);
      } else {
        toast.error('지원하지 않는 파일 형식입니다');
        return;
      }

      onImport(importedBooks);
      toast.success(`${importedBooks.length}권의 책을 가져왔습니다`);
    } catch (error) {
      toast.error('파일 가져오기 실패');
      console.error(error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-2xl px-6 h-12 shadow-sm hover:shadow-md transition-all border-2 border-primary/20">
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-xl">
          <DropdownMenuItem onClick={handleExportJSON} className="rounded-lg">
            <FileJson className="mr-2 h-4 w-4" />
            JSON (백업용)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV} className="rounded-lg">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV (엑셀)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF} className="rounded-lg">
            <FileText className="mr-2 h-4 w-4" />
            PDF (읽기 전용)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-2xl px-6 h-12 shadow-sm hover:shadow-md transition-all border-2 border-primary/20"
      >
        <Upload className="mr-2 h-4 w-4" />
        가져오기
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}