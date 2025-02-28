import { useState, useEffect, useRef } from 'react';
import { SearchInput } from './searchInput';
import { SearchResults } from './searchResults';
import { quickSearch } from '../api/getItems';

import { IShortItem } from '@/types/interfaces';
import { ZodError } from 'zod';

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<IShortItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle closing the dropdown
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setShouldRender(false);
    }, 120);
  };

  // Handle opening the dropdown
  const handleOpen = () => {
    setIsOpen(true);
    setShouldRender(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch results from API
  useEffect(() => {
    if (searchQuery.length === 0) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await quickSearch(searchQuery);
        setResults(response.data as IShortItem[]);
      } catch (error) {
        if (!(error instanceof ZodError)) {
          console.log(error);
        }
      }
    };

    const delay = setTimeout(fetchResults, 300); // Delay API call
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      handleOpen();
    } else {
      handleClose();
    }
  };

  return (
    <div ref={searchRef} className='relative w-full'>
      <SearchInput searchQuery={searchQuery} onSearch={handleSearch} />
      <SearchResults
        searchQuery={searchQuery}
        results={results}
        isOpen={isOpen}
        shouldRender={shouldRender}
      />
    </div>
  );
};
