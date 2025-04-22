
import Papa from "papaparse";

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        try {
          const transactions = results.data
            .filter(row => {
              // Filter out rows with no amount or invalid data
              const amount = parseFloat(row.amount);
              return !isNaN(amount) && amount !== 0;
            })
            .map((row) => ({
              id: Date.now() + Math.random(),
              type: row.type?.toLowerCase() === 'income' ? 'income' : 'expense',
              amount: Math.abs(parseFloat(row.amount)),
              category: row.category?.trim() || "Other",
              description: row.description?.trim() || "",
              date: row.date || new Date().toISOString().split("T")[0],
              isRecurring: row.recurring === "true" || row.isrecurring === "true",
            }));
          
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
