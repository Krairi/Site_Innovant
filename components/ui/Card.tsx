import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', action }) => {
  return (
    <div className={`bg-givd-surface border-2 border-black shadow-neo p-4 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
          {title && <h3 className="font-display font-bold text-xl text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-gray-300 font-body">
        {children}
      </div>
    </div>
  );
};