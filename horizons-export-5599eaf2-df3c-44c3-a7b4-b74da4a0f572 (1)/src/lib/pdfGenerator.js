
import { jsPDF } from "jspdf";

export const generatePDF = (transactions) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text("Financial Report", 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Add transactions
  doc.setFontSize(14);
  doc.text("Transactions", 20, 45);
  
  let y = 55;
  transactions.forEach((transaction) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(10);
    const amount = transaction.type === "income" ? 
      `+$${transaction.amount}` : 
      `-$${transaction.amount}`;
    
    doc.text(new Date(transaction.date).toLocaleDateString(), 20, y);
    doc.text(transaction.category, 50, y);
    doc.text(transaction.description, 90, y);
    doc.text(amount, 170, y);
    
    y += 10;
  });
  
  // Add summary
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;
  
  y += 10;
  doc.setFontSize(12);
  doc.text(`Total Income: $${income.toFixed(2)}`, 20, y);
  doc.text(`Total Expenses: $${expenses.toFixed(2)}`, 20, y + 10);
  doc.text(`Balance: $${balance.toFixed(2)}`, 20, y + 20);
  
  // Save the PDF
  doc.save("financial-report.pdf");
};
