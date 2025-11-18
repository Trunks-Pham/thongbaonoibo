<?php
header('Content-Type: application/json');

$dir = __DIR__;
$files = array_filter(scandir($dir), function($f) use ($dir) {
    $fullPath = $dir . DIRECTORY_SEPARATOR . $f;
    return is_file($fullPath) && 
           (substr($f, -4) === '.pdf' || substr($f, -5) === '.html');
});

$result = array_map(function($f) {
    return [
        'filename' => $f,
        'path' => '/notifications/' . urlencode($f)
    ];
}, array_values($files));

echo json_encode($result);