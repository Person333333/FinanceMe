
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogIn, LogOut, UserPlus, User } from "lucide-react";

const Accounts = () => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // For now using localStorage for authentication
    if (isLogin) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        setIsAuthenticated(true);
        setIsGuest(false);
        localStorage.setItem("currentUser", JSON.stringify(user));
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } else {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u) => u.email === formData.email);

      if (existingUser) {
        toast({
          title: "Error",
          description: "Email already exists",
          variant: "destructive",
        });
        return;
      }

      const newUser = {
        id: Date.now(),
        email: formData.email,
        password: formData.password,
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      setIsAuthenticated(true);
      setIsGuest(false);

      toast({
        title: "Success",
        description: "Account created successfully",
      });
    }

    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleGuestMode = () => {
    setIsAuthenticated(true);
    setIsGuest(true);
    localStorage.removeItem("currentUser");
    
    toast({
      title: "Guest Mode",
      description: "You are now using the app in guest mode",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    localStorage.removeItem("currentUser");
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 glass-card rounded-xl text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isGuest ? "Guest User" : "Welcome Back"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isGuest
                ? "You are currently in guest mode"
                : "You are logged in to your account"}
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 glass-card rounded-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="finance-input"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="finance-input"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="finance-input"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full">
            {isLogin ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGuestMode}
        >
          <User className="w-4 h-4 mr-2" />
          Continue as Guest
        </Button>
      </motion.div>
    </div>
  );
};

export default Accounts;
