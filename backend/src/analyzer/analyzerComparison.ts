import { Types } from 'mongoose';
import { IHistory, IItem, IScraperResult } from '../types/types';

// Define interface for props used in updateHistoryCollection function
interface analyzerComparisonProps {
  historyCollection: IHistory[];
}

// FUNCTIONS
export function analyzerComparison({
  historyCollection,
}: analyzerComparisonProps): IItem[] {
  // Define variables
  let updatedItem: IItem[] = [];

  const startDate: Date = new Date();
  startDate.setUTCHours(15, 0, 0, 0);
  // console.log(startDate);

  const endDate: Date = new Date();
  endDate.setDate(endDate.getDate() + 1); // add one day
  endDate.setUTCHours(14, 59, 59, 999);
  // console.log(endDate);

  // Iterate trough historyCollection
  historyCollection.map((item) => {
    // Filter only dataFull related to this date
    const filteredDataFull: IScraperResult[] = item.dataFull.filter((obj) => {
      const objDate: Date = new Date(obj.date);
      return objDate >= startDate && objDate <= endDate;
    });

    // console.log(filteredCollection);

    // Find the lowest price
    const lowestObj: IScraperResult = filteredDataFull.reduce(
      (min, current) => {
        return current.price <= min.price ? current : min;
      }
    );

    // console.log(lowestObj);

    // Set Item entry
    const newGraphEntry: IItem = {
      _id: item.item_id,
      stores: [
        {
          name: lowestObj.store,
          logo: '',
          url: '',
        },
      ],
      lastUpdated: lowestObj.date,
      lowestPrice: lowestObj.price,
      lowestStore: lowestObj.store,
    };

    updatedItem.push(newGraphEntry);
  });

  // console.log(updatedItem);

  return updatedItem;
}

function testAnalyzerComparison() {
  const historyCollection: IHistory[] = [
    {
      _id: new Types.ObjectId(),
      item_id: new Types.ObjectId('672aed9c2e3245af82416b60'),
      dataFull: [
        {
          store: 'walmart.ca',
          price: 1098,
          date: new Date(),
          moment: 'Morning',
        },
        {
          store: 'bestbuy.ca',
          price: 1100,
          date: new Date(),
          moment: 'Morning',
        },
        {
          store: 'newegg.ca',
          price: 1110,
          date: new Date(),
          moment: 'Morning',
        },
      ],
    },
    {
      _id: new Types.ObjectId(),
      item_id: new Types.ObjectId('672aed9c2e3245af82416b61'),
      dataFull: [
        {
          store: 'walmart.ca',
          price: 999,
          date: new Date(),
          moment: 'Morning',
        },
        {
          store: 'bestbuy.ca',
          price: 849.97,
          date: new Date(),
          moment: 'Morning',
        },
        {
          store: 'newegg.ca',
          price: 1249,
          date: new Date(),
          moment: 'Morning',
        },
      ],
    },
  ];

  const updatedItem: IItem[] = analyzerComparison({
    historyCollection: historyCollection,
  });

  console.log(updatedItem);
  console.log(updatedItem[0]);
  console.log(updatedItem[1]);
}

// testAnalyzerComparison();
