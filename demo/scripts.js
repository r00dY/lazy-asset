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

	// setTimeout(function() {
	// 	LazyAsset.load('body');
	// }, 2000);

	// Contain mode
    LazyAsset.normalizeImagesInContainMode('body');

    window.addEventListener('resize', function() {
        LazyAsset.normalizeImagesInContainMode('body');
	});
	
	
	// LazyAsset.load(document.querySelectorAll('.modes'));
	// LazyAsset.load('.modes');
	// LazyAsset.load('.modes');
    //
	// LazyAsset.normalizeImagesInContainMode('.modes');
    //

	LazyAsset.load('.deferred-loads');

	window.addEventListener('scroll', function() {
        LazyAsset.loadWhenInViewportScrollCallback();
        LazyAsset.autoplayWhenInViewportCallback();
	});

    // let video = document.querySelector('.video-controls-test');

    document.getElementById("video-play-button").addEventListener('click', function() {
        console.log('play video');
        LazyAsset.playVideo('.video-controls-test');
    });

    document.getElementById("video-pause-button").addEventListener('click', function() {
        console.log('pause video');
        LazyAsset.pauseVideo('.video-controls-test');
    });


    // LazyAsset.load('body');
});

window.load = function() {
    LazyAsset.load('body');
};
