import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';

export interface SortOption<T extends string = string> {
  id: T;
  label: string;
}

export interface SortDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  className?: string;
  ariaLabel?: string;
}

export const SortDropdown = <T extends string>({
  value,
  onChange,
  options,
  className = '',
  ariaLabel = 'Sort options'
}: SortDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = options.find((opt) => opt.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`reverb-sort-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`reverb-sort-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={ariaLabel}
      >
        <ArrowUpDown size={14} className="reverb-sort-icon" />
        <span className="reverb-sort-label">{activeOption ? activeOption.label : ''}</span>
        <ChevronDown size={14} className={`reverb-sort-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="reverb-sort-menu" role="menu">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                className={`reverb-sort-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                role="menuitem"
              >
                <span className="reverb-sort-item-label">{option.label}</span>
                {isSelected && <Check size={14} className="reverb-sort-item-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
