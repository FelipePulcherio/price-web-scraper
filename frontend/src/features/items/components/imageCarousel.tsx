import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

import { IItem } from '@/types/interfaces';

import { cn } from '@/utils/cn';

interface ImageCarouselProps {
  item: IItem;
}

export function ImageCarousel({ item }: ImageCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const handleSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', handleSelect);
    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi]);

  const handleDotClick = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  return (
    <>
      <Carousel setApi={setCarouselApi} className='w-full'>
        <CarouselContent>
          {item.images.map((image, index) => (
            <CarouselItem
              key={index}
              className='flex items-center justify-center sm:pl-0'
            >
              <div className='aspect-square w-3xs md:w-xs lg:w-lg'>
                <img
                  src={image.url || '/images/imagePlaceholder.svg'}
                  alt={`${item.brand} ${item.name} - Image ${index + 1}`}
                  className='rounded-xl object-center object-contain'
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-2 sm:left-0 md:left-1 lg:top-133 lg:left-6' />
        <CarouselNext className='right-2 sm:right-3 md:right-5 lg:top-133 lg:right-10' />
      </Carousel>

      <div className='flex justify-center items-center gap-2 mt-4 sm:mt-2 lg:mt-4'>
        {item.images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'size-2 rounded-full transition-colors',
              current === index
                ? 'bg-zinc-950'
                : 'bg-zinc-300 hover:bg-zinc-400'
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}
