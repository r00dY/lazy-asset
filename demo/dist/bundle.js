/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__lazy_asset__ = __webpack_require__(1);


/**
 * Tests to write
 *
 * 1. Video preloading
 * 2. Vimeo integration
 *
 */

window.LazyAsset = __WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */];

document.addEventListener("DOMContentLoaded", function() {

	__WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].load(document.querySelectorAll('.modes'));
	__WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].load('.modes');
	__WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].load('.modes');

	__WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].normalizeImagesInContainMode('.modes');

	__WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].load('.deferred-loads');

	window.addEventListener('scroll', function() {
        __WEBPACK_IMPORTED_MODULE_0__lazy_asset__["a" /* default */].loadWhenInViewportScrollCallback();
	});

});


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let bowser = __webpack_require__(2);

/** Autosizing is removed!!!

 1. It doesn’t work when something is “display: none”. We must remember to call autoSizes. It might cause totally undefined behaviour across the site as scale goes up.
 2. It doesn’t work when elements are laid out by Javascript.
 3. We have no certainty that it works well with resize! Altough double downloads doesn’t happen etc, specification doesn’t specify this.
 4. We can’t preload images before layout is done.

 */

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}

let LazyAsset = new function () {

    function selectMeOrDescendants(arg, cls) {

        let nodes = [];

        // selector
        if (typeof arg === 'string') {
            nodes = document.querySelectorAll(arg);
        }
        // node
        else if (arg instanceof Node) {
            nodes = [arg];
        }
        // node list
        else if (arg instanceof NodeList) {
            nodes = arg;
        }
        else {
            throw 'Bad input argument type for LazyLoad method';
        }

        let result = [];

        nodes.forEach(function(node) {

            // If node itself is matching selector
            if (node.classList.contains(cls)) {
                result.push(node);
                return;
            }

            result = result.concat(Array.from(node.querySelectorAll('.' + cls)));
        });

        return result;
    }

    function isAutoplayDisabled() {

        if (bowser.msie || bowser.msedge) {
            return true;
        }

        if (bowser.mobile || bowser.tablet) {

            if (bowser.check({chrome: "53"})) {
                return false;
            }

            if (bowser.check({safari: "10"})) {
                return false;
            }

            return true;
        }

        return false;
    }


    function isElementInViewport(el) {
        let rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 2 && rect.top > -window.innerHeight && rect.width > 0 && rect.height > 0;
    }


    let loadWhenInViewPortItems = [];
    this.loadWhenInViewportScrollCallback = function () {

        let itemsToLoad = [];

        loadWhenInViewPortItems.forEach(function(item) {
            if (isElementInViewport(item)) {
                itemsToLoad.push(item);
            }
        });

        // Remove element from array, ugly JS way
        itemsToLoad.forEach(function(item, i) {
            let index = loadWhenInViewPortItems.indexOf(itemsToLoad[i]);
            if (index > -1) {
                loadWhenInViewPortItems.splice(index, 1);
            }
        });

        itemsToLoad.forEach(function(item) {
            loadAsset(item);
        });
    };

    // We need to call this on resize and on init of pages which have images in "Contain mode". Reasons why we can't do this by CSS?
    // 1. If we have SVG, and image with max-width 100%, min-width 100%, height: auto, width: auto, then if image is smaller then it doesn’t snap to the placeholder.
    // 2. If we have SVG and div with background-size: contain, then 1px line problem occurs.
    // 3. If we make image as background-size: contain, and make some little transform to make it bigger, OR make SVG smaller, then if we put any layer on it (extra_content), it won’t snap to pixels.
    // Therefore, all solutions suck.
    this.normalizeImagesInContainMode = function (selector) {

        selectMeOrDescendants(selector, 'lazy-asset-mode-contain').forEach(function (item) {

            let wrapper = item.querySelector('.lazy-asset-wrapper');
            let naturalAspectRatio = parseFloat(item.dataset.aspectRatio);

            let containerWidth = item.clientWidth;
            let containerHeight = item.clientHeight;
            let containerAspectRatio = containerWidth / containerHeight;

            if (naturalAspectRatio > containerAspectRatio) {

                let heightPercent = (containerAspectRatio / naturalAspectRatio) * 100;
                let topPercent = (100 - heightPercent) / 2;

                wrapper.style.width = "100%";
                wrapper.style.height = heightPercent + "%";
                wrapper.style.top = topPercent + "%";
            }
            else {

                let widthPercent = (naturalAspectRatio / containerAspectRatio) * 100;
                let leftPercent = (100 - widthPercent) / 2;

                wrapper.style.width = widthPercent + "%";
                wrapper.style.height =  "100%";
                wrapper.style.top = leftPercent + "%";
            }
        });

    };

    this.playVideo = function (selector) {

        selectMeOrDescendants(selector, 'lazy-asset').forEach(function (item) {
            item.classList.add('playing');

            let video = item.querySelector('video');
            if (video !== null) {
                video.play();
            }
        })
    };

    this.pauseVideo = function (selector) {

        selectMeOrDescendants(selector, 'lazy-asset').forEach(function (item) {
            item.classList.remove('playing');

            let video = item.querySelector('video');
            if (video !== null) {
                video.pause();
            }
        });
    };

    let ASSET_TYPE_VIDEO = 0;
    let ASSET_TYPE_IMAGE = 1;
    let ASSET_TYPE_NONE = 2;

    function getAssetType(asset) {
        let videoSources = asset.querySelectorAll('video source');
        let pictureSources = asset.querySelectorAll('picture source');

        if (videoSources.length > 0 && !isAutoplayDisabled()) { // we have video
            return ASSET_TYPE_VIDEO;
        }
        else if (pictureSources.length > 0) { // we load image
            return ASSET_TYPE_IMAGE;
        }

        return ASSET_TYPE_NONE;
    }

    function loadAsset(asset, callback) {

        asset.classList.remove('staged-for-load');
        asset.classList.add('loading');

        // Schedule asset to load
        switch (getAssetType(asset)) {

            case ASSET_TYPE_VIDEO:
                loadVideo(asset, callback);
                break;

            case ASSET_TYPE_IMAGE:
                loadImage(asset, callback);
                break;

            default:
                break;
        }
    }

    // Function for showing loaded asset
    function showAsset(asset) {
        asset.classList.remove('loading');
        asset.classList.add('loaded');
    }

    function loadImage(asset, callback) {
        let img = asset.querySelector('img');

        function fallback() {
            let imagePath = img.dataset.fallbackSrc; // we take default image!

            let virtualImg = new Image();
            virtualImg.setAttribute("src", imagePath);
            virtualImg.onload = function() {
                virtualImg.remove();
                img.style.backgroundImage = 'url(' + imagePath + ')';
                img.removeAttribute('alt');

                showAsset(asset);
                if (typeof callback !== 'undefined') { callback(); }
            }
        }

        if (bowser.msie) { // No object-fit support in IE / Edge, so that we have to use background-image fallback
            fallback();
        }
        else if (bowser.msedge && asset.classList.contains('lazy-asset-mode-cover')) {
            fallback();
        }
        else { // Normal use of <picture> tag!

            asset.querySelectorAll('source').forEach(function (source) {
                changeDataToRealAttribute(source, 'srcset');
            });

            img.onload = function () {
                showAsset(asset);
                if (typeof callback !== 'undefined') { callback(); }
            }

        }
    }

    function checkVideoLoadingStatus(video, callback) {
        if (video.readyState < 3) {
            setTimeout(function () {
                checkVideoLoadingStatus(video, callback);
            }, 250);
        }
        else {
            callback();
        }
    }

    function loadVideo(asset, callback) {
        asset.classList.remove('lazy-asset-image');
        asset.classList.add('lazy-asset-image');

        // asset.removeClass('lazy-asset-image').addClass('lazy-asset-video');

        let video = asset.querySelector('video');
        let sources = video.querySelectorAll('source');

        sources.forEach(function (source) {
            changeDataToRealAttribute(source, 'src');
        });

        video.load();

        checkVideoLoadingStatus(video, function () {
            if (asset.classList.contains('playing')) {
                video.play();
            }
            showAsset(asset);

            if (typeof callback !== 'undefined') {
                callback()
            }
        });
    }


    let LoadSession = function (successCallback, progressCallback) {
        this.successCallback = typeof successCallback === 'undefined' ? function () {
        } : successCallback;
        this.progressCallback = typeof progressCallback === 'undefined' ? function () {
        } : progressCallback;
        this.numberOfVideos = 0;
        this.numberOfImages = 0;
        this.numberOfVideosLoaded = 0;
        this.numberOfImagesLoaded = 0;
        this.imagesToLoad = [];
        this.videosToLoad = [];
    }

    LoadSession.prototype.tryToInvokeCallback = function () {

        if (this.numberOfImages + this.numberOfVideos != 0) {
            this.progressCallback((this.numberOfVideosLoaded + this.numberOfImagesLoaded) / (this.numberOfImages + this.numberOfVideos));
        } else {
            this.progressCallback(1);
        }

        if (this.numberOfVideos == this.numberOfVideosLoaded && this.numberOfImages == this.numberOfImagesLoaded) {
            this.successCallback();
        }
    }

    LoadSession.prototype.run = function () {
        let _this = this;

        for (let j = 0; j < this.videosToLoad.length; j++) {
            loadAsset(this.videosToLoad[j], function () {
                _this.numberOfVideosLoaded++;
                _this.tryToInvokeCallback();
            });
        }

        // Load images
        for (let i = 0; i < this.imagesToLoad.length; i++) {
            loadAsset(this.imagesToLoad[i], function () {
                _this.numberOfImagesLoaded++;
                _this.tryToInvokeCallback();
            });
        }

        // Try to invoke after start, maybe we don't have anything to load and need to invoke callback right away
        _this.tryToInvokeCallback();
    }


    this.load = function (selector, successCallback, progressCallback) {

        let session = new LoadSession(successCallback, progressCallback);

        // Go through all lazy assets in range of `selector` and determine weather it's image or video and if we should load or not.
        let lazyAssetItems = selectMeOrDescendants(selector, 'lazy-asset');

        lazyAssetItems.forEach(function (item) {

            // If image / video is loading or already being loaded, ignore!
            if (item.classList.contains('loaded') || item.classList.contains('loading') || item.classList.contains('staged-for-load')) {
                return;
            }

            // When load in viewport, just stage for load and leave iteration
            if (item.classList.contains('lazy-asset-load-when-in-viewport')) {
                item.classList.add('staged-for-load');
                loadWhenInViewPortItems.push(item);
                return;
            }

            // Schedule asset to load
            switch (getAssetType(item)) {

                case ASSET_TYPE_VIDEO:
                    session.numberOfVideos++;
                    session.videosToLoad.push(item);
                    break;

                case ASSET_TYPE_IMAGE:
                    session.numberOfImages++;
                    session.imagesToLoad.push(item);
                    break;

                default:
                    item.classList.add('loaded');
            }
        });

        session.run();

        this.loadWhenInViewportScrollCallback(window.scrollY);
    };


    function changeDataToRealAttribute(node, name) {
        let data = node.dataset[name];
        if (data) {
            node.setAttribute(name, data);
        }
    }
};

