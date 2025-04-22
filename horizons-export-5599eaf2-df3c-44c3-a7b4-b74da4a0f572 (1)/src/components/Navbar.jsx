
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, PieChart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Navbar = ({ isAuthenticated, setIsAuthenticated, isGuest, setIsGuest }) => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    localStorage.removeItem("currentUser");
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  const links = [
    { path: "/", label: "My Finances", icon: Wallet },
    { path: "/habits", label: "My Habits", icon: TrendingUp },
    { path: "/investments", label: "Investments", icon: PieChart },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            FinanceMe
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-4">
              {links.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className="relative px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  {location.pathname === path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              {isGuest ? "Exit Guest" : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
