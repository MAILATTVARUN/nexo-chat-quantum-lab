
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/pages/Index';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const isMe = message.sender === 'me';

  const handlePlayVoice = () => {
    if (message.type === 'voice') {
      if (!audioElement) {
        const audio = new Audio(message.content);
        audio.onended = () => {
          setIsPlaying(false);
        };
        audio.onpause = () => {
          setIsPlaying(false);
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
        };
        setAudioElement(audio);
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      } else {
        if (isPlaying) {
          audioElement.pause();
          setIsPlaying(false);
        } else {
          audioElement.play().then(() => {
            setIsPlaying(true);
          }).catch((error) => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
        }
      }
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          </div>
        );
      case 'gif':
        return (
          <div className="max-w-xs">
            <img
              src={message.content}
              alt="GIF"
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-center space-x-3 min-w-[120px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayVoice}
              className="text-inherit hover:bg-gray-600 rounded-full p-2"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-current rounded-full ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} message-enter`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isMe
            ? 'bg-gray-700 text-white rounded-br-md'
            : 'bg-gray-800 text-gray-200 rounded-bl-md'
        }`}
      >
        {renderContent()}
        <p
          className={`text-xs mt-1 ${
            isMe ? 'text-gray-300' : 'text-gray-400'
          }`}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
