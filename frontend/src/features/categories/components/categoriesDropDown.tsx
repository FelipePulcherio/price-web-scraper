import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

import { ICategory } from '@/types/interfaces';

const CATEGORIES_LIST: ICategory[] = [
  {
    id: 1,
    name: 'TV & Home Theatre',
    hasDepth: true,
    subCategories: [
      {
        id: 11,
        name: 'Televisions',
        hasDepth: true,
        subSubCategories: [
          { id: 111, name: '85 Inch and Larger TVs' },
          { id: 112, name: '75 - 84 Inch TVs' },
          { id: 113, name: '70 - 74 Inch TVs' },
          { id: 114, name: '65 - 69 Inch TVs' },
          { id: 115, name: '55 - 59 Inch TVs' },
          { id: 116, name: '50 - 54 Inch TVs' },
          { id: 117, name: '43 - 49 Inch TVs' },
          { id: 118, name: '33 - 42 Inch TVs' },
          { id: 119, name: '32 Inch and Smaller TVs' },
          { id: 120, name: 'Smart TVs' },
          { id: 121, name: 'OLED TVs' },
          { id: 122, name: 'QLED TVs' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Computers, Tablets & Accessories',
    hasDepth: true,
    subCategories: [
      {
        id: 21,
        name: 'Laptops & MacBooks',
        hasDepth: true,
        subSubCategories: [
          { id: 211, name: 'Windows Laptops' },
          { id: 212, name: 'Copilot+ PC' },
          { id: 213, name: 'MacBooks' },
          { id: 214, name: 'Chromebooks' },
          { id: 215, name: 'Gaming Laptops' },
          { id: 216, name: '2 in 1 Laptops' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Computers & Accessories',
    hasDepth: true,
    subCategories: [
      {
        id: 21,
        name: 'Laptops & MacBooks',
        hasDepth: true,
        subSubCategories: [
          { id: 211, name: 'Windows Laptops' },
          { id: 212, name: 'Copilot+ PC' },
          { id: 213, name: 'MacBooks' },
          { id: 214, name: 'Chromebooks' },
          { id: 215, name: 'Gaming Laptops' },
          { id: 216, name: '2 in 1 Laptops' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Computers & Tablets',
    hasDepth: false,
    subCategories: [
      {
        id: 21,
        name: 'Laptops & MacBooks',
        hasDepth: true,
        subSubCategories: [
          { id: 211, name: 'Windows Laptops' },
          { id: 212, name: 'Copilot+ PC' },
          { id: 213, name: 'MacBooks' },
          { id: 214, name: 'Chromebooks' },
          { id: 215, name: 'Gaming Laptops' },
          { id: 216, name: '2 in 1 Laptops' },
        ],
      },
    ],
  },
];

export const CategoriesDropDown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const renderSubSubCategories = (
    subSubCategories: { id?: number; name: string }[]
  ) => {
    return subSubCategories.map((subSubCategory) => {
      return (
        <DropdownMenuItem key={subSubCategory.name}>
          {subSubCategory.name}
        </DropdownMenuItem>
      );
    });
  };

  const renderSubCategories = (subCategories: ICategory['subCategories']) => {
    return subCategories.map((subCategory) => {
      if (subCategory.hasDepth) {
        return (
          <DropdownMenuSub key={subCategory.name}>
            <DropdownMenuSubTrigger className='data-[state=open]:bg-zinc-200/70'>
              {subCategory.name}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent alignOffset={-5} sideOffset={3.5}>
                {renderSubSubCategories(subCategory.subSubCategories)}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        );
      }

      return (
        <DropdownMenuItem key={subCategory.name}>
          {subCategory.name}
        </DropdownMenuItem>
      );
    });
  };

  const renderCategories = (categories: ICategory[]) => {
    return categories.map((category) => {
      if (category.hasDepth) {
        return (
          <DropdownMenuSub key={category.name}>
            <DropdownMenuSubTrigger className='hover:bg-cyan-600/25 focus:bg-cyan-600/25 data-[state=open]:bg-cyan-600/25'>
              {category.name}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent alignOffset={-5} sideOffset={3.5}>
                {renderSubCategories(category.subCategories)}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        );
      }

      return (
        <DropdownMenuItem
          key={category.name}
          className='hover:bg-cyan-600/25 focus:bg-cyan-600/25 data-[state=open]:bg-cyan-600/25'
        >
          {category.name}
        </DropdownMenuItem>
      );
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className='hover:bg-zinc-500 cursor-pointer'
          variant='ghost'
          size='defaultCustom'
        >
          <div className='text-zinc-50 hidden sm:flex sm:justify-center sm:items-center sm:gap-2'>
            <div>Categories</div>
            <ChevronDown
              className={`transition duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
              color='#FAFAFA'
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-[30vw] max-w-xs'
        align='start'
        alignOffset={-8}
        sideOffset={8}
      >
        <svg
          width='36'
          height='36'
          viewBox='0 0 15 15'
          fill='#FFFFFF'
          xmlns='http://www.w3.org/2000/svg'
          className='fixed top-[-20px] left-[40px]'
        >
          <path d='M4 9H11L7.5 4.5L4 9Z'></path>
        </svg>
        {renderCategories(CATEGORIES_LIST)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
