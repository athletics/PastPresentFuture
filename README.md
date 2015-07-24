# StateManager

A JavaScipt library for manipulating browser history with pushState and AJAX.

## Introduction

StateManager is a JavaScript library for interacting with [history.pushState()](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history) while loading internal URLs with [AJAX](https://developer.mozilla.org/en-US/docs/AJAX). The goal is to maintain a single load of CSS and JS assets per user session, speeding up page changes for time-on-site retention with increased page views. Below you will find documentation on its configuration and usage.

- [Installation](#installation)
- [Basic Usage](#basicusage)
- [Configuration](#configuration)
- [Events](#events)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

## Installation

### Bower

Use the [Bower](http://bower.io/) package manager to install StateManager into your project. To do so you can either use the CLI:

```bash
$ bower install statemanager --save
```

Or define it in your bower.json manifest:

```javascript
    "dependencies": {
        "statemanager": "latest"
    }
```

### npm

Similarly, StateManager can be installed using [npm](https://www.npmjs.com/). To do so you can either use the CLI:

```bash
$ npm install statemanager --save
```

Or define it in your package.json manifest:

```javascript
    "dependencies": {
        "statemanager": "latest"
    }
```

### Direct download

If package managers are not your thing, the library can be downloaded directly from GitHub using the **Download ZIP** button.

## Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>StateManager Usage</title>
    <script src="jquery.js"></script>
    <script src="StateManager.min.js"></script>
</head>
<body>
    <!--
    This is the main container with content that can be changed.
    -->
    <div class="page_content_holder"></div>

    <script type="text/javascript">
        ( function () {

            StateManager();

        } () );
    </script>
</body>
</html>
```

## Configuration


| key                                          | type     |
| -------------------------------------------- | -------- |
| [`content`](#content)                        | String   |
| [`ajaxContainer`](#ajaxcontainer)            | String   |
| [`prefetchCacheLimit`](#prefetchcachelimit)  | Integer  |
| [`ajaxCacheLimit`](#ajaxcachelimit)          | Integer  |
| [`onParseHtml`](#onparsehtml)                | Function |

**Example Configuration:**

```javascript
{
    content: '.page_content_holder',
    ajaxContainer: '.page_content_holder',
    prefetchCacheLimit: 15,
    ajaxCacheLimit: 15
}
```

### `content`

**Type:** String

**Default:** `'.page_content_holder'`

**Description:** The wrapper that contains the dynamic aspects of the page to be replaced.

[:arrow_up:](#configuration)

### `ajaxContainer`

**Type:** String

**Default:** `'.page_content_holder'`

**Description:** The wrapper that new content will be applied. This defaults the current container, but can be used for a new container if an animation affect is desired.

[:arrow_up:](#configuration)

### `prefetchCacheLimit`

**Type:** Integer

**Default:** `15`

**Description:** This declares the number of pages that are stored in the prefetch cache. The prefetch cache is set by a flag on the next article it increase the load of that page.

[:arrow_up:](#configuration)

### `ajaxCacheLimit`

**Type:** Integer

**Default:** `15`

**Description:** This declares the limit of the cache on pages that have already been visited that are not already in the prefetch cache.

[:arrow_up:](#configuration)

### `onParseHtml`

**Type:** Function

**Default:** None.

**Description:** Callback to filter the HTML before insertion into the DOM. Must return the HTML collection.

[:arrow_up:](#configuration)

## Events

Custom jQuery events prefixed with `StateManager`.

| event                                                              | trigger source  |
| ------------------------------------------------------------------ | --------------- |
| [`StateManager:AfterInitState`](#statemanagerafterinitstate)       | internal        |
| [`StateManager:PushState`](#statemanagerpushstate)                 | internal        |
| [`StateManager:NewState`](#statemanagernewstate)                   | internal        |
| [`StateManager:PopState`](#statemanagerpopstate)                   | internal        |
| [`StateManager:LoadingReveal`](#statemanagerloadingreveal)         | internal        |
| [`StateManager:LoadingComplete`](#statemanagerloadingcomplete)     | internal        |
| [`StateManager:GotoUrl`](#statemanagergotourl)                     | both            |
| [`StateManager:RecordPageview`](#statemanagerrecordpageview)       | internal        |
| [`StateManager:RenderUrl`](#statemanagerrenderurl)                 | internal        |
| [`StateManager:FetchedData`](#statemanagerfetcheddata)             | internal        |
| [`StateManager:BeforeTransition`](#statemanagerbeforetransition)   | internal        |
| [`StateManager:AnimateTransition`](#statemanageranimatetransition) | internal        |
| [`StateManager:ResetPage`](#statemanagerresetpage)                 | internal        |

### `StateManager:AfterInitState`

**Description:** Called on initial load and after pushState.

[:arrow_up:](#events)

### `StateManager:PushState`

**Description:** An event wrapper for `history.pushState()`. It is called before render of AJAX data.

**Parameter:** `options` {Object}

| name       | type    | description                                   |
| ---------- | ------- | --------------------------------------------- |
| `url`      | String  | The url to push into the brower’s history.    |
| `popstate` | Boolean | Whether this is a popstate event. _Optional._ |
| `title`    | String  | The page title for the new url. _Optional._   |

[:arrow_up:](#events)

### `StateManager:NewState`

**Description:** Called after pushState.

[:arrow_up:](#events)

### `StateManager:PopState`

**Description:** This event is called when the history is changed by browser forward and back buttons.

[:arrow_up:](#events)

### `StateManager:LoadingReveal`

**Description:** Called while data from the new page is being loaded into memory.

[:arrow_up:](#events)

### `StateManager:LoadingComplete`

**Description:** Called just before data is rendered to the DOM.

[:arrow_up:](#events)

### `StateManager:GotoUrl`

**Description:** A trigger to be used for loading a new page. Accepts the URL and Options for pushState.

**Parameters:**

`url` {String} The url of the page to go to.
`options` {Object}

| name       | type    | description                                 |
| ---------- | ------- | ------------------------------------------- |
| `url`      | String  | The url of the page to go to.               |
| `popstate` | Boolean | Optional, set to `false` by default.        |
| `options`  | Object  | Optional, specifically  used for pushState. |

[:arrow_up:](#events)

### `StateManager:RecordPageview`

**Description:** Called on init state, passes the current URL and page title.

[:arrow_up:](#events)

### `StateManager:RenderUrl`

**Description:** This event is called after a page is fetch for processing the data.

[:arrow_up:](#events)

### `StateManager:FetchedData`

**Description:** Event for passing data if a page has already been cached.

[:arrow_up:](#events)

### `StateManager:BeforeTransition`

**Description:** This event is called when the `content` and `ajaxContainer` set in the Config aren’t the same.

**Parameter:** `containers` {Object}

| name            | type  | description                                         |
| --------------- | ----- | --------------------------------------------------- |
| `contentHolder` | Array | jQuery selection for the content element.           |
| `ajaxContainer` | Array | jQuery selection for the ajax container element.    |

[:arrow_up:](#events)

### `StateManager:AnimateTransition`

**Description:** This event is called when the `content` and `ajaxContainer` set in the Config aren’t the same. It's called after LoadingComplete is triggered.

[:arrow_up:](#events)

## `StateManager:ResetPage`

**Description:** This event is fired when the library tries to reload the page it is already on. This is particularly useful if the current page has javascript elements that need to be reset.

[:arrow_up:](#events)

## Contributing

### Coding Style

StateManager follows the [WordPress JavaScript Coding Standards](https://make.wordpress.org/core/handbook/coding-standards/javascript/). There is a [`.jscsrc`](https://github.com/athletics/ad-manager/blob/master/.jscsrc) included in the project for automatic linting using [JSCS](http://jscs.info/).

The modules are written in the [UMD](https://github.com/umdjs/umd) pattern to support AMD, CommonJS, and global usage.

### Development

The project contains a gulpfile.js for concatenation and minification. To use first [install gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) and the dependencies (`npm install`). The default gulp task (`gulp`) will start the watch task.

## Dependencies

StateManager requires jQuery.
