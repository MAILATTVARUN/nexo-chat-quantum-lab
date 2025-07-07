
import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  online_status?: boolean;
}

interface UserSearchProps {
  onStartConversation: (userId: string, profile: Profile) => void;
}

export const UserSearch = ({ onStartConversation }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "Unable to search users. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Map the results to include online_status as optional
      const profilesWithStatus = (data || []).map(profile => ({
        ...profile,
        online_status: false // Default to false, we'll fetch real status if needed
      }));

      setSearchResults(profilesWithStatus);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStartConversation = async (profile: Profile) => {
    try {
      onStartConversation(profile.id, profile);
      setOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Failed to start conversation",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Find People</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-400">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleStartConversation(profile)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    {profile.online_status && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-sm text-gray-400">{profile.email}</div>
                  </div>
                </div>
              ))
            ) : searchQuery.length >= 3 ? (
              <div className="text-center py-4 text-gray-400">No users found</div>
            ) : searchQuery.length > 0 ? (
              <div className="text-center py-4 text-gray-400">Type at least 3 characters to search</div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
