import { useState, useEffect } from 'react';
import { CategoriesDropDown } from './categoriesDropDown';
import { CategoriesSheet } from './categoriesSheet';

import { ICategory } from '@/types/interfaces';
import { getAllCategories } from '../api/getCategories';

export const Categories = () => {
  const [results, setResults] = useState<ICategory[]>([]);

  // Fetch results from API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getAllCategories();
        setResults(response.data as ICategory[]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchResults();
  }, []);

  return (
    <>
      <div className='hidden sm:block'>
        <CategoriesDropDown categories={results} />
      </div>
      <div className='sm:hidden'>
        <CategoriesSheet categories={results} />
      </div>
    </>
  );
};
