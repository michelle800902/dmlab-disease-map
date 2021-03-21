// Parse response data, and then store as data objects
function parseResponse(response) {
    // Initialize the townData.js to store new response data
    townDataInitialize();

    // Initialize the date data
    hospitalPeople = [], hospitalDateData = [], residencePeople = [], residenceDateData = [];

    // Split response text to two parts by "."
    var responseData = response.split(".");

    // Front part of response is hospital data, other part is residence data
    var hospitalData = responseData[0].split(" "), residenceData = responseData[1].split(" ");

    // Store hospital data in townData.js
    for (var i = 0; i < hospitalData.length - 1; i = i + 4) {
        // ex: 臺北縣蘆洲鄉 男 1978-01-01 2012-01-07
        var countyName = changeCountyName(hospitalData[i].substr(0, 3)); // First 3 word in data[i] is county name (ex: 臺北縣), then change the old county name to new one
        var townName = changeTownName(hospitalData[i].substr(3, 2)); // After first 3 word in data[i] is town name (ex: 蘆洲)
        var gender = hospitalData[i + 1]; // Word in data[i+1] is gender (ex: 男)
        var birthYear = hospitalData[i + 2].substr(0, 4); // First 4 numbers in data[i+2] is birthday year (ex: 1978)
        var age = 2016 - parseInt(birthYear); // Compute the age by bitrhday year
        var ageRange = getAgeRange(age); // Get the range of age
        var date = hospitalData[i + 3]; // Get the date string (ex: 2012-01-07)
        var dateYear = parseInt(date.substr(0,4)); // Get the year in date (ex: 2012)
        var dateMonth = parseInt(date.substr(5, 2)); // Get the month in date (ex: 01)

        // Push this data in hospitalPeople object
        hospitalPeople.push({county: countyName, 
                            town: townName, 
                            gender: gender, 
                            birthYear: birthYear,
                            age: age, 
                            ageRange: ageRange, 
                            date: date});
        
        // Compute the total number of data by different date
        if(!(dateYear < year[0])) {
            computeTotal(hospitalDateData, date, 1);
        }
        // Count data
        for (var j = 0; j < townData.length; j++) {
            if (countyName == townData[j].County_Name && townName == townData[j].Town_Name.substr(0, 2)) {
                // Store data by all year
                townData[j].Hospital_Total_Data++;

                if (gender == "男") {
                    townData[j].Hospital_Male_People++;
                    townData[j].Hospital_Male_Age = townData[j].Hospital_Male_Age + age;

                    if (ageRange == 1) {
                        townData[j].Hospital_Male_Age1_People++;
                    }
                    else if (ageRange == 2) {
                        townData[j].Hospital_Male_Age2_People++;
                    }
                    else if (ageRange == 3) {
                        townData[j].Hospital_Male_Age3_People++;
                    }
                    else if (ageRange == 4) {
                        townData[j].Hospital_Male_Age4_People++;
                    }
                    else if (ageRange == 5) {
                        townData[j].Hospital_Male_Age5_People++;
                    }
                    else if (ageRange == 6) {
                        townData[j].Hospital_Male_Age6_People++;
                    }
                    else if (ageRange == 7) {
                        townData[j].Hospital_Male_Age7_People++;
                    }
                    else if (ageRange == 8) {
                        townData[j].Hospital_Male_Age8_People++;
                    }
                    else if (ageRange == 9) {
                        townData[j].Hospital_Male_Age9_People++;
                    }
                    break;
                }
                else if (gender == "女") {
                    townData[j].Hospital_Female_People++;
                    townData[j].Hospital_Female_Age = townData[j].Hospital_Female_Age + age;

                    if (ageRange == 1) {
                        townData[j].Hospital_Female_Age1_People++;
                    }
                    else if (ageRange == 2) {
                        townData[j].Hospital_Female_Age2_People++;
                    }
                    else if (ageRange == 3) {
                        townData[j].Hospital_Female_Age3_People++;
                    }
                    else if (ageRange == 4) {
                        townData[j].Hospital_Female_Age4_People++;
                    }
                    else if (ageRange == 5) {
                        townData[j].Hospital_Female_Age5_People++;
                    }
                    else if (ageRange == 6) {
                        townData[j].Hospital_Female_Age6_People++;
                    }
                    else if (ageRange == 7) {
                        townData[j].Hospital_Female_Age7_People++;
                    }
                    else if (ageRange == 8) {
                        townData[j].Hospital_Female_Age8_People++;
                    }
                    else if (ageRange == 9) {
                        townData[j].Hospital_Female_Age9_People++;
                    }
                    break;
                }
            }
        }
    }
    // Sort data by date value
    hospitalDateData.sort(function(a, b) {
        // First, need to change the date string to integer (ex: 2012-01-07 to 20120107)
        // Then, sort then by ascending order
        return parseInt(a.x.replace("-","").replace("-","")) - parseInt(b.x.replace("-","").replace("-",""));
    });

    // Store residence data in townData.js
    for (var i = 0; i < residenceData.length - 1; i = i + 4) {
        // ex: 臺北縣蘆洲鄉 男 1978-01-01
        var countyName = changeCountyName(residenceData[i].substr(0, 3)); // First 3 word in data[i] is county name (ex: 臺北縣), then change the old county name to new one
        var townName = changeTownName(residenceData[i].substr(3, 2)); // After first 3 word in data[i] is town name (ex: 蘆洲)
        var gender = residenceData[i + 1]; // Word in data[i+1] is gender (ex: 男)
        var birthYear = residenceData[i + 2].substr(0, 4); // First 4 numbers in data[i+2] is birthday year (ex: 1978)
        var age = 2016 - parseInt(birthYear); // Compute the age by bitrhday year
        var ageRange = getAgeRange(age); // Get the range of age
        var date = residenceData[i + 3]; // Get the date string (ex: 2012-01-07)
        var dateYear = parseInt(date.substr(0,4)); // Get the year in date (ex: 2012)
        var dateMonth = parseInt(date.substr(5, 2)); // Get the month in date (ex: 01)

        // Push this data in hospitalPeople object
        residencePeople.push({county: countyName, 
                            town: townName, 
                            gender: gender, 
                            birthYear: birthYear,
                            age: age, 
                            ageRange: ageRange, 
                            date: date});
        
        // Compute the total number of data by different date
        if(!(dateYear < year[0])) {
            computeTotal(residenceDateData, date, 1);
        }

        // Count data 
        for (var j = 0; j < townData.length; j++) {
            if (countyName == townData[j].County_Name && townName == townData[j].Town_Name.substr(0, 2)) {
                // Store data by all year
                townData[j].Residence_Total_Data++;

                if (gender == "男") {
                    townData[j].Residence_Male_People++;
                    townData[j].Residence_Male_Age = townData[j].Residence_Male_Age + age;

                    if (ageRange == 1) {
                        townData[j].Residence_Male_Age1_People++;
                    }
                    else if (ageRange == 2) {
                        townData[j].Residence_Male_Age2_People++;
                    }
                    else if (ageRange == 3) {
                        townData[j].Residence_Male_Age3_People++;
                    }
                    else if (ageRange == 4) {
                        townData[j].Residence_Male_Age4_People++;
                    }
                    else if (ageRange == 5) {
                        townData[j].Residence_Male_Age5_People++;
                    }
                    else if (ageRange == 6) {
                        townData[j].Residence_Male_Age6_People++;
                    }
                    else if (ageRange == 7) {
                        townData[j].Residence_Male_Age7_People++;
                    }
                    else if (ageRange == 8) {
                        townData[j].Residence_Male_Age8_People++;
                    }
                    else if (ageRange == 9) {
                        townData[j].Residence_Male_Age9_People++;
                    }

                    break;
                }
                else if (gender == "女") {
                    townData[j].Residence_Female_People++;
                    townData[j].Residence_Female_Age = townData[j].Residence_Female_Age + age;

                    if (ageRange == 1) {
                        townData[j].Residence_Female_Age1_People++;
                    }
                    else if (ageRange == 2) {
                        townData[j].Residence_Female_Age2_People++;
                    }
                    else if (ageRange == 3) {
                        townData[j].Residence_Female_Age3_People++;
                    }
                    else if (ageRange == 4) {
                        townData[j].Residence_Female_Age4_People++;
                    }
                    else if (ageRange == 5) {
                        townData[j].Residence_Female_Age5_People++;
                    }
                    else if (ageRange == 6) {
                        townData[j].Residence_Female_Age6_People++;
                    }
                    else if (ageRange == 7) {
                        townData[j].Residence_Female_Age7_People++;
                    }
                    else if (ageRange == 8) {
                        townData[j].Residence_Female_Age8_People++;
                    }
                    else if (ageRange == 9) {
                        townData[j].Residence_Female_Age9_People++;
                    }
                    break;
                }
            }
        }
    }
    // Sort data by date value
    residenceDateData.sort(function(a, b) {
        // First, need to change the date string to integer (ex: 2012-01-07 to 20120107)
        // Then, sort then by ascending order
        return parseInt(a.x.replace("-","").replace("-","")) - parseInt(b.x.replace("-","").replace("-",""));
    });
}

