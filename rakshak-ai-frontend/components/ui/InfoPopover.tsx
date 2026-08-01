'use client';

import React, { useState, useRef, useEffect } from 'react';

interface InfoPopoverProps {
  text: string;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside or when another popover opens
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleGlobalClose = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('rakshak-close-popovers', handleGlobalClose);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('rakshak-close-popovers', handleGlobalClose);
    };
  }, []);

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      // Notify other popovers to close
      window.dispatchEvent(new Event('rakshak-close-popovers'));
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        onClick={togglePopover}
        type="button"
        aria-label="Information guide"
        className="w-5 h-5 rounded-full bg-[#F2F8DC] border border-[#DCE8B8] text-[#076653] font-bold text-xs flex items-center justify-center hover:bg-[#E3EF26] hover:text-[#06231D] transition-colors focus:outline-none focus:ring-1 focus:ring-[#076653] shrink-0 cursor-pointer"
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-[#0C342C] text-white text-xs p-3 rounded-lg shadow-xl border border-[#0C9276]/40 z-50 animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-sans font-normal text-left">
          {text}
        </div>
      )}
    </div>
  );
};
