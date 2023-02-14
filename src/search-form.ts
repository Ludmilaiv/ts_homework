import { renderBlock } from './lib.js';
import { searchResults } from './search-results.js';

export interface SearchFormData {
  city: string;
  checkInDate: Date,
  checkOutDate: Date,
  maxPrice?: number
}

export function search (event: Event) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (form.id !== 'searchForm') return;
  const formData = new FormData(form);
  const city = 'Санкт-Петербург';
  const checkInDate = formData.get('checkin'); 
  const checkOutDate = formData.get('checkout'); 
  if (!checkInDate || !checkOutDate) return;
  const maxPrice = formData.get('price');
  const data: SearchFormData = {
    city: String(city),
    checkInDate: checkInDate ? new Date(String(checkInDate)) : null,
    checkOutDate: checkOutDate ? new Date(String(checkOutDate)) : null,
    maxPrice: Number(maxPrice) || null
  };
  searchResults(data);
}

export function renderSearchFormBlock (startDate: Date, stopDate: Date) {
  const date = new Date();
  const startDateString = startDate.toLocaleDateString('en-CA');
  const stopDateString = stopDate.toLocaleDateString('en-CA');
  const minDate = date.toLocaleDateString('en-CA');
  const maxDate = (new Date(date.getFullYear(), date.getMonth() + 2, 0)).toLocaleDateString('en-CA');

  renderBlock(
    'search-form-block',
    `
    <form id="searchForm">
      <fieldset class="search-filedset">
        <div class="row">
          <div>
            <label for="city">Город</label>
            <input id="city" name="city" type="text" disabled value="Санкт-Петербург" />
            <input type="hidden" disabled value="59.9386,30.3141" />
          </div>
          <!--<div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>--!>
        </div>
        <div class="row">
          <div>
            <label for="check-in-date">Дата заезда</label>
            <input id="check-in-date" type="date" value="${startDateString}" min="${minDate}" max="${maxDate}" name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value="${stopDateString}" min="${minDate}" max="${maxDate}" name="checkout" />
          </div>
          <div>
            <label for="max-price">Макс. цена суток</label>
            <input id="max-price" type="text" value="" name="price" class="max-price" />
          </div>
          <div>
            <div><button type="submit">Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  );
}
