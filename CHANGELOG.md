# vuex-persist CHANGELOG

## 2.0.0

### 1.1.5

 - fix reactivity loss

### 1.1.3

 - fix window.localStorage as default

### 1.1.0

 - in sync stores too, filter and then save

## 1.0.0

 - Full support for both sync and async storages
 - We can use localForage or window.localStorage as stores
 - Async stores work via promises internally
 - Sync stores **do not use** promise, so store is restored _immediately_ when plugin is added
 
### 0.6.0

 - Fix MockStorage missing

### 0.5.0
 - Depends on Vuex 3.x now
 - Supports localforage without custom restoreState/saveState now

### 0.4.0
 - Supports localforage and similar async storages
### 0.3.0
 - Supports [Vuex strict mode](https://vuex.vuejs.org/en/strict.html)

#### 0.2.2
 - Use lodash.merge instead of deep-assign
 - [FIX] use merge for reducer too
 - fully supports IE8 now

#### 0.2.1
 - Change Object.assign to deep-assign (fix #6)
 
### 0.2.0
 - first public release
### 0.1.0
 - no public release

