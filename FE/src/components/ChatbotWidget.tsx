import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface ChatbotWidgetProps {
  onApplyFilters: (filters: { district?: string; maxBudget?: number }) => void;
}

export function ChatbotWidget({ onApplyFilters }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Xin chào! Mình là SmartStay AI. Bạn muốn tìm phòng trọ khu vực nào và ngân sách bao nhiêu?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);
    setIsTyping(true);

    // Mock API call to process NLP
    setTimeout(() => {
      let botResponse = "Mình đã tìm thấy một số kết quả phù hợp! Bộ lọc đã được tự động áp dụng.";
      const lowerInput = userMessage.toLowerCase();
      let newDistrict = undefined;
      let newBudget = undefined;

      // Simple mock NLP logic
      if (lowerInput.includes("quận 1") || lowerInput.includes("q1")) {
        newDistrict = "Quận 1";
      } else if (lowerInput.includes("quận 3") || lowerInput.includes("q3")) {
        newDistrict = "Quận 3";
      } else if (lowerInput.includes("quận 7") || lowerInput.includes("q7")) {
        newDistrict = "Quận 7";
      } else if (lowerInput.includes("thủ đức")) {
        newDistrict = "Thủ Đức";
      } else if (lowerInput.includes("bình thạnh")) {
        newDistrict = "Bình Thạnh";
      }

      const moneyMatch = userMessage.match(/(\d+)\s*(triệu|tr)/i);
      if (moneyMatch) {
        newBudget = parseInt(moneyMatch[1]);
      } else if (lowerInput.includes("rẻ")) {
        newBudget = 4; // Arbitrary low budget for "rẻ"
      }

      if (!newDistrict && !newBudget) {
         botResponse = "Xin lỗi, mình chưa hiểu rõ yêu cầu. Bạn có thể nói rõ khu vực hoặc mức giá được không? (VD: Tìm phòng quận 1 dưới 6 triệu)";
      } else {
         onApplyFilters({ district: newDistrict, maxBudget: newBudget });
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", content: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-background border shadow-2xl rounded-2xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">SmartStay Assistant</span>
                <Badge variant="outline" className="text-[10px] ml-2 border-primary-foreground/30 text-primary-foreground">AI</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary-foreground/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 pr-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-muted rounded-tl-sm flex items-center gap-1">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  placeholder="Hỏi AI để tìm phòng..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  className="rounded-full bg-background"
                />
                <Button size="icon" className="rounded-full shrink-0" onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center border-4 border-background"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
