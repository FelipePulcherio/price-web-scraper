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

interface CategoriesDropDownProps {
  categories: ICategory[];
}

export const CategoriesDropDown = ({ categories }: CategoriesDropDownProps) => {
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
        {renderCategories(categories)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
