import { renderSearchFormBlock } from './search-form.js'
import { renderSearchStubBlock } from './search-results.js'
import { renderUserBlock } from './user.js'
import { renderToast } from './lib.js'

window.addEventListener('DOMContentLoaded', () => {
  const date = new Date();
  renderUserBlock('Lyudmila', './img/avatar.png', 5)
  renderSearchFormBlock(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), new Date(date.getFullYear(), date.getMonth(), date.getDate() + 3));
  renderSearchStubBlock()
  renderToast(
    {text: 'Это пример уведомления. Используйте его при необходимости', type: 'success'},
    {name: 'Понял', handler: () => {console.log('Уведомление закрыто')}}
  )
})
