# vuex-persist

A Typescript-ready [Vuex](https://vuex.vuejs.org/) plugin that enables
you to save the state of your app to a persisted storage like
Cookies or localStorage.

[![Paypal Donate](https://img.shields.io/badge/Donate-Paypal-2244dd.svg)](https://paypal.me/championswimmer)

**Info :**
[![GitHub stars](https://img.shields.io/github/stars/championswimmer/vuex-persist.svg?style=social&label=%20vuex-persist)](http://github.com/championswimmer/vuex-persist)
[![npm](https://img.shields.io/npm/v/vuex-persist.svg?colorB=dd1100)](http://npmjs.com/vuex-persist)
[![npm](https://img.shields.io/npm/dw/vuex-persist.svg?colorB=fc4f4f)](http://npmjs.com/vuex-persist)
[![license](https://img.shields.io/github/license/championswimmer/vuex-persist.svg)]()

**Status :**
[![Build Status](https://travis-ci.org/championswimmer/vuex-persist.svg?branch=master)](https://travis-ci.org/championswimmer/vuex-persist)
[![codebeat badge](https://codebeat.co/badges/dc97dea1-1e70-45d5-b3f1-fec2a6c3e4b0)](https://codebeat.co/projects/github-com-championswimmer-vuex-persist-master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fdc0921591d4ab98b0c0c173ef22649)](https://www.codacy.com/app/championswimmer/vuex-persist?utm_source=github.com&utm_medium=referral&utm_content=championswimmer/vuex-persist&utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/championswimmer/vuex-persist/badges/gpa.svg)](https://codeclimate.com/github/championswimmer/vuex-persist)
[![codecov](https://codecov.io/gh/championswimmer/vuex-persist/branch/master/graph/badge.svg)](https://codecov.io/gh/championswimmer/vuex-persist)

**Sizes :**
[![npm:size:gzip](https://img.shields.io/bundlephobia/minzip/vuex-persist.svg?label=npm:size:gzip)](https://bundlephobia.com/result?p=vuex-persist)
[![umd:min:gzip](https://img.badgesize.io/https://unpkg.com/vuex-persist?compression=gzip&label=umd:min:gzip)](https://unpkg.com/vuex-persist)
[![umd:min:brotli](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/vuex-persist?compression=brotli&label=umd:min:brotli)](https://cdn.jsdelivr.net/npm/vuex-persist)

#### Table of Contents

- [vuex-persist](#vuex-persist)
      - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Compatibility](#compatibility)
  - [Installation](#installation)
    - [Vue CLI Build Setup (using Webpack or some bundler)](#vue-cli-build-setup-using-webpack-or-some-bundler)
    - [Transpile for `target: es5`](#transpile-for-target-es5)
    - [Directly in Browser](#directly-in-browser)
    - [Tips for NUXT](#tips-for-nuxt)
  - [Usage](#usage)
    - [Steps](#steps)
    - [Constructor Parameters -](#constructor-parameters)
    - [Usage Notes](#usage-notes)
      - [Reducer](#reducer)
      - [Circular States](#circular-states)
  - [Examples](#examples)
    - [Simple](#simple)
    - [Detailed](#detailed)
    - [Support Strict Mode](#support-strict-mode)
    - [Note on LocalForage and async stores](#note-on-localforage-and-async-stores)
    - [How to know when async store has been replaced](#how-to-know-when-async-store-has-been-replaced)
  - [Unit Testing](#unit-testing)
    - [Jest](#jest)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Features

- 📦 NEW in v1.5
  - distributed as esm and cjs both (via module field of package.json)
  - better tree shaking as a result of esm
- 🎗 NEW IN V1.0.0
  - Support localForage and other Promise based stores
  - Fix late restore of state for localStorage
- Automatically save store on mutation.
- Choose which mutations trigger store save, and which don't, using `filter` function
- Works perfectly with modules in store
- Ability to save partial store, using a `reducer` function
- Automatically restores store when app loads
- You can create mulitple VuexPersistence instances if you want to -
  - Save some parts of the store to localStorage, some to sessionStorage
  - Trigger saving to localStorage on data download, saving to cookies on authentication result

## Compatibility

- [VueJS](http://vuejs.org) - v2.0 and above
- [Vuex](http://vuex.vuejs.org) - v2.1 and above

## Installation

### Vue CLI Build Setup (using Webpack or some bundler)

```shell
npm install --save vuex-persist
```

or

```shell
yarn add vuex-persist
```

### Transpile for `target: es5`
This module is distributed in 3 formats

 - umd build `/dist/umd/index.js` in **es5** format
 - commonjs build `/dist/cjs/index.js` in **es2015** format
 - esm build `/dist/esm/index.js` in **es2015** format

When using with Webpack (or Vue CLI 3), the esm file gets used by default.
If your project has a `es6` or `es2015` target, you're good, but if
for backwards compatibility, you are compiling your project to `es5` then
this module also needs to be transpiled.

To enable transpilation of this module

```js
// in your vue.config.js
module.exports = {
  /* ... other config ... */
  transpileDependencies: ['vuex-persist']
}
```

### Directly in Browser

```html
<!-- We need lodash.merge so get lodash first -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vuex-persist"></script>
```

### Tips for NUXT

This is a plugin that works [only on the client side](https://nuxtjs.org/guide/plugins/#client-side-only).
So we'll register it as a ssr-free plugin.

```js
// Inside - nuxt.config.js
export default {
  plugins: [
    { src: '~/plugins/vuex-persist', ssr: false }
  ]
}
```

```js
// ~/plugins/vuex-persist.js
import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  new VuexPersistence({
  /* your options */
  }).plugin(store);
}
```

## Usage

### Steps

Import it

```js
import VuexPersistence from 'vuex-persist'
```

> NOTE: In browsers, you can directly use `window.VuexPersistence`

Create an object

```ts
const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

// or in Typescript

const vuexLocal = new VuexPersistence<RootState>({
  storage: window.localStorage
})

```

Use it as Vue plugin. (in typescript)

```typescript
const store = new Vuex.Store<State>({
  state: { ... },
  mutations: { ... },
  actions: { ... },
  plugins: [vuexLocal.plugin]
})
```

(or in Javascript)

```js
const store = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  plugins: [vuexLocal.plugin]
}
```

### Constructor Parameters -

When creating the VuexPersistence object, we pass an `options` object
of type `PersistOptions`.
Here are the properties, and what they mean -

| Property        | Type                                   | Description                                                                                                                                                                          |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| key             | string                                 | The key to store the state in the storage <br>_**Default: 'vuex'**_                                                                                                                  |
| storage         | Storage (Web API)                      | localStorage, sessionStorage, localforage or your custom Storage object. <br>Must implement getItem, setItem, clear etc. <br> _**Default: window.localStorage**_                     |
| saveState       | function<br> (key, state[, storage])   | If not using storage, this custom function handles <br>saving state to persistence                                                                                                   |
| restoreState    | function<br> (key[, storage]) => state | If not using storage, this custom function handles <br>retrieving state from storage                                                                                                 |
| reducer         | function<br> (state) => object         | State reducer. reduces state to only those values you want to save. <br>By default, saves entire state                                                                               |
| filter          | function<br> (mutation) => boolean     | Mutation filter. Look at `mutation.type` and return true <br>for only those ones which you want a persistence write to be triggered for. <br> Default returns true for all mutations |
| modules         | string[]                               | List of modules you want to persist. (Do not write your own reducer if you want to use this)                                                                                         |
| asyncStorage    | boolean                                | Denotes if the store uses Promises (like localforage) or not (you must set this to true when suing something like localforage) <br>_**Default: false**_                                                                                                |
| supportCircular | boolean                                | Denotes if the state has any circular references to itself (state.x === state) <br>_**Default: false**_                                                                                                       |

### Usage Notes

#### Reducer

Your reducer should not change the shape of the state.

```javascript
const persist = new VuexPersistence({
  reducer: (state) => state.products,
  ...
})
```

Above code is **wrong**
You intend to do this instead

```js
const persist = new VuexPersistence({
  reducer: (state) => ({products: state.products}),
  ...
})
```

#### Circular States

If you have circular structures in your state

```js
let x = { a: 10 }
x.x = x
x.x === x.x.x // true
x.x.x.a === x.x.x.x.a //true
```

`JSON.parse()` and `JSON.stringify()` will not work.
You'll need to install `flatted`

```
npm install flatted
```

And when constructing the store, add `supportCircular` flag

```js
new VuexPersistence({
  supportCircular: true,
  ...
})
```

## Examples

### Simple

Quick example -

```typescript
import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

const store = new Vuex.Store<State>({
  state: {
    user: { name: 'Arnav' },
    navigation: { path: '/home' }
  },
  plugins: [new VuexPersistence().plugin]
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

**Warning:** when working with modules these should be registered in
the Vuex constructor. When using `store.registerModule` you risk the
(restored) persisted state being overwritten with the default state
defined in the module itself.

```typescript
import Vue from 'vue'
import Vuex, { Payload, Store } from 'vuex'
import VuexPersistence from 'vuex-persist'
import Cookies from 'js-cookie'
import { module as userModule, UserState } from './user'
import navModule, { NavigationState } from './navigation'

export interface State {
  user: UserState
  navigation: NavigationState
}

Vue.use(Vuex)

const vuexCookie = new VuexPersistence<State, Payload>({
  restoreState: (key, storage) => Cookies.getJSON(key),
  saveState: (key, state, storage) =>
    Cookies.set(key, state, {
      expires: 3
    }),
  modules: ['user'], //only save user module
  filter: (mutation) => mutation.type == 'logIn' || mutation.type == 'logOut'
})
const vuexLocal = new VuexPersistence<State, Payload>({
  storage: window.localStorage,
  reducer: (state) => ({ navigation: state.navigation }), //only save navigation module
  filter: (mutation) => mutation.type == 'addNavItem'
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

### Support Strict Mode

This now supports [Vuex strict mode](https://vuex.vuejs.org/en/strict.html)
(Keep in mind, **NOT** to use strict mode in production)
In strict mode, we cannot use `store.replaceState` so instead we use a mutation

You'll need to keep in mind to add the **`RESTORE_MUTATION`** to your mutations
See example below

To configure with strict mode support -

```typescript
import Vue from 'vue'
import Vuex, { Payload, Store } from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexPersist = new VuexPersistence<any, any>({
  strictMode: true, // This **MUST** be set to true
  storage: localStorage,
  reducer: (state) => ({ dog: state.dog }),
  filter: (mutation) => mutation.type === 'dogBark'
})

const store = new Vuex.Store<State>({
  strict: true, // This makes the Vuex store strict
  state: {
    user: {
      name: 'Arnav'
    },
    foo: {
      bar: 'baz'
    }
  },
  mutations: {
    RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION // this mutation **MUST** be named "RESTORE_MUTATION"
  },
  plugins: [vuexPersist.plugin]
})
```

Some of the most popular ways to persist your store would be -

- **[js-cookie](https://npmjs.com/js-cookie)** to use browser Cookies
- **window.localStorage** (remains, across PC reboots, untill you clear browser data)
- **window.sessionStorage** (vanishes when you close browser tab)
- **[localForage](http://npmjs.com/localforage)** Uses IndexedDB from the browser

### Note on LocalForage and async stores

There is Window.Storage API as defined by HTML5 DOM specs, which implements the following -

```typescript
interface Storage {
  readonly length: number
  clear(): void
  getItem(key: string): string | null
  key(index: number): string | null
  removeItem(key: string): void
  setItem(key: string, data: string): void
  [key: string]: any
  [index: number]: string
}
```

As you can see it is an entirely synchronous storage. Also note that it
saves only string values. Thus objects are stringified and stored.

Now note the representative interface of Local Forage -

```typescript
export interface LocalForage {
  getItem<T>(key: string): Promise<T>
  setItem<T>(key: string, data: T): Promise<T>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  length(): Promise<number>
  key(keyIndex: number): Promise<string>
  _config?: {
    name: string
  }
}
```

You can note 2 differences here -

1. All functions are asynchronous with Promises (because WebSQL and IndexedDB are async)
2. It works on objects too (not just strings)

I have made `vuex-persist` compatible with both types of storages, but this comes at a slight cost.
When using asynchronous (promise-based) storages, your state will **not** be
immediately restored into vuex from localForage. It will go into the event loop
and will finish when the JS thread is empty. This can invoke a delay of few seconds.

### How to know when async store has been replaced

As noted above, the store is not immediately restored from async stores like localForage. This can have the unfortunate side effect of overwriting mutations to the store that happen before `vuex-persist` has a chance to do its thing. In strict mode, you can create a plugin to subscribe to **`RESTORE_MUTATION`** so that you tell your app to wait until the state has been restored before committing any further mutations. ([Issue #15 demonstrates how to write such a plugin.](https://github.com/championswimmer/vuex-persist/issues/15)) However, since you should turn strict mode off in production, and since [`vuex` doesn't currently provide any kind of notification when `replaceState()` has been called](https://github.com/vuejs/vuex/issues/1316), starting with `v2.1.0` `vuex-persist` will add a `restored` property to the `store` object to let you know the state has been restored and that it is now safe to commit any mutations that modify the stored state. `store.restored` will contain the Promise returned by calling the async version of `restoreState()`.

Here's an example of a `beforeEach()` hook in `vuex-router` that will cause your app to wait for `vuex-persist` to restore the state before taking any further actions:

```js
// in src/router.js
import Vue from 'vue'
import Router from 'vue-router'
import { store } from '@/store' // ...or wherever your `vuex` store is defined

Vue.use(Router)

const router = new Router({
  // define your router as you normally would
})

const waitForStorageToBeReady = async (to, from, next) => {
  await store.restored
  next()
}
router.beforeEach(waitForStorageToBeReady)

export default router
```

Note that on the 2nd and subsequent router requests to your app, the Promise in `store.restored` should already be in a "resolved" state, so the hook will _not_ force your app to wait for additional calls to `restoreState()`.

## Unit Testing

### Jest

When testing with Jest, you might find this error -

```
TypeError: Cannot read property 'getItem' of undefined
```

This is because there is no localStorage in Jest. You can add the following Jest plugins to solve this
https://www.npmjs.com/package/jest-localstorage-mock
