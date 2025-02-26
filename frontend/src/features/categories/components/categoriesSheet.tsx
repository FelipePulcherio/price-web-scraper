import { useState } from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { ICategory } from '@/types/interfaces';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

export const CategoriesSheet = () => {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const toggleCategory = (categoryName: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryName)) {
      newOpenCategories.delete(categoryName);
    } else {
      newOpenCategories.add(categoryName);
    }
    setOpenCategories(newOpenCategories);
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) {
          setOpenCategories(new Set());
        }
      }}
    >
      <SheetTrigger asChild>
        <Button
          className='hover:bg-zinc-500 cursor-pointer'
          variant='ghost'
          size='icon'
        >
          <Menu className='size-6' color='#FAFAFA' />
          <span className='sr-only'>Open categories menu mobile</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-xs gap-0'>
        <SheetHeader className='text-lg p-4 border-b border-zinc-200'>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <div className='overflow-y-auto h-full pb-20'>
          {CATEGORIES_LIST.map((category) => (
            <div key={category.name} className='border-b border-zinc-200'>
              {category.hasDepth ? (
                <Collapsible
                  open={openCategories.has(category.name)}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger
                    className={`flex w-full items-center justify-between p-4 text-left hover:bg-cyan-600/25 ${
                      openCategories.has(category.name) ? 'bg-cyan-600/25' : ''
                    }`}
                  >
                    <span>{category.name}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-150 ${
                        openCategories.has(category.name) ? 'rotate-90' : ''
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {category.subCategories.map((subCategory) => (
                      <div
                        key={subCategory.name}
                        className='border-t border-zinc-200'
                      >
                        {subCategory.hasDepth ? (
                          <Collapsible
                            open={openCategories.has(subCategory.name)}
                            onOpenChange={() =>
                              toggleCategory(subCategory.name)
                            }
                          >
                            <CollapsibleTrigger
                              className={`flex w-full items-center justify-between p-4 pl-8 text-left hover:bg-zinc-100 ${
                                openCategories.has(category.name)
                                  ? 'bg-zinc-200/70'
                                  : ''
                              }`}
                            >
                              <span>{subCategory.name}</span>
                              <ChevronRight
                                className={`h-4 w-4 transition-transform duration-150 ${
                                  openCategories.has(subCategory.name)
                                    ? 'rotate-90'
                                    : ''
                                }`}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {subCategory.subSubCategories.map(
                                (subSubCategory) => (
                                  <button
                                    key={subSubCategory.name}
                                    className='w-full p-4 pl-12 text-left hover:bg-zinc-100 border-t border-zinc-200'
                                  >
                                    {subSubCategory.name}
                                  </button>
                                )
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <button className='w-full p-4 pl-8 text-left hover:bg-zinc-100'>
                            {subCategory.name}
                          </button>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <button className='w-full p-4 text-left hover:bg-cyan-600/25'>
                  {category.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
