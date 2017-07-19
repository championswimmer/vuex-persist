# vuex-persist

A Typescript-ready [Vuex](https://vuex.vuejs.org/) plugin that enables
you to save the state of your app to a persisted storage like
Cookies or localStorage.

[![GitHub Stars](https://img.shields.io/github/stars/championswimmer/vuex-persist.svg?style=social&label= vuex-persist ★)](https://github.com/championswimmer/vuex-persist)
[![npm](https://img.shields.io/npm/v/vuex-persist.svg?colorB=dd1100)](http://npmjs.com/vuex-persist)
[![npm](https://img.shields.io/npm/dw/vuex-persist.svg?colorB=fc4f4f)](http://npmjs.com/vuex-persist)
[![license](https://img.shields.io/github/license/championswimmer/vuex-persist.svg)]()

[![bitHound Overall Score](https://www.bithound.io/github/championswimmer/vuex-persist/badges/score.svg)](https://www.bithound.io/github/championswimmer/vuex-persist)
[![bitHound Dependencies](https://www.bithound.io/github/championswimmer/vuex-persist/badges/dependencies.svg)](https://www.bithound.io/github/championswimmer/vuex-persist/master/dependencies/npm)
[![codebeat badge](https://codebeat.co/badges/dc97dea1-1e70-45d5-b3f1-fec2a6c3e4b0)](https://codebeat.co/projects/github-com-championswimmer-vuex-persist-master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fdc0921591d4ab98b0c0c173ef22649)](https://www.codacy.com/app/championswimmer/vuex-persist?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=championswimmer/vuex-persist&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/championswimmer/vuex-persist/badges/gpa.svg)](https://codeclimate.com/github/championswimmer/vuex-persist)
[![codecov](https://codecov.io/gh/championswimmer/vuex-persist/branch/master/graph/badge.svg)](https://codecov.io/gh/championswimmer/vuex-persist)



## Installation

```shell
npm install --save vuex-persist
```

or
```shell
yarn add vuex-persist
```


## Usage

### Steps

Import it
```js
import VuexPersistence from 'vuex-persist'
```

Create an object

```js
const vuexLocal = new VuexPersistence({
    storage: window.localStorage
})
```

Use it as Vue plugin.

```js
const store = new Vuex.Store<State>({
  state: { ... },
  mutations: { ... },
  actions: { ... },
  plugins: [vuexLocal.plugin]
})
```

### Constructor Parameters -

When creating the VuexPersistence object, we pass an `options` object
of type `PersistOptions`.
Here are the properties, and what they mean -

| Property     	| Type                               	| Description                                                                                                                        	|
|--------------	|------------------------------------	|------------------------------------------------------------------------------------------------------------------------------------	|
| key          	| string                             	| The key to store the state in the storage                                                                                          	|
| storage      	| Storage (Web API)                  	| localStorage, sessionStorage or your custom Storage object. Must implement getItem, setItem, clear etc.                            	|
| saveState    	| function (key, state[, storage])   	| If not using storage, this custom function handles saving state to persistence                                                     	|
| restoreState 	| function (key[, storage]) => state 	| If not using storage, this custom function handles retrieving state from storage                                                   	|
| reducer      	| function (state) => object         	| state reducer. reduces state to only those values you want to save. by default, saves entire state                                 	|
| filter       	| function (mutation) => boolean     	| mutation filter. look at mutation.type and return true for only those ones which you want a persistence write to be triggered for. 	|



## Examples

### Simple

Quick example -

```js
import Vue from 'vue'
import Vuex 'vuex'
import VuexPersistence from 'vuex-persist'


Vue.use(Vuex)

const store = new Vuex.Store<State>({
  state: {
    user: {name: 'Arnav'},
    navigation: {path: '/home'}
  },
  plugins: [(new VuexPersistence()).plugin]
})

export default store
```

### Detailed

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
