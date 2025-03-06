import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { StoreAvatar } from '@/features/stores/components/storeAvatar';
import { ItemCard } from '@/features/items/components/itemCard';

import { IShortStore, IShortItem } from '@/types/interfaces';
import { StoreNameFormat } from '@/utils/storeNameFormat';

import { getAllStores } from '@/features/stores/api/getStores';
import { getMainDeals } from '@/features/items/api/getDeals';
import { AdsCard } from '@/features/ads/components/adsCard';

function StoresCarousel({
  stores,
}: {
  stores: IShortStore[];
}): React.ReactNode {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className='w-full'
    >
      <CarouselContent className={`mx-10`}>
        {stores.map((store, index) => (
          <CarouselItem
            key={index}
            className={`pl-0 basis-1/4 sm:basis-1/6 lg:basis-1/8 xl:basis-1/10 2xl:basis-1/12`}
          >
            <StoreAvatar
              subtitle={StoreNameFormat(store.name)}
              url={store.logo}
              fallback={store.name}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className='absolute z-1 h-full bg-zinc-50 w-10 top-0 -left-1'></div>
      <div className='absolute z-1 h-full bg-zinc-50 w-10 top-0 -right-1'></div>
      <CarouselPrevious className='size-7 sm:size-8 z-2 top-1/2 -left-0' />
      <CarouselNext className='size-7 sm:size-8 z-2 top-1/2 -right-0' />
    </Carousel>
  );
}

function DealsCarousel({ items }: { items: IShortItem[] }): React.ReactNode {
  return (
    <Carousel
      opts={{
        align: 'start',
        dragFree: true,
      }}
      className='w-full'
    >
      <CarouselContent className='sm:ml-6 sm:mr-10'>
        {items.map((item, index) => (
          <CarouselItem key={index} className={`pl-4 basis-[14rem]`}>
            <ItemCard
              id={item.id}
              name={item.name}
              model={item.model}
              brand={item.brand}
              image={item.image}
              price={item.price}
              storesQty={item.storesQty}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className='hidden sm:block'>
        <div className='absolute z-1 h-full bg-zinc-50 w-10 top-0 -left-1'></div>
        <div className='absolute z-1 h-full bg-zinc-50 w-10 top-0 -right-1'></div>
        <CarouselPrevious className='size-7 sm:size-8 z-2 top-1/2 -left-0' />
        <CarouselNext className='size-7 sm:size-8 z-2 top-1/2 -right-0' />
      </div>
    </Carousel>
  );
}

function AdsCarousel(): React.ReactNode {
  return (
    <Carousel
      opts={{
        align: 'center',
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4000,
          playOnInit: true,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
      className='w-full'
    >
      <CarouselContent className='ml-2 mr-6 md:ml-4 md:mr-8 lg:ml-16 lg:mr-18 xl:ml-32 xl:mr-36 2xl:ml-64 2xl:mr-68'>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className={`basis-full`}>
            <AdsCard />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

const LandingRoute = () => {
  const [stores, setStores] = useState<IShortStore[]>([]);
  const [items, setItems] = useState<IShortItem[]>([]);

  // Fetch stores and deals from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await getAllStores();
        const responseData = response.data as IShortStore[];
        const response2 = responseData
          .concat(responseData)
          .concat(responseData);
        setStores(response2 as IShortStore[]); // response.data
      } catch (error) {
        console.log(error);
      }
    };

    const fetchMainDeals = async () => {
      try {
        const response = await getMainDeals();
        const responseData = response.data as IShortItem[];
        const response2 = responseData.concat(responseData);
        setItems(response2 as IShortItem[]); // response.data
      } catch (error) {
        console.log(error);
      }
    };

    fetchStores();
    fetchMainDeals();
  }, []);

  return (
    <div className='flex flex-col justify-start items-center'>
      <div className='w-dvw pb-4'>
        <AdsCarousel />
      </div>

      <div className='w-full'>
        <div className='text-lg font-bold pb-4 sm:ml-10'>Available Stores</div>
        <StoresCarousel stores={stores} />
      </div>

      <div className='w-full'>
        <div className='text-lg font-bold pb-4 sm:ml-10'>
          Deals of the week!
        </div>
        <DealsCarousel items={items} />
      </div>
    </div>
  );
};

export default LandingRoute;
