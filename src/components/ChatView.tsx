
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact, Message } from '@/pages/Index';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';

interface ChatViewProps {
  contact: Contact;
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey! How\'s your day going?',
    timestamp: '10:30 AM',
    sender: 'other',
    type: 'text'
  },
  {
    id: '2',
    content: 'Pretty good! Just working on the new NEXO features. How about you?',
    timestamp: '10:32 AM',
    sender: 'me',
    type: 'text'
  },
  {
    id: '3',
    content: 'That sounds exciting! I\'d love to see what you\'re building.',
    timestamp: '10:33 AM',
    sender: 'other',
    type: 'text'
  },
  {
    id: '4',
    content: 'I\'ll send you some screenshots later. The UI is looking really clean!',
    timestamp: '10:35 AM',
    sender: 'me',
    type: 'text'
  }
];

export const ChatView = ({ contact }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'That\'s awesome!',
          'I totally agree',
          'Sounds great to me',
          'Perfect! Let\'s do it',
          'Thanks for letting me know!'
        ];
        const response: Message = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'other',
          type: 'text'
        };
        setMessages(prev => [...prev, response]);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nexo-blue-400 to-nexo-blue-600 flex items-center justify-center text-lg">
                {contact.avatar}
              </div>
              {contact.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">{contact.name}</h2>
              <p className="text-sm text-muted-foreground">
                {contact.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-3">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-none bg-muted/50 focus:bg-background transition-colors"
            />
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Mic className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
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
