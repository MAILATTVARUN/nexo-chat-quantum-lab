
import { MessageCircle, Shield, Zap, Users, Moon } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-center max-w-2xl px-8">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-200">
            Welcome to NEXO
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Chat. Connect. Simplify.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center p-6 rounded-2xl bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors">
            <Zap className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-gray-200">Ultra-fast</h3>
            <p className="text-sm text-gray-400">Lightning-fast real-time messaging</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-gray-200">Secure</h3>
            <p className="text-sm text-gray-400">End-to-end encryption</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-gray-200">Group Chats</h3>
            <p className="text-sm text-gray-400">Connect with teams & friends</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors">
            <Moon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-2 text-gray-200">Dark Mode</h3>
            <p className="text-sm text-gray-400">Comfortable night chatting</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};
