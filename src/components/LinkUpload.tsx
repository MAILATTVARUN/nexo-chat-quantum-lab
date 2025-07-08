
import { useState } from 'react';
import { Link, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LinkUploadProps {
  onLinkSend: (url: string) => void;
  onClose: () => void;
}

export const LinkUpload = ({ onLinkSend, onClose }: LinkUploadProps) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      // Try with https:// prefix
      try {
        new URL(`https://${inputUrl}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setIsValidUrl(validateUrl(value));
  };

  const handleSendLink = () => {
    if (url.trim() && isValidUrl) {
      let formattedUrl = url.trim();
      
      // Add https:// if no protocol is specified
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      onLinkSend(formattedUrl);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl) {
      handleSendLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Share Link</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-nexo-blue-500"
            />
            {url && !isValidUrl && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid URL</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendLink}
              disabled={!url.trim() || !isValidUrl}
              className="bg-nexo-blue-500 hover:bg-nexo-blue-600 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
