/********************************************* main.js ********************************************/
/** This javaScript file contains the main functions of map visualization on medical data:       **/
/** 1. Connect postgres database in php file, and get php response data by jQuery ajax           **/
/** 2. Parse data and then store in JSON format                                                  **/
/** 3. Create interactive user interface and map layer using Leaflet.js                          **/
/** 4. Create timeline and result tree for data visualization by D3.js                           **/
/**************************************************************************************************/

/******************************** Initialize all public variables *********************************/

// Query variables to store user selections
var diseaseType = "flu", // Store checked type of radio buttons
    disease = ["流感"],         // Store disease string of checked type
    startDate = "2011-01-01",  // Store start date of date picker
    endDate = "2016-12-31",    // Store end date of date picker
    boundaryType = "county";   // Store boundary by county or town of Taiwan

// Store cdc and ptt data count by date and month
var cdcCountyTown = [],
    cdcDateData = [], cdcMonthData = [],
    pttDateData = [], pttMonthData = [],
    allDateData = [], allMonthData = [],
    simulateData = [];

// Related to cluster marker data
var current_light_data = {};
var all_response_data = {};
var all_markers_by_date = {};
//var all_markers_by_leafletid = {};
var marker_cluster = null;
var bar = null;

// Clustering circle
var clusterCircle;
var current_clusterCircle = [];

// User is searching or not
var searching = 0; // 0 is not searching
// User is playing the time line or not
var playing = 0;   // 0 is not playing
// Store the max and min values in legend when user is playing the time line
var playingMax = 0, playingMin = 0;
// Search mode or simulate mode
var mode = 0; // 0 is search mode

// D3 functions for parsing the time format using in drawTimeLine and drawDateTown
var parseDate   = d3.time.format("%Y-%m-%d").parse,
    parseMonth  = d3.time.format("%Y-%m").parse,
    parseYear   = d3.time.format("%Y").parse,
    formatDate  = d3.time.format("%Y-%m-%d"),
    formatMonth = d3.time.format("%Y-%m"),
    formatYear  = d3.time.format("%Y"),
    bisectDate  = d3.bisector(function(d) { return d.date; }).left;


/************************** Put the map layer transfer control on the map *************************/

// Map layer links
var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    osmAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
    landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
    landAttribution = 'Map data &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
    positronUrl = 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
    positronAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> © CartoDB',
    mbxUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw",
    mbxAttribution = 'Map data &copy; <a href="http://mapbox.com">Mapbox</a>';

// Map tile layers, set their url links and min zoom size
var osmMap = L.tileLayer(osmUrl, { minZoom: 2, attribution: osmAttribution }),                             // OpenStrreMap layer
    landMap = L.tileLayer(landUrl, { minZoom: 2, attribution: landAttribution }),                          // Thunderforest Lanscape layer
    positronMap = L.tileLayer(positronUrl, { minZoom: 2, attribution: positronAttribution }),
    mbGrayMap = L.tileLayer(mbxUrl, { id: 'mapbox.light', minZoom: 2, attribution: mbxAttribution }),      // MapBox gray scale Layer
    mbStreetsMap = L.tileLayer(mbxUrl, { id: 'mapbox.streets', minZoom: 2, attribution: mbxAttribution }); // MapBox streets Layer

// Base maps layer, let user to select the maps
var baseMaps = {
    "Open Street Map": osmMap,
    "Landscape Map": landMap,
    "positron Map": positronMap,
    //"Mapbox Gray Scale": mbGrayMap,
    //"Mapbox Streets": mbStreetsMap
};

// Initialize the map
var map = L.map('map', {
    layers: [positronMap],      // Set the url link of map
    center: [23.6, 120.9], // Set the center position in window screen
    zoom: 8,               // Set the initial zoom size
    zoomControl: false     // Hide the zoom control in window screen
});

// Draw initial county boundary layer on the initial map
var choroplethLayer = L.geoJson(countyBoundary).addTo(map);

var overlayMaps = {};

// Put the scale one map
L.control.scale({ position: 'bottomright' }).addTo(map);

// Put the control of map layers
//L.control.layers(baseMaps, overlayMaps, { position: 'bottomright' }).addTo(map);


/******************************* Put the query input box on the map *******************************/

