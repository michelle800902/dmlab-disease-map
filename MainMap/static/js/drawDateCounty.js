// Draw the county data on the map from start date to end date
function drawDateCounty(startTime, endTime) {

    if (playing == 1) { // User is playing the time line
        let maxDate;
        maxDate = findMaxDate(cdcDateData);
        getDateData(maxDate, maxDate);
        drawLegend(dateCountyData);
        playingMax = findMax(dateCountyData);
        playingMin = findMin(dateCountyData, playingMax);
    }
    // Get town data 
    getDateData(startTime, endTime);

    // Draw result on map
    drawChoropleth(dateCountyData);
    //drawResultMap(dateCountyData);

    // Change the date text in result box
    startDate = startTime;
    endDate = endTime;
    
    // Update the result box
    resultBoxOpen = 1;
    resultBox.update(resultBoxOpen, dateCountyData);
}

// Find the max value in data
function findMaxDate(data) {
    let max = 0, maxDate;
    for (var i = 0; i < data.length; i++) {
        if (parseInt(data[i].count) > max) {
            max = parseInt(data[i].count);
            maxDate = data[i].date;
        }
    }
    maxDate = formatDate(maxDate);
    return maxDate;
}

function getDateData(startTime, endTime) {
    // Initialize the dateCountyData
    boundaryDataInitialize(dateCountyData);

    // Store all date from start date to end date
    let dateInterval = [];
    
    // Store all date string into dateInterval
    if (startTime == endTime) { // If only one date
        dateInterval.push(startTime);
    }
    else {
        for (var i = 0; i < cdcDateData.length; i++) {
            if (parseInt(formatDate(cdcDateData[i].date).replace("-","").replace("-","")) >= parseInt(startTime.replace("-","").replace("-",""))) {
                for (var j = 0; i+j < cdcDateData.length; j++) {
                    dateInterval.push(formatDate(cdcDateData[i+j].date));
                    if (parseInt(formatDate(cdcDateData[i+j].date).replace("-","").replace("-","")) >= parseInt(endTime.replace("-","").replace("-",""))) 
                        break;
                }
                break;
            }
        }
    }

    if (mode == 0) { // search mode
        // Compute total date's county data from start date to end date
        for (var i = 0; i < cdcCountyTown.length; i++) {
            for (var n = 0; n < dateInterval.length; n++) {
                if (cdcCountyTown[i].date == dateInterval[n]) {
                    for (var j = 0; j < dateCountyData.features.length; j++) {
                        if (cdcCountyTown[i].county == dateCountyData.features[j].properties.C_Name) {
                            dateCountyData.features[j].properties.Data++;
                        }
                    }
                }
            }
        }
    }
    else { // simulate mode
        for (var i = 0; i < simulateData.length; i++) {
            for (var n = 0; n < dateInterval.length; n++) {
                if (simulateData[i].time == dateInterval[n]) {
                    for (var j = 0; j < dateCountyData.features.length; j++) {
                        //臺南縣和臺南市一起算
                        if (simulateData[i].city.substr(0, 2) == dateCountyData.features[j].properties.C_Name.substr(0, 2)) { 
                            dateCountyData.features[j].properties.Data += parseInt(simulateData[i].count);
                        }   
                    }
                }
            }
        }
    }
    
}
