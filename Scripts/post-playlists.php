<?php
if(!empty($_POST['data'])){
    $data = $_POST['data'];
	$fname = "playlists.json"; //creates file name
    $dir = "../"; // karaoke's root directory
	$file = fopen($dir . "/" . $fname, 'w');//creates new file
	fwrite($file, $data);
	fclose($file);
}
?>