import { renderBlock } from './lib.js';
import { SearchFormData } from './search-form.js';
import { FlatRentSdk, Flat } from './flat-rent-sdk.js';

export type FavoriteItems = Map<string, Pick<Flat, 'title' | 'photos'>>;

const flatRentSdk =  new FlatRentSdk;

function dateToUnixStamp(date) {
  return date.getTime() / 1000;
}

function mapToJson(map : FavoriteItems) : string {
  const keys = [...map.keys()];
  const mapData = keys.map(key => [key, map.get(key)]);
  return JSON.stringify({
    dataType: 'Map',
    mapData: mapData
  });
}
export function jsonToMap(json?: string) : FavoriteItems {
  if (!json) return new Map();
  const data: {dataType: string, mapData: [string, Flat][]} = JSON.parse(json);
  if (data.dataType !== 'Map') return; 
  return new Map(data.mapData);
}

export function searchResults (searchData: SearchFormData) {

  flatRentSdk.search({
    city: 'Санкт-Петербург',
    checkInDate: searchData.checkInDate,
    checkOutDate: searchData.checkOutDate,
    priceLimit: searchData.maxPrice
  })
    .then(data => data ? renderSearchResultsBlock(data) : renderEmptyOrErrorSearchBlock('Ничего не найдено'))
    .catch((err) => {renderEmptyOrErrorSearchBlock('Что-то пошло не так'); console.log(err)});
}

function isFavorite (id: string) {
  const favoriteItemsData = localStorage.getItem('favoriteItems');
  const favoriteItems: FavoriteItems = jsonToMap(favoriteItemsData);
  return favoriteItems.has(id);
}

export function toggleFavoriteItem (event: Event) {
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
    flatRentSdk.get(id)
      .then(data => {
        favoriteItems.set(id, { 
          title: data.title,
          photos: data.photos,
        });
        localStorage.setItem('favoriteItems', mapToJson(favoriteItems));
        likeBtn.classList.add('active');
        document.querySelector('.fav').innerHTML = favoriteItems.size ? `<i class="heart-icon active"></i>${favoriteItems.size}` : '<i class="heart-icon"></i>ничего нет';
      })
      .catch(() => renderEmptyOrErrorSearchBlock('Что-то пошло не так'));
  } 
}

export function renderSearchStubBlock () {
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

export function renderEmptyOrErrorSearchBlock (reasonMessage?: string) {
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

export function renderSearchResultsBlock (data: Flat[]) {
  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select>
                <option selected="">Сначала дешёвые</option>
                <option selected="">Сначала дорогие</option>
                <option>Сначала ближе</option>
            </select>
        </div>
    </div>
    <ul class="results-list">` +
    data.map(place => `<li class="result">
    <div class="result-container">
      <div class="result-img-container">
        <div class="favorites ${isFavorite(place.id) && 'active'}" data-id="${place.id}"></div>
        <img class="result-img" src="${place.photos[0]}" alt="">
      </div>	
      <div class="result-info">
        <div class="result-info--header">
          <p>${place.title}</p>
          <p class="price">${place.totalPrice}&#8381;</p>
        </div>
        <div class="result-info--map"><i class="map-icon"></i></div>
        <div class="result-info--descr">${place.details}</div>
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
