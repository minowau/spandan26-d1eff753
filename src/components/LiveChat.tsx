import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, User, ArrowDown, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { censorMessage } from '@/utils/censorWords';

interface ChatMessage {
  id: string;
  message: string;
  username: string;
  created_at: string;
}

interface ChatReaction {
  id: string;
  message_id: string;
  emoji: string;
  user_identifier: string;
}

interface LiveChatProps {
  sportId: string;
  sportName: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '👏'];

export function LiveChat({ sportId, sportName }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<ChatReaction[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Generate or retrieve user identifier for reactions
  useEffect(() => {
    let identifier = localStorage.getItem('spandan_user_id');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('spandan_user_id', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

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

    // Fetch initial reactions
    const fetchReactions = async () => {
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('sport_id', sportId);
      
      if (messagesData && messagesData.length > 0) {
        const messageIds = messagesData.map(m => m.id);
        const { data: reactionsData } = await supabase
          .from('chat_reactions')
          .select('*')
          .in('message_id', messageIds);
        
        if (reactionsData) setReactions(reactionsData as ChatReaction[]);
      }
    };

    fetchMessages();
    fetchReactions();

    // Subscribe to realtime message updates
    const messageChannel = supabase
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

    // Subscribe to realtime reaction updates
    const reactionChannel = supabase
      .channel(`reactions-${sportId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_reactions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as ChatReaction]);
          } else if (payload.eventType === 'DELETE') {
            setReactions((prev) => prev.filter(r => r.id !== (payload.old as ChatReaction).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(reactionChannel);
    };
  }, [sportId]);

  // Check if user is at bottom of scroll
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShowScrollButton(!isAtBottom);
      }
    }
  }, []);

  // Auto-scroll to bottom on new messages (only if already at bottom)
  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        setShowScrollButton(false);
      }
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const finalUsername = username.trim() || 'Anonymous';
    if (username.trim()) {
      localStorage.setItem('spandan_username', finalUsername);
    }

    // Censor the message before sending
    const censoredMessage = censorMessage(newMessage.trim());
    const censoredUsername = censorMessage(finalUsername);

    await supabase.from('chat_messages').insert({
      sport_id: sportId,
      message: censoredMessage,
      username: censoredUsername,
    });

    setNewMessage('');
    scrollToBottom();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!userIdentifier) return;

    const existingReaction = reactions.find(
      r => r.message_id === messageId && r.emoji === emoji && r.user_identifier === userIdentifier
    );

    if (existingReaction) {
      // Remove reaction
      await supabase.from('chat_reactions').delete().eq('id', existingReaction.id);
    } else {
      // Add reaction
      await supabase.from('chat_reactions').insert({
        message_id: messageId,
        emoji,
        user_identifier: userIdentifier,
      });
    }
  };

  const getReactionCounts = (messageId: string) => {
    const messageReactions = reactions.filter(r => r.message_id === messageId);
    const counts: Record<string, { count: number; hasReacted: boolean }> = {};
    
    messageReactions.forEach(r => {
      if (!counts[r.emoji]) {
        counts[r.emoji] = { count: 0, hasReacted: false };
      }
      counts[r.emoji].count++;
      if (r.user_identifier === userIdentifier) {
        counts[r.emoji].hasReacted = true;
      }
    });
    
    return counts;
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
      <div className="relative">
        <ScrollArea 
          className="h-64 p-4" 
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const reactionCounts = getReactionCounts(msg.id);
                return (
                  <div key={msg.id} className="flex gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">{msg.username}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                        
                        {/* Reaction button */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Smile className="w-3 h-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" side="top">
                            <div className="flex gap-1">
                              {REACTION_EMOJIS.map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-sm text-foreground/90 break-words">{msg.message}</p>
                      
                      {/* Display reactions */}
                      {Object.keys(reactionCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(reactionCounts).map(([emoji, { count, hasReacted }]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(msg.id, emoji)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                                hasReacted 
                                  ? 'bg-primary/20 text-primary border border-primary/30' 
                                  : 'bg-secondary hover:bg-secondary/80'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg gap-1"
          >
            <ArrowDown className="w-3 h-3" />
            New messages
          </Button>
        )}
      </div>

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
