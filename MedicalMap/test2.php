<?php
ini_set('display_errors', 1); 

// Database login information
$host = '172.16.8.68';
$port = '5432';
$dbname = 'NHIRD';
$user = 'deltadrc';
$password = 'deltadrc';

// Connet to our postgersql database
$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

// If connection ois error, then return it
if (!$conn) {
	echo "Not connected : " . pg_error();
	exit;
}

$yearArray = ["2012"];
$queryInput = "牙科";

$sql_hospital_array = array();
$sql_residence_array = array();
foreach ($yearArray as $year) {
    // Set sql statements for searching data by hospital place
    array_push($sql_hospital_array, 
                "SELECT hosb2012.area_no_h, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                        FROM r01_cd".$year." INNER JOIN hosb2012 
                        ON r01_cd".$year.".hosp_id = hosb2012.hosp_id");
    // Set sql statements for searching data by people residence
    array_push($sql_residence_array, 
                "SELECT r01_id2012.reg_zip_code_decode, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                    FROM r01_cd".$year." INNER JOIN r01_id2012 
                    ON r01_cd".$year.".id = r01_id2012.id");
}

for ($i = 0; $i < sizeof($yearArray); $i++) {
    $sql_hospital_array[$i] = $sql_hospital_array[$i]." WHERE func_type = '$queryInput';";
    $sql_residence_array[$i] = $sql_residence_array[$i]." WHERE func_type = '$queryInput';";
}


// Set sql statements for searching data by hospital place
//$sql_hospital = "SELECT r01_dd2012.id, r01_dd2012.seq_no, r01_dd2012.id_sex, hosb2012.area_no_h, r01_dd2012.id_birthday, r01_dd2012.appl_beg_date, r01_dd2012.appl_end_date, r01_dd2012.e_bed_day, r01_dd2012.s_bed_day
//                    FROM r01_dd2012 INNER JOIN hosb2012 
//                    ON r01_dd2012.hosp_id = hosb2012.hosp_id
//                    WHERE e_bed_day > 20 OR s_bed_day > 20 
//                    ORDER BY r01_dd2012.id, r01_dd2012.appl_beg_date, r01_dd2012.seq_no;";

// Send the query
if (!$response_hospital = pg_query($conn, $sql_hospital_array[0])) {
	echo "A query error occured.\n";
	exit;
}
if (!$response_residence = pg_query($conn, $sql_residence_array[0])) {
	echo "A query error occured.\n";
	exit;
}

// Echo the response
$count_hospital = 0;
while ($row = pg_fetch_row($response_hospital)) {
	echo "hospital ".$count_hospital.".[ ";
    foreach ($row as $item) {
        echo $item . " ";
    }
	echo "]<br>";
    $count_hospital++;
}
// echo "<br><br>";
// $count_residence = 0;
// while ($row = pg_fetch_row($response_residence)) {
// 	echo "residence ".$count_residence.".[ ";
//     foreach ($row as $item) {
//         echo $item . " ";
//     }
// 	echo "]<br>";
//     $count_residence++;
// }

?>