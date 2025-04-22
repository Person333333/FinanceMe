
import React, { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Common financial questions and their answers
const FAQ_DATABASE = {
  "how to start budgeting": "Start by tracking all your expenses for a month. Then, categorize your spending and set realistic limits for each category. Use our Budget Settings feature in the My Habits section to set up your first budget.",
  "what is an emergency fund": "An emergency fund is money saved for unexpected expenses. Aim to save 3-6 months of living expenses. You can track this in the Investments section as a separate savings goal.",
  "how to reduce spending": "Review your transactions in My Finances to identify areas where you spend the most. Look for patterns in the Smart Advice section and consider areas where you can cut back.",
  "how to import transactions": "You can import transactions from your bank by downloading a CSV file and using our Import CSV feature. The file should include date, amount, description, and category columns.",
  "what are recurring transactions": "Recurring transactions are regular payments that happen on a schedule (like rent or subscriptions). Mark transactions as recurring when adding them to better track regular expenses.",
  // Add more Q&A pairs as needed
};

// Helper function to find the best matching question
const findBestMatch = (input) => {
  const userQuestion = input.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  Object.entries(FAQ_DATABASE).forEach(([question, answer]) => {
    const words = question.split(" ");
    const matchScore = words.reduce((score, word) => {
      return score + (userQuestion.includes(word) ? 1 : 0);
    }, 0) / words.length;

    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = { question, answer };
    }
  });

  return highestScore > 0.3 ? bestMatch : null;
};

const FinanceHelper = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "system",
      message: "Hi! I'm your finance helper. Ask me anything about managing your finances or using this app!",
    },
  ]);

  // Handle user questions and provide responses
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user question to chat
    setChatHistory((prev) => [
      ...prev,
      { type: "user", message: question },
    ]);

    // Find matching answer or provide default response
    const match = findBestMatch(question);
    const response = match
      ? match.answer
      : "I'm not sure about that. Try asking about budgeting, emergency funds, or how to use specific features of the app.";

    // Add system response to chat
    setChatHistory((prev) => [
      ...prev,
      { type: "system", message: response },
    ]);

    setQuestion("");
  };

  return (
    <>
      {/* Helper Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      {/* Helper Dialog */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 w-96 bg-white rounded-xl shadow-xl"
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Finance Helper</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat History */}
          <div className="p-4 h-96 overflow-y-auto space-y-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.type === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
          </div>

          {/* Question Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 finance-input"
                placeholder="Ask a question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="submit">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </>
  );
};

export default FinanceHelper;
