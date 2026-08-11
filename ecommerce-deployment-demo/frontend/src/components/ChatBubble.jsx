import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getConversations, getConversationMessages, sendMessage } from "../services/messageService";

export default function ChatBubble() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setUnreadCount(0);
      return;
    }
    
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Poll for new messages when bubble is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true);
      } else {
        fetchConversations();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, selectedConversation]);

  // Fetch unread count periodically
  useEffect(() => {
    if (!token) return;
    
    const fetchUnread = async () => {
      try {
        const data = await getConversations();
        const total = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (err) {
        // Silently fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      const total = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getConversationMessages(conversationId);
      setMessages(data.messages);
      if (!silent) setSelectedConversation(data.conversation);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const targetReceiverId = selectedConversation.participants.find(p => p !== currentUserId);
      
      await sendMessage({
        receiverId: targetReceiverId,
        content: newMessage.trim(),
        orderId: selectedConversation.orderId || null
      });
      
      setNewMessage("");
      fetchMessages(selectedConversation.id);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipantName = (conversation) => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    return conversation.participantNames?.[otherParticipantId] || "Unknown User";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Don't render if not logged in (after all hooks)
  if (!token) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            {selectedConversation ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="p-1 rounded-md hover:bg-muted"
                >
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground text-sm truncate max-w-[180px]">
                  {getOtherParticipantName(selectedConversation)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Messages</span>
              </div>
            )}
            <button
              onClick={() => navigate("/messages")}
              className="text-xs text-primary hover:underline"
            >
              Open Full
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading && !selectedConversation ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
              </div>
            ) : selectedConversation ? (
              // Messages View
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No messages yet
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-9 text-sm"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={sending || !newMessage.trim()}
                    className="h-9 w-9 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              // Conversations List
              <ScrollArea className="h-full">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start chatting with sellers from product pages
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => fetchMessages(conv.id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50"
                    >
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm truncate">
                            {getOtherParticipantName(conv)}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage || "No messages"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </ScrollArea>
            )}
          </div>
        </div>
      )}
    </>
  );
}