// Get the range of age
function getAgeRange(age) {
    var range = parseInt(age / 10);
    if (age % 10 > 0) range = range + 1;
    if (range >= 9) range = 9;
    return range;
}

// Compute total data according different date or month or year
function computeTotal(data, x, y) {
    if (data.length == 0) { // Data is empty
        data.push({x: x, y: y});
        //console.log(x+": "+y);
    }
    else {
        var exist = 0; // Check this date exists or not
        for (var n = 0; n < data.length; n++) {
            if (data[n].x == x) { // Exist
                data[n].y = data[n].y + y; // data+1 in this date
                exist++; // This date exists
                //console.log("Repeat date "+x+": "+data[n].y);
                break;
            }
        }
        if (exist == 0) { // Not exist
            data.push({x: x, y: y});
            //console.log(x+": "+y);
        }
    }
}

// Generate month data by date data we had after parsing response
function generateData() {
    monthData = [];
    // yearData = [];
    for (var i = 0; i < hospitalDateData.length; i++) {
        var month = hospitalDateData[i].x.substr(0, 7), // ex:2012-01
            // year = hospitalDateData[i].x.substr(0, 4);  // ex:2012
        month = month.concat("-01");
        // year = year.concat("-01-01");
        computeTotal(monthData, month, hospitalDateData[i].y);
        // computeTotal(yearData, year, hospitalDateData[i].y);
    }
}

