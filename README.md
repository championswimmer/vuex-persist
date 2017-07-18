# vuex-persist

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fdc0921591d4ab98b0c0c173ef22649)](https://www.codacy.com/app/championswimmer/vuex-persist?utm_source=github.com&utm_medium=referral&utm_content=championswimmer/vuex-persist&utm_campaign=badger)

A Typescript-ready [Vuex](https://vuex.vuejs.org/) plugin that enables
you to save the state of your app to a persisted storage like
Cookies or localStorage.


## Installation

```shell
npm install --save vuex-persist
```

or
```shell
yarn add vuex-persist
```


## Usage

Here is an example store that has 2 modules, `user` and `navigation`
We are going to save user details into a Cookie _(using js-cookie)_
And, we will save the navigation state into _localStorage_ whenever
a new item is added to nav items.
So you can use multiple VuexPersistence instances to store different
parts of your Vuex store into different storage providers.


```js
import Vue from 'vue'
import Vuex, {Payload, Store} from 'vuex'
import VuexPersistence from 'vuex-persist'
import Cookies from 'js-cookie'
import {module as userModule, UserState} from './user'
import navModule, {NavigationState} from './navigation'

export interface State {
  user: UserState,
  navigation: NavigationState
}


Vue.use(Vuex)

const vuexCookie = new VuexPersistence<State, Payload>({
  restoreState: (key, storage) => Cookies.getJSON(key),
  saveState: (key, state, storage) => Cookies.set(key, state, {
    expires: 3
  }),
  reducer: (state) => ({user: state.user}),
  filter: (mutation) => (mutation.type == 'logIn' || mutation.type == 'logOut')
})
const vuexLocal = new VuexPersistence<State, Payload> ({
  storage: window.localStorage,
  reducer: state => ({navigation: state.navigation}),
  filter: mutation => (mutation.type == 'addNavItem')
})

const store = new Vuex.Store<State>({
  modules: {
    user: userModule,
    navigation: navModule
  },
  plugins: [vuexCookie.plugin, vuexLocal.plugin]
})

export default store

```

Some of the most popular ways to persist your store would be -
 - **[js-cookie](https://npmjs.com/js-cookie)** to use browser Cookies
 - **window.localStorage** (remains, across PC reboots, untill you clear browser data)
 - **window.sessionStorage** (vanishes when you close browser tab)
 - **[localForage](http://npmjs.com/localForage)** Uses IndexedDB from the browser