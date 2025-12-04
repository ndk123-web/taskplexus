// Flowchart-style Logo Component - matches app's purple/blue gradient theme
// Main box with 3 connected child boxes in flowchart layout
interface TrelloLogoProps {
  size?: number;
  className?: string;
}

const TrelloLogo = ({ size = 40, className = '' }: TrelloLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter: 'drop-shadow(0 0 8px rgba(102, 126, 234, 0.4))'
      }}
    >
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 0.9 }} />
        </linearGradient>
      </defs>
      
      {/* Box 1 - Left side */}
      <rect
        x="3"
        y="13"
        width="6"
        height="6"
        rx="1"
        fill="url(#flowGradient)"
      />
      
      {/* Box 2 - Top Right */}
      <rect
        x="22"
        y="5"
        width="6"
        height="6"
        rx="1"
        fill="url(#flowGradient)"
      />
      
      {/* Box 3 - Bottom Right */}
      <rect
        x="22"
        y="21"
        width="6"
        height="6"
        rx="1"
        fill="url(#flowGradient)"
      />
      
      {/* Connection line: Box 1 to split point */}
      <line
        x1="9"
        y1="16"
        x2="16"
        y2="16"
        stroke="#a78bfa"
        strokeWidth="1"
        opacity="0.9"
      />
      
      {/* Vertical line at split point */}
      <line
        x1="16"
        y1="8"
        x2="16"
        y2="24"
        stroke="#a78bfa"
        strokeWidth="1"
        opacity="0.9"
      />
      
      {/* Arrow to Box 2 (top) */}
      <line
        x1="16"
        y1="8"
        x2="22"
        y2="8"
        stroke="#a78bfa"
        strokeWidth="1"
        opacity="0.9"
      />
      <polygon
        points="22,8 19,6.5 19,9.5"
        fill="#60a5fa"
        opacity="0.9"
      />
      
      {/* Arrow to Box 3 (bottom) */}
      <line
        x1="16"
        y1="24"
        x2="22"
        y2="24"
        stroke="#a78bfa"
        strokeWidth="1"
        opacity="0.9"
      />
      <polygon
        points="22,24 19,22.5 19,25.5"
        fill="#a78bfa"
        opacity="0.9"
      />
    </svg>
  );
};

export default TrelloLogo;
