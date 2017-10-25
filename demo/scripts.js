var $ = require("jquery");
var LazyAsset = require("../lazy-asset.js");

global.$ = $;

/**
 * Tests to write
 *
 * 1. Video preloading
 * 2. Vimeo integration
 *
 */

$(document).ready(function() {

	LazyAsset.load('.modes');
	LazyAsset.load('.modes');
	LazyAsset.load('.modes');

	LazyAsset.normalizeImagesInContainMode('.modes');

	LazyAsset.initAutoSizes();

	LazyAsset.load('.deferred-loads');

	$(window).scroll(function() {
		LazyAsset.loadWhenInViewportScrollCallback($(window).scrollTop());
	})

	// LazyAsset.playVideo('.modes');
	// setTimeout(function() {
	// 	LazyAsset.pauseVideo('.modes');
	// }, 3000);

});
