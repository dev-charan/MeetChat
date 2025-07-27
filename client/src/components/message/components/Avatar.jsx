import React from 'react';

const Avatar = ({ src, alt, isOnline = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  const indicatorSizes = {
    small: 'w-2 h-2 bottom-0 right-0',
    medium: 'w-3 h-3 bottom-0.5 right-0.5',
    large: 'w-4 h-4 bottom-1 right-1'
  };

  return (
    <div className="relative inline-block">
      <img 
        src={src} 
        alt={alt} 
        className={`
          ${sizeClasses[size]} rounded-full object-cover 
          border-2 border-white shadow-sm
        `}
        onError={(e) => {
          e.target.src = 'https://ui-avatars.com/api/?name=' + alt + '&background=0D8ABC&color=fff';
        }}
      />
      {isOnline && (
        <div className={`
          absolute bg-green-500 border-2 border-white rounded-full shadow-sm
          ${indicatorSizes[size]}
        `}></div>
      )}
    </div>
  );
};

export default Avatar;