function startDatePicker() {
    $("#startDatePicker").datepicker({
        dateFormat:"yy-mm-dd",
        beforeShow: function(input, inst) {
            inst.dpDiv.css({
                marginTop: -input.offsetHeight + 'px',
                marginLeft: (input.offsetWidth+10) + 'px'
            });
        }
    });
    $("#startDatePicker").datepicker("setDate",new Date(2011,0,1));
}
function endDatePicker() {
    $("#endDatePicker").datepicker({
        dateFormat:"yy-mm-dd",
        beforeShow: function(input, inst) {
            inst.dpDiv.css({
                marginTop: -input.offsetHeight + 'px',
                marginLeft: (input.offsetWidth+10) + 'px'
            });
        }
    });
    $("#endDatePicker").datepicker("setDate",new Date(2016,11,31));
}

// Create a control of user input box
var inputBox = L.control({ position: 'topleft' });

// The situation of input box: close or open
var inputBoxOpen = 0; // Close

// Add a input box to get the user query
inputBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update(inputBoxOpen, "");
    return this._div;
};

// Update the input box
inputBox.update = function (inputBoxOpen, diseaseType) {
    // When input box is close
    if (inputBoxOpen == 0) this._div.innerHTML = '<div class="menuButton"><input type="button" id="menuButton"></div>';
    // When user open the input box
    else if (inputBoxOpen == 1) {
        this._div.innerHTML = '<div class="menuButton"><input type="button" id="menuButton">' +
        '<b style="font-size:16px; color:#777;"> 疾病與輿情地圖</b></div>';

        if (diseaseType == "dengue") { // 登革熱
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                    '<input type="radio" name="diseaseType" value="dengue" id="dengue" checked>' +
                    '<label for="dengue">登革熱</label> ' +
                    '<input type="radio" name="diseaseType" value="enterovirus" id="enterovirus">' +
                    '<label for="enterovirus">腸病毒</label><br>' +
                    '<input type="radio" name="diseaseType" value="flu" id="flu">' +
                    '<label for="flu">流感</label> ' +
                    '<input type="radio" name="diseaseType" value="a_type" id="a_type">' +
                    '<label for="a_type">Ａ型肝炎</label></div>');
        }
        else if (diseaseType == "enterovirus") { // 腸病毒
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                    '<input type="radio" name="diseaseType" value="dengue" id="dengue">' +
                    '<label for="dengue">登革熱</label> ' +
                    '<input type="radio" name="diseaseType" value="enterovirus" id="enterovirus" checked>' +
                    '<label for="enterovirus">腸病毒</label><br>' +
                    '<input type="radio" name="diseaseType" value="flu" id="flu">' +
                    '<label for="flu">流感</label> ' +
                    '<input type="radio" name="diseaseType" value="a_type" id="a_type">' +
                    '<label for="a_type">Ａ型肝炎</label></div>');
        }
        else if (diseaseType == "flu") { // 流感
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                    '<input type="radio" name="diseaseType" value="dengue" id="dengue">' +
                    '<label for="dengue">登革熱</label> ' +
                    '<input type="radio" name="diseaseType" value="enterovirus" id="enterovirus">' +
                    '<label for="enterovirus">腸病毒</label><br>' +
                    '<input type="radio" name="diseaseType" value="flu" id="flu" checked>' +
                    '<label for="flu">流感</label> ' +
                    '<input type="radio" name="diseaseType" value="a_type" id="a_type">' +
                    '<label for="a_type">Ａ型肝炎</label></div>');
        }
        else { // Ａ型肝炎
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                    '<input type="radio" name="diseaseType" value="dengue" id="dengue">' +
                    '<label for="dengue">登革熱</label> ' +
                    '<input type="radio" name="diseaseType" value="enterovirus" id="enterovirus">' +
                    '<label for="enterovirus">腸病毒</label><br>' +
                    '<input type="radio" name="diseaseType" value="flu" id="flu">' +
                    '<label for="flu">流感</label> ' +
                    '<input type="radio" name="diseaseType" value="a_type" id="a_type" checked>' +
                    '<label for="a_type">Ａ型肝炎</label></div>');
        }

        this._div.innerHTML = this._div.innerHTML.concat(
            '<div class="searchTime">' +
                '起始時間 <input type="text" id="startDatePicker" onclick="startDatePicker();"><br>'+
                '結束時間 <input type="text" id="endDatePicker" onclick="endDatePicker();">'+
            '</div>' +
            '<div class="searchButton">'+
                '<input type="button" id="searchButton" value="查詢" style="margin-left:50px;">'+
            '</div>');

        // Initialize date picker
        $(startDatePicker).click();
        $(endDatePicker).click();

        // Update the input box and refresh search
        refreshSearch();

        // Add a listener when user click the search menu button
        L.DomEvent.on(menuButton, 'click', function (e) {
            // Close
            inputBoxOpen = 0;
            inputBox.update(inputBoxOpen, "");

            // Add a listener when user click the search menu button
            L.DomEvent.on(menuButton, 'click', function (e) {
                // Open
                inputBoxOpen = 1;
                inputBox.update(inputBoxOpen, diseaseType);
            });
        });
    }
};

