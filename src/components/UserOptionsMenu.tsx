
import { useState } from 'react';
import { UserX, Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface UserOptionsMenuProps {
  contact: Profile;
  onClose: () => void;
}

export const UserOptionsMenu = ({ contact, onClose }: UserOptionsMenuProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBlockUser = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: contact.id
        });

      if (error) {
        console.error('Error blocking user:', error);
        toast({
          title: "Failed to block user",
          description: "Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "User blocked",
        description: `${contact.name} has been blocked successfully.`,
      });
      onClose();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Failed to block user",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_id: contact.id,
          reason: 'inappropriate_behavior'
        });

      if (error) {
        console.error('Error reporting user:', error);
        toast({
          title: "Failed to report user",
          description: "Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "User reported",
        description: `${contact.name} has been reported successfully.`,
      });
      onClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: "Failed to report user",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">User Options</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleBlockUser}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <UserX className="h-4 w-4 mr-2" />
            Block User
          </Button>

          <Button
            onClick={handleReportUser}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </Button>
        </div>
      </div>
    </div>
  );
};
