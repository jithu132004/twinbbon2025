import { createRouter, createWebHistory } from 'vue-router';


const routes = [

    {
        path: '/',
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