// Add the input box on map
inputBox.addTo(map);

// Disable dragging when user's cursor enters the element
inputBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
inputBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
});

// Add a listener when user click the search menu button
L.DomEvent.on(menuButton, 'click', function (e) {
    // Open
    inputBoxOpen = 1;
    inputBox.update(inputBoxOpen, diseaseType);
});

// Open the initial inputBox
// $(menuButton).click();
// ajax_data(disease, startDate, endDate);


// Update the input box and refresh search
function refreshSearch() {
    // Get the disease type in user selector now
    diseaseType = $('input:radio[name="diseaseType"]:checked').val();

    $('input:radio[name="diseaseType"]').change(function() {
        diseaseType = $('input:radio[name="diseaseType"]:checked').val();

        if (diseaseType == "dengue") disease = ["登革熱"];
        else if (diseaseType == "enterovirus") disease = ["腸病毒"];
        else if (diseaseType == "flu") disease = ["流感"];
        else if (diseaseType == "a_type") disease = ["A型肝炎"];

        console.log(diseaseType, disease);
    });

    // Add a listener when user click the search button
    L.DomEvent.on(searchButton, 'click', function (e) {
        playing = 0;
        playing_x_value = 0;
        d3.selectAll("#playLine").interrupt();
        d3.selectAll("#playLine").remove();
        d3.selectAll(".tooltip").style("display", "none"); // Hide the tooltip on time line
        
        startDate = formatDate($("#startDatePicker").datepicker("getDate"));
        endDate = formatDate($("#endDatePicker").datepicker("getDate"));
        console.log(startDate, endDate);

        // Get data by searching queries
        ajax_data(disease, startDate, endDate);
        removeClustering();
    });
}

// Load necessary data for markers using PHP (from database) after map is loaded and ready
function ajax_data(disease, startDate, endDate){
    // Loading page
    start_pg();
    // =================================================================
    $.ajax({
        // url: "assets/external/data.php",
        // url: "http://54.201.237.10/all_data2/",
        // url: "/all_data2/",
        url: "/all_light_data2/",
        data: {
            category: JSON.stringify(disease),
            start_time: new Date(startDate).getTime(),
            end_time: new Date(endDate).getTime()
        },
        // dataType: "json",
        dataType: "html",
        // contentType: "json",
        // method: "POST",
        method: "GET",
        xhr: refresh_pg,
        success: function(response){
            current_light_data = $.parseJSON(response);
            parseData(current_light_data);
            save_response_data(current_light_data);

            drawResultMap(countyBoundary);
            resultBoxOpen = 1;
            resultBox.update(resultBoxOpen, countyBoundary);

            mode = 0;
            drawTimeLine();

            init_marker_cluster();
            let end = new Date(startDate);
            end.setDate(end.getDate() + 31);
            refresh_marker(startDate,end);

            stop_pg();
        },
        error : function (jqXHR,exception) {
        // error : function (e) {
            // console.log(e);
            // console.log(e.error());
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}


// Check the search result is empty or not
function checkEmpty() {
    // Count the zero data times
    var count = 0;
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.Data == 0) {
            count++;
        }
    }
    // All results are zero, then alert to user
    if (count == countyBoundary.features.length) {
        console.log("Empty!");
        //alert("您查詢的內容無結果，請重新輸入!");
        return true;
    }
    else {
        // console.log("Not Empty!");
        return false;
    }
}


/*********************************** Put the time box on the map **********************************/

// Create a control that shows time box
var timeBox = L.control({ position: 'bottomleft' });

timeBox.onAdd = function (map) {
    // Value in time slider range
    var time = 1; // From first month January
    var timeText = document.getElementById("timeValue");

    this._div = L.DomUtil.create('div');
    this._div.innerHTML ='<div id="timeLine"></div>';

    return this._div;
}

// Add the time box on map
timeBox.addTo(map);

// Disable dragging when user's cursor enters the element
timeBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
timeBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
});


/********************************* Put the result box on the map **********************************/

// Create a control that shows result box
var resultBox = L.control({position: 'topright'});

// The situation of result box: close or open
var resultBoxOpen = 0; // Close
// When user click one date circle, result box will show the date text
var dateText = "";

resultBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update(resultBoxOpen);
    return this._div;
}

