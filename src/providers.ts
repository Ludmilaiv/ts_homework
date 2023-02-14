import { FlatRentSdk, FlatSdk } from './flat-rent-sdk.js';
import { SearchFormData } from './search-form.js';

const flatRentSdk =  new FlatRentSdk;

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
  getById(id: string): Promise<Place>;
}

function toPlaceFromFlatSdk(item: FlatSdk) : Place {
  return {
    id: item.id,
    name: item.title,
    image: item.photos[0],
    price: item.totalPrice,
    description: item.details,
    bookedDates: item.bookedDates,
  };
}

function dateToUnixStamp(date) {
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
        priceLimit: filter.maxPrice
      })
        .then(data => {
          const places: Place[] = [];
          data.forEach(item => places.push(toPlaceFromFlatSdk(item)));
          res(places);
        })
    })
  }

  public getById(id: string): Promise<Place> {
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
        .then<Place[]>(response => response.json())
        .then(res);
    })
  }

  public getById(id: string): Promise<Place> {
    return new Promise(res => {
      const url = `${this.apiUrl}/${id}`;
      fetch(url)
        .then<Place>(response => response.json())
        .then(res);
    })
  }

}