<?php

class LazyAsset {

    const MODE_COVER = 0;
    const MODE_CONTAIN = 1;
    const MODE_ASPECT_RATIO = 2;

    private static $SIZES_REPLACE_MAP;

    public static function setSizesReplaceMap($map) {
        self::$SIZES_REPLACE_MAP = $map;
    }

    private static function validateSourceAndAddAspectRatio(&$source) {
        if (!array_key_exists("url", $source)) { trigger_error("lazy asset must have 'url' property defined!"); }
        if (!array_key_exists("width", $source)) { trigger_error("lazy asset must have 'width' property defined!"); }
        if (!array_key_exists("height", $source)) { trigger_error("lazy asset must have 'height' property defined!"); }

        $source["aspect_ratio"] =  intval($source["width"]) / intval($source["height"]);
        $source["aspect_ratio_padding"] = strval(1 / $source["aspect_ratio"] * 100) . '%';
    }

    private static function prepareOptions($options) {

        if (!array_key_exists("mode", $options)) { trigger_error("lazy asset must have 'mode' property defined"); }
        if ($options["mode"] != self::MODE_COVER && $options["mode"] != self::MODE_CONTAIN && $options["mode"] != self::MODE_ASPECT_RATIO) { trigger_error("lazy asset 'mode' property has wrong value"); }

        if (!array_key_exists("classes", $options)) { $options["classes"] = ""; }
        if (!array_key_exists("animation", $options)) { $options["animation"] = "none"; }
        if (!array_key_exists("extra_markup", $options)) { $options["extra_markup"] = ""; }
        if (!array_key_exists("attributes", $options)) { $options["attributes"] = array(); }
        if (!array_key_exists("autosizes", $options)) { $options["autosizes"] = false; }

        if (!array_key_exists("sizes", $options)) {
            $options["sizes"] = "100vw";
        } else {

            if (is_string($options["sizes"])) {
                foreach(self::$SIZES_REPLACE_MAP as $key => $val) {
                    $options["sizes"] = str_replace($key, $val, $options["sizes"]);
                }
            }
            else if (is_array($options["sizes"])) {

                $resultSizesString = "";

                foreach($options["sizes"] as $breakpoint => $val) {

                    $realKeyValue = array_key_exists($breakpoint, self::$SIZES_REPLACE_MAP) ? self::$SIZES_REPLACE_MAP[$breakpoint] : $breakpoint;

                    if ($resultSizesString != "") { $resultSizesString .= ", "; }

                    $resultSizesString .= ("(min-width: " . $realKeyValue . ") " . $val);
                }

                $options["sizes"] = $resultSizesString;

            }
            else {
                trigger_error("lazy asset must have 'sizes' property set as string or array!!!");
            }

        }

        if (!array_key_exists("alt", $options)) { $options["alt"] = ""; }
        if (!array_key_exists("images", $options)) { $options["images"] = []; }

        if (!array_key_exists("videos", $options)) { $options["videos"] = []; }
        if (!array_key_exists("loop", $options)) { $options["loop"] = false; }
        if (!array_key_exists("autoplay", $options)) { $options["autoplay"] = false; }
        if (!array_key_exists("muted", $options)) { $options["muted"] = true; }

        // IMAGES
        $options["images_landscape"] = [];
        $options["images_portrait"] = [];
        $options["images_fallback_url"] = $options["images"][0]["url"];

        foreach($options["images"] as &$image) {
            if (!array_key_exists("portrait", $image)) { $image["portrait"] = false; }
            if (!array_key_exists("fallback", $image)) { $image["fallback"] = false; }

            self::validateSourceAndAddAspectRatio($image);

            if ($image["portrait"]) {
                array_push($options["images_portrait"] , $image);
            } else {
                array_push($options["images_landscape"], $image);
            }

            if ($image["fallback"]) {
                $options["images_fallback_url"] = $image["url"];
            }
        }

        if (count($options["images"]) > 0) {
            $options["aspect_ratio"] = $options["images"][0]["aspect_ratio"];
            $options["aspect_ratio_padding"] = $options["images"][0]["aspect_ratio_padding"];
        }

        // VIDEOS

        foreach($options["videos"] as &$video) {
            self::validateSourceAndAddAspectRatio($video);
        }

        return $options;
    }

    private static function pasteAttributes($options) {
        $result = "";

        foreach($options["attributes"] as $key => $value) {
            $result = $result . " " . $key . "=\"" . $value . "\"";
        }

        return $result;
    }


    public static function put($options) {
        $options = self::prepareOptions($options);

        $mode = 'lazy-asset-mode-cover';
        if ($options["mode"] == self::MODE_CONTAIN) {
            $mode = 'lazy-asset-mode-contain';
        } else if ($options["mode"] == self::MODE_ASPECT_RATIO) {
            $mode = 'lazy-asset-mode-aspect-ratio';
        }

        $typeClass = 'lazy-asset-image';
        if (count($options["videos"]) > 0) { // This will be changed to lazy-asset-image dynamically if browser can't play video.
            $typeClass = 'lazy-asset-video';
        }

        ?>

        <div class="lazy-asset <?= $mode ?> <?php if ($options["autosizes"]): ?>lazy-asset-auto-sizes<?php endif; ?> <?= $options["classes"] ?> <?= $typeClass ?>" data-anim="<?php echo $options["animation"]; ?>"  data-aspect-ratio="<?= $options["aspect_ratio"] ?>" <?= self::pasteAttributes($options); ?>>
            <div class="lazy-asset-wrapper" <?php if ($options["mode"] == self::MODE_ASPECT_RATIO): ?>style="padding-bottom: <?= $options["aspect_ratio_padding"] ?>;"<?php endif; ?> >

                <?php if (count($options["images"]) > 0): ?>

                <picture>

                    <?php if (count($options["images_portrait"]) > 0): ?>
                    <source data-srcset="
                    <?php foreach($options["images_portrait"] as $image): ?>
                        <?= $image["url"] ?> <?= $image["width"]?>w,
                    <?php endforeach ?>
                    " media="(orientation: portrait)" <?php if (!$options["autosizes"]): ?>sizes="<?= $options["sizes"] ?>"<?php endif ?>>
                    <?php endif; ?>

                    <?php if (count($options["images_landscape"]) > 0): ?>
                    <source data-srcset="
                    <?php foreach($options["images_landscape"] as $image): ?>
                        <?= $image["url"] ?> <?= $image["width"] ?>w,
                    <?php endforeach ?>
                    " <?php if (!$options["autosizes"]): ?>sizes="<?= $options["sizes"] ?>"<?php endif ?>>
                    <?php endif; ?>

                    <img data-src="<?= $options["images"][0]["url"] ?>" data-fallback-src="<?= $options["images_fallback_url"] ?>" alt="<?= $options["alt"] ?>">
                </picture>

                <?php endif; ?>

                <?php if (count($options["videos"]) > 0): ?>

                <video playsinline <?php if ($options["loop"]): ?>loop<?php endif; ?> <?php if ($options["autoplay"]): ?>autoplay<?php endif; ?> <?php if ($options["muted"]): ?>muted<?php endif; ?>>
                    <?php foreach($options["videos"] as $video): ?>
                        <source data-src="<?= $video["url"] ?>">
                    <?php endforeach ?>
                </video>

                <?php endif; ?>

                <?= $options["extra_markup"]; ?>

            </div>
         </div>

         <?php

    }
}