// Update the result box
resultBox.update = function (resultBoxOpen, boundaryData) {
    // When result box is close
    if(resultBoxOpen == 0) {
         this._div.innerHTML = '<div class="resultButton"><input type="button" id="resultButton"></div>';
    }
    // When user open the result box
    else if(resultBoxOpen == 1) {
        this._div.innerHTML = '<div class="resultButton"><input type="button" id="resultButton">'+
                                '<b style="font-size:16px; color:#777;"> CDC 資料總覽</b></div>'+
                                '<table class="fixed">'+
                                '<col width="40px" />'+
                                '<col width="200px" />'+
                                    '<tr><td><b>疾病: </b></td>'+
                                        '<td>'+disease+'</td></tr>'+
                                    '<tr><td><b>時間: </b></td>'+
                                        '<td>'+startDate+" ~ "+endDate+"<br>"+dateText+'</td></tr>'+
                                '<table>'+
                                '<div id="resultTree"></div>';

        // Draw result tree in the result box
        drawResultTree(boundaryData);

        // Add a listener when user click the result button
        L.DomEvent.on(resultButton, 'click', function (e) {
            // Close
            resultBoxOpen = 0;
            resultBox.update(resultBoxOpen, countyBoundary);

            // Add a listener when user click the result button
            L.DomEvent.on(resultButton, 'click', function (e) {
                // Open
                resultBoxOpen = 1;
                resultBox.update(resultBoxOpen, countyBoundary);
            });
        });
    }
    // Initialize the date text
    dateText = "";
};

// Add the result box on map
resultBox.addTo(map);

// Disable dragging when user's cursor enters the element
resultBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
resultBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
});

// If user input some query to search, then let user open result box
if (searching == 1) {
    // Add a listener when user click the result button
    L.DomEvent.on(resultButton, 'click', function (e) {
        // Open
        resultBoxOpen = 1;
        resultBox.update(resultBoxOpen, countyBoundary);
    });
}

// Set the choropleth layer when user mouseover on result tree
var mouseoverLayer = L.geoJson();

// Draw the target county when user mouseover on result tree
function drawMouseoverCounty(targetCounty) {
    // Clear old zoom choropleth layer first
    mouseoverLayer.clearLayers();
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.C_Name == targetCounty) {
            var targetCountyBoundary = countyBoundary.features[i]; // Store the boundary data of target county
        }
    }
    // Draw the county boundary layer in target county
    mouseoverLayer = L.geoJson(targetCountyBoundary, {
        style: mouseoverStyle, // Set the county choropleth style
    }).addTo(map);
}

// Set the choropleth color style when user mouseover on result tree
function mouseoverStyle(feature) {
    return {
        weight: 5,
        opacity: 1,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7,
        fillColor: getColor(checkGrade(feature.properties.Data)) // Fill color by data values
    };
}

// Set the choropleth layer when user click on result tree
var clickLayer = L.geoJson();

// Draw the target county and zoom to it when user click on result tree
function drawClickCounty(targetCounty) {
    clickLayer.clearLayers();
    for (var i = 0; i < countyBoundary.features.length; i++) {
        if (countyBoundary.features[i].properties.C_Name == targetCounty) {
            var targetCountyBoundary = countyBoundary.features[i]; // Store the boundary data of target county
        }
    }
    // Draw the county boundary layer in target county
    clickLayer = L.geoJson(targetCountyBoundary);
    // Zoom to target layer's bounds
    map.fitBounds(clickLayer.getBounds());
}


/****************************** Put the color legend box on the map *******************************/

// Create a initial control of color legend on map
var legend = L.control({ position: 'bottomright' });

// Add the initial legend to show the color meanings
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<i style="background: white; border: 2px solid #0080FF"></i>' + '0';
    return div;
};

// Add the initial legend on map
legend.addTo(map);

// Refresh the legend box after user search result every time
function refreshLegend(boundaryData, max, min) {
    if (checkEmpty() == true) {
        var changedLegend = legend;
    }
    else {
        // Create a control of color legend on changed map
        var changedLegend = L.control({ position: 'bottomright' });

        var gradesNum = 0; // Number of grades
        if (boundaryData == townBoundary) 
            gradesNum = 5;
        else
            gradesNum = 7;

        // Add a changed legend to show the color meanings
        changedLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = getGrades(max, min, gradesNum), 
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
                if (boundaryData == townBoundary) 
                    labels.push('<i style="background:' + getZoomColor(i) + '"></i><span>' + (to ? to : from + '+') + '</span>');
                else
                    labels.push('<i style="background:' + getColor(i) + '"></i><span>' + (to ? to : from + '+') + '</span>');
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
    }
    // Add the changed legend on map
    changedLegend.addTo(map);

    return changedLegend
}

