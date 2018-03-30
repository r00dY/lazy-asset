let bowser = require("bowser");

/** Autosizing is removed!!!

 1. It doesn’t work when something is “display: none”. We must remember to call autoSizes. It might cause totally undefined behaviour across the site as scale goes up.
 2. It doesn’t work when elements are laid out by Javascript.
 3. We have no certainty that it works well with resize! Altough double downloads doesn’t happen etc, specification doesn’t specify this.
 4. We can’t preload images before layout is done.

 */

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

export default LazyAsset;

