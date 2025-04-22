
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Download, Upload, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generatePDF } from "@/lib/pdfGenerator";
import { parseCSV } from "@/lib/csvParser";

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Insurance",
  "Debt Payments",
  "Other"
];

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Rental Income",
  "Business",
  "Gifts",
  "Other"
];

const ITEMS_PER_PAGE = 10;

const MyFinances = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    amount: "",
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split("T")[0],
    description: "",
    isRecurring: false,
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const storageKey = currentUser ? `transactions_${currentUser.id}` : "transactions_guest";

  useEffect(() => {
    const savedTransactions = localStorage.getItem(storageKey);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [storageKey]);

  useEffect(() => {
    setNewTransaction(prev => ({
      ...prev,
      category: prev.type === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
    }));
  }, [newTransaction.type]);

  const saveTransactions = (newTransactions) => {
    localStorage.setItem(storageKey, JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount),
    };
    
    const updatedTransactions = [...transactions, transaction];
    saveTransactions(updatedTransactions);
    
    setShowAddForm(false);
    setNewTransaction({
      type: "expense",
      amount: "",
      category: EXPENSE_CATEGORIES[0],
      date: new Date().toISOString().split("T")[0],
      description: "",
      isRecurring: false,
    });

    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  const handleDelete = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    saveTransactions(updatedTransactions);
    
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
  };

  const handleImportCSV = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const importedTransactions = await parseCSV(file);
      
      if (importedTransactions.length === 0) {
        toast({
          title: "Error",
          description: "No valid transactions found in the CSV file",
          variant: "destructive",
        });
        return;
      }

      saveTransactions([...transactions, ...importedTransactions]);
      
      toast({
        title: "Success",
        description: `Imported ${importedTransactions.length} transactions successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import transactions. Please check your CSV format.",
        variant: "destructive",
      });
    }
    e.target.value = "";
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    return 0;
  });

  const filteredTransactions = sortedTransactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Finances</h1>
        <div className="flex space-x-2">
          <Button onClick={() => generatePDF(transactions)}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("csv-input").click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Search className="text-gray-400 w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 glass-card rounded-xl space-y-4"
          onSubmit={handleAddTransaction}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="finance-input"
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, type: e.target.value })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="finance-input"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, amount: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="finance-input"
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, category: e.target.value })
              }
            >
              {(newTransaction.type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              className="finance-input"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="finance-input"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                className="mr-2"
                checked={newTransaction.isRecurring}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    isRecurring: e.target.checked,
                  })
                }
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Recurring
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Transaction</Button>
          </div>
        </motion.form>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => handleSort('date')}>
            Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleSort('amount')}>
            Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </Button>
        </div>

        <AnimatePresence>
          {paginatedTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 glass-card rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {transaction.category}
                    </span>
                  </div>
                  {expandedTransaction === transaction.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-gray-700 mt-2">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.isRecurring && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Recurring
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(transaction.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFinances;