/* harmony default export */ __webpack_exports__["a"] = (LazyAsset);



/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*!
 * Bowser - a browser detector
 * https://github.com/ded/bowser
 * MIT License | (c) Dustin Diaz 2015
 */

!function (root, name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (true) __webpack_require__(3)(name, definition)
  else root[name] = definition()
}(this, 'bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[2]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , nexusMobile = /nexus\s*[0-6]\s*/i.test(ua)
      , nexusTablet = !nexusMobile && /nexus\s*[0-9]+/i.test(ua)
      , chromeos = /CrOS/.test(ua)
      , silk = /silk/i.test(ua)
      , sailfish = /sailfish/i.test(ua)
      , tizen = /tizen/i.test(ua)
      , webos = /(web|hpw)os/i.test(ua)
      , windowsphone = /windows phone/i.test(ua)
      , samsungBrowser = /SamsungBrowser/i.test(ua)
      , windows = !windowsphone && /windows/i.test(ua)
      , mac = !iosdevice && !silk && /macintosh/i.test(ua)
      , linux = !android && !sailfish && !tizen && !webos && /linux/i.test(ua)
      , edgeVersion = getSecondMatch(/edg([ea]|ios)\/(\d+(\.\d+)?)/i)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua) && !/tablet pc/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , xbox = /xbox/i.test(ua)
      , result

    if (/opera/i.test(ua)) {
      //  an old Opera
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i)
      }
    } else if (/opr\/|opios/i.test(ua)) {
      // a new Opera
      result = {
        name: 'Opera'
        , opera: t
        , version: getFirstMatch(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/SamsungBrowser/i.test(ua)) {
      result = {
        name: 'Samsung Internet for Android'
        , samsungBrowser: t
        , version: versionIdentifier || getFirstMatch(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/coast/i.test(ua)) {
      result = {
        name: 'Opera Coast'
        , coast: t
        , version: versionIdentifier || getFirstMatch(/(?:coast)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/yabrowser/i.test(ua)) {
      result = {
        name: 'Yandex Browser'
      , yandexbrowser: t
      , version: versionIdentifier || getFirstMatch(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/ucbrowser/i.test(ua)) {
      result = {
          name: 'UC Browser'
        , ucbrowser: t
        , version: getFirstMatch(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/mxios/i.test(ua)) {
      result = {
        name: 'Maxthon'
        , maxthon: t
        , version: getFirstMatch(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/epiphany/i.test(ua)) {
      result = {
        name: 'Epiphany'
        , epiphany: t
        , version: getFirstMatch(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/puffin/i.test(ua)) {
      result = {
        name: 'Puffin'
        , puffin: t
        , version: getFirstMatch(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i)
      }
    }
    else if (/sleipnir/i.test(ua)) {
      result = {
        name: 'Sleipnir'
        , sleipnir: t
        , version: getFirstMatch(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (/k-meleon/i.test(ua)) {
      result = {
        name: 'K-Meleon'
        , kMeleon: t
        , version: getFirstMatch(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i)
      }
    }
    else if (windowsphone) {
      result = {
        name: 'Windows Phone'
      , osname: 'Windows Phone'
      , windowsphone: t
      }
      if (edgeVersion) {
        result.msedge = t
        result.version = edgeVersion
      }
      else {
        result.msie = t
        result.version = getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    } else if (chromeos) {
      result = {
        name: 'Chrome'
      , osname: 'Chrome OS'
      , chromeos: t
      , chromeBook: t
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    } else if (/edg([ea]|ios)/i.test(ua)) {
      result = {
        name: 'Microsoft Edge'
      , msedge: t
      , version: edgeVersion
      }
    }
    else if (/vivaldi/i.test(ua)) {
      result = {
        name: 'Vivaldi'
        , vivaldi: t
        , version: getFirstMatch(/vivaldi\/(\d+(\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (sailfish) {
      result = {
        name: 'Sailfish'
      , osname: 'Sailfish OS'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel|fxios/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
        result.osname = 'Firefox OS'
      }
    }
    else if (silk) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/slimerjs/i.test(ua)) {
      result = {
        name: 'SlimerJS'
        , slimer: t
        , version: getFirstMatch(/slimerjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , osname: 'BlackBerry OS'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (webos) {
      result = {
        name: 'WebOS'
      , osname: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , osname: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (tizen) {
      result = {
        name: 'Tizen'
      , osname: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/qupzilla/i.test(ua)) {
      result = {
        name: 'QupZilla'
        , qupzilla: t
        , version: getFirstMatch(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || versionIdentifier
      }
    }
    else if (/chromium/i.test(ua)) {
      result = {
        name: 'Chromium'
        , chromium: t
        , version: getFirstMatch(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
        , chrome: t
        , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
        , version: versionIdentifier
      }
    }
    else if (/safari|applewebkit/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      }
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if(/googlebot/i.test(ua)) {
      result = {
        name: 'Googlebot'
      , googlebot: t
      , version: getFirstMatch(/googlebot\/(\d+(\.\d+))/i) || versionIdentifier
      }
    }
    else {
      result = {
        name: getFirstMatch(/^(.*)\/(.*) /),
        version: getSecondMatch(/^(.*)\/(.*) /)
     };
   }

    // set webkit or gecko flag for browsers based on these engines
    if (!result.msedge && /(apple)?webkit/i.test(ua)) {
      if (/(apple)?webkit\/537\.36/i.test(ua)) {
        result.name = result.name || "Blink"
        result.blink = t
      } else {
        result.name = result.name || "Webkit"
        result.webkit = t
      }
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (!result.windowsphone && (android || result.silk)) {
      result.android = t
      result.osname = 'Android'
    } else if (!result.windowsphone && iosdevice) {
      result[iosdevice] = t
      result.ios = t
      result.osname = 'iOS'
    } else if (mac) {
      result.mac = t
      result.osname = 'macOS'
    } else if (xbox) {
      result.xbox = t
      result.osname = 'Xbox'
    } else if (windows) {
      result.windows = t
      result.osname = 'Windows'
    } else if (linux) {
      result.linux = t
      result.osname = 'Linux'
    }

    function getWindowsVersion (s) {
      switch (s) {
        case 'NT': return 'NT'
        case 'XP': return 'XP'
        case 'NT 5.0': return '2000'
        case 'NT 5.1': return 'XP'
        case 'NT 5.2': return '2003'
        case 'NT 6.0': return 'Vista'
        case 'NT 6.1': return '7'
        case 'NT 6.2': return '8'
        case 'NT 6.3': return '8.1'
        case 'NT 10.0': return '10'
        default: return undefined
      }
    }

    // OS version extraction
    var osVersion = '';
    if (result.windows) {
      osVersion = getWindowsVersion(getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i))
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.mac) {
      osVersion = getFirstMatch(/Mac OS X (\d+([_\.\s]\d+)*)/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = !result.windows && osVersion.split('.')[0];
    if (
         tablet
      || nexusTablet
      || iosdevice == 'ipad'
      || (android && (osMajorVersion == 3 || (osMajorVersion >= 4 && !mobile)))
      || result.silk
    ) {
      result.tablet = t
    } else if (
         mobile
      || iosdevice == 'iphone'
      || iosdevice == 'ipod'
      || android
      || nexusMobile
      || result.blackberry
      || result.webos
      || result.bada
    ) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if (result.msedge ||
        (result.msie && result.version >= 10) ||
        (result.yandexbrowser && result.version >= 15) ||
		    (result.vivaldi && result.version >= 1.0) ||
        (result.chrome && result.version >= 20) ||
        (result.samsungBrowser && result.version >= 4) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        || (result.chromium && result.version >= 20)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        || (result.chromium && result.version < 20)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent || '' : '')

  bowser.test = function (browserList) {
    for (var i = 0; i < browserList.length; ++i) {
      var browserItem = browserList[i];
      if (typeof browserItem=== 'string') {
        if (browserItem in bowser) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get version precisions count
   *
   * @example
   *   getVersionPrecision("1.10.3") // 3
   *
   * @param  {string} version
   * @return {number}
   */
  function getVersionPrecision(version) {
    return version.split(".").length;
  }

  /**
   * Array::map polyfill
   *
   * @param  {Array} arr
   * @param  {Function} iterator
   * @return {Array}
   */
  function map(arr, iterator) {
    var result = [], i;
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, iterator);
    }
    for (i = 0; i < arr.length; i++) {
      result.push(iterator(arr[i]));
    }
    return result;
  }

  /**
   * Calculate browser version weight
   *
   * @example
   *   compareVersions(['1.10.2.1',  '1.8.2.1.90'])    // 1
   *   compareVersions(['1.010.2.1', '1.09.2.1.90']);  // 1
   *   compareVersions(['1.10.2.1',  '1.10.2.1']);     // 0
   *   compareVersions(['1.10.2.1',  '1.0800.2']);     // -1
   *
   * @param  {Array<String>} versions versions to compare
   * @return {Number} comparison result
   */
  function compareVersions(versions) {
    // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
    var precision = Math.max(getVersionPrecision(versions[0]), getVersionPrecision(versions[1]));
    var chunks = map(versions, function (version) {
      var delta = precision - getVersionPrecision(version);

      // 2) "9" -> "9.0" (for precision = 2)
      version = version + new Array(delta + 1).join(".0");

      // 3) "9.0" -> ["000000000"", "000000009"]
      return map(version.split("."), function (chunk) {
        return new Array(20 - chunk.length).join("0") + chunk;
      }).reverse();
    });

    // iterate in reverse order by reversed chunks array
    while (--precision >= 0) {
      // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
      if (chunks[0][precision] > chunks[1][precision]) {
        return 1;
      }
      else if (chunks[0][precision] === chunks[1][precision]) {
        if (precision === 0) {
          // all version chunks are same
          return 0;
        }
      }
      else {
        return -1;
      }
    }
  }

  /**
   * Check if browser is unsupported
   *
   * @example
   *   bowser.isUnsupportedBrowser({
   *     msie: "10",
   *     firefox: "23",
   *     chrome: "29",
   *     safari: "5.1",
   *     opera: "16",
   *     phantom: "534"
   *   });
   *
   * @param  {Object}  minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function isUnsupportedBrowser(minVersions, strictMode, ua) {
    var _bowser = bowser;

    // make strictMode param optional with ua param usage
    if (typeof strictMode === 'string') {
      ua = strictMode;
      strictMode = void(0);
    }

    if (strictMode === void(0)) {
      strictMode = false;
    }
    if (ua) {
      _bowser = detect(ua);
    }

    var version = "" + _bowser.version;
    for (var browser in minVersions) {
      if (minVersions.hasOwnProperty(browser)) {
        if (_bowser[browser]) {
          if (typeof minVersions[browser] !== 'string') {
            throw new Error('Browser version in the minVersion map should be a string: ' + browser + ': ' + String(minVersions));
          }

          // browser version and min supported version.
          return compareVersions([version, minVersions[browser]]) < 0;
        }
      }
    }

    return strictMode; // not found
  }

  /**
   * Check if browser is supported
   *
   * @param  {Object} minVersions map of minimal version to browser
   * @param  {Boolean} [strictMode = false] flag to return false if browser wasn't found in map
   * @param  {String}  [ua] user agent string
   * @return {Boolean}
   */
  function check(minVersions, strictMode, ua) {
    return !isUnsupportedBrowser(minVersions, strictMode, ua);
  }

  bowser.isUnsupportedBrowser = isUnsupportedBrowser;
  bowser.compareVersions = compareVersions;
  bowser.check = check;

  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  /*
   * Set our detect public method to the main bowser object
   * This is needed to implement bowser in server side
   */
  bowser.detect = detect;
  return bowser
});


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = function() {
	throw new Error("define cannot be used indirect");
};


/***/ })
/******/ ]);