// Number to digit number ex: 9649 to 9000
function toDigitNum(num) {
    var firstNum = num.toString().charAt(0);
    var digitLen = num.toString().length;
    var digitNum = firstNum;

    for (var i = 0; i < digitLen - 1; i++) {
        digitNum = digitNum.concat("0");
    }
    digitNum = parseInt(digitNum);

    return digitNum;
}

// Compute the grade in all result data by the cell numbers
function getGrades(max, min, cellNumber) {
    var grades = [];

    if (max < 10) {
        for (var i = 0; i <= cellNumber; i++) {
            grades.push(i);
        }
        //grades = [0, 1, 2, 3, 4, 5, 6, 7];
    }
    else if (max - min < 100) {
        var interval = Math.round(max / cellNumber);
        grades = [min];
        for (var i = 1; i <= cellNumber; i++) {
            grades.push(interval*i);
        }
        //grades = [min, interval, interval*2, interval*3, interval*4, interval*5, interval*6, interval*7];
    }
    else {
        // 開頭數字
        var minFirstNum = min.toString().charAt(0);
        var maxFirstNum = max.toString().charAt(0);

        // 幾位數
        var minDigit = min.toString().length;
        var maxDigit = max.toString().length;

        var minGrade = minFirstNum;
        for (var i = 0; i < minDigit - 1; i++) {
            minGrade = minGrade.concat("0");
        }
        minGrade = parseInt(minGrade);

        var maxGrade = maxFirstNum;
        for (var i = 0; i < maxDigit - 1; i++) {
            maxGrade = maxGrade.concat("0");
        }
        maxGrade = parseInt(maxGrade);

        // 間隔
        var intervalFirstNum = (Math.round(maxGrade / cellNumber)).toString().charAt(0);
        var intervalSecondNum = (Math.round(maxGrade / cellNumber)).toString().charAt(1);
        if (intervalSecondNum < 5) intervalSecondNum = 0;
        else intervalSecondNum = 5;
        var intervalDigit = (Math.round(maxGrade / cellNumber)).toString().length;
        var interval = intervalFirstNum.concat(intervalSecondNum);
        for (var i = 0; i < intervalDigit - 2; i++) {
            interval = interval.concat("0");
        }
        interval = parseInt(interval);

        grades = [minGrade];
        for (var i = 1; i <= cellNumber; i++) {
            grades.push(interval * i);
        }
    }
    return grades;
}

// Find the max value in data
function findMax(boundaryData) {
    var max = 0;
    for (var i = 0; i < boundaryData.features.length; i++) {
        if (boundaryData.features[i].properties.Data > max) {
            max = boundaryData.features[i].properties.Data;
        }
    }
    return max;
}

// Find the min value in data
function findMin(boundaryData, max) {
    var min = max;
    for (var i = 0; i < boundaryData.features.length; i++) {
        if (boundaryData.features[i].properties.Data < min) {
            min = boundaryData.features[i].properties.Data;
        }
    }
    return min;
}


/********************************* Put the loading box on the map *********************************/

// Create a control of loading box on map
var loading = L.control({ position: 'topleft' });

// The state of loading to change the word in loading box
var state = 0; // 0 is 查詢中, 1 is 繪製中

// Add a loading box to show loading image
loading.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'loading');
    // this._div.innerHTML = '<div class="loading"><img src="icon/magnify_icon.gif">'+
    //                         '<b style="font: 14px Microsoft JhengHei; font-weight: bold;"> 查詢中...<b></div>';
    this.update(state);
    return this._div;
};

// Update the loading box
loading.update = function (state) {
    if (state == 0) {
        this._div.innerHTML = '<div class="loading"><img src="icon/magnify_icon.gif">'+
                                '<b style="font: 14px Microsoft JhengHei; font-weight: bold;"> 查詢中...<b></div>';
    }
    else {
        this._div.innerHTML = '<div class="loading"><img src="icon/magnify_icon.gif">'+
                                '<b style="font: 14px Microsoft JhengHei; font-weight: bold;"> 繪製中...<b></div>';
    }
};

// Show the loading image when our program is running
function showLoading(state, time) {
    // Remove the original loading box
    map.removeControl(loading);
    // Add the loading box on map
    loading.addTo(map);
    // Update the loading box by the state
    loading.update(state);

    // After running time, remove the loading box
    setTimeout(function remove() {
        map.removeControl(loading);
    }, time);
}


/************ Draw the choropleth color and output the results when user input the query **********/

// Draw search result on map
function drawResultMap(boundaryData) {
    drawLegend(boundaryData);
    drawChoropleth(boundaryData);
    // // Get the boundary data
    // getBoundary(data);
    // // Draw by county or town boundary
    // if (boundaryType == "county") {
    //     if (playing == 0) drawLegend(countyBoundary);
    //     drawChoropleth(countyBoundary);
    // }
    // else {
    //     if (playing == 0) drawLegend(townBoundary);
    //     drawChoropleth(townBoundary);
    // }
}

