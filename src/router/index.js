import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Tools from '../views/Tools.vue';
import NotFound from '../views/NotFound.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue'
import _ from 'lodash';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Submitted Requests'
    }
  },
  {
    path: '/help',
    name: 'help',
    // route level code-splitting
    // this generates a separate chunk (help.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "help" */ '../views/Help.vue'),
    meta: {
      title: 'Help'
    }
  },
  {
    path: '/proposals',
    name: 'proposals',
    // TODO: Update with proposals component
    component: NotFound
  },
  {
    path: '/proposals/:id',
    name: 'proposalsDetail',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/requestgroups/:id',
    name: 'requestgroupsDetail',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: {
      title: 'Profile'
    }
  },
  {
    path: '/login',
    name: 'login',
    // TODO: Update with login component
    component: Login,
    meta: {
      title: 'Log in'
    }
  },
  {
    path: '/register',
    name: 'register',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/accounts/password/reset',
    name: 'passwordReset',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/accounts/password/change',
    name: 'passwordChange',
    // TODO: Update component
    component: NotFound
  },
  {
    // This is one of our views
    path: '/accounts/removalrequest/',
    name: 'accountRemoval',
    component: NotFound
  },
  {
    path: '/apply',
    name: 'apply',
    // TODO: Update with sciapplications component
    component: NotFound
  },
  {
    path: '/create',
    name: 'create',
    // TODO: Update with create component
    component: NotFound
  },
  {
    path: '/tools',
    name: 'tools',
    component: Tools,
    meta: {
      title: 'Planning Tools'
    }
  },
  { 
    path: '*',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // Set the title of each page
  const baseTitle = _.split(document.title, '|')[0];
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = baseTitle + ' | ' + nearestWithTitle.meta.title;
  } else {
    document.title = baseTitle;
  }
  next();
});

export default router;
