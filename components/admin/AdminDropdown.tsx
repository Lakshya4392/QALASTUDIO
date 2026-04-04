import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ElementType;
  style?: string;
}

interface AdminDropdownProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ 
  value, 
  options, 
  onChange, 
  label, 
  placeholder = 'Select option',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-6 py-4 bg-white border-2 border-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:shadow-lg active:scale-[0.98] ${isOpen ? 'shadow-lg border-black' : 'border-black/10 hover:border-black'}`}
      >
        <span className="flex items-center gap-3 truncate">
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4" />}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[999] mt-3 w-full bg-white border-2 border-black rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="max-h-60 overflow-y-auto py-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white ${value === opt.value ? 'bg-black/5 text-black' : 'text-black/60'}`}
              >
                <span className="flex items-center gap-3">
                  {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                  {opt.label}
                </span>
                {value === opt.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;
