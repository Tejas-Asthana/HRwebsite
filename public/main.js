import {Router} from './router.js'

const router = new Router()
router.root = 'http://localhost/jsrouter'
router.add({name: 'home', path: '/', handler: () => console.log('handler to home')})
router.add({name: 'opportunities', path: '/opportunities', handler: () => console.log('handler to opportunities')})
router.add({name: 'contactus', path: '/contactus', handler: () => console.log('handler to contactUs')})

const activeRoutes = Array.from(document.querySelectorAll('[route]'))
activeRoutes.forEach((route) => route.addEventListener('click', (e) => {
  e.preventDefault()
  router.navigate(e.target.getAttribute('route'))
}, false))
