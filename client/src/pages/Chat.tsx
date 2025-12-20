import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, ArrowLeft, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    username: string;
  };
}

interface Conversation {
  id: number;
  bookingId: number;
  customerId: number;
  providerId: number;
  createdAt: string;
  otherUser: {
    id: number;
    name: string;
    username: string;
  };
  lastMessage: Message | null;
  unreadCount: number;
}

export default function Chat() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [matched, params] = useRoute("/chat/:conversationId");
  const conversationId = matched ? Number(params?.conversationId) : null;
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && conversationId) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const activeConversation = conversations?.find(c => c.id === conversationId);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Please log in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingConversations ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !conversations || conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Book a service to start chatting with providers
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setLocation(`/chat/${conv.id}`)}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover-elevate border-b ${
                        conv.id === conversationId ? 'bg-primary/5' : ''
                      }`}
                      data-testid={`conversation-item-${conv.id}`}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {conv.otherUser.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{conv.otherUser.name}</span>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {conversationId && activeConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden"
                      onClick={() => setLocation("/chat")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {activeConversation.otherUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{activeConversation.otherUser.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Booking #{activeConversation.bookingId}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {loadingMessages ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                            <Skeleton className="h-12 w-48 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : !messages || messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">No messages yet</p>
                          <p className="text-xs text-muted-foreground/70">Send a message to get started</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isMe = msg.senderId === user.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : ''}`}>
                              <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                                <div className={`px-4 py-2 rounded-lg ${
                                  isMe 
                                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                    : 'bg-secondary rounded-bl-sm'
                                }`}>
                                  <p className="text-sm">{msg.content}</p>
                                </div>
                                <p className={`text-xs text-muted-foreground mt-1 ${isMe ? 'text-right' : ''}`}>
                                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-message"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Select a conversation</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
