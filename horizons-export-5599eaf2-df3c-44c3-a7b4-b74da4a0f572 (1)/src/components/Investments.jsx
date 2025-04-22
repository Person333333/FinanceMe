
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Investments = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [newInvestment, setNewInvestment] = useState({
    type: "stocks",
    name: "",
    amount: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    currentValue: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const storageKey = currentUser ? `investments_${currentUser.id}` : "investments_guest";

  useEffect(() => {
    const savedInvestments = localStorage.getItem(storageKey);
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    }
  }, [storageKey]);

  const saveInvestments = (newInvestments) => {
    localStorage.setItem(storageKey, JSON.stringify(newInvestments));
    setInvestments(newInvestments);
  };

  const handleAddInvestment = (e) => {
    e.preventDefault();
    const investment = {
      ...newInvestment,
      id: Date.now(),
      amount: parseFloat(newInvestment.amount),
      currentValue: parseFloat(newInvestment.currentValue),
    };
    
    const updatedInvestments = [...investments, investment];
    saveInvestments(updatedInvestments);
    
    setShowAddForm(false);
    setNewInvestment({
      type: "stocks",
      name: "",
      amount: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      currentValue: "",
    });

    toast({
      title: "Success",
      description: "Investment added successfully",
    });
  };

  const handleUpdateValue = (id, newValue) => {
    const updatedInvestments = investments.map(inv =>
      inv.id === id ? { ...inv, currentValue: parseFloat(newValue) } : inv
    );
    saveInvestments(updatedInvestments);
    setEditingInvestment(null);

    toast({
      title: "Success",
      description: "Investment value updated successfully",
    });
  };

  const handleDelete = (id) => {
    const updatedInvestments = investments.filter((i) => i.id !== id);
    saveInvestments(updatedInvestments);
    
    toast({
      title: "Success",
      description: "Investment deleted successfully",
    });
  };

  const calculateReturn = (investment) => {
    const returnValue = investment.currentValue - investment.amount;
    const returnPercentage = (returnValue / investment.amount) * 100;
    return {
      value: returnValue.toFixed(2),
      percentage: returnPercentage.toFixed(2),
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Investments</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 glass-card rounded-xl space-y-4"
          onSubmit={handleAddInvestment}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="finance-input"
                value={newInvestment.type}
                onChange={(e) =>
                  setNewInvestment({ ...newInvestment, type: e.target.value })
                }
              >
                <option value="stocks">Stocks</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="bonds">Bonds</option>
                <option value="realestate">Real Estate</option>
                <option value="commodities">Commodities</option>
                <option value="p2p">P2P Lending</option>
                <option value="etf">ETFs</option>
                <option value="mutual">Mutual Funds</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="finance-input"
                value={newInvestment.name}
                onChange={(e) =>
                  setNewInvestment({ ...newInvestment, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Purchase Amount
              </label>
              <input
                type="number"
                step="0.01"
                className="finance-input"
                value={newInvestment.amount}
                onChange={(e) =>
                  setNewInvestment({ ...newInvestment, amount: e.target.value })
                }
                required
              />
            />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Value
              </label>
              <input
                type="number"
                step="0.01"
                className="finance-input"
                value={newInvestment.currentValue}
                onChange={(e) =>
                  setNewInvestment({
                    ...newInvestment,
                    currentValue: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purchase Date</label>
            <input
              type="date"
              className="finance-input"
              value={newInvestment.purchaseDate}
              onChange={(e) =>
                setNewInvestment({
                  ...newInvestment,
                  purchaseDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Investment</Button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investments.map((investment) => {
          const returns = calculateReturn(investment);
          return (
            <motion.div
              key={investment.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 glass-card rounded-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{investment.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {investment.type}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingInvestment(investment.id)}
                  >
                    <Edit2 className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(investment.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Purchase Amount:</span>
                  <span className="font-medium">${investment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Value:</span>
                  {editingInvestment === investment.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        className="finance-input w-24 text-right py-0 px-1"
                        defaultValue={investment.currentValue}
                        onBlur={(e) => handleUpdateValue(investment.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateValue(investment.id, e.target.value);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span className="font-medium">${investment.currentValue.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Return:</span>
                  <span
                    className={`font-medium ${
                      returns.value >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${returns.value} ({returns.percentage}%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Purchase Date:</span>
                  <span className="font-medium">
                    {new Date(investment.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Investments;
