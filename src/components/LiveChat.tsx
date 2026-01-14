import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  message: string;
  username: string;
  created_at: string;
}

interface LiveChatProps {
  sportId: string;
  sportName: string;
}

export function LiveChat({ sportId, sportName }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load stored username
    const stored = localStorage.getItem('spandan_username');
    if (stored) setUsername(stored);

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('sport_id', sportId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) setMessages(data as ChatMessage[]);
      setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`chat-${sportId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sport_id=eq.${sportId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sportId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const finalUsername = username.trim() || 'Anonymous';
    if (username.trim()) {
      localStorage.setItem('spandan_username', finalUsername);
    }

    await supabase.from('chat_messages').insert({
      sport_id: sportId,
      message: newMessage.trim(),
      username: finalUsername,
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary-foreground" />
        <h3 className="font-semibold text-primary-foreground">Live Discussion - {sportName}</h3>
        <span className="ml-auto text-xs bg-primary-foreground/20 text-primary-foreground px-2 py-1 rounded-full">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <ScrollArea className="h-64 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{msg.username}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3 bg-secondary/30">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Your name (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-32 text-sm"
          />
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}