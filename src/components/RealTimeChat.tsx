
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Image, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  online_status?: boolean;
}

interface DatabaseMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  message_type: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'other';
  type: 'text' | 'image' | 'file' | 'voice';
}

interface RealTimeChatProps {
  contact: Profile;
  conversationId: string;
}

export const RealTimeChat = ({ contact, conversationId }: RealTimeChatProps) => {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as DatabaseMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          conversation_id: conversationId,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Failed to send message",
          description: "Please try again.",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (message: DatabaseMessage): Message => {
    return {
      id: message.id,
      content: message.content,
      timestamp: new Date(message.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sender: message.sender_id === user?.id ? 'me' : 'other',
      type: 'text'
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nexo-blue-400 to-nexo-blue-600 flex items-center justify-center text-lg">
                {contact.name?.charAt(0)?.toUpperCase() || contact.email?.charAt(0)?.toUpperCase()}
              </div>
              {contact.online_status && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">{contact.name}</h2>
              <p className="text-sm text-gray-400">
                {contact.online_status ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-900">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={formatMessage(message)} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-nexo-blue-500"
              disabled={loading}
            />
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Mic className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              className="bg-nexo-blue-500 hover:bg-nexo-blue-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
