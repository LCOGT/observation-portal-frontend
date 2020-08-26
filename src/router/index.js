import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Tools from '../views/Tools.vue';
import Login from '../views/Login.vue';
import Profile from '../views/Profile.vue';
import Register from '../views/Register.vue';
import AcceptTerms from '../views/AcceptTerms.vue';
import AccountsGet from '../views/AccountsGet.vue';
import AccountsForm from '../views/AccountsForm.vue';
import AccountRemovalRequest from '../views/AccountRemovalRequest.vue';
import RequestgroupDetail from '../views/RequestgroupDetail.vue';
import ObservationDetail from '../views/ObservationDetail.vue';
import Compose from '../views/Compose.vue';
import NotFound from '../components/NotFound.vue';
import store from '../store/index.js';
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
    name: 'proposalDetail',
    // TODO: Update component
    component: NotFound
  },
  {
    path: '/requestgroups/:id',
    name: 'requestgroupDetail',
    component: RequestgroupDetail,
    meta: {
      title: 'Request Group Detail'
    }
  },
  {
    path: '/requests/:id',
    name: 'requestDetail',
    component: RequestgroupDetail,
    meta: {
      title: 'Request Detail'
    }
  },
  {
    path: '/observations',
    name: 'observations',
    component: NotFound,
    meta: {
      title: 'Observations'
    }
  },
  {
    path: '/observations/:id',
    name: 'observationDetail',
    component: ObservationDetail,
    meta: {
      title: 'Observation Detail'
    }
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
    component: Compose,
    meta: {
      title: 'Create New Request',
      requiresAuth: true
    }
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
    path: '/accounts/profile',
    name: 'profile',
    component: Profile,
    meta: {
      title: 'Profile'
    }
  },
  {
    path: '/accounts/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Log in'
    }
  },
  {
    path: '/accounts/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Register for an account'
    }
  },
  {
    path: '/accounts/password/reset/confirm/:id/set-password',
    name: 'passwordResetConfirmSetPassword',
    component: AccountsForm
  },
  {
    path: '/accounts/password/reset/confirm/:id/:anotherId',
    name: 'passwordResetConfirm',
    component: AccountsGet,
    props: {
      successRedirectViewName: 'passwordResetConfirmSetPassword'
    }
  },
  {
    path: '/accounts/password/reset',
    name: 'passwordReset',
    component: AccountsForm
  },
  {
    path: '/accounts/password/change',
    name: 'passwordChange',
    component: AccountsForm
  },
  {
    path: '/accounts/removalrequest',
    name: 'accountRemovalRequest',
    component: AccountRemovalRequest,
    meta: {
      keepMessages: true
    }
  },
  {
    path: '/accounts/acceptterms',
    name: 'acceptTerms',
    component: AcceptTerms,
    meta: {
      title: 'Accept Terms'
    }
  },
  {
    path: '/accounts/*',
    component: AccountsGet,
    meta: {
      title: 'Accounts'
    }
  },
  {
    path: '*',
    name: 'notFound',
    component: NotFound
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // Set the title of each page
  const baseTitle = _.split(document.title, '|')[0];
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.title);
  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = baseTitle + ' | ' + nearestWithTitle.meta.title;
  } else {
    document.title = baseTitle;
  }
  next();
});

router.beforeEach((to, from, next) => {
  // Redirect to the Accept Terms page if the user is logged in but has not
  // yet accepted the terms.
  if (store.state.userIsAuthenticated && !store.state.userAcceptedTerms && to.name !== 'acceptTerms') {
    next({ name: 'acceptTerms' });
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  // If we used the router to navigate to a page, and set in the params to persist
  // the messages, keep them. This is useful for when a success message should be displayed on
  // the page that is navigated to on successful form submission. By default though, messages
  // should be cleared.
  if (to.name !== from.name && !to.params.persistMessage) {
    store.commit('clearAllMessages');
  }
  next();
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Route requires the user to be logged in, check if logged in and if not, redirect to login page.
    if (!store.state.userIsAuthenticated) {
      next({ name: 'login', query: { next: to.name } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
