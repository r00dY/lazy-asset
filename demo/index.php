<?php
	require('../lazy-asset.php');
?>

<!DOCTYPE html>
<html lang="en">

	<head>
        <meta charset="UTF-8" />

        <meta name="viewport" content="width=device-width,user-scalable=no,minimum-scale=1,maximum-scale=1">

        <title>Lazy asset demo</title>

		<script src="dist/bundle.js"></script>
		<link rel="stylesheet" href="dist/style.css">
    </head>

	<body>

		<div class="modes">

			<div class="lazy-asset  image-cover" data-anim="fade">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="
							cat/cat_420.png 420w,
							cat/cat_768.png 768w,
							cat/cat_1024.png 1024w,
							cat/cat_1280.png 1280w,
							cat/cat_1600.png 1600w,
							cat/cat_1920.png 1920w
						" media="(orientation: landscape)">

						<source data-srcset="
							cat/cat_p420.png 420w,
							cat/cat_p768.png 768w,
							cat/cat_p920.png 1024w
						" media="(orientation: portrait)">

						<img data-src="cat/cat_1920.png" alt="Cat motha fucka photo">
					</picture>
				</div>
			</div>

			<div class="lazy-asset  image-cover" data-anim="fade">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="
							cat/cat_420.png 420w,
							cat/cat_768.png 768w,
							cat/cat_1024.png 1024w,
							cat/cat_1280.png 1280w,
							cat/cat_1600.png 1600w,
							cat/cat_1920.png 1920w
						" media="(orientation: landscape)">

						<source data-srcset="
							cat/cat_p420.png 420w,
							cat/cat_p768.png 768w,
							cat/cat_p920.png 1024w
						" media="(orientation: portrait)">

						<img data-src="cat/cat_1920.png" alt="Cat motha fucka photo">
					</picture>
				</div>
			</div>

			<div class="lazy-asset image-cover-parts" data-anim="fade">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="wedding.jpg">

						<img data-src="wedding.jpg" alt="Cat motha fucka photo">
					</picture>
				</div>
			</div>

			<div class="lazy-asset image-cover-parts" data-anim="fade">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="wedding.jpg">

						<img data-src="wedding.jpg" alt="Cat motha fucka photo">
					</picture>
					<video loop muted><source data-src='video.mp4'></video>
				</div>
			</div>

			<div class="lazy-asset image-cover-parts" data-anim="fade">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="wedding.jpg">

						<img data-src="wedding.jpg" alt="Cat motha fucka photo">
					</picture>
					<video loop muted><source data-src='video.mp4'></video>
				</div>
			</div>

			<div class="lazy-asset image-aspect-ratio" data-anim="fade">
				<div class="lazy-asset-wrapper" style="padding-bottom: 50%">
					<picture>
						<source data-srcset="wedding.jpg">
						<img data-src="wedding.jpg" alt="Cat motha fucka photo">
					</picture>
				</div>
			</div>

			<div class="lazy-asset lazy-asset-mode-contain image-contain" data-anim="fade" data-aspect-ratio="2.5">
				<div class="lazy-asset-wrapper">
					<picture>
						<source data-srcset="
							cat/cat_420.png 420w,
							cat/cat_768.png 768w,
							cat/cat_1024.png 1024w,
							cat/cat_1280.png 1280w,
							cat/cat_1600.png 1600w,
							cat/cat_1920.png 1920w
						" media="(orientation: landscape)">

						<source data-srcset="
							cat/cat_p420.png 420w,
							cat/cat_p768.png 768w,
							cat/cat_p920.png 920w
						" media="(orientation: portrait)">

						<img data-src="cat/cat_1920.png" alt="Cat motha fucka photo">
					</picture>
					<video loop muted><source data-src='video.mp4'></video>
				</div>
			</div>

			<h1>Empty</h1>

			<div class="lazy-asset  image-cover" data-anim="fade">
				<div class="lazy-asset-wrapper">

				</div>
			</div>

			<div class="lazy-asset image-aspect-ratio" data-anim="fade" style="margin-bottom: 50px;">
				<div class="lazy-asset-wrapper" style="padding-bottom: 50%">
				</div>
			</div>

			<div class="lazy-asset lazy-asset-mode-contain image-contain" data-anim="fade" data-aspect-ratio="2.5">
				<div class="lazy-asset-wrapper">
				</div>
			</div>

			<h1>PHP Helpers</h1>

			<?php

				LazyAsset::setSizesReplaceMap([
					"_xs" => "0px",
					"_sm" => "420px",
					"_md" => "768px",
					"_xl" => "1600px"
				]);

				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_COVER,
					"classes" 			=> "image-cover",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat cover",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					],
					"sizes" => "(min-width: _sm) 33vw, (min-width: _md) 66vw, 100vw"
				]);

				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_ASPECT_RATIO,
					"classes" 			=> "image-aspect-ratio",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat aspect ratio",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					],
					"sizes" => ["_xs" => "33vw", "_md" => "66vw", "_xl" => "100vw"]
				]);

				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_CONTAIN,
					"classes" 			=> "image-contain",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat contain",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					]
				]);


				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_COVER,
					"classes" 			=> "image-cover",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat cover",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					],
					"autoplay" => true,
					"loop" => true,
					"videos" => [
						[
							"url" => "video.mp4",
							"type" => "video/mp4",
							"width" => 1920,
							"height" => 1080
						]
					]
				]);

				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_ASPECT_RATIO,
					"classes" 			=> "image-aspect-ratio",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat aspect ratio",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					],
					"autoplay" => false,
					"loop" => false,
					"videos" => [
						[
							"url" => "video.mp4",
							"type" => "video/mp4",
							"width" => 1920,
							"height" => 1080
						]
					]
				]);

				LazyAsset::put([
					"mode"				=> LazyAsset::MODE_CONTAIN,
					"classes" 			=> "image-contain",
					"animation"			=> "fade",
					"alt" 				=> "Super duper cat contain",
					"images"			=> [
						[
							"url" => "cat/cat_420.png",
							"width" => 420,
							"height" => 236
						],
						[
							"url" => "cat/cat_768.png",
							"width" => 768,
							"height" => 430
						],
						[
							"url" => "cat/cat_p420.png",
							"width" => 420,
							"height" => 489,
							"portrait" => true
						],
						[
							"url" => "cat/cat_p920.png",
							"width" => 920,
							"height" => 1071,
							"portrait" => true
						]
					],
					"autoplay" => true,
					"loop" => false,
					"videos" => [
						[
							"url" => "video.mp4",
							"type" => "video/mp4",
							"width" => 1920,
							"height" => 1080
						]
					]
				]);
			?>



		</div>




		<h1>Deferred loads</h1>

		<div class="deferred-loads">
		<?php

			for($i = 0; $i < 50; $i++) {

				$height = (string) (300 + $i);
				$path = "https://placeholdit.co//i/555x" . $height;


				?>
					<div class="lazy-asset lazy-asset-load-when-in-viewport image-aspect-ratio lazy-asset-image item" data-anim="fade">
						<div class="lazy-asset-wrapper" style="padding-bottom: 50%">
							<picture>
								<source data-srcset="<?= $path ?>">
								<img data-src="<?= $path ?>" alt="Placeholdit">
							</picture>
						</div>
					</div>

				<?php
			}

		?>
		</div>





	</body>

</html>



