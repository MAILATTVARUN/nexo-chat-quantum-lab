
export const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
};
