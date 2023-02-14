import { renderSearchFormBlock, search } from './search-form.js';
import { renderSearchStubBlock, toggleFavoriteItem } from './search-results.js';
import { renderUserBlock, getUserData, getFavoritesAmount, setData} from './user.js';
import { renderToast } from './lib.js';

window.addEventListener('DOMContentLoaded', () => {
  setData(); //Временно для теста
  const date = new Date();
  const userData = getUserData();
  const favoritesAmount = getFavoritesAmount();
  if (userData) {
    renderUserBlock(userData.username, userData.avatarUrl, favoritesAmount);
  }
  renderSearchFormBlock(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3));
  renderSearchStubBlock();
  renderToast(
    {text: 'Это пример уведомления. Используйте его при необходимости', type: 'success'},
    {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
  );
  document.addEventListener('submit', search);
  document.addEventListener('click', toggleFavoriteItem);
})
