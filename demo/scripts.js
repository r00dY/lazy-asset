import LazyAsset from "../lazy-asset";

/**
 * Tests to write
 *
 * 1. Video preloading
 * 2. Vimeo integration
 *
 */

window.LazyAsset = LazyAsset;

document.addEventListener("DOMContentLoaded", function() {

	LazyAsset.load(document.querySelectorAll('.modes'));
	LazyAsset.load('.modes');
	LazyAsset.load('.modes');

	LazyAsset.normalizeImagesInContainMode('.modes');

	LazyAsset.load('.deferred-loads');

	window.addEventListener('scroll', function() {
        LazyAsset.loadWhenInViewportScrollCallback();
	});

});
