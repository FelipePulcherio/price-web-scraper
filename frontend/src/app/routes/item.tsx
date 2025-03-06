import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';

import { ChevronRight, Bell } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

import { ICurrentPrice, IItem, IShortEvent } from '@/types/interfaces';
import { PriceFormat } from '@/utils/priceFormat';
import { StoreNameFormat } from '@/utils/storeNameFormat';

import { getItemDetails } from '@/features/items/api/getItemDetails';
import { ImageCarousel } from '@/features/items/components/imageCarousel';
import { getCurrentPrices } from '@/features/items/api/getCurrentPrices';
import { getPriceHistory30 } from '@/features/items/api/getPriceHistory30';

const ItemRoute = () => {
  const itemPlaceholder: IItem = {
    id: 0,
    name: '',
    model: '',
    brand: '',
    categories: [{ name: '' }],
    subCategories: [{ name: '' }],
    subSubCategories: [{ name: '' }],
    images: [{ name: '', url: '' }],
    description: {} as JSON,
    stores: [{ name: '', url: '' }],
  };

  const currentPricesPlaceholder: ICurrentPrice = {
    stores: [
      {
        name: '',
        logo: '',
        url: '',
        price: 0,
      },
    ],
  };

  const chartDataPlaceholder: IShortEvent[] = [
    {
      date: new Date(),
      price: 0,
    },
  ];

  const [item, setItem] = useState<IItem>(itemPlaceholder);
  const [currentPrices, setCurrentPrices] = useState<ICurrentPrice>(
    currentPricesPlaceholder
  );
  const [chartData, setchartData] =
    useState<IShortEvent[]>(chartDataPlaceholder);
  const [timeRange, setTimeRange] = useState('30d');

  const compareRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  const params = useParams();
  const itemId = parseInt(params.id || '0', 10); // TODO: Fix this ugly hack

  const lowestPrice = Math.min(
    ...currentPrices.stores.map((store) => store.price)
  );

  const chartConfig = {
    price: {
      label: 'Price',
      color: '#22D3EE',
    },
  } satisfies ChartConfig;

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    let daysToSubtract = 30;
    if (timeRange === '365d') {
      daysToSubtract = 365;
    } else if (timeRange === '180d') {
      daysToSubtract = 180;
    } else if (timeRange === '90d') {
      daysToSubtract = 90;
    } else if (timeRange === '30d') {
      daysToSubtract = 30;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Fetch stores and deals from API
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await getItemDetails(itemId);
        setItem(response.data as IItem);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchCurrentPrices = async () => {
      try {
        const response = await getCurrentPrices(itemId);
        setCurrentPrices(response.data as ICurrentPrice);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchPriceHistory30 = async () => {
      try {
        const response = await getPriceHistory30(itemId);
        setchartData(response.data as IShortEvent[]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchItemDetails();
    fetchCurrentPrices();
    fetchPriceHistory30();
  }, [itemId]);

  return (
    <div className='flex flex-col justify-center items-center gap-y-5'>
      <ScrollArea className='relative w-full text-xs text-nowrap text-cyan-600 md:text-sm'>
        <div className='flex justify-start items-center gap-2 mb-4'>
          <div className='flex justify-start items-center'>
            <div className='pr-2'>{item.categories[0].name}</div>
            <ChevronRight
              className='size-4'
              strokeWidth={1.5}
              absoluteStrokeWidth={true}
            />
          </div>
          <div className='flex justify-start items-center'>
            <div className='pr-2'>{item.subCategories[0].name}</div>
            <ChevronRight
              className='size-4'
              strokeWidth={1.5}
              absoluteStrokeWidth={true}
            />
          </div>
          <div className='flex justify-start items-center'>
            <div className='pr-2'>{item.subSubCategories[0].name}</div>
            <ChevronRight
              className='size-4'
              strokeWidth={1.5}
              absoluteStrokeWidth={true}
            />
          </div>
          {/* TODO: Better handling of subSubCategories */}
          {item.subSubCategories.length > 1 && (
            <div className='text-zinc-600 pr-2'>
              {item.subSubCategories[1].name}
            </div>
          )}
        </div>
        <div className='absolute top-7.5 -left-2 w-full border-b border-zinc-200'></div>
        <ScrollBar orientation='horizontal' className='sm:hidden' />
      </ScrollArea>

      <div className='flex flex-col justify-start items-start -mt-2 gap-1 mr-auto'>
        <div className='text-lg font-bold md:text-xl'>{`${item.brand} ${item.name}`}</div>
        <span className='text-sm font-normal text-zinc-500 md:text-base'>{`Model: ${item.model}`}</span>
      </div>

      <div className='w-full sm:flex sm:gap-x-2'>
        <div className='max-w-[352px] pb-5 mx-auto sm:mx-0 sm:pb-0 md:max-w-md lg:max-w-xl'>
          <ImageCarousel item={item} />
        </div>

        <div className='w-full flex flex-col gap-y-5'>
          <div className='order-1 w-full'>
            <div className='text-sm text-green-600 lg:text-base'>
              {'Lowest price '}
              <span className='text-zinc-950'>{`with ${StoreNameFormat(
                currentPrices.stores[0].name
              )}:`}</span>
            </div>
            <div className='text-xl font-bold lg:text-2xl'>
              {PriceFormat(currentPrices.stores[0].price, 'en-CA', 'CAD')}
            </div>
          </div>

          <Button
            className='order-2 w-full cursor-pointer hover:bg-zinc-500 sm:order-3'
            variant='default'
            size='lg'
            onClick={() => {
              compareRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {`Compare in ${currentPrices.stores.length} ${
              currentPrices.stores.length === 1 ? 'store' : 'stores'
            }`}
            <span className='sr-only'>Compare stores</span>
          </Button>

          <Card
            key={'Alert'}
            className='order-3 w-full py-3 shadow-none sm:order-2 lg:py-6'
          >
            <CardContent className='px-3 flex justify-between items-center gap-2 lg:px-6'>
              <div className=''>
                <div className='flex justify-start items-center gap-2'>
                  <div className='rounded-full p-1 bg-zinc-900'>
                    <Bell className='size-4.5' color='#FAFAFA' />
                  </div>
                  <div className='text-sm'>I want to pay less!</div>
                </div>
                <div className='text-xs text-zinc-500 pt-2'>
                  We'll notify you when the price drop
                </div>
              </div>
              <Button
                className='bg-cyan-700 cursor-pointer hover:bg-cyan-600 sm:mt-4'
                variant='default'
                size='default'
              >
                <div className=''>Set alert</div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='w-full mt-1 flex justify-start items-center border-b border-zinc-200'>
        <Button
          variant='link'
          className='px-2 py-2 pr-4 mt-1 border-b-4 border-cyan-600 cursor-pointer rounded-none hover:no-underline sm:px-4'
          onClick={() => {
            compareRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Prices
        </Button>
        <Button
          variant='link'
          className='px-4 py-3 cursor-pointer hover:no-underline'
          onClick={() => {
            historyRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          History
        </Button>
        <Button
          variant='link'
          className='px-4 py-3 cursor-pointer hover:no-underline'
        >
          Details
        </Button>
      </div>

      <div ref={compareRef} id='compare' className='w-full'>
        <div className='font-bold pb-4 lg:text-lg'>{`Compare prices in ${
          currentPrices.stores.length
        } ${currentPrices.stores.length === 1 ? 'store' : 'stores'}`}</div>
        <div className='flex flex-col justify-start items-center gap-4'>
          {currentPrices.stores.map((store, index) => {
            return (
              <Card
                key={index}
                className={`w-full max-w-5xl shadow-none ${
                  store.price === lowestPrice && 'border border-green-500'
                }`}
              >
                {store.price === lowestPrice && (
                  <div className='relative max-w-fit px-2 py-0.5 -top-6 left-0 rounded-tl-md rounded-br-sm bg-green-500 text-sm font-medium text-zinc-50'>
                    Lowest price
                  </div>
                )}
                <CardContent
                  className={`${store.price === lowestPrice && '-mt-8'}`}
                >
                  <div className='gap-6 flex justify-start items-center'>
                    <img
                      src={item.images[0].url || '/images/imagePlaceholder.svg'}
                      alt={`${item.brand} ${item.name} - Icon ${index + 1}`}
                      className='size-18 rounded-xl object-center object-contain'
                    />
                    <div className='text-xl font-bold'>
                      {PriceFormat(store.price, 'en-CA', 'CAD')}
                    </div>
                  </div>
                  <div className='pt-2 flex justify-between items-center'>
                    <div className='flex justify-start items-center gap-2'>
                      <img
                        src={store.logo || '/images/imagePlaceholder.svg'}
                        alt={`${store.name} - Icon ${index + 1}`}
                        className='size-10'
                      />
                      <div className='text-sm font-bold'>
                        {StoreNameFormat(store.name)}
                      </div>
                    </div>
                    <Button
                      size='lg'
                      className='cursor-pointer hover:bg-zinc-500'
                      onClick={() => window.open(store.url, '_blank')}
                    >
                      Go to store
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div ref={historyRef} id='hisotry' className='w-full'>
        <div className='font-bold pb-4 lg:text-lg'>Check the price history</div>

        <Card className='shadow-none'>
          <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
            <ChartContainer
              config={chartConfig}
              className='aspect-auto h-[250px] w-full'
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id='fillPrice' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#0891B2' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#0891B2' stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <YAxis
                  dataKey='price'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={2}
                  tickFormatter={(value) => {
                    return PriceFormat(value, 'en-CA', 'CAD');
                  }}
                />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={16}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-CA', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-CA', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                      valueFormatter={(value) => {
                        return PriceFormat(value as number, 'en-CA', 'CAD');
                      }}
                      indicator='dot'
                    />
                  }
                />
                <Area
                  dataKey='price'
                  type='linear'
                  fill='url(#fillPrice)'
                  stroke='#22D3EE'
                  stackId='a'
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemRoute;
