'use client';

import React from 'react';

interface SmoothScrollLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

const SmoothScrollLink: React.FC<SmoothScrollLinkProps> = ({ 
  targetId, 
  children, 
  className = '',
  offset = 80 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - offset;
      
      // Use JavaScript for smooth scrolling instead of CSS
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className={className}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

export default SmoothScrollLink;
