
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Settings } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const MyHabits = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [budget, setBudget] = useState({
    monthly: 1000,
    categories: Object.fromEntries(EXPENSE_CATEGORIES.map(cat => [cat.toLowerCase(), 0]))
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userKey = currentUser ? `budget_${currentUser.id}` : "budget_guest";

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem(currentUser ? `transactions_${currentUser.id}` : "transactions_guest") || "[]");
    const savedBudget = JSON.parse(localStorage.getItem(userKey) || JSON.stringify(budget));
    
    setTransactions(savedTransactions);
    setBudget(savedBudget);
  }, []);

  const saveBudget = (newBudget) => {
    localStorage.setItem(userKey, JSON.stringify(newBudget));
    setBudget(newBudget);
    
    toast({
      title: "Success",
      description: "Budget updated successfully",
    });
  };

  const getSpendingData = () => {
    const monthlySpending = {};
    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const month = new Date(transaction.date).toLocaleString("default", {
          month: "short",
        });
        monthlySpending[month] = (monthlySpending[month] || 0) + transaction.amount;
      }
    });

    return {
      labels: Object.keys(monthlySpending),
      datasets: [
        {
          label: "Monthly Spending",
          data: Object.values(monthlySpending),
          borderColor: "rgb(34, 197, 94)",
          tension: 0.4,
        },
      ],
    };
  };

  const getCategorySpending = () => {
    const categorySpending = {};
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    transactions
      .filter(t => t.type === "expense" && new Date(t.date) >= lastMonth)
      .forEach((transaction) => {
        const category = transaction.category.toLowerCase();
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      });
    return categorySpending;
  };

  const getSpendingAdvice = () => {
    const categorySpending = getCategorySpending();
    const advice = [];
    const averages = {};

    // Calculate averages
    Object.entries(categorySpending).forEach(([category, amount]) => {
      averages[category] = amount / 30; // Daily average
    });

    // Compare with budget and generate advice
    Object.entries(budget.categories).forEach(([category, limit]) => {
      const spent = categorySpending[category] || 0;
      const monthlyAverage = (averages[category] || 0) * 30;

      if (spent > limit && limit > 0) {
        advice.push({
          type: "warning",
          message: `Your ${category} spending (${spent.toFixed(2)}) is ${((spent/limit - 1) * 100).toFixed(1)}% over budget. Consider reducing expenses in this category.`
        });
      } else if (spent < limit * 0.5 && limit > 0) {
        advice.push({
          type: "opportunity",
          message: `You're significantly under budget in ${category}. This might be a good opportunity to invest in your wellbeing or save the difference.`
        });
      }

      // Compare with average spending
      if (monthlyAverage > 0 && Math.abs(spent - monthlyAverage) / monthlyAverage > 0.3) {
        advice.push({
          type: "insight",
          message: spent > monthlyAverage 
            ? `Your ${category} spending is unusually high this month (${((spent/monthlyAverage - 1) * 100).toFixed(1)}% above average)`
            : `Your ${category} spending is lower than usual (${((1 - spent/monthlyAverage) * 100).toFixed(1)}% below average)`
        });
      }
    });

    return advice;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
        <Button onClick={() => setShowBudgetSettings(!showBudgetSettings)}>
          <Settings className="w-4 h-4 mr-2" />
          Budget Settings
        </Button>
      </div>

      {showBudgetSettings && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 glass-card rounded-xl space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Budget Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Budget</label>
              <input
                type="number"
                className="finance-input"
                value={budget.monthly}
                onChange={(e) => saveBudget({ ...budget, monthly: parseFloat(e.target.value) })}
              />
            </div>
            {EXPENSE_CATEGORIES.map((category) => (
              <div key={category}>
                <label className="block text-sm font-medium mb-1">{category} Budget</label>
                <input
                  type="number"
                  className="finance-input"
                  value={budget.categories[category.toLowerCase()]}
                  onChange={(e) => {
                    const newCategories = { ...budget.categories };
                    newCategories[category.toLowerCase()] = parseFloat(e.target.value) || 0;
                    saveBudget({ ...budget, categories: newCategories });
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="chart-container"
        >
          <h2 className="text-xl font-semibold mb-4">Spending Trends</h2>
          <Line data={getSpendingData()} options={{ responsive: true }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <h2 className="text-xl font-semibold mb-4">Budget Goals</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(budget.categories).map(([category, limit]) => {
              const spent = getCategorySpending()[category] || 0;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{category}</span>
                    <span>
                      ${spent.toFixed(2)} / ${limit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${percentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card"
      >
        <h2 className="text-xl font-semibold mb-4">Smart Advice</h2>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {getSpendingAdvice().map((advice, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                advice.type === "warning" 
                  ? "bg-red-50 text-red-700" 
                  : advice.type === "opportunity"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {advice.message}
            </div>
          ))}
          {getSpendingAdvice().length === 0 && (
            <p className="text-sm text-gray-700">
              You're doing great! Keep maintaining your current spending habits.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyHabits;
