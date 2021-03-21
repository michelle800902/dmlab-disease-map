<?php
ini_set('display_errors', 1); 

// Database login information
$host = '172.16.8.101';
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

// Get the table name
$table = $_GET['tableName'];
// Get the table year
$yearArray = $_GET['tableYear'];
// Get the query type and user input
$queryType = $_GET['queryTypeData'];
$queryInput = $_GET['queryInputData'];

// // Get the initial town data
// $townData =  file_get_contents("town_data.json"); // Get the json string
// $townData = json_decode($townData, true); // Decode the json string to array

// Create array to store each year's sql statements
$sql_hospital = array();
$sql_residence = array();

// 門診治療檔 CD
if ($table == "r01_cd") {
    foreach ($yearArray as $year) {
        // Set sql statements for searching data by hospital place
        array_push($sql_hospital, 
                    "SELECT hosb2012.area_no_h, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                        FROM r01_cd".$year." INNER JOIN hosb2012 
                        ON r01_cd".$year.".hosp_id = hosb2012.hosp_id");
        // Set sql statements for searching data by people residence
        array_push($sql_residence, 
                    "SELECT r01_id2012.reg_zip_code_decode, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                        FROM r01_cd".$year." INNER JOIN r01_id2012 
                        ON r01_cd".$year.".id = r01_id2012.id");
    }
    // 查詢就醫科別
    if ($queryType == "FUNC_TYPE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE func_type = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE func_type = '$queryInput';";
        }
    }
    // 查詢主手術代碼
    else if ($queryType == "ICD_OP_CODE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE icd_op_code = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE icd_op_code = '$queryInput';";
        }
    }
    // 查詢國際疾病分類號
    else if ($queryType == "ACODE_ICD9") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE acode_icd9_1 LIKE '$queryInput%' OR acode_icd9_2 LIKE '$queryInput%' OR acode_icd9_3 LIKE '$queryInput%';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE acode_icd9_1 LIKE '$queryInput%' OR acode_icd9_2 LIKE '$queryInput%' OR acode_icd9_3 LIKE '$queryInput%';";
        }
    }
    // 查詢特定治療項目代號
    else if ($queryType == "CURE_ITEM") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]. " WHERE cure_item_no1 = '$queryInput' OR cure_item_no2 = '$queryInput' OR cure_item_no3 = '$queryInput' OR cure_item_no4 = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]. " WHERE cure_item_no1 = '$queryInput' OR cure_item_no2 = '$queryInput' OR cure_item_no3 = '$queryInput' OR cure_item_no4 = '$queryInput';";
        }
    }
}
// 住院費用檔 DD
else if ($table == "r01_dd") {
    foreach ($yearArray as $year) {
        // Set sql statements for searching data by hospital place
        array_push($sql_hospital, 
                    "SELECT hosb2012.area_no_h, r01_dd".$year.".id_sex, r01_dd".$year.".id_birthday, r01_dd".$year.".in_date 
                        FROM r01_dd".$year." INNER JOIN hosb2012 
                        ON r01_dd".$year.".hosp_id = hosb2012.hosp_id");
        // Set sql statements for searching data by people residence
        array_push($sql_residence, 
                    "SELECT r01_id2012.reg_zip_code_decode, r01_dd".$year.".id_sex, r01_dd".$year.".id_birthday, r01_dd".$year.".in_date 
                        FROM r01_dd".$year." INNER JOIN r01_id2012 
                        ON r01_dd".$year.".id = r01_id2012.id");
    }
    // 查詢就醫科別
    if ($queryType == "FUNC_TYPE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE func_type = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE func_type = '$queryInput';";
        }
    }
    // 查詢手術代碼
    else if ($queryType == "ICD_OP_CODE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            // $sql_hospital[$i] = $sql_hospital[$i]." WHERE icd_op_code_decode = '$queryInput' OR icd_op_code_1_decode = '$queryInput' OR icd_op_code_2_decode = '$queryInput' OR icd_op_code_3_decode = '$queryInput' OR icd_op_code_4_decode = '$queryInput';";
            // $sql_residence[$i] = $sql_residence[$i]." WHERE icd_op_code_decode = '$queryInput' OR icd_op_code_1_decode = '$queryInput' OR icd_op_code_2_decode = '$queryInput' OR icd_op_code_3_decode = '$queryInput' OR icd_op_code_4_decode = '$queryInput';";
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE icd_op_code = '$queryInput' OR icd_op_code_1 = '$queryInput' OR icd_op_code_2 = '$queryInput' OR icd_op_code_3 = '$queryInput' OR icd_op_code_4 = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE icd_op_code = '$queryInput' OR icd_op_code_1 = '$queryInput' OR icd_op_code_2 = '$queryInput' OR icd_op_code_3 = '$queryInput' OR icd_op_code_4 = '$queryInput';";
        }
    }
    // 查詢診斷代碼
    else if ($queryType == "ICD9CM_CODE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            // $sql_hospital[$i] = $sql_hospital[$i]." WHERE icd9cm_code_decode LIKE '$queryInput%' OR icd9cm_code_1_decode LIKE '$queryInput%' OR icd9cm_code_2_decode LIKE '$queryInput%' OR icd9cm_code_3_decode LIKE '$queryInput%' OR icd9cm_code_4_decode LIKE '$queryInput%';";
            // $sql_residence[$i] = $sql_residence[$i]." WHERE icd9cm_code_decode LIKE '$queryInput%' OR icd9cm_code_1_decode LIKE '$queryInput%' OR icd9cm_code_2_decode LIKE '$queryInput%' OR icd9cm_code_3_decode LIKE '$queryInput%' OR icd9cm_code_4_decode LIKE '$queryInput%';";
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE icd9cm_code LIKE '$queryInput%' OR icd9cm_code_1 LIKE '$queryInput%' OR icd9cm_code_2 LIKE '$queryInput%' OR icd9cm_code_3 LIKE '$queryInput%' OR icd9cm_code_4 LIKE '$queryInput%';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE icd9cm_code LIKE '$queryInput%' OR icd9cm_code_1 LIKE '$queryInput%' OR icd9cm_code_2 LIKE '$queryInput%' OR icd9cm_code_3 LIKE '$queryInput%' OR icd9cm_code_4 LIKE '$queryInput%';";
        }
    }
    // 查詢住院天數
    else if($queryType == "BED_DAY") {
        $dayInput = explode("-", $queryInput);
        $fromDayInput = $dayInput[0];
        $toDayInput = $dayInput[1];
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE '$fromDayInput' <= e_bed_day AND e_bed_day <= '$toDayInput' OR '$fromDayInput' <= s_bed_day AND s_bed_day<= '$toDayInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE '$fromDayInput' <= e_bed_day AND e_bed_day <= '$toDayInput' OR '$fromDayInput' <= s_bed_day AND s_bed_day <= '$toDayInput';";
        }
    }   
}
// 門診醫令檔 OO
else if ($table == "r01_oo") {
    foreach ($yearArray as $year) {
        // Set sql statements for searching data by hospital place
        array_push($sql_hospital, 
                    "SELECT hosb2012.area_no_h, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                        FROM r01_oo".$year." INNER JOIN r01_cd".$year."
                        ON r01_oo".$year.".seq_no = r01_cd".$year.".seq_no INNER JOIN hosb2012 
                        ON r01_cd".$year.".hosp_id = hosb2012.hosp_id");
        // Set sql statements for searching data by people residence
        array_push($sql_residence, 
                    "SELECT r01_id2012.reg_zip_code_decode, r01_cd".$year.".id_sex, r01_cd".$year.".id_birthday, r01_cd".$year.".func_date 
                        FROM r01_oo".$year." INNER JOIN r01_cd".$year." 
                        ON r01_oo".$year.".seq_no = r01_cd".$year.".seq_no INNER JOIN r01_id2012 
                        ON r01_cd".$year.".id = r01_id2012.id");
    }
    // 查詢醫令類別
    if ($queryType == "ORDER_TYPE") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE order_type = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE order_type = '$queryInput';";
        }
    }
    // 查詢醫令代碼
    else if ($queryType == "DRUG_NO") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE drug_no = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE drug_no = '$queryInput';";
        }
    }
}
// 住院醫令檔 DO
else if ($table == "r01_do") {
    foreach ($yearArray as $year) {
        // Set sql statements for searching data by hospital place
        array_push($sql_hospital, 
                    "SELECT hosb2012.area_no_h, r01_dd".$year.".id_sex, r01_dd".$year.".id_birthday, r01_dd".$year.".in_date 
                        FROM r01_do".$year." INNER JOIN r01_dd".$year."
                        ON r01_do".$year.".seq_no = r01_dd".$year.".seq_no INNER JOIN hosb2012 
                        ON r01_dd".$year.".hosp_id = hosb2012.hosp_id");
        // Set sql statements for searching data by people residence
        array_push($sql_residence, 
                    "SELECT r01_id2012.reg_zip_code_decode, r01_dd".$year.".id_sex, r01_dd".$year.".id_birthday, r01_dd".$year.".in_date 
                        FROM r01_do".$year." INNER JOIN r01_dd".$year." 
                        ON r01_do".$year.".seq_no = r01_dd".$year.".seq_no INNER JOIN r01_id2012 
                        ON r01_dd".$year.".id = r01_id2012.id");
    }
    // 查詢醫令類別
    if ($queryType == "ORDER_TYPE") {   
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE order_type = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE order_type = '$queryInput';";
        }
    }
    // 查詢醫令代碼
    else if ($queryType == "DRUG_NO") {
        for ($i = 0; $i < sizeof($yearArray); $i++) {
            $sql_hospital[$i] = $sql_hospital[$i]." WHERE drug_no = '$queryInput';";
            $sql_residence[$i] = $sql_residence[$i]." WHERE drug_no = '$queryInput';";
        }
    }
}

// Send the query
for ($i = 0; $i < sizeof($yearArray); $i++) {
    if (!$response_hospital[$i] = pg_query($conn, $sql_hospital[$i])) {
        echo "A query error occured.\n";
        exit;
    }
    if (!$response_residence[$i] = pg_query($conn, $sql_residence[$i])) {
        echo "A query error occured.\n";
        exit;
    }
}

// Echo the response
for ($i = 0; $i < sizeof($yearArray); $i++) {
    while ($row = pg_fetch_row($response_hospital[$i])) {
        foreach ($row as $item) {
            echo $item . " ";
        }
    }
}
echo ".";
for ($i = 0; $i < sizeof($yearArray); $i++) {
    while ($row = pg_fetch_row($response_residence[$i])) {
        foreach ($row as $item) {
            echo $item . " ";
        }
    }
}

?>