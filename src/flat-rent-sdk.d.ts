interface SearchParams {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  priceLimit: number;
}

export interface Flat {
  id: string;
  bookedDates: Date[];
  coordinates: number[];
  details: string;
  photos: string[];
  title: string;
  totalPrice: number;
}

export class FlatRentSdk {
  get(id: string) : Promise<Flat>;
  search(parameters: SearchParams) : Promise<Flat[]>;
  book(flatId: string, checkInDate: Date, checkOutDate: Date) : Promise<number>
}