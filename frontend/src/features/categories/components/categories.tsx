import { CategoriesDropDown } from './categoriesDropDown';
import { CategoriesSheet } from './categoriesSheet';

export const Categories = () => {
  return (
    <>
      <div className='hidden sm:block'>
        <CategoriesDropDown />
      </div>
      <div className='sm:hidden'>
        <CategoriesSheet />
      </div>
    </>
  );
};
