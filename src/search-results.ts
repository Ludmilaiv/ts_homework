import { renderBlock } from './lib.js';
import { SearchFormData } from './search-form.js';
import { Place, ApiProvider, SdkProvider } from './providers.js';

export type FavoriteItems = Map<string, Pick<Place, 'name' | 'image'>>;

function mapToJson(map: FavoriteItems): string {
  const keys = [...map.keys()];
  const mapData = keys.map(key => [key, map.get(key)]);
  return JSON.stringify({
    dataType: 'Map',
    mapData: mapData
  });
}
export function jsonToMap(json?: string): FavoriteItems {
  if (!json) return new Map();
  const data: { dataType: string, mapData: [string, Place][] } = JSON.parse(json);
  if (data.dataType !== 'Map') return;
  return new Map(data.mapData);
}

function sortByPriceAscending(one: Place, two: Place) {
  if (one.price > two.price) {
    return 1
  } else if (one.price < two.price) {
    return -1
  } else {
    return 0
  }
}

function sortByPriceDescending(one: Place, two: Place) {
  if (one.price < two.price) {
    return 1
  } else if (one.price > two.price) {
    return -1
  } else {
    return 0
  }
}

function sortByDistance(one: Place, two: Place) {
  if (one.remoteness > two.remoteness) {
    return 1
  } else if (one.remoteness < two.remoteness || !two.remoteness) {
    return -1
  } else {
    return 0
  }
}

function sorting(places: Place[], order: 'ch' | 'exp' | 'cl'): Place[] {
  switch(order) {
  case 'ch':
    return places.sort(sortByPriceAscending);
  case 'exp':
    return places.sort(sortByPriceDescending);
  case 'cl':
    return places.sort(sortByDistance)
  }
}

const sdk = new SdkProvider;
const api = new ApiProvider;

export function searchResults(searchData: SearchFormData, order?: 'ch' | 'exp' | 'cl') {
  Promise.all([
    sdk.find(searchData),
    api.find(searchData)
  ]).then(results => {
    const allResults: Place[] = [...results[0], ...results[1]];
    results ? renderSearchResultsBlock(sorting(allResults, order || 'ch')) : renderEmptyOrErrorSearchBlock('Ничего не найдено');
  }).catch((err) => { renderEmptyOrErrorSearchBlock('Что-то пошло не так'); console.log(err) });
}

function isFavorite(id: string) {
  const favoriteItemsData = localStorage.getItem('favoriteItems');
  const favoriteItems: FavoriteItems = jsonToMap(favoriteItemsData);
  return favoriteItems.has(id);
}

export function toggleFavoriteItem(event: Event) {
  const likeBtn = event.target as HTMLElement;
  if (!likeBtn.classList.contains('favorites')) return;
  const id = likeBtn.getAttribute('data-id');
  const favoriteItemsData = localStorage.getItem('favoriteItems');
  const favoriteItems: FavoriteItems = jsonToMap(favoriteItemsData);
  if (favoriteItems.has(id)) {
    favoriteItems.delete(id);
    localStorage.setItem('favoriteItems', mapToJson(favoriteItems));
    likeBtn.classList.remove('active');
    document.querySelector('.fav').innerHTML = favoriteItems.size ? `<i class="heart-icon active"></i>${favoriteItems.size}` : '<i class="heart-icon"></i>ничего нет';
  } else {
    Promise.all([
      sdk.getById(id),
      api.getById(id)
    ]).then(results => {
      const result: Place = results[0] || results[1];
      favoriteItems.set(id, {
        name: result.name,
        image: result.image,
      });
      localStorage.setItem('favoriteItems', mapToJson(favoriteItems));
      likeBtn.classList.add('active');
      document.querySelector('.fav').innerHTML = favoriteItems.size ? `<i class="heart-icon active"></i>${favoriteItems.size}` : '<i class="heart-icon"></i>ничего нет';
    }).catch(() => renderEmptyOrErrorSearchBlock('Что-то пошло не так'));
  }
}

export function renderSearchStubBlock() {
  renderBlock(
    'search-results-block',
    `
    <div class="before-results-block">
      <img src="img/start-search.png" />
      <p>Чтобы начать поиск, заполните форму и&nbsp;нажмите "Найти"</p>
    </div>
    `
  )
}

export function renderEmptyOrErrorSearchBlock(reasonMessage?: string) {
  renderBlock(
    'search-results-block',
    `
    <div class="no-results-block">
      <img src="img/no-results.png" />
      <p>${reasonMessage}</p>
    </div>
    `
  )
}

document.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target.classList.contains('filter')) {
    const form = document.getElementById('searchForm') as HTMLFormElement;
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
    const order = target.value as 'ch' | 'exp' | 'cl';
    searchResults(data, order);
  }
})


export function renderSearchResultsBlock(data: Place[]) {
  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select class="filter">
                <option value="ch" selected>Сначала дешёвые</option>
                <option value="exp">Сначала дорогие</option>
                <option value="cl">Сначала ближе</option>
            </select>
        </div>
    </div>
    <ul class="results-list">` +
    data.map(place => `<li class="result">
    <div class="result-container">
      <div class="result-img-container">
        <div class="favorites ${isFavorite(place.id) && 'active'}" data-id="${place.id}"></div>
        <img class="result-img" src="${place.image}" alt="">
      </div>	
      <div class="result-info">
        <div class="result-info--header">
          <p>${place.name}</p>
          <p class="price">${place.price}&#8381;</p>
        </div>
        <div class="result-info--map"><i class="map-icon"></i>${place.remoteness ? place.remoteness + 'км от вас' : 'нет информации'}</div>
        <div class="result-info--descr">${place.description}</div>
        <div class="result-info--footer">
          <div>
            <button>Забронировать</button>
          </div>
        </div>
      </div>
    </div>
  </li>`)
    + '</ul>'

  )
}
