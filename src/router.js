import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

import AmplifyStore from './store'
import {
  AmplifyEventBus,
  AmplifyPlugin,
  components
} from 'aws-amplify-vue'
import * as AmplifyModules from 'aws-amplify'

Vue.use(Router)
Vue.use(AmplifyPlugin, AmplifyModules)

let user
getUser().then((user) => {
  if (user) {
    router.push({
      path: '/'
    })
  }
})

AmplifyEventBus.$on('authState', async (state) => {
  if (state === 'signedOut') {
    user = null
    AmplifyStore.commit('setUser', null)
    router.push({
      path: '/auth'
    })
  } else if (state === 'signedIn') {
    user = await getUser()
    router.push({
      path: '/'
    })
  }
})

function getUser() {
  return Vue.prototype.$Amplify.Auth.currentAuthenticatedUser().then((data) => {
    if (data && data.signInUserSession) {
      AmplifyStore.commit('setUser', data)
      return data
    }
  }).catch(() => {
    AmplifyStore.commit('setUser', null)
    return null
  })
}

const router = new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      meta: {
        requiresAuth: true
      },
      component: () => import( /* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: components.Authenticator
    },
    {
      path: '/database',
      name: 'database',
      meta: {
        requiresAuth: true
      },
      component: () => import('./views/Database.vue')
    }
  ]
})

router.beforeResolve(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    user = await getUser()
    if (!user) {
      return next({
        path: '/auth',
        query: {
          redirect: to.fullPath
        }
      });
    }
    return next()
  }
  return next()
})

export default router