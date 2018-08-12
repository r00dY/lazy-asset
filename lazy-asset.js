let bowser = require("bowser");

/** Autosizing is removed!!!

 1. It doesn’t work when something is “display: none”. We must remember to call autoSizes. It might cause totally undefined behaviour across the site as scale goes up.
 2. It doesn’t work when elements are laid out by Javascript.
 3. We have no certainty that it works well with resize! Altough double downloads doesn’t happen etc, specification doesn’t specify this.
 4. We can’t preload images before layout is done.

 */

let LazyAsset = new function () {

    let _this = this;

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


    function isElementInViewport(el, multiplier) {

        if (typeof multiplier === 'undefined') { multiplier = 1; }

        let rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * multiplier && (rect.top + rect.height) > -(multiplier - 1) * window.innerHeight && rect.width > 0 && rect.height > 0;
    }


    let loadWhenInViewPortItems = [];
    this.loadWhenInViewportScrollCallback = function () {

        let itemsToLoad = [];

        loadWhenInViewPortItems.forEach(function(item) {
            if (isElementInViewport(item, 2)) {
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

    let autoplayWhenInViewportItems = [];

    this.autoplayWhenInViewportCallback = function() {

        autoplayWhenInViewportItems.forEach(function(item) {
            if (isElementInViewport(item)) {
                LazyAsset.playVideo(item);
            }
            else {
                LazyAsset.pauseVideo(item);
            }
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
                wrapper.style.left = "0";
            }
            else {

                let widthPercent = (naturalAspectRatio / containerAspectRatio) * 100;
                let leftPercent = (100 - widthPercent) / 2;

                wrapper.style.width = widthPercent + "%";
                wrapper.style.height =  "100%";
                wrapper.style.top = "0";
                wrapper.style.left = leftPercent + "%";
            }
        });

    };

    this.autoplayWhenInViewport = function (selector, flag) {

        selectMeOrDescendants(selector, 'lazy-asset').forEach((item) => {

            if (flag) {
                item.classList.add('lazy-asset-autoplay-when-in-viewport');
                autoplayWhenInViewportItems.push(item);
                this.autoplayWhenInViewportCallback();

            } else {
                item.classList.remove('lazy-asset-autoplay-when-in-viewport');
                autoplayWhenInViewportItems = autoplayWhenInViewportItems.filter(i => i !== item);
                this.pauseVideo(item);
            }
        })
    };

    this.playVideo = function (selector) {

        selectMeOrDescendants(selector, 'lazy-asset').forEach(function (item) {
            item.classList.add('playing');

            let video = item.querySelector('video');
            if (video !== null) {
                let promise = video.play();

                // empty promise to avoid exceptions https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
                promise
                    .then(_ => {
                    })
                    .catch((error) => {
                    });
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
        let video = asset.querySelector('video');
        let img = asset.querySelector('img');

        if (video !== null && !isAutoplayDisabled()) { // we have video
            return ASSET_TYPE_VIDEO;
        }
        else if (img !== null) { // we load image
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
        asset.classList.remove('lazy-asset-video');
        asset.classList.add('lazy-asset-image');

        let img = asset.querySelector('img');

        function fallback() {
            let imagePath = img.dataset.fallbackSrc; // we take default image!

            let virtualImg = new Image();
            virtualImg.setAttribute("src", imagePath);
            virtualImg.onload = function() {
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
        else { // Normal use of <picture> or <img> tag!

            if (asset.classList.contains('lazy-asset-preload')) {

                if (img.complete && img.naturalWidth > 0) { // image already loaded
                    showAsset(asset);
                    if (typeof callback !== 'undefined') { callback(); }
                }
                else {
                    img.onload = function () {
                        showAsset(asset);
                        if (typeof callback !== 'undefined') { callback(); }
                    }
                }
            }
            else {

                let sources = asset.querySelectorAll('picture > source');

                if (sources.length > 0) {
                    asset.querySelectorAll('picture > source').forEach(function (source) {
                        changeDataToRealAttribute(source, 'srcset');
                    });
                }
                else {
                    changeDataToRealAttribute(asset.querySelector('img'), 'srcset');
                }

                img.onload = function () {
                    showAsset(asset);
                    if (typeof callback !== 'undefined') { callback(); }
                }

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
        asset.classList.add('lazy-asset-video');

        let video = asset.querySelector('video');
        let sources = video.querySelectorAll('source');

        sources.forEach(function (source) {
            changeDataToRealAttribute(source, 'src');
        });

        video.load();

        checkVideoLoadingStatus(video,  () => {

            // Autoplay when in viewport. When video is loaded it should register for listening autoplay scroll event
            if (asset.classList.contains('lazy-asset-autoplay-when-in-viewport')) {
                autoplayWhenInViewportItems.push(asset);
                _this.autoplayWhenInViewportCallback();
            }

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
    };


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


    this.debug = function() {

        let devicePixelDensity = window.devicePixelRatio;

        function getPercent(num) {
            return Math.round(num * 100).toString();
        }

        let loadedAssets = [];
        let notLoadedAssets = [];

        document.querySelectorAll('.lazy-asset').forEach((asset) => {

            if (asset.classList.contains('lazy-asset-video')) { return; }

            let img = asset.querySelector('img');
            let containerWidth = img.clientWidth;
            let src = img.currentSrc;

            let tmpImg = new Image();
            tmpImg.src = img.currentSrc;

            let loadedWidth = tmpImg.width / devicePixelDensity;

            let diff = Math.abs(loadedWidth / containerWidth - 1);

            // Remove old debugger
            let oldDebugger = asset.querySelector('.lazy-asset-debugger');
            if (oldDebugger) { oldDebugger.remove(); }

            let debug = document.createElement("div");
            debug.classList.add('lazy-asset-debugger');

            if (img.naturalWidth === 0) {
                let debugRatio = document.createElement('div');
                debugRatio.appendChild(document.createTextNode(`not loaded`));
                debugRatio.classList.add('lazy-asset-debugger__img-container');

                debug.appendChild(debugRatio);

                notLoadedAssets.push({
                    asset: asset
                });
            }
            else {
                let debugRatio = document.createElement('div');
                debugRatio.appendChild(document.createTextNode(`container: ${getPercent(containerWidth / window.innerWidth)}vw, ${containerWidth.toString()}px`));
                debugRatio.classList.add('lazy-asset-debugger__img-container');

                let debugLoaded = document.createElement('div');
                debugLoaded.appendChild(document.createTextNode(`image: ${loadedWidth.toString()}px`));
                debugLoaded.classList.add('lazy-asset-debugger__img-asset');

                let debugEfficiency = document.createElement('div');
                debugEfficiency.appendChild(document.createTextNode(`eff: ${getPercent(loadedWidth / containerWidth)}%`));
                debugEfficiency.classList.add('lazy-asset-debugger__img-efficiency');


                if (diff < 0.3) {}
                else if (diff < 0.5) {
                    debugEfficiency.classList.add('lazy-asset-debugger__img-efficiency--warn');
                } else {
                    debugEfficiency.classList.add('lazy-asset-debugger__img-efficiency--error');
                }

                debug.appendChild(debugRatio);
                debug.appendChild(debugLoaded);
                debug.appendChild(debugEfficiency);

                loadedAssets.push({
                    asset: asset,
                    diff: diff,
                    eff: loadedWidth / containerWidth
                });

            }


            asset.appendChild(debug);
        });

        loadedAssets.sort((a, b) => {
            if (a.eff == b.eff) {
                return 0;
            } else if (a.eff < b.eff) {
                return 1
            }
            return -1;
        });

        console.log('LOADED ASSETS: ');
        loadedAssets.forEach((asset) => {
            let isBad = asset.diff > 0.5 ? "(BAD)" : "";
            console.log(`Eff ${isBad}: ${asset.eff}, asset: `, asset.asset);
        });

        console.log('NOT LOADED ASSETS: ');
        notLoadedAssets.forEach((asset) => {
            console.log(asset.asset);
        });


    };


    function changeDataToRealAttribute(node, name) {
        let data = node.dataset[name];
        if (data) {
            node.setAttribute(name, data);
        }
    }
};

export default LazyAsset;

/** POLYFILLS */

// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };

        // The length property of the from method is 1.
        return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}


if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}

// NodeList forEach polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}
