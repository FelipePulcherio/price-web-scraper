import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  searchQuery: string;
  onSearch: (value: string) => void;
}

export const SearchInput = ({ searchQuery, onSearch }: SearchInputProps) => {
  return (
    <div className='relative flex-1'>
      <Input
        type='text'
        placeholder='Search for an item...'
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className='bg-zinc-50 h-10 shadow-none focus-visible:border-zinc-50 focus-visible:ring-zinc-50/50'
      />
      {searchQuery && (
        <div className='absolute right-10 top-1/5 flex justify-center items-center gap-4'>
          <X
            className='size-4 cursor-pointer'
            color='#71717A'
            strokeWidth={1.75}
            absoluteStrokeWidth={true}
            onClick={() => onSearch('')}
          />
          <div className='h-6 border-r border-zinc-400'></div>
        </div>
      )}
      <Search
        className='absolute right-1.5 top-1/4 size-5 bg-zinc-50'
        color='#71717A'
        strokeWidth={1.75}
        absoluteStrokeWidth={true}
      />
    </div>
  );
};
