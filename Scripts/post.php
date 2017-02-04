<?php
if(!empty($_POST['data'])){
    $data = $_POST['data'];
    $json_obj = json_decode($data);
    $json_obj->title = str_replace(':', '-', $json_obj->title);
    $json_obj->book->title = str_replace(':', '-', $json_obj->book->title);
	$fname = $json_obj->title . ".json";//creates file name
    if($json_obj->book->title != '') { // If the song has been assigned to a book
        $dir = "../library/" . $json_obj->book->title;
        if (!file_exists($dir)) { // Create the book directory if it does not yet exist
            mkdir($dir, 0777, true);
        }
    }
    else { // Otherwise save in the root library folder
        $dir = "../library";
    }
	$file = fopen($dir . "/" . $fname, 'w');//creates new file
	fwrite($file, $data);
	fclose($file);
}
?>