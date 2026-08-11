import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getConversations, getConversationMessages, sendMessage, getSellerByStoreId } from "../services/messageService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, User, Check, CheckCheck } from "lucide-react";

export default function Messages() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [newConversationMode, setNewConversationMode] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const receiverId = searchParams.get("receiverId");
  const orderId = searchParams.get("orderId");
  const storeId = searchParams.get("storeId");
  const productId = searchParams.get("productId");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // Fetch current user ID from the API since JWT only contains email
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
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
  }, []);

  useEffect(() => {
    const initFromStoreId = async () => {
      if (storeId && !loading) {
        try {
          const info = await getSellerByStoreId(storeId);
          setSellerInfo(info);
          
          const existingConv = conversations.find(conv => 
            conv.participants.includes(info.sellerId)
          );
          
          if (existingConv) {
            fetchMessages(existingConv.id);
          } else {
            setNewConversationMode(true);
          }
        } catch (err) {
          setError("Failed to load seller info");
          console.error(err);
        }
      }
    };
    
    initFromStoreId();
  }, [storeId, conversations, loading]);

  useEffect(() => {
    if (receiverId && !storeId && conversations.length >= 0 && !loading) {
      // Find existing conversation with this user (ignore orderId - one conversation per user pair)
      const existingConv = conversations.find(conv => 
        conv.participants.includes(receiverId)
      );
      
      if (existingConv) {
        fetchMessages(existingConv.id);
      } else {
        setNewConversationMode(true);
      }
    }
  }, [receiverId, storeId, conversations, loading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data.messages);
      setSelectedConversation(data.conversation);
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const targetReceiverId = selectedConversation 
        ? selectedConversation.participants.find(p => p !== getCurrentUserId())
        : (sellerInfo?.sellerId || receiverId);
      
      const messageData = {
        receiverId: targetReceiverId,
        content: newMessage.trim(),
        orderId: selectedConversation?.orderId || orderId || null
      };

      const response = await sendMessage(messageData);
      setNewMessage("");
      
      if (selectedConversation) {
        fetchMessages(selectedConversation.id);
      } else if (newConversationMode) {
        setNewConversationMode(false);
        await fetchConversations();
        if (response.conversationId) {
          fetchMessages(response.conversationId);
        }
      } else {
        fetchConversations();
      }
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getCurrentUserId = () => currentUserId;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getOtherParticipantName = (conversation) => {
    const currentUserId = getCurrentUserId();
    const otherParticipantId = conversation.participants.find(p => p !== currentUserId);
    return conversation.participantNames[otherParticipantId] || "Unknown User";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        Messages
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversations List */}
        <Card className="md:col-span-1 bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-zinc-100">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-zinc-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => fetchMessages(conv.id)}
                    className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                      selectedConversation?.id === conv.id ? "bg-zinc-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-100 truncate">
                          {getOtherParticipantName(conv)}
                        </p>
                        <p className="text-sm text-zinc-500 truncate">
                          {conv.lastMessage || "No messages"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Panel */}
        <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 border-b border-zinc-800">
            {selectedConversation ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-zinc-100">
                    {getOtherParticipantName(selectedConversation)}
                  </CardTitle>
                  {selectedConversation.orderId && (
                    <p className="text-xs text-zinc-500">
                      Order: #{selectedConversation.orderId.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <CardTitle className="text-lg text-zinc-100">
                Select a conversation
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[500px]">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === currentUserId;
                      
                      const renderMessageStatus = () => {
                        if (!isOwn) return null;
                        
                        const status = msg.status || (msg.isRead ? 'SEEN' : 'SENT');
                        
                        if (status === 'SEEN') {
                          return (
                            <span className="inline-flex items-center gap-0.5 text-blue-300" title="Seen">
                              <CheckCheck className="h-3.5 w-3.5" />
                            </span>
                          );
                        } else if (status === 'DELIVERED') {
                          return (
                            <span className="inline-flex items-center gap-0.5 text-blue-200" title="Delivered">
                              <CheckCheck className="h-3.5 w-3.5" />
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-0.5 text-blue-200/60" title="Sent">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          );
                        }
                      };
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-800 text-zinc-100"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : ""}`}>
                              <span className={`text-xs ${isOwn ? "text-blue-200" : "text-zinc-500"}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {renderMessageStatus()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-zinc-800 flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : newConversationMode && (receiverId || sellerInfo) ? (
              <>
                <div className="flex-1 p-4 flex items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start a new conversation</p>
                    {sellerInfo && (
                      <p className="text-sm mt-2 text-zinc-300">
                        Contacting: <span className="font-medium">{sellerInfo.storeName}</span>
                      </p>
                    )}
                    {orderId && <p className="text-xs mt-1">Related to Order #{orderId.slice(-8)}</p>}
                    {productId && <p className="text-xs mt-1">About a product inquiry</p>}
                  </div>
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-zinc-800 flex gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your first message..."
                    className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
