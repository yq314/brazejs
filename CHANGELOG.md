## [1.2.2](https://github.com/yq314/brazejs/compare/v1.2.1...v1.2.2) (2019-09-17)


### Bug Fixes

* convert undefined to 0 for math operations ([6fbe4b7](https://github.com/yq314/brazejs/commit/6fbe4b7))

## [1.2.1](https://github.com/yq314/brazejs/compare/v1.2.0...v1.2.1) (2019-07-20)


### Bug Fixes

* further improve rendering for if and assign tag ([81924f8](https://github.com/yq314/brazejs/commit/81924f8))
* improve if condition tag ([6c5ef6c](https://github.com/yq314/brazejs/commit/6c5ef6c))
* make date filter working with UTC by default and add support for more formats ([103f2ad](https://github.com/yq314/brazejs/commit/103f2ad))
* make stringify closer to braze output ([6e6e9ce](https://github.com/yq314/brazejs/commit/6e6e9ce))

# [1.2.0](https://github.com/yq314/brazejs/compare/v1.1.5...v1.2.0) (2019-07-18)


### Bug Fixes

* fix assign tag to support output ([85d4646](https://github.com/yq314/brazejs/commit/85d4646))


### Features

* added support for `first` and `last` for values ([eb5b8c3](https://github.com/yq314/brazejs/commit/eb5b8c3))

## [1.1.5](https://github.com/yq314/brazejs/compare/v1.1.4...v1.1.5) (2019-07-18)


### Bug Fixes

* support output parsing in `if` and `connected-content` tag ([2288d4c](https://github.com/yq314/brazejs/commit/2288d4c))

## [1.1.4](https://github.com/yq314/brazejs/compare/v1.1.3...v1.1.4) (2019-07-16)


### Bug Fixes

* downcase will convert input to String first, and plus/minus will convert input to Number first ([7c91a1c](https://github.com/yq314/brazejs/commit/7c91a1c))

## [1.1.3](https://github.com/yq314/brazejs/compare/v1.1.2...v1.1.3) (2019-07-16)


### Bug Fixes

* searching content blocks filename in kebab-case ([6ebc1c0](https://github.com/yq314/brazejs/commit/6ebc1c0))

## [1.1.2](https://github.com/yq314/brazejs/compare/v1.1.1...v1.1.2) (2019-07-07)


### Bug Fixes

* support spaces around equal ([57aaa71](https://github.com/yq314/brazejs/commit/57aaa71))

## [1.1.1](https://github.com/yq314/brazejs/compare/v1.1.0...v1.1.1) (2019-07-07)


### Bug Fixes

* Allow parsing variables in assign tag ([2ab4a2f](https://github.com/yq314/brazejs/commit/2ab4a2f))

# [1.1.0](https://github.com/yq314/brazejs/compare/v1.0.4...v1.1.0) (2019-07-06)


### Features

* Add filters: json_escape, url_escape, url_param_escape ([2492101](https://github.com/yq314/brazejs/commit/2492101))
* add support for content blocks ([c6b605a](https://github.com/yq314/brazejs/commit/c6b605a))

## [1.0.4](https://github.com/yq314/brazejs/compare/v1.0.3...v1.0.4) (2019-05-02)


### Bug Fixes

* improve error handling so abort_message will abort the entire message ([b6a892b](https://github.com/yq314/brazejs/commit/b6a892b))

## [1.0.3](https://github.com/yq314/brazejs/compare/v1.0.2...v1.0.3) (2019-05-01)


### Bug Fixes

* skip cache when cache=0 in connected_content ([f01f2ff](https://github.com/yq314/brazejs/commit/f01f2ff))

## [1.0.2](https://github.com/yq314/brazejs/compare/v1.0.1...v1.0.2) (2019-04-30)


### Bug Fixes

* fix connected_content and stringify object in output ([3ae2972](https://github.com/yq314/brazejs/commit/3ae2972))

## [1.0.1](https://github.com/yq314/brazejs/compare/v1.0.0...v1.0.1) (2019-04-30)


### Bug Fixes

* move request-promise-cache from devDep to dependency ([028f2e2](https://github.com/yq314/brazejs/commit/028f2e2))

# 1.0.0 (2019-04-29)


### Features

* add tags: abort_message, connected_content; add filter: property_accessor; add syntax: attributes; remove filter: abs ([8bbf37e](https://github.com/yq314/brazejs/commit/8bbf37e))
