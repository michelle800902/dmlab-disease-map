function save_response_data(current_light_data){
    for( data of current_light_data.response_data ){
        if( !(data.id in all_response_data) ){
            all_response_data[data.id] = data;
        }
    }
    // console.log(all_response_data);
}

// Store count town in the data object
function countyTownObject(date, county, town) {
    this.date = date;
    this.county = county;
    this.town = town;
}

// Store date count in the data objet
function dateCountObject(date, count) {
    this.date = date;
    this.count = count;
}

// Store all date data in data object
function allDataObject(date, cdcCount, pttCount) {
    this.date = date;
    this.cdc = cdcCount;
    this.ptt = pttCount;
}

// Count data value which has the same key in data object
function countData(data) {
    let newObject = {};
    let result = [];

    for (i in data) {
        let item = data[i];
        if (item.date != undefined) {
            if (newObject[item.date] == undefined) newObject[item.date] = 0;
            newObject[item.date] += item.count;
        }
    }
    for (i in newObject) {
        result.push({"date": i, "count": newObject[i]});
    }

    return result;
}

// Count data value which has the same key in data object
function mergeDate(data) {
    let cdcObject = {}, pttObject = {}; // Count the cdc and ptt times by date
    let dateObject = {};                // Count the date times
    let result = [];                    // Store new object in result

    for (i in data) {
        let item = data[i];
        if (item.date != undefined) {
            if (cdcObject[item.date]  == undefined) cdcObject[item.date] = 0;
            if (pttObject[item.date]  == undefined) pttObject[item.date] = 0;
            if (dateObject[item.date] == undefined) dateObject[item.date]= 0;
            cdcObject[item.date] += item.cdc;
            pttObject[item.date] += item.ptt;
            dateObject[item.date]++;
        }
    }
    for (i in dateObject){
        result.push({"date": i, "cdc": cdcObject[i], "ptt": pttObject[i]});
    }

    return result;
}

// Parse the ajax response data
function parseData(response) {

    boundaryDataInitialize(countyBoundary); // Initialize the countyBoundary
    //boundaryDataInitialize(townBoundary);   // Initialize the townBoundary -> When adding town boundary filter

    cdcCountyTown = [];                  // Initial cdc county town array for drawing date choropleth
    cdcDateData = [], cdcMonthData = []; // Initial cdc date and month data array for drawing timeline
    pttDateData = [], pttMonthData = []; // Initial ptt date and month data array for drawing timeline
    allDateData = [], allMonthData = []; // Initial all date data which merge cdc and ptt array by date for drawing timeline

    // cdc data parsing
    let cdc_data = response.heatmap_data;
    let countyName, townName, cdc_date, cdc_month;

    for (var i = 0; i < cdc_data.length; i++) {
        countyName = changeName(cdc_data[i].loc.substr(0, 3)); // Get the county name of data
        townName   = changeName(cdc_data[i].loc.substr(3, 2)); // Get the town name of data

        cdc_date  = cdc_data[i].date.substr(0, 10);              // Get the date of each data
        cdc_month = cdc_data[i].date.substr(0, 7).concat("-01"); // Get the month of each data

        cdcCountyTown.push(new countyTownObject(cdc_date, countyName, townName)); // Store county town obect of each cdc data
        cdcDateData.push(new dateCountObject(cdc_date, 1));    // Store date data object into cdc date data
        cdcMonthData.push(new dateCountObject(cdc_month, 1));  // Store month data object into cdc month data
        allDateData.push(new allDataObject(cdc_date, 1, 0));   // Store cdc date data into all date data object
        allMonthData.push(new allDataObject(cdc_month, 1, 0)); // Store cdc month data into all month data object

        // Store data in countyBoundary
        for (var j = 0; j < countyBoundary.features.length; j++) {
            if (countyName == countyBoundary.features[j].properties.C_Name)
                countyBoundary.features[j].properties.Data++;
        }
        //Store data in townBoundary
        for (var j = 0; j < townBoundary.features.length; j++) {
            if (countyName == townBoundary.features[j].properties.C_Name &&
                townName == townBoundary.features[j].properties.T_Name.substr(0, 2))
                townBoundary.features[j].properties.Data++;
        }
    }

    // ptt data parsing
    let ptt_data = response.response_data;
    let ptt_date, ptt_month;

    for (var i = 0; i < ptt_data.length; i++) {
        ptt_date  = ptt_data[i].date.substr(0, 10);              // Get the date of each data
        ptt_month = ptt_data[i].date.substr(0, 7).concat("-01"); // Get the month of each data

        pttDateData.push(new dateCountObject(ptt_date, 1));    // Store date data object into ptt date data
        pttMonthData.push(new dateCountObject(ptt_month, 1));  // Store month data object into ptt month data
        allDateData.push(new allDataObject(ptt_date, 0, 1));   // Store ptt date data into all data object
        allMonthData.push(new allDataObject(ptt_month, 0, 1)); // Store ptt month data into all month data object
    }

    cdcDateData  = countData(cdcDateData);   // Count data which has the same date
    cdcDateData  = sortByDate(cdcDateData);  // Sort cdc date data by date value
    cdcMonthData = countData(cdcMonthData);  // Count data which has the same month
    cdcMonthData = sortByDate(cdcMonthData); // Sort cdc month data by month value

    pttDateData  = countData(pttDateData);   // Count data which has the same date
    pttDateData  = sortByDate(pttDateData);  // Sort ptt date data by date value
    pttMonthData = countData(pttMonthData);  // Count data which has the same month
    pttMonthData = sortByDate(pttMonthData); // Sort ptt month data by month value

    allDateData  = mergeDate(allDateData);   // Merge data which has the same date
    allDateData  = sortByDate(allDateData);  // Sort all date data by date value
    allMonthData = mergeDate(allMonthData);  // Merge data which has the same month
    allMonthData = sortByDate(allMonthData); // Sort all month data by month value

}


