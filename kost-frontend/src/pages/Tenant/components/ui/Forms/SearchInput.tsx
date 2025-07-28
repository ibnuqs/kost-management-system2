// File: src/pages/Tenant/components/ui/Forms/SearchInput.tsx
import React, { useState, useEffect } from 'react';
import { Search, X, LucideIcon } from 'lucide-react';
import Input from './Input';
import { debounce } from '../../../utils/helpers';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // ADD THIS
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  autoFocus?: boolean;
  icon?: LucideIcon; // ADD THIS
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value = '',
  onSearch,
  onClear,
  debounceMs = 300,
  disabled = false,
  loading = false,
  className = '',
  autoFocus = false,
}) => {
  const [searchValue, setSearchValue] = useState(value);

  // Create debounced search function
  const debouncedSearch = debounce((query: string) => {
    onSearch(query);
  }, debounceMs);

  // Effect to handle external value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Effect to trigger debounced search
  useEffect(() => {
    debouncedSearch(searchValue);
  }, [searchValue, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    onClear?.();
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={className}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        leftIcon={Search}
        rightIcon={searchValue ? X : undefined}
        onRightIconClick={searchValue ? handleClear : undefined}
        disabled={disabled}
        loading={loading}
        autoFocus={autoFocus}
        className="pr-10"
      />
    </div>
  );
};

export default SearchInput;