// Draw legend by data on map
function drawLegend(boundaryData) {
    // Find the max value in the result
    var max = findMax(boundaryData);
    // Find the min value in the result
    var min = findMin(boundaryData, max);
    // console.log("min=" + min, "max=" + max);
    // console.log("Draw Legend!")
    // Remove the original legend
    map.removeControl(legend);
    // Create a new legend that refresh the color data
    var changedLegend = refreshLegend(boundaryData, max, min);
    legend = changedLegend;
}

// Draw the choropleth layer and ouput the results
function drawChoropleth(boundaryData) {
    // console.log("Draw Choropleth!");
    // If zoomChoroplethLayer exist, then clean it
    if (zoomChoroplethLayer.length != 0) {
        zoomChoroplethLayer.clearLayers();
    }
    // Clean the old color layer
    choroplethLayer.clearLayers();
    // Redraw the data boundary layer
    choroplethLayer = L.geoJson(boundaryData, {
        style: style, // Set the choropleth style
        onEachFeature: onEachFeature // Highlight the boundary lines when user mouse on
    }).addTo(map);
}


// Draw the choropleth color on map
function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: '0.7',
        fillColor: getColor(checkGrade(feature.properties.Data)) // Fill color by data values
    };
}

// Check the data belong to which grade in array grades
function checkGrade(d) {
    if (playing == 0) {
        if (boundaryType == "county") {
            var max = findMax(countyBoundary);
            var min = findMin(countyBoundary, max);
        }
        else if (boundaryType == "town") {
            var max = findMax(townBoundary);
            var min = findMin(townBoundary, max);
        }
    }
    else { // User is playing time line
        var max = playingMax;
        var min = playingMin;
    }

    var grades = getGrades(max, min, 7);

    for (var i = 0; i < grades.length; i++) {
        if (d <= grades[i])  return i - 1; // Position in array grades
        if (d > grades[grades.length - 1]) return grades.length - 1;
    }
    return 0;
}

// Get color depending on the values of data
function getColor(i) {
    if (i == 0) return '#FFEDA0';
    else if (i == 1) return '#FED976';
    else if (i == 2) return '#FEB24C';
    else if (i == 3) return '#FD8D3C';
    else if (i == 4) return '#FC4E2A';
    else if (i == 5) return '#E31A1C';
    else if (i == 6) return '#BD0026';
    else if (i == 7) return '#800026';
    else return 'white';
}

// Do something on layer by each feature
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Create a popup
var popup = L.popup({ closeButton: false });
// Set the highlight layer's feature'
function highlightFeature(e) { // e: mouseover
    var layer = e.target; // target layer
    // Set the target county layer's style
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    // Set the popup
    if (boundaryType == "county") {
        popup.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
            .openOn(map);
    }
    else if (boundaryType == "town") {
        popup.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name +
            '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
            .openOn(map);

    }

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

// Reset the highlight layer
function resetHighlight(e) { // e: mouseout
    var layer = e.target;
    // Reset the layer's style
    choroplethLayer.resetStyle(layer);
    // Close the popup
    map.closePopup(popup);
}

// Create a popup for information label
var label = L.popup({ maxWidth : 600, maxHeight: 600});

// When mouse click one county, then zoom in
function zoomToFeature(e) {
    var layer = e.target;

    // Zoom to target layer's bounds
    map.fitBounds(layer.getBounds());

    if (boundaryType == "county") {
        // Set the label
        label.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>'+
            '共 ' + layer.feature.properties.Data + ' 筆<br><br>' +
            '<input type="button" id="wordCloudButton" value="查看輿情文字雲"><br>' +
            '<input type="button" id="showClusterButton" value="顯示輿情分群點"><br>' +
            // '<input type="button" id="hideClusterButton" value="隱藏輿情分群點"><br>' +
            '<input type="button" id="zoomTownButton" value="顯示鄉鎮區資訊">')
            .openOn(map);

        L.DomEvent.addListener(wordCloudButton, 'click', function (e) {
            // label.setContent('<b>' + layer.feature.properties.C_Name + '</b><br>' +
            // '<div id="wordCloud" style="width:600px;"></div>')
            // .openOn(map);
            map.closePopup(label);
            getWordCloud(layer.feature.properties.C_Name);
        });

        L.DomEvent.addListener(showClusterButton, 'click', function (e) {
            getClustering(layer.feature.properties.C_Name, diseaseType);
            map.closePopup(label);
        });

        //  L.DomEvent.addListener(hideClusterButton, 'click', function (e) {
        //     // Clean the cluster circles
        //     map.removeLayer(clusterCircle);
        //     map.closePopup(label);
        // });

        L.DomEvent.addListener(zoomTownButton, 'click', function (e) {
            drawZoomTown(layer.feature.properties.C_Name);
            map.closePopup(label);
        });
    }
}

