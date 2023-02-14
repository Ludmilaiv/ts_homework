interface SearchParams {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  priceLimit: number;
}

export interface FlatSdk {
  id: string;
  bookedDates: Date[];
  coordinates: number[];
  details: string;
  photos: string[];
  title: string;
  totalPrice: number;
}

export class FlatRentSdk {
  get(id: string) : Promise<FlatSdk>;
  search(parameters: SearchParams) : Promise<FlatSdk[]>;
  book(flatId: string, checkInDate: Date, checkOutDate: Date) : Promise<number>
}