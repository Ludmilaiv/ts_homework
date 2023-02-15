import { FlatRentSdk, FlatSdk } from './flat-rent-sdk.js';
import { SearchFormData } from './search-form.js';

const flatRentSdk =  new FlatRentSdk;

interface FlatApi {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  bookedDates: Date[];
  remoteness: number;
}

export interface Place {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  bookedDates: Date[];
  remoteness?: number;
}

interface Provider {
  find(filter: SearchFormData): Promise<Place[]>;
  getById(id: string): Promise<Place | null>;
}

function toPlaceFromFlatSdk(item?: FlatSdk) : Place | null {
  if (!item) return null;
  return {
    id: item.id,
    name: 'item.title',
    image: item.photos[0] || '',
    price: item.totalPrice,
    description: item.details,
    bookedDates: item.bookedDates,
  };
}

function toPlaceFromFlatApi(item?: FlatApi) : Place | null {
  if (!item) return null;
  return {
    id: String(item.id),
    name: item.name,
    image: item.image,
    price: item.price,
    description: item.description,
    bookedDates: item.bookedDates,
    remoteness: item.remoteness
  };
}

function dateToUnixStamp(date: Date | null) {
  if (!date) return;
  return date.getTime() / 1000;
}

export class SdkProvider implements Provider {
  public static provider = 'sdk';

  public find(filter: SearchFormData): Promise<Place[]> {
    return new Promise(res => {
      flatRentSdk.search({
        city: 'Санкт-Петербург',
        checkInDate: filter.checkInDate,
        checkOutDate: filter.checkOutDate,
        priceLimit: filter.maxPrice || null
      })
        .then(data => {
          const places: Place[] = [];
          data.forEach(item => {
            const place = toPlaceFromFlatSdk(item);
            if (place) places.push(place);
          });
          res(places);
        })
    })
  }

  public getById(id: string): Promise<Place | null> {
    return new Promise(res => {
      flatRentSdk.get(id)
        .then(data => {
          const place = toPlaceFromFlatSdk(data);
          res(place);
        });
    })
  }

}

export class ApiProvider implements Provider {
  public static provider = 'api';

  private apiUrl = 'http://localhost:3030/places';

  public find(filter: SearchFormData): Promise<Place[]> {
    return new Promise(res => {
      let url = `${this.apiUrl}?` +
      `checkInDate=${dateToUnixStamp(filter.checkInDate)}&` +
      `checkOutDate=${dateToUnixStamp(filter.checkOutDate)}&` +
      'coordinates=59.9386,30.3141';
      if (filter.maxPrice) {
        url += `&maxPrice=${filter.maxPrice}`
      }
      fetch(url)
        .then<FlatApi[]>(response => response.json())
        .then(data => {
          const places: Place[] = [];
          data.forEach(item => {
            const place = toPlaceFromFlatApi(item);
            if (place) places.push(place);
          });
          res(places);
        });
    })
  }

  public getById(id: string): Promise<Place | null> {
    return new Promise(res => {
      const url = `${this.apiUrl}/${id}`;
      fetch(url)
        .then<FlatApi>(response => response.json())
        .then(data => {
          const place = toPlaceFromFlatApi(data);
          res(place);
        });
    })
  }

}