// Change the old county name to new one
function changeCountyName(countyName) {
    if (countyName == "臺北縣") countyName = "新北市";
    if (countyName == "桃園縣") countyName = "桃園市";
    if (countyName == "臺中縣") countyName = "臺中市";
    if (countyName == "臺南縣") countyName = "臺南市";
    if (countyName == "高雄縣") countyName = "高雄市";
    if (countyName == "台東縣") countyName = "臺東縣";
    return countyName;
}

// Change all 台 to 臺 in town name
function changeTownName(townName) {
    for (var i = 0; i < townData.length; i++) {
        if (townName[i] == "台") townName = townName.replace("台", "臺");
    }
    return townName;
}

// Store data in boundary by different filter selections
function getBoundary(data) {
 if (resultType == "hospital") {
        if (genderType == "all") {
            if (dataType == "data") {
                countyBoundary = hospitalCountyAllData(data);
                townBoundary = hospitalTownAllData(data);
            }
            else if (dataType == "age") {
                countyBoundary = hospitalCountyAllAge(data);
                townBoundary = hospitalTownAllAge(data);
            }
        }
        else if (genderType == "male") {
            if (dataType == "data") {
                countyBoundary = hospitalCountyMaleData(data);
                townBoundary = hospitalTownMaleData(data);
            }
            else if (dataType == "age") {
                countyBoundary = hospitalCountyMaleAge(data);
                townBoundary = hospitalTownMaleAge(data);
            }
        }
        else if (genderType == "female") {
            if (dataType == "data") {
                countyBoundary = hospitalCountyFemaleData(data);
                townBoundary = hospitalTownFemaleData(data);
            }
            else if (dataType == "age") {
                countyBoundary = hospitalCountyFemaleAge(data);
                townBoundary = hospitalTownFemaleAge(data);
            }
        }
    }
    else if (resultType == "residence") {
        if (genderType == "all") {
            if (dataType == "data") {
                countyBoundary = residenceCountyAllData(data);
                townBoundary = residenceTownAllData(data);
            }
            else if (dataType == "age") {
                countyBoundary = residenceCountyAllAge(data);
                townBoundary = residenceTownAllAge(data);
            }
        }
        else if (genderType == "male") {
            if (dataType == "data") {
                countyBoundary = residenceCountyMaleData(data);
                townBoundary = residenceTownMaleData(data);
            }
            else if (dataType == "age") {
                countyBoundary = residenceCountyMaleAge(data);
                townBoundary = residenceTownMaleAge(data);
            }
        }
        else if (genderType == "female") {
            if (dataType == "data") {
                countyBoundary = residenceCountyFemaleData(data);
                townBoundary = residenceTownFemaleData(data);
            }
            else if (dataType == "age") {
                countyBoundary = residenceCountyFemaleAge(data);
                townBoundary = residenceTownFemaleAge(data);
            }
        }
    }
}

