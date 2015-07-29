<?php

	// randomly delay the response - max should be longer than request timeout 
	// to test timeout handling on the client side
	sleep(rand(0,8));

//	// break a specific caller
//	if ($_POST["name"] === 'two') {
//		 echo 'xa:sb:cz';
//		 return;
//	}

	$val = rand(0,9);

	// return invalid data
	if ($val == 9) {
		echo "adfdajajdfkj";
		return;
	}

	// return no data
	if ($val == 8) {
		return;
	}
	
	// return fail response code
    if ($val == 7) {
		http_response_code(404);
		return;
	}
	
	echo date("H:i:s");