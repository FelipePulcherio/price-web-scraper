import { CategoriesDropDown } from './categoriesDropDown';
import { CategoriesSheet } from './categoriesSheet';

export const Categories = () => {
  return (
    <div>
      <div className='flex items-center justify-center'>
        <div className='hidden md:block'>
          <CategoriesDropDown />
        </div>
        <div className='md:hidden'>
          <CategoriesSheet />
        </div>
      </div>
    </div>
  );
};
