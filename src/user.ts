import { renderBlock } from './lib.js';

interface User {
  username: string,
  avatarUrl: string
}

//Временно для теста
export function setData () {
  const userData: User = {
    username: 'MyName',
    avatarUrl: './img/avatar.png'
  };
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('favoritesAmount', '3')
} 

export function getUserData (): User|null {
  const userData: unknown = JSON.parse(localStorage.getItem('user'));
  if (userData instanceof Object && 'username' in userData && 'avatarUrl' in userData) {
    return userData as User;
  }
  return null;
}

export function getFavoritesAmount (): number|null {
  const favoritesAmount: unknown = Number(localStorage.getItem('favoritesAmount'));
  if (typeof(favoritesAmount) === 'number') {
    return favoritesAmount;
  }
  return null;
}

export function renderUserBlock (userName: string, avatar: string, favoriteItemsAmount?: number) {
  const favoritesCaption = favoriteItemsAmount ? favoriteItemsAmount : 'ничего нет'
  const hasFavoriteItems = favoriteItemsAmount ? true : false

  renderBlock(
    'user-block',
    `
    <div class="header-container">
      <img class="avatar" src="${avatar}" alt="Wade Warren" />
      <div class="info">
          <p class="name">${userName}</p>
          <p class="fav">
            <i class="heart-icon${hasFavoriteItems ? ' active' : ''}"></i>${favoritesCaption}
          </p>
      </div>
    </div>
    `
  )
}
