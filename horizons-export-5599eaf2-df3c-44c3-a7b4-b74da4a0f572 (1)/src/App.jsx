
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import MyFinances from "@/components/MyFinances";
import MyHabits from "@/components/MyHabits";
import Investments from "@/components/Investments";
import AuthForm from "@/components/AuthForm";
import FinanceHelper from "@/components/FinanceHelper";

// Main App component - manages authentication state and routing
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // Check for existing user session on app load
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setIsAuthenticated(true);
      setIsGuest(false);
    }
  }, []);

  // Show authentication form if user is not authenticated
  if (!isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
        <AuthForm 
          setIsAuthenticated={setIsAuthenticated} 
          setIsGuest={setIsGuest} 
        />
        <Toaster />
      </div>
    );
  }

  // Main app layout with navigation and routes
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
        <Navbar 
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          isGuest={isGuest}
          setIsGuest={setIsGuest}
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MyFinances />} />
            <Route path="/habits" element={<MyHabits />} />
            <Route path="/investments" element={<Investments />} />
          </Routes>
        </main>
        <FinanceHelper />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
