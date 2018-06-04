<?php
require('../lazy-asset.php');
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8"/>

    <meta name="viewport" content="width=device-width,user-scalable=no,minimum-scale=1,maximum-scale=1">

    <title>Lazy asset demo</title>

    <script src="dist/bundle.js"></script>
    <link rel="stylesheet" href="dist/style.css">
</head>

<body>

    <div class="non-deferred">

    <?php

    LazyAsset::setSizesReplaceMap([
        "_xs" => "0px",
        "_sm" => "420px",
        "_md" => "768px",
        "_xl" => "1600px"
    ]);

    $catLandscape = [
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
            "url" => "cat/cat_1024.png",
            "width" => 1024,
            "height" => 534
        ],
        [
            "url" => "cat/cat_1280.png",
            "width" => 1280,
            "height" => 717
        ],
        [
            "url" => "cat/cat_1600.png",
            "width" => 1600,
            "height" => 896
        ],
        [
            "url" => "cat/cat_1920.png",
            "width" => 1920,
            "height" => 1075
        ]
    ];

    $catPortrait = [
        [
            "url" => "cat/cat_p420.png",
            "width" => 420,
            "height" => 489,
            "portrait" => true
        ],
        [
            "url" => "cat/cat_p768.png",
            "width" => 768,
            "height" => 894,
            "portrait" => true
        ],
        [
            "url" => "cat/cat_p920.png",
            "width" => 920,
            "height" => 1071,
            "portrait" => true
        ]
    ];

    $videos = [
        [
            "url" => "bigbuckbunny.mp4",
            "type" => "video/mp4",
            "width" => 1920,
            "height" => 1080
        ]
    ];

    $sizes = ["_xs" => "100vw", "_md" => "66vw", "_xl" => "33vw"];



    function render($prefix, $img, $options = [])
    {
        global $sizes;

        ?>
        <h3><?= $prefix ?> - aspect ratio</h3>

        <?php
        LazyAsset::put(array_merge([
            "mode" => LazyAsset::MODE_ASPECT_RATIO,
            "classes" => "mode-aspect-ratio",
            "animation" => "fade",
            "alt" => "Alternative image text",
            "images" => $img,
            "sizes" => $sizes
        ], $options));
        ?>

        <h3><?= $prefix ?> - cover</h3>

        <?php
        LazyAsset::put(array_merge([
            "mode" => LazyAsset::MODE_COVER,
            "classes" => "mode-cover",
            "animation" => "fade",
            "alt" => "Alternative image text",
            "images" => $img,
            "sizes" => $sizes
        ], $options));
        ?>

        <h3><?= $prefix ?> - contain</h3>

        <?php
        LazyAsset::put(array_merge([
            "mode" => LazyAsset::MODE_CONTAIN,
            "classes" => "mode-contain-high",
            "animation" => "fade",
            "alt" => "Alternative image text",
            "images" => $img,
            "sizes" => $sizes
        ], $options));
        ?>

        <?php
        LazyAsset::put(array_merge([
            "mode" => LazyAsset::MODE_CONTAIN,
            "classes" => "mode-contain-low",
            "animation" => "fade",
            "alt" => "Alternative image text",
            "images" => $img,
            "sizes" => $sizes
        ], $options));

    }

    function renderAll($options)
    {
        global $catLandscape;
        global $catPortrait;
        global $videos;

        render("IMG", $catLandscape, $options);
        render("PICTURE", array_merge($catLandscape, $catPortrait), $options);
        render("VIDEO", $catLandscape, array_merge($options, [ "videos" => $videos, "autoplay" => true, "loop" => true, "muted" => true ]));
    }

    ?>


    <h1>STANDARD</h1>

    <p>Things to test</p>
    <ul>
        <li>Tag should be <em>img</em></li>
        <li><em>alt</em> tag should be present</li>
        <li>animation should be fade</li>
        <li>class should be added</li>
        <li><em>sizes</em> param should be properly filled</li>
    </ul>

    <?php renderAll([]); ?>

    <h1>PLACEHOLDER (edges out of image) + EXTRA MARKUP + NO FADE ANIM</h1>

    <?php renderAll([
            "placeholder" => "pattern.png",
            "extra_markup" => "<div class='image-label'><h1>LA</h1></div>",
            "animation" => "none"
    ]); ?>

    <h1>PRELOAD</h1>

    <p>Things to test</p>
    <ul>
        <li>Check if items are downloaded right after content starts being downloaded (before DOMContentLoaded). You can check it in Network tab in DevTools</li>
        <li>Check if items are animated with fade effect</li>
    </ul>

    <?php renderAll([
            "preload" => true
    ]); ?>


    <h1>Video controls</h1>

    <?php
        LazyAsset::put([
            "mode" => LazyAsset::MODE_ASPECT_RATIO,
            "classes" => "mode-aspect-ratio video-controls-test",
            "animation" => "fade",
            "alt" => "Alternative image text",
            "images" => $catLandscape,
            "sizes" => $sizes,
            "videos" => $videos,
            "loop" => true,
            "muted" => false
        ]);
    ?>

    <button id="video-play-button">Play</button>
    <button id="video-pause-button">Pause</button>


    </div>


    <h1>Deferred loads</h1>

    <div class="deferred-loads">

        <?php

        for ($i = 0; $i < 50; $i++) {

            $height = (string)(300 + $i);
            $path = "https://placeholdit.co//i/555x" . $height;

            LazyAsset::put([
                "mode" => LazyAsset::MODE_ASPECT_RATIO,
                "classes" => "mode-aspect-ratio",
                "animation" => "fade",
                "alt" => "Alternative image text",
                "images" => [
                    [
                        "url" => $path,
                        "width" => 400,
                        "height" => 200
                    ]
                ],
                "load_when_in_viewport" => true
            ]);

        }

        ?>
    </div>


</body>

</html>