// Set the choropleth layer when user click target county and zoom to town
var zoomChoroplethLayer = L.geoJson();

// Draw the zoom town on selected target county
function drawZoomTown(targetCounty) {
    // Clear old zoom choropleth layer first
    zoomChoroplethLayer.clearLayers();
    console.log("Draw town ~");
    var targetTownBoundary = []; // Store the boundary data of target town
    for (var i = 0; i < townBoundary.features.length; i++) {
        if (townBoundary.features[i].properties.C_Name == targetCounty) {
            targetTownBoundary.push(townBoundary.features[i]);
        }
    }
    // Draw the town boundary layer in target county
    zoomChoroplethLayer = L.geoJson(targetTownBoundary, {
        style: zoomStyle, // Set the zoom town choropleth style
        onEachFeature: zoomOnEachFeature // Highlight the boundary lines when user mouse on
    }).addTo(map);

    // Draw legend of the zoom town
    drawLegend(townBoundary);
}

// Draw the choropleth color on map
function zoomStyle(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'gray',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getZoomColor(checkZoomGrade(feature.properties.Data)) // Fill color by data values
    };
}

// Check the data belong to which grade in array grades
function checkZoomGrade(d) {
    var max = findMax(townBoundary);
    var min = findMin(townBoundary, max);
    var grades = getGrades(max, min, 5); // Array grades
    for (var i = 0; i < grades.length; i++) {
        if (d <= grades[i]) {
            return i - 1; // Position in array grades
        }
        if (d > grades[grades.length - 1]) {
            return grades.length - 1;
        }
    }
    return 0;
}

// Get color depending on the values of data
function getZoomColor(i) {
    if (i == 0) return '#c6dbef';
    else if (i == 1) return '#6baed6';
    else if (i == 2) return '#4292c6';
    else if (i == 3) return '#2171b5';
    else if (i == 4) return '#08519c';
    else if (i == 5) return '#08306b';
    else return 'white';
}

// Do something on layer by each feature
function zoomOnEachFeature(feature, layer) {
    layer.on({
        mouseover: zoomHighlightFeature,
        mouseout: resetZoomHighlight,
        click: hideZoomFeature
    });
}

// Set the highlight layer's feature'
function zoomHighlightFeature(e) { // e: mouseover
    var layer = e.target; // target layer
    // Set the target county layer's style
    layer.setStyle({
        weight: 5,
        color: 'black',
        dashArray: '',
        fillOpacity: 0.9
    });
    // Set the popup
    popup.setLatLng(e.latlng)
        .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name +
        '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
        .openOn(map);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

// Reset the zoom highlight layer
function resetZoomHighlight(e) { // e: mouseout
    var layer = e.target;
    // Reset the layer's style
    zoomChoroplethLayer.resetStyle(layer);
    // Close the popup
    map.closePopup(popup);
}

// When mouse click one county, then zoom in
function hideZoomFeature(e) {
    var layer = e.target;
    // Set the label
    label.setLatLng(e.latlng)
        .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + '</b><br>' +
        '共 ' + layer.feature.properties.Data + ' 筆<br><br>' +
        '<input type="button" id="hideTownButton" value="隱藏鄉鎮區資訊">')
        .openOn(map);

    L.DomEvent.addListener(hideTownButton, 'click', function (e) {
        // Clean the zoom town color layer
        zoomChoroplethLayer.clearLayers();
        map.closePopup(label);
        // Refresh legend to original one
        drawLegend(countyBoundary);
    });
}



/*********************** Put the circle clusters of ptt articles on the map ***********************/

