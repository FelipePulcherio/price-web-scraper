import { Card, CardContent } from '@/components/ui/card';
import { IShortItem } from '@/types/interfaces';

export function ItemCard({
  id,
  name,
  model,
  brand,
  image,
  price,
  storesQty,
}: IShortItem): React.ReactNode {
  return (
    <Card key={id} className='p-4 h-full'>
      <CardContent className='p-0 aspect-square flex flex-col justify-start items-center'>
        <img
          className='w-full max-w-[250px] aspect-square'
          src={image.url}
          alt={`Image ${brand} ${name} ${model}`}
        />
        <div className='h-16 w-full pb-2 text-xs'>
          {`${brand} ${name} - ${model}`}
          <span className='text-2xs'></span>
        </div>
        <div className='w-full pb-2 text-lg font-bold'>
          {Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
          }).format(price as number)}
        </div>
        <div className='w-full pb-6 text-zinc-800 text-xs'>{`Compare from ${storesQty} ${
          storesQty === 1 ? 'store' : 'stores'
        }`}</div>
      </CardContent>
    </Card>
  );
}
