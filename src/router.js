import { createRouter, createWebHistory } from 'vue-router';


const routes = [

    {
        path: '/',
        name: 'TwibbonSignup',
        component: () => import('@/components/TwibbonSignup.vue') 

      },
      
      {
        path: '/twibbon-signin',
        name: 'TwibbonSignin',
        component: () => import('@/components/TwibbonSignin.vue') 

      },

      {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('@/components/ResetPassword.vue') 

      },

      



       {
        path: '/twibbon-page',
        name: 'TwibbonizePage',
        component: () => import('@/components/TwibbonizePage.vue') 

      },

       {
        path: '/twibbon-frames',
        name: 'TwibbonFrames',
        component: () => import('@/components/TwibbonFrames.vue') 

      },

      {
        path: '/twibbon-bg',
        name: 'TwibbonBg',
        component: () => import('@/components/TwibbonBg.vue') 

      },
 
    
   
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;