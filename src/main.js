/**
 * Created by wangshouyun on 2016/12/2.
 */

require('./css/global.css');
require('./css/topo.css');

//ajax
var VueResource = require('vue-resource');
Vue.use(VueResource);

//路由
var VueRouter = require('vue-router');
Vue.use(VueRouter);

//路由管理
var router = new VueRouter({
    routes: [
        {
            path: '/home',
            component: function (resolve) {
                require(['./pages/Home.vue'], resolve);
            }
        }
    ]
});

var app = new Vue({
    router: router
}).$mount('#app');

//初始化路由
router.replace('/home');