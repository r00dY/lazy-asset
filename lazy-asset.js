var $ = require("jquery");
var bowser = require("bowser");

var LazyAsset = new function () {
    var _this = this;


    function selectMeOrDecentants(node, selector) {
        if ($(node).is(selector)) {
            return $(node);
        }
        else {
            return $(node).find(selector);
        }
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


    /** Autosizing is deprecated!!!

     1. It doesn’t work when something is “display: none”. We must remember to call autoSizes.
     2. It doesn’t work when elements are laid out by Javascript.
     3. We have no certainty that it works well with resize! That double downloads doesn’t happen etc, specification doesn’t specify this.
     4. We can’t preload images before layout is done.

     Use "sizes" hiting instead. Sad I know :( - heavy duplication of layout logic. Hints should be simple and don't have to be perfect!

     */

    this.disableAutosizingTotally = false; // settings this flag to true optimizes loading images if autosizing is disabled

    function setAutoSize(sources, width) {
        sources.each(function () {
            if (typeof width === 'undefined' || width === 0) {
                $(this).attr('sizes', '1vw'); // almost empty! It will load asset but smallest possible.
            }
            else {
                $(this).attr('sizes', Math.round(width / window.innerWidth * 100) + 'vw');
            }
        });
    }


    this.autosize = function (sources, width) {
        selectMeOrDecentants(sources, '.lazy-asset').each(function () {

            var pictureWidth = width;
            if (typeof width === 'undefined') {
                pictureWidth = $(this).width();
            }

            setAutoSize($(this).find('picture source'), pictureWidth);
        });
    }


    this.initAutoSizes = function () {
        $(window).resize(function () {
            _this.autosize('.lazy-asset.lazy-asset-auto-sizes');
        });
    }

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 2 && rect.top > -window.innerHeight;
    }


    var loadWhenInViewPortItems = [];
    this.loadWhenInViewportScrollCallback = function (scrollTop) {

        var itemsToLoad = [];

        for (var i = 0; i < loadWhenInViewPortItems.length; i++) {
            var item = loadWhenInViewPortItems[i];

            if (isElementInViewport(item[0])) {
                itemsToLoad.push(item);
            }
        }

        // Remove element from array, ugly JS way
        for (var j = 0; j < itemsToLoad.length; j++) {
            var index = loadWhenInViewPortItems.indexOf(itemsToLoad[j]);
            if (index > -1) {
                loadWhenInViewPortItems.splice(index, 1);
            }
        }

        for (var j = 0; j < itemsToLoad.length; j++) {
            loadAsset(itemsToLoad[j]);
        }

    }

    // We need to call this on resize and on init of pages which have images in "Contain mode". Reasons why we can't do this by CSS?
    // 1. If we have SVG, and image with max-width 100%, min-width 100%, height: auto, width: auto, then if image is smaller then it doesn’t snap to the placeholder.
    // 2. If we have SVG and div with background-size: contain, then 1px line problem occurs.
    // 3. If we make image as background-size: contain, and make some little transform to make it bigger, OR make SVG smaller, then if we put any layer on it (extra_content), it won’t snap to pixels.
    // Therefore, all solutions suck.
    this.normalizeImagesInContainMode = function (selector) {

        selectMeOrDecentants(selector, '.lazy-asset-mode-contain').each(function () {

            var wrapper = $(this).find('.lazy-asset-wrapper');
            // var width = $(this).data('width');
            // var height = $(this).data('height');
            var naturalAspectRatio = parseFloat($(this).data('aspect-ratio'));

            var containerWidth = $(this).width();
            var containerHeight = $(this).height();
            var containerAspectRatio = containerWidth / containerHeight;

            if (naturalAspectRatio > containerAspectRatio) {

                var heightPercent = (containerAspectRatio / naturalAspectRatio) * 100;
                var topPercent = (100 - heightPercent) / 2;

                wrapper.css({
                    width: "100%",
                    height: heightPercent + '%',
                    top: topPercent + '%'
                });
            }
            else {

                var widthPercent = (naturalAspectRatio / containerAspectRatio) * 100;
                var leftPercent = (100 - widthPercent) / 2;

                wrapper.css({
                    width: widthPercent + '%',
                    height: '100%',
                    left: leftPercent + '%'
                });
            }
        });

    }

    this.playVideo = function (selector) {

        selectMeOrDecentants(selector, '.lazy-asset').each(function () {
            $(this).addClass('playing');

            var video = $(this).find('video');
            if (video.length > 0) {
                video[0].play();
            }

        })
    }

    this.pauseVideo = function (selector) {

        selectMeOrDecentants(selector, '.lazy-asset').each(function () {

            $(this).removeClass('playing');

            var video = $(this).find('video');
            if (video.length > 0) {
                video[0].pause();
            }

        });
    }

    var ASSET_TYPE_VIDEO = 0;
    var ASSET_TYPE_IMAGE = 1;
    var ASSET_TYPE_NONE = 2;

    function getAssetType(asset) {
        var videoSources = asset.find('video source');
        var pictureSources = asset.find('picture source');

        if (videoSources.length > 0 && !isAutoplayDisabled()) { // we have video
            return ASSET_TYPE_VIDEO;
        }
        else if (pictureSources.length > 0) { // we load image
            return ASSET_TYPE_IMAGE;
        }

        return ASSET_TYPE_NONE;
    }

    function loadAsset(asset, callback) {

        asset.removeClass('staged-for-load').addClass('loading');

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

        var anim = asset.data('anim') || "none";

        var itemToShow;

        if (asset.hasClass('video')) {
            itemToShow = asset.find('video');
        }
        else {
            itemToShow = asset.find('img')
        }

        asset.removeClass('loading').addClass('loaded');
    }

    function loadImage(asset, callback) {
        var img = asset.find('img');

        function fallback() {
            var imagePath = img.data('fallback-src'); // we take default image!

            $('<img/>').attr('src', imagePath).on('load', function () {
                $(this).remove(); // prevent memory leaks as @benweet suggested
                img.css('background-image', 'url(' + imagePath + ')');
                img.removeAttr('alt');

                showAsset(asset);
                if (typeof callback !== 'undefined') {
                    callback()
                }
                ;
            });
        }

        if (bowser.msie) { // No object-fit support in IE / Edge, so that we have to use background-image fallback
            fallback();
        }
        else if (bowser.msedge && asset.hasClass('lazy-asset-mode-cover')) {
            fallback();
        }
        else { // Normal use of <picture> tag!

            asset.find('source').each(function () {
                changeDataToRealAttribute($(this), 'srcset');
            });

            img[0].onload = function () {
                showAsset(asset);
                if (typeof callback !== 'undefined') {
                    callback()
                }
                ;
            }

            if (!this.disableAutosizingTotally) {
                if (asset.hasClass('lazy-asset-auto-sizes')) {
                    setAutoSize(asset.find('source'), asset.width());
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
        asset.removeClass('lazy-asset-image').addClass('lazy-asset-video');

        var video = asset.find('video');
        var sources = video.find('source');

        sources.each(function () {
            changeDataToRealAttribute($(this), 'src');
        })

        video = video[0];

        video.load();

        checkVideoLoadingStatus(video, function () {
            if (asset.hasClass('playing')) {
                video.play();
            }
            showAsset(asset);

            if (typeof callback !== 'undefined') {
                callback()
            }
            ;
        });
    }


    var LoadSession = function (successCallback, progressCallback) {
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
        var _this = this;

        for (var j = 0; j < this.videosToLoad.length; j++) {
            loadAsset(this.videosToLoad[j], function () {
                _this.numberOfVideosLoaded++;
                _this.tryToInvokeCallback();
            });
        }

        // Load images
        for (var i = 0; i < this.imagesToLoad.length; i++) {
            loadAsset(this.imagesToLoad[i], function () {
                _this.numberOfImagesLoaded++;
                _this.tryToInvokeCallback();
            });
        }

        // Try to invoke after start, maybe we don't have anything to load and need to invoke callback right away
        _this.tryToInvokeCallback();
    }


    this.load = function (selector, successCallback, progressCallback) {

        var session = new LoadSession(successCallback, progressCallback);

        // Go through all lazy assets in range of `selector` and determine weather it's image or video and if we should load or not.
        var lazyAssetItems = selectMeOrDecentants(selector, '.lazy-asset');

        lazyAssetItems.each(function () {

            // If image / video is loading or already being loaded, ignore!
            if ($(this).hasClass('loaded') || $(this).hasClass('loading') || $(this).hasClass('staged-for-load')) {
                return;
            }

            // When load in viewport, just stage for load and leave iteration
            if ($(this).hasClass('lazy-asset-load-when-in-viewport')) {
                $(this).addClass('staged-for-load');
                loadWhenInViewPortItems.push($(this));
                return;
            }

            // Schedule asset to load
            switch (getAssetType($(this))) {

                case ASSET_TYPE_VIDEO:
                    session.numberOfVideos++;
                    session.videosToLoad.push($(this));
                    break;

                case ASSET_TYPE_IMAGE:
                    session.numberOfImages++;
                    session.imagesToLoad.push($(this));
                    break;

                default:
                    $(this).addClass('loaded');
            }
        });

        session.run();

        this.loadWhenInViewportScrollCallback($(window).scrollTop());
    }


    function changeDataToRealAttribute(node, name) {

        node = node[0];
        var data = node.getAttribute('data-' + name);
        if (data) {
            node.setAttribute(name, data);
        }

        // var data = node.data(name);
        // if (data) {
        //     node.attr(name, data)
        // }
    }
}


module.exports = LazyAsset;

