
import { Message } from '@/pages/Index';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isMe = message.sender === 'me';

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
