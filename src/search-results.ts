import { renderBlock } from './lib.js';
import { SearchFormData } from './search-form.js';

export interface Place {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  bookedDates: number[];
  remoteness: number;
}

function dateToUnixStamp(date) {
  return date.getTime() / 1000;
}

function mapToJson(map : Map<number, Pick<Place, 'name'|'image'>>) : string {
  const keys = [...map.keys()];
  const mapData = keys.map(key => [key, map.get(key)]);
  return JSON.stringify({
    dataType: 'Map',
    mapData: mapData
  });
}
export function jsonToMap(json?: string) : Map<number, Pick<Place, 'name'|'image'>> {
  if (!json) return new Map();
  const data: {dataType: string, mapData: [number, Pick<Place, 'name'|'image'>][]} = JSON.parse(json);
  if (data.dataType !== 'Map') return; 
  return new Map(data.mapData);
}

export function searchResults (searchData: SearchFormData) {
  let url = 'http://localhost:3030/places?' +
  `checkInDate=${dateToUnixStamp(searchData.checkInDate)}&` +
  `checkOutDate=${dateToUnixStamp(searchData.checkOutDate)}&` +
  'coordinates=59.9386,30.3141';
  if (searchData.maxPrice) {
    url += `&maxPrice=${searchData.maxPrice}`
  }
  fetch(url)
    .then<Place[]>(response => response.json())
    .then(data => data ? renderSearchResultsBlock(data) : renderEmptyOrErrorSearchBlock('Ничего не найдено'))
    .catch((err) => {renderEmptyOrErrorSearchBlock('Что-то пошло не так'); console.log(err)});
}

function isFavorite (id: number) {
  const favoriteItemsData = localStorage.getItem('favoriteItems');
  const favoriteItems: Map<number, Pick<Place, 'name'|'image'>> = jsonToMap(favoriteItemsData);
  return favoriteItems.has(id);
}

export function toggleFavoriteItem (event: Event) {
  const likeBtn = event.target as HTMLElement;
  if (!likeBtn.classList.contains('favorites')) return;
  const id = Number(likeBtn.getAttribute('data-id'));
  const favoriteItemsData = localStorage.getItem('favoriteItems');
  const favoriteItems: Map<number, Pick<Place, 'name'|'image'>> = jsonToMap(favoriteItemsData);
  if (favoriteItems.has(id)) {
    favoriteItems.delete(id);
    localStorage.setItem('favoriteItems', mapToJson(favoriteItems));
    likeBtn.classList.remove('active');
    document.querySelector('.fav').innerHTML = favoriteItems.size ? `<i class="heart-icon active"></i>${favoriteItems.size}` : '<i class="heart-icon"></i>ничего нет';
  } else {
    const url = `http://localhost:3030/places/${id}`;
    fetch(url)
      .then<Place>(response => response.json())
      .then(data => {
        favoriteItems.set(id, { 
          name: data.name,
          image: data.image,
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

export function renderSearchResultsBlock (data: Place[]) {
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
        <img class="result-img" src="${place.image}" alt="">
      </div>	
      <div class="result-info">
        <div class="result-info--header">
          <p>${place.name}</p>
          <p class="price">${place.price}&#8381;</p>
        </div>
        <div class="result-info--map"><i class="map-icon"></i>${place.remoteness}км от вас</div>
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
