
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00C2FF" />
            <stop offset="100%" stopColor="#0047FF" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF4D00" />
          </linearGradient>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D600FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>
        </defs>
        
        {/* Stylized M - Segmented to match user's logo style */}
        {/* Left Vertical Bar */}
        <rect x="15" y="20" width="18" height="60" rx="9" fill="url(#blueGrad)" />
        
        {/* Middle Diagonal Slash */}
        <path
          d="M33 25L65 75"
          stroke="url(#orangeGrad)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        
        {/* Top Right Segment */}
        <rect x="67" y="30" width="18" height="12" rx="6" fill="#FFB800" />
        
        {/* Bottom Right Segment */}
        <path
          d="M55 45H75C80 45 85 50 85 55V65C85 70 80 75 75 75H55"
          fill="url(#purpleGrad)"
        />
        
        {/* Circuit Pattern Accents (simplified) */}
        <circle cx="24" cy="35" r="2" fill="white" fillOpacity="0.5" />
        <circle cx="24" cy="50" r="2" fill="white" fillOpacity="0.5" />
        <circle cx="24" cy="65" r="2" fill="white" fillOpacity="0.5" />
      </svg>
    </div>
  );
};

export default Logo;