// Return the countyBoundary which stored all of hospital county data
function hospitalCountyAllData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Total_Data != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Hospital_Total_Data;
                    //console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored male of hospital county data
function hospitalCountyMaleData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Male_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Hospital_Male_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored female of hospital county data
function hospitalCountyFemaleData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Female_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Hospital_Female_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored average age of hospital county data
function hospitalCountyAllAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Total_Data != 0) {
            var totalAge = data[i].Hospital_Male_Age + data[i].Hospital_Female_Age;
            var totalPeople = data[i].Hospital_Male_People + data[i].Hospital_Female_People;
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + totalAge;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + totalPeople;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the countyBoundary which stored male age of hospital county data
function hospitalCountyMaleAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Male_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + data[i].Hospital_Male_Age;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + data[i].Hospital_Male_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the countyBoundary which stored female age of hospital county data
function hospitalCountyFemaleAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store hospital count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Female_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + data[i].Hospital_Female_Age;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + data[i].Hospital_Female_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the countyBoundary which stored all of residence county data
function residenceCountyAllData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Total_Data != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Residence_Total_Data;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored male of residence county data
function residenceCountyMaleData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Male_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Residence_Male_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored female of residence county data
function residenceCountyFemaleData(data) {
    // Initialize the countyBoundary
    boundaryDataInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Female_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + data[i].Residence_Female_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    return countyBoundary;
}

// Return the countyBoundary which stored average age of residence county data
function residenceCountyAllAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Total_Data != 0) {
            var totalAge = data[i].Residence_Male_Age + data[i].Residence_Female_Age;
            var totalPeople = data[i].Residence_Male_People + data[i].Residence_Female_People;
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + totalAge;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + totalPeople;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the countyBoundary which stored male age of residence county data
function residenceCountyMaleAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Male_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + data[i].Residence_Male_Age;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + data[i].Residence_Male_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the countyBoundary which stored female age of residence county data
function residenceCountyFemaleAge(data) {
    // Initialize the countyBoundary
    boundaryAgeInitialize(countyBoundary);
    // Store residence count result as a county boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Female_People != 0) {
            for (var j = 0; j < countyBoundary.features.length; j++) {
                if (data[i].County_Name == countyBoundary.features[j].properties.C_Name) {
                    // Change value where the key is "Data" in countyBoundary
                    countyBoundary.features[j].properties.Data[0] = countyBoundary.features[j].properties.Data[0] + data[i].Residence_Female_Age;
                    countyBoundary.features[j].properties.Data[1] = countyBoundary.features[j].properties.Data[1] + data[i].Residence_Female_People;
                    console.log(countyBoundary.features[j].properties.C_Name + countyBoundary.features[j].properties.Data);
                    break;
                }
            }
        }
    }
    // Average the age of all people
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data[1] > 0) {
            countyBoundary.features[i].properties.Data = (countyBoundary.features[i].properties.Data[0] / countyBoundary.features[i].properties.Data[1]).toFixed(1);
            console.log(countyBoundary.features[i].properties.C_Name + countyBoundary.features[i].properties.Data);
        }
        else
            countyBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return countyBoundary;
}

