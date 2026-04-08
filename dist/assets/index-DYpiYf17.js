const create = Object.create
const defineProperty = Object.defineProperty
const getDescriptor = Object.getOwnPropertyDescriptor
const getKeys = Object.getOwnPropertyNames
const getProto = Object.getPrototypeOf
const hasOwn = Object.prototype.hasOwnProperty

const createModule = (factory, cache) => () => {
if (!cache) {
cache = { exports: {} }
factory(cache.exports, cache)
}
return cache.exports
}

const copyProperties = (target, source, exclude, descriptor) => {
if ((source && typeof source === "object") || typeof source === "function") {
const keys = getKeys(source)

```
for (let i = 0; i < keys.length; i++) {
  const key = keys[i]

  if (!hasOwn.call(target, key) && key !== exclude) {
    defineProperty(target, key, {
      get: () => source[key],
      enumerable: !(descriptor = getDescriptor(source, key)) || descriptor.enumerable
    })
  }
}
```

}

return target
}

const toESModule = (module, isNodeMode, target) => {
target = module != null ? create(getProto(module)) : {}

if (!module || !module.__esModule) {
defineProperty(target, "default", {
value: module,
enumerable: true
})
}

return copyProperties(target, module)
}

;(function setupModulePreloadPolyfill() {
const relList = document.createElement("link").relList

if (relList && relList.supports && relList.supports("modulepreload")) return

const processPreloadLink = (link) => {
if (link.ep) return

```
link.ep = true

const fetchOptions = buildFetchOptions(link)
fetch(link.href, fetchOptions)
```

}

const buildFetchOptions = (link) => {
const options = {}

```
if (link.integrity) options.integrity = link.integrity
if (link.referrerPolicy) options.referrerPolicy = link.referrerPolicy

if (link.crossOrigin === "use-credentials") {
  options.credentials = "include"
} else if (link.crossOrigin === "anonymous") {
  options.credentials = "omit"
} else {
  options.credentials = "same-origin"
}

return options
```

}

document
.querySelectorAll('link[rel="modulepreload"]')
.forEach(processPreloadLink)

new MutationObserver((mutations) => {
for (const mutation of mutations) {
if (mutation.type !== "childList") continue

```
  for (const node of mutation.addedNodes) {
    if (node.tagName === "LINK" && node.rel === "modulepreload") {
      processPreloadLink(node)
    }
  }
}
```

}).observe(document, {
childList: true,
subtree: true
})
})()
