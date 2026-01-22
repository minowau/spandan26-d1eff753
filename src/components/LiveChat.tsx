import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, User, ArrowDown, Smile, Reply, X } from 'lucide-react';
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
  reply_to?: string | null;
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
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let identifier = localStorage.getItem('spandan_user_id');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('spandan_user_id', identifier);
    }
    setUserIdentifier(identifier);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('spandan_username');
    if (stored) setUsername(stored);

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
            setReactions((prev) =>
              prev.filter(r => r.id !== (payload.old as ChatReaction).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(reactionChannel);
    };
  }, [sportId]);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight >= 50);
      }
    }
  }, []);

  useEffect(() => {
    if (!showScrollButton) scrollToBottom();
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const cancelReply = () => setReplyingTo(null);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const finalUsername = username.trim() || 'Anonymous';
    if (username.trim()) localStorage.setItem('spandan_username', finalUsername);

    await supabase.from('chat_messages').insert({
      sport_id: sportId,
      message: censorMessage(newMessage.trim()), // REAL message stored
      username: censorMessage(finalUsername),
      reply_to: replyingTo?.id || null,
    });

    setNewMessage('');
    setReplyingTo(null);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const existing = reactions.find(
      r => r.message_id === messageId &&
           r.emoji === emoji &&
           r.user_identifier === userIdentifier
    );

    if (existing) {
      await supabase.from('chat_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('chat_reactions').insert({
        message_id: messageId,
        emoji,
        user_identifier: userIdentifier,
      });
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      <div className="bg-primary px-4 py-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary-foreground" />
        <h3 className="font-semibold text-primary-foreground">
          Live Discussion - {sportName}
        </h3>
      </div>

      <ScrollArea className="h-64 p-4" ref={scrollAreaRef} onScrollCapture={handleScroll}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-sm">{msg.username}</span>

                {/* 🔥 ONLY CHANGE IS HERE 🔥 */}
                <p className="text-sm text-muted-foreground italic">
                  Chat Disabled
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Your name (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-32"
          />
          <Input
            ref={inputRef}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