// Return the townBoundary which stored all of hospital county data
function hospitalTownAllData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Hospital_Total_Data;
    }
    return townBoundary;
}

// Return the townBoundary which stored male of hospital county data
function hospitalTownMaleData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Hospital_Male_People;
    }
    return townBoundary;
}

// Return the townBoundary which stored female of hospital county data
function hospitalTownFemaleData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Hospital_Female_People;
    }
    return townBoundary;
}

// Return the townBoundary which stored average age of hospital county data
function hospitalTownAllAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        var totalAge = data[i].Hospital_Male_Age + data[i].Hospital_Female_Age;
        var totalPeople = data[i].Hospital_Male_People + data[i].Hospital_Female_People;
        if (totalPeople > 0)
            townBoundary.features[i].properties.Data = (totalAge / totalPeople).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Return the townBoundary which stored male age of hospital county data
function hospitalTownMaleAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Male_People > 0)
            townBoundary.features[i].properties.Data = (data[i].Hospital_Male_Age / data[i].Hospital_Male_People).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Return the townBoundary which stored female age of hospital county data
function hospitalTownFemaleAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store hospital count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Hospital_Female_People > 0)
            townBoundary.features[i].properties.Data = (data[i].Hospital_Female_Age / data[i].Hospital_Female_People).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Return the townBoundary which stored all of residence county data
function residenceTownAllData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Residence_Total_Data;
    }
    return townBoundary;
}

// Return the townBoundary which stored male of residence county data
function residenceTownMaleData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Residence_Male_People;
    }
    return townBoundary;
}

// Return the townBoundary which stored female of residence county data
function residenceTownFemaleData(data) {
    // Initialize the townBoundary
    boundaryDataInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        townBoundary.features[i].properties.Data = data[i].Residence_Female_People;
    }
    return townBoundary;
}

// Return the townBoundary which stored average age of residence county data
function residenceTownAllAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        var totalAge = data[i].Residence_Male_Age + data[i].Residence_Female_Age;
        var totalPeople = data[i].Residence_Male_People + data[i].Residence_Female_People;
        if (totalPeople > 0) 
            townBoundary.features[i].properties.Data = (totalAge / totalPeople).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Return the townBoundary which stored male age of residence county data
function residenceTownMaleAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Male_People > 0)
            townBoundary.features[i].properties.Data = (data[i].Residence_Male_Age / data[i].Residence_Male_People).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Return the townBoundary which stored female age of residence county data
function residenceTownFemaleAge(data) {
    // Initialize the townBoundary
    boundaryAgeInitialize(townBoundary);
    // Store residence count result as a town boundary format
    for (var i = 0; i < data.length; i++) {
        if (data[i].Residence_Female_People > 0)
            townBoundary.features[i].properties.Data = (data[i].Residence_Female_Age / data[i].Residence_Female_People).toFixed(1);
        else
            townBoundary.features[i].properties.Data = (0).toFixed(1);
    }
    return townBoundary;
}

// Initialize the townData.js
function townDataInitialize() {
    for (var i = 0; i < townData.length; i++) {
        for (var j in townData[i]) {
            if (townData[i].hasOwnProperty(j) && typeof (townData[i][j]) == "number")
                townData[i][j] = 0;
        }
    }
}

// Initialize the dateTownData.js
function dateTownDataInitialize() {
    for (var i = 0; i < dateTownData.length; i++) {
        for (var j in dateTownData[i]) {
            if (dateTownData[i].hasOwnProperty(j) && typeof (dateTownData[i][j]) == "number")
                dateTownData[i][j] = 0;
        }
    }
}

// Initialize the data in boundary.js
function boundaryDataInitialize(boundaryData) {
    for (var i = 0; i < boundaryData.features.length; i++) {
        boundaryData.features[i].properties.Data = 0;
    }
}

// Initialize the age in boundary.js
function boundaryAgeInitialize(boundaryData) {
    for (var i = 0; i < boundaryData.features.length; i++) {
        boundaryData.features[i].properties.Data = [0, 0];
    }
}