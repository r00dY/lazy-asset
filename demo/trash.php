		<h1>Lazy asset demo</h1>
<!-- 
		<?php

			LazyAsset::setFileBasePath("./");
			LazyAsset::setFileBaseUrl("");

			LazyAsset::putFile([
				"mode"				=> LazyAsset::MODE_COVER,
				"classes" 			=> "photo-cover",
				"animation"			=> "fade",

				"file-path"			=> "cat1.jpg"
			]);

			LazyAsset::putFile([
				"mode"				=> LazyAsset::MODE_ASPECT_RATIO,
				"classes" 			=> "photo-aspect-ratio",
				"animation"			=> "fade",

				"file-path"			=> "cat2.jpg"
			]);

			LazyAsset::putFile([
				"mode"				=> LazyAsset::MODE_CONTAIN,
				"classes" 			=> "photo-contain",
				"animation"			=> "fade",

				"file-path"			=> "cat3.jpg"
			]);

			LazyAsset::putFile([
				"mode"				=> LazyAsset::MODE_COVER,
				"classes" 			=> "video",
				"animation"			=> "fade",

				"video-src"			=> "video.mp4",
				"file-path"			=> "cat3.jpg"
			]);

		?> -->

		<!-- cover new API -->
		<div class="lazy-asset lazy-asset-mode-cover">
			<picture>
				<source data-src-set="
					cat/cat_420x432 420w,
					cat/cat_768x432 768w,
					cat/cat_1024x576 1024w,
					cat/cat_1280x720 1280w,
					cat/cat_1600x900 1600w,
					cat/cat_1920x1080 1920w
				" media="(min-aspect-ratio: 1/1)">
				<source data-src-set="blabla-landscape" media="blablabla">
				<img data-src="default-desktop-ie-image.jpg" alt="alternative text">
			</picture>

			<div class="background" data-src="default-desktop-ie-edge-image.jpg"></div> <!-- IE will show image as background-image instead of <img> because object-fit is not supported -->
		</div>

		<!-- aspect ratio new api -->
		<div class="lazy-asset lazy-asset-mode-aspect-ratio">
			<div class="wrapper" style="padding-bottom: 67%">
				<img data-src="ie-edge-desktop-size.jpg" data-srcset="blablabla" sizes="blablabla" alt="blablabla"> <!-- works in all browsers! -->
			</div>
		</div>

		<!-- contain new api -->
		<div class="lazy-asset lazy-asset-mode-contain">
			<div class="wrapper" style="padding-bottom: 150%"> <!-- we must place this in JS. Object-fit wouldn't help if we want to show color background under image -->
				<img data-src="dupa.jpg" data-srcset="blablabla" sizes="blablabla" alt="blablabla">
			</div>
		</div>




