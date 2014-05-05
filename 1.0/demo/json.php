<?php
header('Content-Type: text/plain');
header("Cache-Control: no-cache, must-revalidate");
//A date in the past
header("Expires: ".gmdate(DATE_RFC822) );

$name = $_REQUEST[ 'name' ];
// $callback = $_GET["callback"];  
// $a = array(  
//     'name'=>'wind'
// );  
// $result = json_encode($a);  
// echo $callback."(".$result.")";  
// exit;

if( $name !== 'wind'){
	echo 'no';
}else{
	echo 'ok';
}
exit;

?>