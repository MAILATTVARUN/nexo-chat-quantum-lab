
import { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Contact } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ChatSidebarProps {
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  user: User;
}

export const ChatSidebar = ({ selectedContact, onSelectContact, user }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Contact[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // Get conversations for the current user
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            id,
            participant1_id,
            participant2_id,
            updated_at,
            messages (
              content,
              created_at,
              sender_id
            )
          `)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          console.error('Error loading conversations:', conversationsError);
          return;
        }

        if (!conversationsData) return;

        // Get profiles for other participants
        const participantIds = conversationsData.map(conv => 
          conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id
        ).filter(Boolean);

        if (participantIds.length === 0) return;

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', participantIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          return;
        }

        // Transform to Contact format
        const contacts: Contact[] = conversationsData.map(conv => {
          const otherParticipantId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
          const profile = profilesData?.find(p => p.id === otherParticipantId);
          
          if (!profile) return null;

          const lastMessage = conv.messages && conv.messages.length > 0 
            ? conv.messages[conv.messages.length - 1]
            : null;

          return {
            id: profile.id,
            name: profile.name || profile.email,
            avatar: profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase(),
            lastMessage: lastMessage?.content || 'No messages yet',
            timestamp: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '',
            unread: 0,
            online: false, // Default to false since we're not fetching online_status
            email: profile.email
          };
        }).filter(Boolean) as Contact[];

        setConversations(contacts);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
  }, [user]);

  const filteredContacts = conversations.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No conversations yet. Start by searching for people to message!
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-4 cursor-pointer transition-colors hover:bg-gray-700 border-b border-gray-700/50 ${
                selectedContact?.id === contact.id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nexo-blue-400 to-nexo-blue-600 flex items-center justify-center text-xl">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate text-white">{contact.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{contact.timestamp}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-400 truncate flex-1">
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="ml-2 bg-nexo-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
