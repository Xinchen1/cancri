import React from 'react';

/**
 * Formats message content for optimal reading experience
 * Removes code blocks and formats text for readability
 */
export function formatMessage(content: string): React.ReactNode {
  if (!content) return null;

  // Remove all code blocks completely - they're not needed for reading
  let processed = content;
  
  // Remove code blocks entirely
  processed = processed.replace(/```[\w]*\n?([\s\S]*?)```/g, '');

  // Remove inline code markers
  processed = processed.replace(/`([^`]+)`/g, '$1');

  // Remove markdown formatting
  processed = processed.replace(/^###\s+/gm, '');
  processed = processed.replace(/^##\s+/gm, '');
  processed = processed.replace(/^#\s+/gm, '');
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '$1');
  processed = processed.replace(/\*([^*]+)\*/g, '$1');

  // Clean up multiple newlines
  processed = processed.replace(/\n{3,}/g, '\n\n');

  // Split content into paragraphs
  const paragraphs = processed.split(/\n\n+/).filter(p => p.trim());

  return (
    <div className="space-y-4 leading-relaxed">
      {paragraphs.map((paragraph, idx) => {
        const trimmed = paragraph.trim();
        
        // All formatting already removed, just process lists and render
        let formatted = trimmed;

        // Handle lists - convert to readable format
        const lines = formatted.split('\n');
        const processedLines: React.ReactNode[] = [];
        let inList = false;
        let listItems: string[] = [];

        lines.forEach((line, lineIdx) => {
          const trimmedLine = line.trim();
          const listMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
          const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);

          if (listMatch || numberedMatch) {
            if (!inList) {
              inList = true;
              listItems = [];
            }
            listItems.push(listMatch ? listMatch[1] : numberedMatch![1]);
          } else {
            if (inList) {
              processedLines.push(
                <ul key={`list-${lineIdx}`} className="list-disc list-inside space-y-2 my-3 ml-4 text-white/80 leading-relaxed">
                  {listItems.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              );
              listItems = [];
              inList = false;
            }
            if (trimmedLine) {
              processedLines.push(
                <p key={lineIdx} className="leading-relaxed mb-2">{trimmedLine}</p>
              );
            }
          }
        });

        // Handle remaining list items
        if (inList && listItems.length > 0) {
          processedLines.push(
            <ul key={`list-final`} className="list-disc list-inside space-y-2 my-3 ml-4 text-white/80 leading-relaxed">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }

        // If no list processing happened, render as normal paragraph
        if (processedLines.length === 0) {
          return (
            <p key={idx} className="leading-relaxed">{formatted}</p>
          );
        }

        return <div key={idx} className="space-y-2">{processedLines}</div>;
      })}
    </div>
  );
}

/**
 * Simple formatter that removes code blocks and formats for reading
 */
export function formatMessageSimple(content: string): string {
  if (!content) return '';

  let formatted = content;

  // Remove code block markers but keep content
  formatted = formatted.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    // Convert code block to indented text
    const lines = code.trim().split('\n');
    return lines.map((line: string) => `    ${line}`).join('\n');
  });

  // Remove inline code markers but keep content
  formatted = formatted.replace(/`([^`]+)`/g, '$1');

  // Convert markdown headers to plain text
  formatted = formatted.replace(/^###\s+(.+)$/gm, '$1');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '$1');
  formatted = formatted.replace(/^#\s+(.+)$/gm, '$1');

  // Remove markdown bold/italic markers
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');
  formatted = formatted.replace(/\*([^*]+)\*/g, '$1');

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

