<?php
	
	function resize_image($file, $x, $y, $w, $h) {
		list($width, $height) = getimagesize($file);
		
		$content = file_get_contents($file);
		$src = @imagecreatefromstring($content);
		$dst = imagecreatetruecolor($w * $width, $h * $height);
		
		imagecopyresized($dst, $src, 0, 0, $width * $x, $height * $y, $width, $height, $width, $height);
		
		return $dst;		
	}

	
	$path = "toto.png";
	$content = file_get_contents($path);	
	$resized = resize_image($path, 0.23, 0.19, 0.53, 0.5);

	//imagejpeg($resized);

	
?>