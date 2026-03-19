import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (headers: string[], data: any[][], fileName: string, title: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { top: 35 },
  });
  
  doc.save(`${fileName}.pdf`);
};
