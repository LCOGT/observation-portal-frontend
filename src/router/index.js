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
import Observations from '../views/Observations.vue';
import ObservationDetail from '../views/ObservationDetail.vue';
import Compose from '../views/Compose.vue';
import ProposalList from '../views/ProposalList.vue';
import ProposalDetail from '../views/ProposalDetail.vue';
import SemesterDetail from '../views/SemesterDetail.vue';
import SemesterDetailCurrent from '../views/SemesterDetailCurrent.vue';
import SemesterAdminTable from '../views/SemesterAdminTable.vue';
import Apply from '../views/Apply.vue';
import SciApplicationDetail from '../views/SciApplicationDetail.vue';
import SciApplicationCombinedPdf from '../views/SciApplicationCombinedPdf.vue';
import CreateSciApplication from '../views/CreateSciApplication.vue';
import UpdateSciApplication from '../views/UpdateSciApplication.vue';
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
    component: ProposalList,
    meta: {
      title: 'Proposal List',
      requiresAuth: true
    }
  },
  {
    path: '/proposals/:id',
    name: 'proposalDetail',
    component: ProposalDetail,
    props: true,
    meta: {
      title: 'Proposal Detail',
      requiresAuth: true
    }
  },
  {
    path: '/proposals/semesteradmin/:id',
    name: 'semesterAdminTable',
    component: SemesterAdminTable,
    props: true,
    meta: {
      isFluidPage: true,
      requiresAuth: true
    }
  },
  {
    path: '/proposals/semester/current',
    name: 'semesterDetailCurrent',
    component: SemesterDetailCurrent,
    meta: {
      title: 'Semester Detail'
    }
  },
  {
    path: '/proposals/semester/:id',
    name: 'semesterDetail',
    component: SemesterDetail,
    props: true,
    meta: {
      title: 'Semester Detail'
    }
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
    component: Observations,
    meta: {
      title: 'Observations',
      isFluidPage: true
    }
  },
  {
    path: '/observations/:id',
    name: 'observationDetail',
    component: ObservationDetail,
    props: true,
    meta: {
      title: 'Observation Detail'
    }
  },
  {
    path: '/apply',
    name: 'apply',
    component: Apply,
    meta: {
      title: 'Submit Proposal',
      requiresAuth: true
    }
  },
  {
    path: '/apply/:sciAppId',
    name: 'appDetail',
    component: SciApplicationDetail,
    props: true,
    meta: {
      title: 'Science Application',
      requiresAuth: true,
      isPlainPage: true
    }
  },
  {
    path: '/apply/:sciAppId/combined_pdf',
    name: 'appCombinedPdf',
    component: SciApplicationCombinedPdf,
    props: true,
    meta: {
      requiresAuth: true,
      isPlainPage: true
    }
  },
  {
    path: '/apply/create/:callId',
    name: 'createApp',
    component: CreateSciApplication,
    props: true,
    meta: {
      title: 'Submit Application',
      requiresAuth: true
    }
  },
  {
    path: '/apply/update/:sciAppId',
    name: 'updateApp',
    component: UpdateSciApplication,
    props: true,
    meta: {
      title: 'Submit Application',
      requiresAuth: true
    }
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
      next({ name: 'login', query: { next: to.path } });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
