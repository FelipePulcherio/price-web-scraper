import { useState, useEffect, useRef } from 'react';
import { SearchInput } from './searchInput';
import { SearchResults } from './searchResults';

import { IShortItem } from '@/types/interfaces';

const ITEMS_LIST: IShortItem[] = [
  {
    name: 'TV 65" Q60D 4K UHD HDR QLED 2024',
    model: 'QN65Q60DAFXZC',
    brand: 'Samsung',
    image: {
      name: 'Samsung Q60D TV Image',
      url: 'https://res.cloudinary.com/dabwt1bon/image/upload/f_auto,q_auto/w_150,h_150/v1/Items/Samsung/QN65Q60DAFXZC/Samsung_QN65Q60DAFXZC_1',
    },
    price: 899.99,
  },
  {
    name: 'TV 75" Q60D 4K UHD HDR QLED 2024',
    model: 'QN75Q60DAFXZC',
    brand: 'Samsung',
    image: {
      name: 'Samsung Q60D TV Image',
      url: 'https://res.cloudinary.com/dabwt1bon/image/upload/f_auto,q_auto/w_150,h_150/v1/Items/Samsung/QN65Q60DAFXZC/Samsung_QN65Q60DAFXZC_1',
    },
    price: 1399.99,
  },
  {
    name: 'TV 85" Q60D 4K UHD HDR QLED 2024',
    model: 'QN85Q60DAFXZC',
    brand: 'Samsung',
    image: {
      name: 'Samsung Q60D TV Image',
      url: 'https://res.cloudinary.com/dabwt1bon/image/upload/f_auto,q_auto/w_150,h_150/v1/Items/Samsung/QN65Q60DAFXZC/Samsung_QN65Q60DAFXZC_1',
    },
    price: 1999.99,
  },
  {
    name: 'TV 55" Q60D 4K UHD HDR QLED 2024',
    model: 'QN55Q60DAFXZC',
    brand: 'Samsung',
    image: {
      name: 'Samsung Q60D TV Image',
      url: 'https://res.cloudinary.com/dabwt1bon/image/upload/f_auto,q_auto/w_150,h_150/v1/Items/Samsung/QN65Q60DAFXZC/Samsung_QN65Q60DAFXZC_1',
    },
    price: 749.99,
  },
  {
    name: 'TV 50" Q60D 4K UHD HDR QLED 2024',
    model: 'QN50Q60DAFXZC',
    brand: 'Samsung',
    image: {
      name: 'Samsung Q60D TV Image',
      url: 'https://res.cloudinary.com/dabwt1bon/image/upload/f_auto,q_auto/w_150,h_150/v1/Items/Samsung/QN65Q60DAFXZC/Samsung_QN65Q60DAFXZC_1',
    },
    price: 699.99,
  },
];

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
        results={ITEMS_LIST}
        isOpen={isOpen}
        shouldRender={shouldRender}
      />
    </div>
  );
};