function getClustering(countyName, disease) {
    start_pg();
    $.ajax({
        url: "/get_clustering/", 
        data: {
            location: countyName,
            disease: disease    
        },
        //dataType: "json",
        method: "GET",
        xhr:refresh_pg,
        success: function(response) {
            drawClustering(response);
            stop_pg();
        },
        error : function (jqXHR, exception) {
            console.log("error");
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}


function drawClustering(data) {
    // Remove original choropleth layer
    choroplethLayer.clearLayers();
    // Draw initial county boundary layer on the initial map
    choroplethLayer = L.geoJson(countyBoundary).addTo(map);
    // Remove original marker cluster layer
    marker_cluster.clearLayers();

    let circleColor = d3.scale.category10();

    data.forEach(function(d) {
        drawCircle(d.lat, d.lng, d.size, d.category);
    });
    
    function drawCircle(lat, lng, size, category) {
        clusterCircle = L.circle([lng, lat], {
            color: circleColor(category),
            fillColor: circleColor(category),
            opacity: 0.3,
            fillOpacity: 0.5,
            radius: size*50
        });
        clusterCircle.addTo(map);
        current_clusterCircle.push(clusterCircle);
    }

    // Append return button
    d3.select("div.searchButton")
        .append("input")
        .attr("type", "button")
        .attr("id", "returnButton")
        .attr("value", "返回")
        .style("margin-left", "5px");

    // Add a listener when user click the search button
    L.DomEvent.on(returnButton, 'click', function (e) {
        drawChoropleth(countyBoundary);
        let end = new Date(startDate);
        end.setDate(end.getDate() + 31);
        refresh_marker(startDate,end);
        removeClustering();
        d3.select("#returnButton").remove();
    });
}

function removeClustering() {
    for(clusterCircle of current_clusterCircle){
        map.removeLayer(clusterCircle);    
    }
    current_clusterCircle = [];
}



/********************************* Put the simulate box on the map **********************************/

// Create a control that shows simulate box
var simulateBox = L.control({position: 'topleft'});

// The situation of simulate box: close or open
var simulateBoxOpen = 0; // Close

simulateBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'simulate');
    this.update(simulateBoxOpen);
    return this._div;
}

// Update the simulate box
simulateBox.update = function (simulateBoxOpen) {
    // When simulate box is close
    if (simulateBoxOpen == 0) {
        this._div.innerHTML = '<div class="simulateButton"><input type="button" id="simulateButton"></div>';
    }
    // When user open the simulate box
    else if (simulateBoxOpen == 1) {
        this._div.innerHTML = '<div class="simulateButton" style="width:100px;"><input type="button" id="simulateButton">' +
            '<b style="font-size:16px; color:#777;"> 疫情模擬</b></div><br>' +
                '<div class="searchTime">' +
                    '起始時間 <input type="text" id="startDatePicker"><br>'+
                    // '結束時間 <input type="text" id="endDatePicker" onclick="endDatePicker();">'+
                    '起始感染人數 <input type="text" id="startDatePicker"><br>'+
                '</div>' +
                // '<b>Susceptible: <span id="sValue"> 70</span><br>' + 
                // '<input type="range" id="sSlider" min="0" max="1" value="0.7" step="0.1" style="width:100px;" onchange="sChange();"><br>' +
                // '<b>Infected: <span id="iValue"> 70</span><br>' +
                // '<input type="range" id="iSlider" min="0" max="1" value="0.7" step="0.1" style="width:100px;" onchange="iChange();"><br>' +
                '<input type="button" id="simulationButton" value="開始模擬" style="margin-left:15px;" onclick="getDiseaseSimulate()"></div>';
        
        // // Initialize date picker
        // $(startDatePicker).click();
        // $(endDatePicker).click();

        // Add a listener when user click the simulate button
        L.DomEvent.on(simulateButton, 'click', function (e) {
            // Close 
            simulateBoxOpen = 0;
            simulateBox.update(simulateBoxOpen);
            
            // Add a listener when user click the simulate button
            L.DomEvent.on(simulateButton, 'click', function (e) {
                // Open
                simulateBoxOpen = 1;
                simulateBox.update(simulateBoxOpen);
            });
        });
    }
};

// Add the filter box on map
simulateBox.addTo(map);

// Disable dragging when user's cursor enters the element
simulateBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
simulateBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
});

// Add a listener when user click the filter button
L.DomEvent.on(simulateButton, 'click', function (e) {
    // Open
    simulateBoxOpen = 1;
    simulateBox.update(simulateBoxOpen); 
});



/*********************** Put the disease simulation of choropleth on the map ***********************/

function getDiseaseSimulate() {
    //start_pg();
    $.ajax({
        url: "/get_disease_simulate/", 
        data: {   
        },
        //dataType: "json",
        method: "GET",
        //xhr:refresh_pg,
        success: function(response) {
            startDate = "2015-08-01";
            endDate = "2015-08-30";
            
            marker_cluster.clearLayers();
            playing = 0;
            parseSimulate(response);
            drawResultMap(countyBoundary);
            resultBoxOpen = 1;
            resultBox.update(resultBoxOpen, countyBoundary);

            mode = 1;
            drawTimeLine();
            //stop_pg();
        },
        error : function (jqXHR, exception) {
            console.log("error");
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}

