import { Book } from '../types/book';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (books: Book[]): void => {
  const headers = ['제목', '대분류', '소분류', '평점', '길이', '완결여부', '태그', '관련 링크', '메모'];
  
  const csvContent = [
    headers.join(','),
    ...books.map(book => [
      `"${book.title}"`,
      `"${book.mainCategory}"`,
      `"${book.subCategory}"`,
      book.rating,
      `"${book.length}"`,
      book.completed ? '완결' : '미완결',
      `"${book.tags.join('; ')}"`,
      `"${book.link}"`,
      `"${book.memo.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `책_목록_${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = (books: Book[]): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 제목 추가
  doc.setFontSize(18);
  doc.text('내 책 라이브러리', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString('ko-KR');
  doc.text(`생성일: ${date}`, 105, 22, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text(`총 ${books.length}권`, 105, 28, { align: 'center' });

  // 테이블 데이터 준비
  const tableData = books.map((book, index) => [
    (index + 1).toString(),
    book.title,
    `${book.mainCategory}\n${book.subCategory ? '> ' + book.subCategory : ''}`,
    '★'.repeat(book.rating) + '☆'.repeat(5 - book.rating),
    book.length || '-',
    book.completed ? '완결' : '미완결',
    book.tags.length > 0 ? book.tags.join(', ') : '-',
    book.memo || '-'
  ]);

  // autoTable을 사용하여 테이블 생성
  autoTable(doc, {
    startY: 35,
    head: [['#', '제목', '분류', '평점', '길이', '상태', '태그', '메모']],
    body: tableData,
    styles: {
      font: 'Noto Sans KR',
      fontSize: 8,
      cellPadding: 3,
      lineColor: [201, 165, 143],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [201, 165, 143],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [90, 74, 66],
    },
    alternateRowStyles: {
      fillColor: [250, 244, 239],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },  // #
      1: { cellWidth: 35 },                     // 제목
      2: { cellWidth: 30, fontSize: 7 },       // 분류
      3: { cellWidth: 20, halign: 'center' },  // 평점
      4: { cellWidth: 15, halign: 'center' },  // 길이
      5: { cellWidth: 15, halign: 'center' },  // 상태
      6: { cellWidth: 30, fontSize: 7 },       // 태그
      7: { cellWidth: 35, fontSize: 7 },       // 메모
    },
    margin: { top: 35, left: 10, right: 10 },
    theme: 'grid',
    didDrawPage: (data) => {
      // 페이지 번호 추가
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(155, 139, 130);
      doc.text(
        `Page ${currentPage} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });

  // 링크가 있는 책들을 별도로 표시
  const booksWithLinks = books.filter(book => book.link);
  if (booksWithLinks.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 35;
    
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(90, 74, 66);
    doc.text('관련 링크', 105, 20, { align: 'center' });
    
    let yPos = 30;
    booksWithLinks.forEach((book, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(90, 74, 66);
      doc.text(`${index + 1}. ${book.title}`, 15, yPos);
      yPos += 6;
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const linkText = book.link.length > 70 ? book.link.substring(0, 70) + '...' : book.link;
      doc.textWithLink(linkText, 20, yPos, { url: book.link });
      yPos += 10;
    });
  }
  
  doc.save(`책_목록_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const importFromCSV = (file: File): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header
        const dataLines = lines.slice(1);
        
        const books: Book[] = dataLines.map(line => {
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                currentValue += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue);
          
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: values[0] || '',
            mainCategory: values[1] || '',
            subCategory: values[2] || '',
            rating: parseInt(values[3]) || 0,
            length: values[4] || '',
            completed: values[5] === '완결',
            tags: values[6] ? values[6].split(';').map(t => t.trim()) : [],
            link: values[7] || '',
            memo: values[8] || '',
            createdAt: new Date().toISOString()
          };
        });
        
        resolve(books);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'UTF-8');
  });
};

export const exportToJSON = (books: Book[]): void => {
  const jsonContent = JSON.stringify(books, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `책_목록_${new Date().toISOString().split('T')[0]}.json`);
  link.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const books = JSON.parse(text);
        resolve(books);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
