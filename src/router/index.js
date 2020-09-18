import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'

const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')

const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')

const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')

const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')

const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')

const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

const List = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/List.vue')

const Add = () => import(/* webpackChunkName: "List_Add" */ '../components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')

const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

/**
 * 挂载路由导航守卫
 * to   将要访问的路径
 * from   代表从哪个路径跳转过来
 * next   是一个函数、表示放行
 *    next()    放行
 *    next('/login')    强制跳转
 */
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
