import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ content, speed = 10, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset if content changes drastically (new message)
    if (content.length > 0 && indexRef.current === 0) {
      setDisplayedContent('');
      setIsComplete(false);
    }
  }, [content]);

  useEffect(() => {
    if (isComplete) return;

    const animate = () => {
      if (indexRef.current < content.length) {
        // Add next character
        const nextChar = content.charAt(indexRef.current);
        setDisplayedContent((prev) => prev + nextChar);
        indexRef.current++;

        // Fluid speed variance: punctation pauses slightly longer, random jitter for realism
        let delay = speed;
        if (nextChar === '.' || nextChar === ',' || nextChar === '?' || nextChar === '!') {
          delay = speed * 5;
        } else {
          delay = speed + (Math.random() * 15 - 5); // +/- 5ms jitter
        }

        timeoutRef.current = setTimeout(animate, delay);
      } else {
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    };

    // Start animation
    timeoutRef.current = setTimeout(animate, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, speed, isComplete, onComplete]);

  // If the content was already fully rendered (e.g. from history), just show it
  if (indexRef.current >= content.length && !isComplete) {
     return <span>{content}</span>;
  }

  return (
    <span>
      {displayedContent}
      {!isComplete && (
        <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 align-middle animate-pulse" />
      )}
    </span>
  );
};