function parseSimulate(response) {
    simulateData = response;
    console.log("simulate data", simulateData);

    boundaryDataInitialize(countyBoundary); // Initialize the countyBoundary
      
    cdcDateData = [], cdcMonthData = [];
    allDateData = [], allMonthData = [];

    let countyName, count, date, month;

    for (var i = 0; i < response.length; i++) {
        countyName = response[i].city;
        count = parseInt(response[i].count);

        date  = response[i].time.substr(0, 10);              // Get the date of each data
        month = response[i].time.substr(0, 7).concat("-01"); // Get the month of each data

        cdcDateData.push(new dateCountObject(date, count));
        cdcMonthData.push(new dateCountObject(month, count));

        allDateData.push(new allDataObject(date, count, 0));   // Store cdc date data into all date data object
        allMonthData.push(new allDataObject(month, count, 0)); // Store cdc month data into all month data object

        // Store data in countyBoundary
        for (var j = 0; j < countyBoundary.features.length; j++) {
            if (countyName == countyBoundary.features[j].properties.C_Name) {
                countyBoundary.features[j].properties.Data = countyBoundary.features[j].properties.Data + count;
            }
        }
    }

    cdcDateData  = countData(cdcDateData);   // Count data which has the same date
    cdcDateData  = sortByDate(cdcDateData);  // Sort cdc date data by date value
    cdcMonthData = countData(cdcMonthData);  // Count data which has the same month
    cdcMonthData = sortByDate(cdcMonthData); // Sort cdc month data by month value
    
    allDateData  = mergeDate(allDateData);
    allDateData  = sortByDate(allDateData);
    allMonthData = mergeDate(allMonthData);
    allMonthData = sortByDate(allMonthData);

}

// Initialize the data in boundary.js
function boundaryDataInitialize(boundaryData) {
    for (var i = 0; i < boundaryData.features.length; i++) {
        boundaryData.features[i].properties.Data = 0;
    }
}

// Change "台" to "臺" in name word
function changeName(name) {
    name = name.replace("台", "臺");
    return name;
}

// Sort the date data by date value
function sortByDate(dateData) {
    dateData.sort(function(a, b) {
        // First, need to change the date string to integer (ex: 2012-01-07 to 20120107)
        // Then, sort then by ascending order
        return parseInt(a.date.replace("-","").replace("-","")) - parseInt(b.date.replace("-","").replace("-",""));
    });
    return dateData;
}
