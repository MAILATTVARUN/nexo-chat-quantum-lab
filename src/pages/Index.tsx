
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/ChatSidebar';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { RealTimeChat } from '@/components/RealTimeChat';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserSearch } from '@/components/UserSearch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'other';
  type: 'text' | 'image' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
}

const Index = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStartConversation = async (userId: string, profile: any) => {
    if (!user) return;

    try {
      // Get or create conversation
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: userId
      });

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      const conversationId = data;
      
      // Create contact object with proper Profile interface compatibility
      const contact: Contact = {
        id: userId,
        name: profile.name || profile.email,
        avatar: profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase(),
        lastMessage: '',
        timestamp: 'now',
        unread: 0,
        online: profile.online_status || false,
        email: profile.email
      };

      setSelectedContact(contact);
      setSelectedConversationId(conversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-gray-200">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-gray-200">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-200">NEXO</h1>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <UserSearch onStartConversation={handleStartConversation} />
        </div>
        
        <ChatSidebar 
          selectedContact={selectedContact} 
          onSelectContact={setSelectedContact}
          user={user}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedContact && selectedConversationId ? (
          <RealTimeChat 
            contact={selectedContact} 
            conversationId={selectedConversationId}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default Index;
