// Draw the town data on the map from start date to end date
function drawDateTown(startDate, endDate) {
    if (playing == 1) { // User is playing the time line
        var maxDate = findMaxDate(hospitalDateData);
        console.log("Max Date: ",maxDate);
        getDateTownData(maxDate, maxDate);
        getBoundary(dateTownData);
        drawLegend(countyBoundary);
        playingMax = findMax(countyBoundary);
        playingMin = findMin(countyBoundary, playingMax);
    }
    // Get town data 
    getDateTownData(startDate, endDate);
    // Draw result on map
    drawResultMap(dateTownData);
    // Store the date text
    if (startDate == endDate) dateText = " ("+startDate+")";
    else dateText = "<br>("+startDate+"~"+endDate+")";
    // Update the result box
    resultBox.update(1);
}

// Find the max value in data
function findMaxDate(data) {
    var max = 0, maxDate;
    for (var i = 0; i < data.length; i++) {
        if (parseInt(data[i].y) > max) {
            max = parseInt(data[i].y);
            maxDate = data[i].x;
        }
    }
    maxDate = formatDate(maxDate);
    return maxDate;
}

function getDateTownData(startDate, endDate) {
    //console.log("Start:"+startDate,"End:"+endDate);
    // Initialize dateTownData.js
    dateTownDataInitialize();
    
    // Store all date from startDate to endDate
    var dateInterval = [];
    
    // Store all date string into dateInterval
    if (startDate == endDate) { // If only one date
        dateInterval.push(startDate);
    }
    else {
        for (var i = 0; i < hospitalDateData.length; i++) {
            if (parseInt(formatDate(hospitalDateData[i].x).replace("-","").replace("-","")) >= parseInt(startDate.replace("-","").replace("-",""))) {
                for (var j = 0; i+j < hospitalDateData.length; j++) {
                    dateInterval.push(formatDate(hospitalDateData[i+j].x));
                    if (parseInt(formatDate(hospitalDateData[i+j].x).replace("-","").replace("-","")) >= parseInt(endDate.replace("-","").replace("-",""))) break;
                }
                break;
            }
        }
    }

    // Compute total date's town data from startDate to endDate
    for (var i = 0; i < hospitalPeople.length; i++) {
        for (var n = 0; n < dateInterval.length; n++) {
            if (hospitalPeople[i].date == dateInterval[n]) {
                for (var j = 0; j < dateTownData.length; j++) {
                    //console.log("0",hospitalPeople[i].county, dateTownData[j].County_Name, hospitalPeople[i].town, dateTownData[j].Town_Name.substr(0, 2));
                    if (hospitalPeople[i].county == "臺南市") {
                        if (hospitalPeople[i].town == "中區" || hospitalPeople[i].town == "西區") hospitalPeople[i].town = "中西";
                    }
                    if (hospitalPeople[i].county == dateTownData[j].County_Name && 
                        hospitalPeople[i].town == dateTownData[j].Town_Name.substr(0, 2)) {
                        // Store data by all year
                        //console.log(hospitalPeople[i].county, dateTownData[j].County_Name, hospitalPeople[i].town, dateTownData[j].Town_Name.substr(0, 2));
                        dateTownData[j].Hospital_Total_Data++;
                        
                        if (hospitalPeople[i].gender == "男") {
                            dateTownData[j].Hospital_Male_People++;
                            if (dateTownData[j].Hospital_Male_Age == 0) {
                                dateTownData[j].Hospital_Male_Age = hospitalPeople[i].age;
                            }
                            else {
                                dateTownData[j].Hospital_Male_Age = parseInt((dateTownData[j].Hospital_Male_Age + hospitalPeople[i].age) / 2);
                            }
                            if (hospitalPeople[i].ageRange == 1) {
                                dateTownData[j].Hospital_Male_Age1_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 2) {
                                dateTownData[j].Hospital_Male_Age2_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 3) {
                                dateTownData[j].Hospital_Male_Age3_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 4) {
                                dateTownData[j].Hospital_Male_Age4_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 5) {
                                dateTownData[j].Hospital_Male_Age5_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 6) {
                                dateTownData[j].Hospital_Male_Age6_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 7) {
                                dateTownData[j].Hospital_Male_Age7_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 8) {
                                dateTownData[j].Hospital_Male_Age8_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 9) {
                                dateTownData[j].Hospital_Male_Age9_People++;
                            }
                            break;
                        }
                        else if (hospitalPeople[i].gender == "女") {
                            dateTownData[j].Hospital_Female_People++;

                            if (dateTownData[j].Hospital_Female_Age == 0) {
                                dateTownData[j].Hospital_Female_Age = hospitalPeople[i].age;
                            }
                            else {
                                dateTownData[j].Hospital_Female_Age = parseInt((dateTownData[j].Hospital_Female_Age + hospitalPeople[i].age) / 2);
                            }

                            if (hospitalPeople[i].ageRange == 1) {
                                dateTownData[j].Hospital_Female_Age1_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 2) {
                                dateTownData[j].Hospital_Female_Age2_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 3) {
                                dateTownData[j].Hospital_Female_Age3_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 4) {
                                dateTownData[j].Hospital_Female_Age4_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 5) {
                                dateTownData[j].Hospital_Female_Age5_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 6) {
                                dateTownData[j].Hospital_Female_Age6_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 7) {
                                dateTownData[j].Hospital_Female_Age7_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 8) {
                                dateTownData[j].Hospital_Female_Age8_People++;
                            }
                            else if (hospitalPeople[i].ageRange == 9) {
                                dateTownData[j].Hospital_Female_Age9_People++;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}