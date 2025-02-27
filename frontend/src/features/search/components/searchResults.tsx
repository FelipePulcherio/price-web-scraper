import { IShortItem } from '@/types/interfaces';

interface SearchResultsProps {
  searchQuery: string;
  results: IShortItem[];
  isOpen: boolean;
  shouldRender: boolean;
}

export const SearchResults = ({
  searchQuery,
  results,
  isOpen,
  shouldRender,
}: SearchResultsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  if (!shouldRender) return null;

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className='absolute z-100 w-full mt-2 p-1 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-md dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
    >
      <div className='w-full p-2'>
        <div className='px-2 py-1.5 text-sm font-bold text-zinc-900'>
          {searchQuery}
        </div>
        <div className='my-1 h-px bg-zinc-200' />
        <div className=''>
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.model}
                className='flex items-center gap-4 rounded-sm px-2 py-1.5 text-sm text-zinc-900 cursor-pointer select-none hover:text-cyan-600 hover:bg-zinc-100'
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded'>
                  <img
                    src={item.image.url || ''}
                    alt={item.image.name || item.name}
                    className='object-cover w-full h-full'
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='truncate font-medium'>{item.name}</div>
                  <div className='text-zinc-500'>{`${item.brand} - ${item.model}`}</div>
                </div>
                <div className='flex-shrink-0 font-medium text-zinc-900'>
                  {item.price ? formatPrice(item.price) : 'N/A'}
                </div>
              </div>
            ))
          ) : (
            <div className='px-2 py-1.5 text-sm text-zinc-500'>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
