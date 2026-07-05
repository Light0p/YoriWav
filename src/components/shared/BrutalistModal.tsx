/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface BrutalistModalProps {
  isOpen: boolean; // Flag determining if the modal is mounted/visible
  onClose: () => void; // Triggered when close actions (Escape, backdrop click, Close button) fire
  title: string; // Modal header title text
  children: React.ReactNode; // Body content nodes
  footer?: React.ReactNode; // Optional footer controls block
}

/**
 * Reusable Brutalist design modal container.
 * Features focus trapping, escape-key callbacks, backdrop clicks, and ARIA markup.
 */
export const BrutalistModal: React.FC<BrutalistModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 1. Keyboard listeners for Escape key close trigger
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 2. Focus Trap loop implementation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    
    // Query all focusable DOM nodes inside our modal container
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll<HTMLElement>(focusableSelectors);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Set initial focus to the first focusable item on mount
    firstElement.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // If Shift + Tab is clicked, loop focus from first back to last element
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // If Tab is clicked, loop focus from last to first element
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener("keydown", trapFocus);
    return () => {
      modal.removeEventListener("keydown", trapFocus);
    };
  }, [isOpen]);

  // Render nothing if modal status is closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0D0D0D]/40 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Dialog Window */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-heading"
        className="relative w-full max-w-md border-4 border-black bg-[#F5F0E8] p-6 shadow-[8px_8px_0_0_#000] z-10 flex flex-col gap-6 text-black font-mono animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Header Area */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h3 
            id="modal-title-heading" 
            className="font-serif text-xl font-bold uppercase truncate"
          >
            {title}
          </h3>
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Area */}
        <div className="text-sm font-bold leading-relaxed text-black uppercase">
          {children}
        </div>

        {/* Optional Footer controls */}
        {footer && (
          <div className="flex justify-end gap-3 border-t-2 border-black/10 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrutalistModal;
