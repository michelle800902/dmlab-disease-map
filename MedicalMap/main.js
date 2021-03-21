/********************************************* main.js ********************************************/
/** This javaScript file contains the main functions of map visualization on medical data:       **/
/** 1. Connect postgres database in php file, and get php response data by jQuery ajax           **/              
/** 2. Parse data and then store in JSON format                                                  **/
/** 3. Create interactive user interface and map layer using Leaflet.js                          **/
/** 4. Create timeline and result tree for data visualization by D3.js                           **/
/**************************************************************************************************/

/******************************** Initialize all public variables *********************************/

// Query variables to store user selections
var searchType = "easy",     // Select easy search or complex search mode
    table = "r01_cd",        // Store selected table name 
    year = ["2012"],         // Store selected year of this table
    queryType = "FUNC_TYPE", // Store selected column type of this table
    queryInput = "",         // Store query input for some value of column
    boundaryType = "county", // Store boundary by county or town of Taiwan
    resultType = "hospital", // Store search result by hospital place or residence place
    genderType = "all",      // Store search gender by male or female or all 
    dataType = "data";       // Store result by data count or average age
// Query input in every column under complex search mode
var FUNC_TYPE_query = "",    // 就醫科別
    ICD_OP_CODE_query = "",  // 手術代碼
    ACODE_ICD9_query = "",   // 國際疾病分類號
    CURE_ITEM_query = "",    // 特定治療項目代號
    ICD9CM_CODE_query = "",  // 診斷代碼
    BED_DAY_query = "";      // 住院天數

// User is searching or not
var searching = 0; // 0 is not searching
// User is playing the time line or not
var playing = 0;   // 0 is not playing
// Store the max and min values in legend when user is playing the time line
var playingMax = 0, playingMin = 0;

// Response result data and store them into array after parsing
var hospitalPeople = [],    // Store all information of people by hospital place
    residencePeople = [],   // Store all information of people by residence place
    hospitalDateData = [],  // Store the data by date and hospital place
    monthData = [],         // Store the data by month and hospital place
    residenceDateData = []; // Store the data by date and residence place

// D3 functions for parsing the time format using in drawTimeLine and drawDateTown
var parseDate   = d3.time.format("%Y-%m-%d").parse,
    parseMonth  = d3.time.format("%Y-%m").parse,
    parseYear   = d3.time.format("%Y").parse,
    formatDate  = d3.time.format("%Y-%m-%d"),
    formatMonth = d3.time.format("%Y-%m"),
    formatYear  = d3.time.format("%Y"),
    bisectDate  = d3.bisector(function(d) { return d.x; }).right;


/************************** Put the map layer transfer control on the map *************************/

// Map layer links
var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    osmAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> | 最佳解析度1280x768',
    landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
    landAttribution = 'Map data &copy; <a href="http://thunderforest.com/">Thunderforest</a> | 最佳解析度1280x768',
    mbxUrl = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw",
    mbxAttribution = 'Map data &copy; <a href="http://mapbox.com">Mapbox</a> | 最佳解析度1280x768';

// Map tile layers, set their url links and min zoom size
var osmMap = L.tileLayer(osmUrl, { minZoom: 2, attribution: osmAttribution }),                             // OpenStrreMap layer
    landMap = L.tileLayer(landUrl, { minZoom: 2, attribution: landAttribution }),                          // Thunderforest Lanscape layer
    mbGrayMap = L.tileLayer(mbxUrl, { id: 'mapbox.light', minZoom: 2, attribution: mbxAttribution }),      // MapBox gray scale Layer
    mbStreetsMap = L.tileLayer(mbxUrl, { id: 'mapbox.streets', minZoom: 2, attribution: mbxAttribution }); // MapBox streets Layer

// Base maps layer, let user to select the maps
var baseMaps = {
    "Open Street Map": osmMap,
    "Landscape Map": landMap
    // "Mapbox Gray Scale": mbGrayMap,
    // "Mapbox Streets": mbStreetsMap
};

// Initialize the map 
var map = L.map('map', {
    layers: [osmMap],      // Set the url link of map
    center: [23.6, 120.9], // Set the center position in window screen
    zoom: 8,               // Set the initial zoom size
    zoomControl: false     // Hide the zoom control in window screen
});

// Draw initial county boundary layer on the initial map
var choroplethLayer = L.geoJson(countyBoundary).addTo(map);


/*********************** Put the hospital layer transfer control on the map ***********************/

// New the layer groups by every county for ploting the hospital locations on map layer
var Taipei_City_hospital       = new L.LayerGroup();
var New_Taipei_City_hospital   = new L.LayerGroup();
var Taoyuan_City_hospital      = new L.LayerGroup();
var Taichung_City_hospital     = new L.LayerGroup();
var Tainan_City_hospital       = new L.LayerGroup();
var Kaohsiung_City_hospital    = new L.LayerGroup();
var Keelung_City_hospital      = new L.LayerGroup();
var Hsinchu_City_hospital      = new L.LayerGroup();
var Chiayi_City_hospital       = new L.LayerGroup();
var Hsinchu_County_hospital    = new L.LayerGroup();
var Miaoli_County_hospital     = new L.LayerGroup();
var Changhua_County_hospital   = new L.LayerGroup();
var Nantou_County_hospital     = new L.LayerGroup();
var Yunlin_County_hospital     = new L.LayerGroup();
var Chiayi_County_hospital     = new L.LayerGroup();
var Pingtung_County_hospital   = new L.LayerGroup();
var Yilan_County_hospital      = new L.LayerGroup();
var Hualian_County_hospital    = new L.LayerGroup();
var Taitung_County_hospital    = new L.LayerGroup();
var Penghu_County_hospital     = new L.LayerGroup();
var Kinmen_Countyi_hospital    = new L.LayerGroup();
var Lienchiang_County_hospital = new L.LayerGroup();

// Set the hospital marker icon as a blue pot
var hospitalIcon = L.icon({
    iconUrl: "icon/blue_icon.png",
    //shadowUrl: 'leaf-shadow.png',
    iconSize: [5, 5],         // Size of the icon
    //shadowSize:   [50, 64], // Size of the shadow
    iconAnchor: [0, 0],       // Point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // The same for the shadow
    popupAnchor: [0, 0]       // Point from which the popup should open relative to the iconAnchor
});
// var hospitalMouseover = L.icon({
//     iconUrl: 'hospital_marker.png',
//     iconSize: [10, 10]    
// });

// Read every county's hospital csv file using d3.js
d3.csv("hospital_data/Taipei_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"])
            .addTo(Taipei_City_hospital);
            // .on('mouseover', function (e) {
            //     this.setIcon(hospitalMouseover);
            //     this.openPopup();
            // })
            // .on('mouseout', function (e) {
            //     this.setIcon(hospitalIcon);
            //     this.closePopup();
            // });
    });
});
d3.csv("hospital_data/New_Taipei_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(New_Taipei_City_hospital);
    });
});
d3.csv("hospital_data/Taoyuan_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Taoyuan_City_hospital);
    });
});
d3.csv("hospital_data/Taichung_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Taichung_City_hospital);
    });
});
d3.csv("hospital_data/Tainan_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Tainan_City_hospital);
    });
});
d3.csv("hospital_data/Kaohsiung_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Kaohsiung_City_hospital);
    });
});
d3.csv("hospital_data/Keelung_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Keelung_City_hospital);
    });
});
d3.csv("hospital_data/Hsinchu_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Hsinchu_City_hospital);
    });
});
d3.csv("hospital_data/Chiayi_City_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Chiayi_City_hospital);
    });
});
d3.csv("hospital_data/Hsinchu_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Hsinchu_County_hospital);
    });
});
d3.csv("hospital_data/Miaoli_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Miaoli_County_hospital);
    });
});
d3.csv("hospital_data/Changhua_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Changhua_County_hospital);
    });
});
d3.csv("hospital_data/Nantou_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Nantou_County_hospital);
    });
});
d3.csv("hospital_data/Yunlin_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Yunlin_County_hospital);
    });
});
d3.csv("hospital_data/Chiayi_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Chiayi_County_hospital);
    });
});
d3.csv("hospital_data/Pingtung_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Pingtung_County_hospital);
    });
});
d3.csv("hospital_data/Yilan_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Yilan_County_hospital);
    });
});
d3.csv("hospital_data/Hualian_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Hualian_County_hospital);
    });
});
d3.csv("hospital_data/Taitung_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Taitung_County_hospital);
    });
});
d3.csv("hospital_data/Penghu_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Penghu_County_hospital);
    });
});
d3.csv("hospital_data/Kinmen_Countyi_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Kinmen_Countyi_hospital);
    });
});
d3.csv("hospital_data/Lienchiang_County_hospital.csv", function (data) {
    data.forEach(function (d) {
        // Add the marker of hospital on layer
        L.marker([d["經度"], d["緯度"]], { icon: hospitalIcon })
            .bindPopup("<b>" + d["機構名稱"] + "</b><br>" + d["地址"] + "<br>" + d["電話"]).addTo(Lienchiang_County_hospital);
    });
});

// Overlay map layers
var overlayMaps = {
    "臺北市 醫院 (3477所)": Taipei_City_hospital,
    "新北市 醫院 (3228所)": New_Taipei_City_hospital,
    "桃園市 醫院 (1519所)": Taoyuan_City_hospital,
    "臺中市 醫院 (3365所)": Taichung_City_hospital,
    "臺南市 醫院 (1882所)": Tainan_City_hospital,
    "高雄市 醫院 (2931所)": Kaohsiung_City_hospital,
    "基隆市 醫院 (297所)" : Keelung_City_hospital,
    "新竹市 醫院 (434所)" : Hsinchu_City_hospital,
    "嘉義市 醫院 (412所)" : Chiayi_City_hospital,
    "新竹縣 醫院 (376所)" : Hsinchu_County_hospital,
    "苗栗縣 醫院 (387所)" : Miaoli_County_hospital,
    "彰化縣 醫院 (1055所)": Changhua_County_hospital,
    "南投縣 醫院 (430所)" : Nantou_County_hospital,
    "雲林縣 醫院 (500所)" : Yunlin_County_hospital,
    "嘉義縣 醫院 (271所)" : Chiayi_County_hospital,
    "屏東縣 醫院 (645所)" : Pingtung_County_hospital,
    "宜蘭縣 醫院 (329所)" : Yilan_County_hospital,
    "花蓮縣 醫院 (278所)" : Hualian_County_hospital,
    "臺東縣 醫院 (161所)" : Taitung_County_hospital,
    "澎湖縣 醫院 (89所)"  : Penghu_County_hospital,
    "金門縣 醫院 (52所)"  : Kinmen_Countyi_hospital,
    "連江縣 醫院 (5所)"   : Lienchiang_County_hospital
};

// Put the scale one map
L.control.scale({ position: 'bottomright' }).addTo(map);
        
// Put the control of map layers 
L.control.layers(baseMaps, overlayMaps, { position: 'bottomright' }).addTo(map);


/******************************* Put the query input box on the map *******************************/

// function startDatePicker() {
//     $("#startDatePicker").datepicker({
//         beforeShow: function(input, inst) {
//             inst.dpDiv.css({
//                 marginTop: -input.offsetHeight + 'px', 
//                 marginLeft: (input.offsetWidth+115) + 'px'
//             });
//         }
//     });
// }
// function endDatePicker() {
//     $("#endDatePicker").datepicker({
//         beforeShow: function(input, inst) {
//             inst.dpDiv.css({
//                 marginTop: -input.offsetHeight + 'px', 
//                 marginLeft: (input.offsetWidth+8) + 'px'
//             });
//         }
//     });
// }

// Create a control of user input box
var inputBox = L.control({ position: 'topleft' });

// The situation of input box: close or open
var inputBoxOpen = 0; // Close

// Add a input box to get the user query
inputBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update(inputBoxOpen, "", "", "");
    return this._div;
};

// Update the input box
inputBox.update = function (inputBoxOpen, searchType, table, queryType) {
    // When input box is close
    if (inputBoxOpen == 0) this._div.innerHTML = '<div class="menuButton"><input type="button" id="menuButton"></div>';
    // When user open the input box
    else if (inputBoxOpen == 1) {
        this._div.innerHTML = '<div class="menuButton"><input type="button" id="menuButton">' +
                                '<b style="font-size:16px; color:#777;"> 健保資料地圖檢索</b></div><br>';
        // When user select the easy searcfh type
        if (searchType == "easy") {
            // When user select CD檔
            if (table == "r01_cd") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy" checked="checked">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                        '<div class="selector">' +
                        '<select id="tableSelector" name="tableSelector">' +
                            '<option value="r01_cd" selected>門診治療檔 CD</option>' +
                            '<option value="r01_dd">住院費用檔 DD</option>' +
                            '<option value="r01_oo">門診醫令檔 OO</option>' +
                            '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                        '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                            '<option value="2011">2011</option>' +
                            '<option value="2010">2010</option>' +
                            '<option value="2009">2009</option>' +
                            '<option value="2008">2008</option>' +
                            '<option value="2007">2007</option>' +
                            '<option value="2006">2006</option>' +
                            '<option value="2005">2005</option>' +
                            '<option value="2004">2004</option></select> 至 ' +
                        '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                            '<option value="2012" selected>2012</option>' +
                            '<option value="2011">2011</option>' +
                            '<option value="2010">2010</option>' +
                            '<option value="2009">2009</option>' +
                            '<option value="2008">2008</option>' +
                            '<option value="2007">2007</option>' +
                            '<option value="2006">2006</option>' +
                            '<option value="2005">2005</option>' +
                            '<option value="2004">2004</option></select> 年</div><br>' +
                        // '<input type="text" id="startDatePicker" onclick="startDatePicker();"> to '+
                        // '<input type="text" id="endDatePicker" onclick="endDatePicker();"></div><br>' +
                    '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE" checked="checked">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ACODE_ICD9" id="ACODE_ICD9">' +
                        '<label for="ACODE_ICD9">國際疾病<br>分類號</label> ' +
                        '<input type="radio" name="inputType" value="CURE_ITEM" id="CURE_ITEM">' +
                        '<label for="CURE_ITEM">特定治療<br>項目代號</label></div><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="searchInput" placeholder="ex: 牙科" style="width: 130px;">' +
                    '<input type="button" id="searchButton" value="查詢"></div>');
            }
            // When user select DD檔
            else if (table == "r01_dd") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy" checked="checked">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd" selected>住院費用檔 DD</option>' +
                        '<option value="r01_oo">門診醫令檔 OO</option>' +
                        '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option></select> 年</div><br>');

                if (queryType == "FUNC_TYPE") {
                    this._div.innerHTML = this._div.innerHTML.concat(
                        '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE" checked="checked">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ICD9CM_CODE" id="ICD9CM_CODE">' +
                        '<label for="ICD9CM_CODE">診斷代碼</label> ' +
                        '<input type="radio" name="inputType" value="BED_DAY" id="BED_DAY">' +
                        '<label for="BED_DAY">住院天數</label></div><br>' +
                        '<div class="searchText">' +
                        '<input type="text" id="searchInput" placeholder="ex: 牙科" style="width: 130px;">' +
                        '<input type="button" id="searchButton" value="查詢"></div>');
                }
                else if (queryType == "ICD_OP_CODE") {
                    this._div.innerHTML = this._div.innerHTML.concat(
                        '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE" checked="checked">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ICD9CM_CODE" id="ICD9CM_CODE">' +
                        '<label for="ICD9CM_CODE">診斷代碼</label> ' +
                        '<input type="radio" name="inputType" value="BED_DAY" id="BED_DAY">' +
                        '<label for="BED_DAY">住院天數</label></div><br>' +
                        '<div class="searchText">' +
                        '<input type="text" id="searchInput" placeholder="ex: 牙科" style="width: 130px;">' +
                        '<input type="button" id="searchButton" value="查詢"></div>');
                }
                else if (queryType == "ICD9CM_CODE") {
                    this._div.innerHTML = this._div.innerHTML.concat(
                        '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ICD9CM_CODE" id="ICD9CM_CODE" checked="checked">' +
                        '<label for="ICD9CM_CODE">診斷代碼</label> ' +
                        '<input type="radio" name="inputType" value="BED_DAY" id="BED_DAY">' +
                        '<label for="BED_DAY">住院天數</label></div><br>' +
                        '<div class="searchText">' +
                        '<input type="text" id="searchInput" placeholder="ex: 牙科" style="width: 130px;">' +
                        '<input type="button" id="searchButton" value="查詢"></div>');
                }
                else if (queryType == "BED_DAY") {
                    this._div.innerHTML = this._div.innerHTML.concat(
                        '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ICD9CM_CODE" id="ICD9CM_CODE">' +
                        '<label for="ICD9CM_CODE">診斷代碼</label> ' +
                        '<input type="radio" name="inputType" value="BED_DAY" id="BED_DAY" checked="checked">' +
                        '<label for="BED_DAY">住院天數</label></div><br>' +
                        '<div class="searchDay">' +
                        '<input type="text" id="fromDayInput" placeholder="ex: 0"> 至 ' +
                        '<input type="text" id="toDayInput" placeholder="ex: 3"> 天 ' +
                        '<input type="button" id="daySearchButton" value="查詢"></div>');
                }
                else {
                    this._div.innerHTML = this._div.innerHTML.concat(
                        '<b>單一欄位內容查詢 :</b><br><br>' +
                        '<div class="radio">' +
                        '<input type="radio" name="inputType" value="FUNC_TYPE" id="FUNC_TYPE" checked="checked">' +
                        '<label for="FUNC_TYPE">就醫科別</label> ' +
                        '<input type="radio" name="inputType" value="ICD_OP_CODE" id="ICD_OP_CODE">' +
                        '<label for="ICD_OP_CODE">手術代碼</label><br>' +
                        '<input type="radio" name="inputType" value="ICD9CM_CODE" id="ICD9CM_CODE">' +
                        '<label for="ICD9CM_CODE">診斷代碼</label> ' +
                        '<input type="radio" name="inputType" value="BED_DAY" id="BED_DAY">' +
                        '<label for="BED_DAY">住院天數</label></div><br>' +
                        '<div class="searchText">' +
                        '<input type="text" id="searchInput" placeholder="ex: 牙科" style="width: 130px;">' +
                        '<input type="button" id="searchButton" value="查詢"></div>');
                }
            }
            else if (table == "r01_oo") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy" checked="checked">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd">住院費用檔 DD</option>' +
                        '<option value="r01_oo" selected>門診醫令檔 OO</option>' +
                        '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 年</div><br>' +
                    '<b>單一欄位內容查詢 :</b><br><br>' +
                    '<div class="radio">' +
                    '<input type="radio" name="inputType" value="ORDER_TYPE" id="ORDER_TYPE" checked="checked">' +
                    '<label for="ORDER_TYPE">醫令類別</label> ' +
                    '<input type="radio" name="inputType" value="DRUG_NO" id="DRUG_NO">' +
                    '<label for="DRUG_NO">醫令代碼</label></div><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="searchInput" placeholder="ex: 1 用藥" style="width: 130px;">' +
                    '<input type="button" id="searchButton" value="查詢"></div>');
            }
            else if (table == "r01_do") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy" checked="checked">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd">住院費用檔 DD</option>' +
                        '<option value="r01_oo">門診醫令檔 OO</option>' +
                        '<option value="r01_do" selected>住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 年</div><br>' +
                    '<b>單一欄位內容查詢 :</b><br><br>' +
                    '<div class="radio">' +
                    '<input type="radio" name="inputType" value="ORDER_TYPE" id="ORDER_TYPE" checked="checked">' +
                    '<label for="ORDER_TYPE">醫令類別</label> ' +
                    '<input type="radio" name="inputType" value="ORDER_CODE" id="ORDER_CODE">' +
                    '<label for="ORDER_CODE">醫令代碼</label></div><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="searchInput" placeholder="ex: 1 用藥" style="width: 130px;">' +
                    '<input type="button" id="searchButton" value="查詢"></div>');
            }
        }
        // When user select the complex search type
        else if (searchType == "complex") {
            // When user select CD檔
            if (table == "r01_cd") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex" checked="checked">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd" selected>門診治療檔 CD</option>' +
                        '<option value="r01_dd">住院費用檔 DD</option>' +
                        '<option value="r01_oo">門診醫令檔 OO</option>' +
                        '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option>' +
                        '<option value="2008">2008</option>' +
                        '<option value="2007">2007</option>' +
                        '<option value="2006">2006</option>' +
                        '<option value="2005">2005</option>' +
                        '<option value="2004">2004</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option>' +
                        '<option value="2008">2008</option>' +
                        '<option value="2007">2007</option>' +
                        '<option value="2006">2006</option>' +
                        '<option value="2005">2005</option>' +
                        '<option value="2004">2004</option></select> 年</div><br>' +
                    '<b>多重欄位內容查詢 :</b><br><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="FUNC_TYPE_Input" placeholder="就醫科別"><br>' +
                    '<input type="text" id="ICD_OP_CODE_Input" placeholder="手術代碼"><br>' +
                    '<input type="text" id="ACODE_ICD9_Input" placeholder="國際疾病分類號"><br>' +
                    '<input type="text" id="CURE_ITEM_Input" placeholder="特定治療項目代號"></div>' +
                    '<input type="button" id="searchButton" value="查詢" style="position:relative;left:35%;"><br>');
            }
            // When user select DD檔
            else if (table == "r01_dd") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex" checked="checked">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                        '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd" selected>住院費用檔 DD</option>' +
                        '<option value="r01_oo">門診醫令檔 OO</option>' +
                        '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option>' +
                        '<option value="2011">2011</option>' +
                        '<option value="2010">2010</option>' +
                        '<option value="2009">2009</option></select> 年</div><br>' +
                    '<b>多重欄位內容查詢 :</b><br><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="FUNC_TYPE_Input" placeholder="就醫科別"><br>' +
                    '<input type="text" id="ICD_OP_CODE_Input" placeholder="手術代碼"><br>' +
                    '<input type="text" id="ICD9CM_CODE_Input" placeholder="診斷代碼"><br>' +
                    '<input type="text" id="BED_DAY_Input" placeholder="住院天數 ex: 0-3"></div>' +
                    '<input type="button" id="searchButton" value="查詢" style="position:relative;left:35%;"><br>');
            }
            else if (table == "r01_oo") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex" checked="checked">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd">住院費用檔 DD</option>' +
                        '<option value="r01_oo" selected>門診醫令檔 OO</option>' +
                        '<option value="r01_do">住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 年</div><br>' +
                    '<b>多重欄位內容查詢 :</b><br><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="ORDER_TYPE_Input" placeholder="醫令類別"><br>' +
                    '<input type="text" id="DRUG_NO_Input" placeholder="醫令代碼"></div>' +
                    '<input type="button" id="searchButton" value="查詢" style="position:relative;left:35%;"><br>');
            }
            else if (table == "r01_do") {
                this._div.innerHTML = this._div.innerHTML.concat(
                    '<div class="radio">' +
                    '<input type="radio" name="searchType" value="easy" id="easy">' +
                    '<label for="easy">簡易查詢</label> ' +
                    '<input type="radio" name="searchType" value="complex" id="complex" checked="checked">' +
                    '<label for="complex">進階查詢</label></div><br>' +
                    '<b>請選擇資料表 :</b><br><br>' +
                    '<div class="selector">' +
                    '<select id="tableSelector" name="tableSelector">' +
                        '<option value="r01_cd">門診治療檔 CD</option>' +
                        '<option value="r01_dd">住院費用檔 DD</option>' +
                        '<option value="r01_oo">門診醫令檔 OO</option>' +
                        '<option value="r01_do" selected>住院醫令檔 DO</option></select><br>' +
                    '<select id="startYearSelector" name="startYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 至 ' +
                    '<select id="endYearSelector" name="endYearSelector" style="width:65px;">' +
                        '<option value="2012" selected>2012</option></select> 年</div><br>' +
                    '<b>多重欄位內容查詢 :</b><br><br>' +
                    '<div class="searchText">' +
                    '<input type="text" id="ORDER_TYPE_Input" placeholder="醫令類別"><br>' +
                    '<input type="text" id="ORDER_CODE_Input" placeholder="醫令代碼"></div>' +
                    '<input type="button" id="searchButton" value="查詢" style="position:relative;left:35%;"><br>');
            }
        }

        // Update the input box and refresh search
        refreshSearch();

        // Add a listener when user click the search menu button
        L.DomEvent.on(menuButton, 'click', function (e) {
            // Close 
            inputBoxOpen = 0;
            inputBox.update(inputBoxOpen, "", "", "");

            // Add a listener when user click the search menu button
            L.DomEvent.on(menuButton, 'click', function (e) {
                // Open
                inputBoxOpen = 1;
                inputBox.update(inputBoxOpen, searchType, table, queryType);
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
    inputBox.update(inputBoxOpen, searchType, table, queryType);
});

// Update the input box and refresh search
function refreshSearch() {
    // Get the now search type
    searchType = $('input:radio[name="searchType"]:checked').val();
    // Get the selected table name
    table = $('#tableSelector').val();
    
    // Get the selected years from startYear to endYear
    var startYear = parseInt($('#startYearSelector').val()), 
        endYear = parseInt($('#endYearSelector').val());
    year = [];
    for (var i = 0; startYear+i <= endYear; i++) {
        year.push((startYear+i).toString());
    }
    // Get the input type in user selector
    queryType = $('input:radio[name="inputType"]:checked').val();

    // Update the input box when user change the search type
    $('input:radio[name="searchType"]').change(function () {
        // Get the changed search type in user selector
        searchType = $('input:radio[name="searchType"]:checked').val();
        // Update input box
        inputBox.update(inputBoxOpen, searchType, table, queryType);
    });
    // Update the input box when user select another table
    $('#tableSelector').change(function () {
        // Get the selected table name 
        table = $('#tableSelector').val();
        // Update input box
        inputBox.update(inputBoxOpen, searchType, table, queryType);
    });
    // Update the input box when user select the query type BED_DAY
    $('input:radio[name="inputType"]').change(function () {
        queryType = $('input:radio[name="inputType"]:checked').val();
        if (table == "r01_dd") {
            if (queryType == "BED_DAY")
                inputBox.update(inputBoxOpen, searchType, table, queryType);
            else
                inputBox.update(inputBoxOpen, searchType, table, queryType);
        }
    });
    console.log(searchType, table, year, queryType);
    // Set the search listener and run search
    searchListener();
}

// Set the search listener and run search
function searchListener() {
    // Listen the search again
    if (searchType == "easy") {
        if (table == "r01_dd" && queryType == "BED_DAY") {
            // Add a listener when user click the day search button
            L.DomEvent.on(daySearchButton, 'click', function (e) {
                easySearch();
            });
        }
        else {
            // Add a listener when user finish the search input and press enter
            L.DomEvent.addListener(searchInput, 'keypress', function (e) {
                // When user press enter in search input box
                if (e.which == 13 || e.keyCode == 13) {
                    easySearch();
                }
            });
            // Add a listener when user click the search button
            L.DomEvent.on(searchButton, 'click', function (e) {
                easySearch();
            });
        }
    }
    else if (searchType == "complex") {
        // Add a listener when user click the search button
        L.DomEvent.on(searchButton, 'click', function (e) {
            complexSearch();
        });
    }
}

// Do easy search
function easySearch() {
    // Get the selected table name
    table = $('#tableSelector').val();

    // Get the selected years from startYear to endYear
    var startYear = parseInt($('#startYearSelector').val()), 
        endYear = parseInt($('#endYearSelector').val());
    year = [];
    for (var i = 0; startYear+i <= endYear; i++) {
        year.push((startYear+i).toString());
    }
  
    // Get the input type in user selector
    queryType = $('input:radio[name="inputType"]:checked').val();

    if (queryType == "BED_DAY") {
        // Get the from and to day number from input 
        fromDayInput = $("#fromDayInput").val();
        toDayInput = $("#toDayInput").val();
        queryInput = fromDayInput.concat("-");
        queryInput = queryInput.concat(toDayInput);
    }
    else {
        // Get the search input in search box from user
        queryInput = $("#searchInput").val();
    }
    console.log(table, year, queryType, queryInput, boundaryType, resultType, genderType, dataType);

    if (queryInput == "" || typeof queryType == "undefined") {
        console.log("Empty Input!");
        alert("請點選項目並輸入查詢內容!");
    }
    else {
        searching = 1;
        // Open filter box
        filterBoxOpen = 1;
        filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
        // Query it and get data
        getEasyData(table, year, queryType, queryInput);
    }
}

// Get data using jQuery ajax to read php file
function getEasyData(table, year, queryType, queryInput) {
    $.ajax({
        type: "GET", // Use GET method 
        url: "getEasyData.php", // Connect to getEasyData.php
        data: { // Get data (key, value)
            tableName: table,
            tableYear: year,
            queryTypeData: queryType,
            queryInputData: queryInput
        },
        dataType: "text", // Response data type
        success: function (response) { // Response data from php
            parseResponse(response);
            console.log('success!');
        },
        beforeSend: function () {
            showLoading(0, 10000000);
        },
        complete: function () {
            showLoading(1, 1000);
            generateData();
            drawResultMap(townData);
            resultBoxOpen = 1;
            resultBox.update(resultBoxOpen);
            drawTimeLine();  
        },
        error: function (jqXHR) {
            alert("發生錯誤: " + jqXHR.status);
        }
    });
}

// Do complex search
function complexSearch() {
    // Get the selected table name
    table = $('#tableSelector').val();

    // Get the selected years from startYear to endYear
    var startYear = parseInt($('#startYearSelector').val()), 
        endYear = parseInt($('#endYearSelector').val());
    year = [];
    for (var i = 0; startYear+i <= endYear; i++) {
        year.push((startYear+i).toString());
    }

    if (table == "r01_cd") {
        FUNC_TYPE_query = $("#FUNC_TYPE_Input").val().split(",");
        ICD_OP_CODE_query = $("#ICD_OP_CODE_Input").val().split(",");
        ACODE_ICD9_query = $("#ACODE_ICD9_Input").val().split(",");
        CURE_ITEM_query = $("#CURE_ITEM_Input").val().split(",");
        ICD9CM_CODE_query = "";
        BED_DAY_query = "";
        console.log(table, year, FUNC_TYPE_query, ICD_OP_CODE_query, ACODE_ICD9_query, CURE_ITEM_query);

        if (FUNC_TYPE_query[0] == "" && ICD_OP_CODE_query[0] == "" && ACODE_ICD9_query[0] == "" && CURE_ITEM_query[0] == "") {
            console.log("Empty Input!");
            alert("請輸入查詢內容!");
        }
    }
    else if (table == "r01_dd") {
        FUNC_TYPE_query = $("#FUNC_TYPE_Input").val().split(",");
        ICD_OP_CODE_query = $("#ICD_OP_CODE_Input").val().split(",");
        ACODE_ICD9_query = "";
        CURE_ITEM_query = "";
        ICD9CM_CODE_query = $("#ICD9CM_CODE_Input").val().split(",");
        BED_DAY_query = $("#BED_DAY_Input").val();
        console.log(table, year, FUNC_TYPE_query, ICD_OP_CODE_query, ICD9CM_CODE_query, BED_DAY_query);

        if (FUNC_TYPE_query[0] == "" && ICD_OP_CODE_query[0] == "" && ICD9CM_CODE_query[0] == "" && BED_DAY_query[0] == "") {
            console.log("Empty Input!");
            alert("請輸入查詢內容!");
        }
    }
    else { // table is r01_oo or r01_do
        // Did not finish the code to query these two tables
    }

    searching = 1;
    // Open filter box
    filterBoxOpen = 1;
    filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    // Query it and get data
    getComplexData(table, year, FUNC_TYPE_query, ICD_OP_CODE_query, ACODE_ICD9_query, CURE_ITEM_query, ICD9CM_CODE_query, BED_DAY_query);
}

// Get data using jQuery ajax to read php file
function getComplexData(table, year, FUNC_TYPE_query, ICD_OP_CODE_query, ACODE_ICD9_query, CURE_ITEM_query, ICD9CM_CODE_query, BED_DAY_query) {
    $.ajax({
        type: "GET", // Use GET method 
        url: "getComplexData.php", // Connect to getComplexData.php
        data: { // Get data (key, value)
            tableName: table,
            tableYear: year,
            FUNC_TYPE_input: FUNC_TYPE_query,
            ICD_OP_CODE_input: ICD_OP_CODE_query,
            ACODE_ICD9_input: ACODE_ICD9_query,
            CURE_ITEM_input: CURE_ITEM_query,
            ICD9CM_CODE_input: ICD9CM_CODE_query,
            BED_DAY_input: BED_DAY_query
        },
        dataType: "text", // Response data type
         success: function (response) { // Response data from php
            parseResponse(response);
            console.log('success!');
        },
        beforeSend: function () {
            showLoading(0, 100000);
        },
        complete: function () {
            showLoading(1, 1000);
            generateData();
            drawResultMap(townData);
            resultBoxOpen = 1;
            resultBox.update(resultBoxOpen);
            drawTimeLine();
        },
        error: function (jqXHR) {
            alert("發生錯誤: " + jqXHR.status);
        }
    });
}


/********************************* Put the filter box on the map **********************************/

// Create a control that shows filter box
var filterBox = L.control({position: 'topleft'});

// The situation of filter box: close or open
var filterBoxOpen = 0; // Close

filterBox.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'filter');
    this.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    return this._div;
}

// Update the filter box
filterBox.update = function (filterBoxOpen, boundaryType, resultType, genderType, dataType) {
    // When filter box is close
    if (filterBoxOpen == 0) {
        console.log(boundaryType, resultType, genderType, dataType);
        this._div.innerHTML = '<div class="filterButton"><input type="button" id="filterButton"></div>';
    }
    // When user open the filter box
    else if (filterBoxOpen == 1) {
        console.log(boundaryType, resultType, genderType, dataType);
        this._div.innerHTML = '<div class="filterButton" style="width:180px;"><input type="button" id="filterButton">' +
            '<b style="font-size:16px; color:#777;"> 篩選條件</b></div><br>';
        // Boundary type: county or town                
        if (boundaryType == "county") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>界線 : </b>' +
                '<input type="radio" name="boundaryType" value="county" id="county" checked="checked">' +
                '<label for="county">縣市</label> ' +
                '<input type="radio" name="boundaryType" value="town" id="town">' +
                '<label for="town">鄉鎮區</label></div>');
        }
        else if (boundaryType == "town") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>界線 : </b>' +
                '<input type="radio" name="boundaryType" value="county" id="county">' +
                '<label for="county">縣市</label> ' +
                '<input type="radio" name="boundaryType" value="town" id="town" checked="checked">' +
                '<label for="town">鄉鎮區</label></div>');
        }
        // Result type: hospital or residence
        if (resultType == "hospital") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>地點 : </b>' +
                '<input type="radio" name="resultType" value="hospital" id="hospital" checked="checked">' +
                //'<label for="hospital"><img src="hospital.png" width="25px" height="25px"></label>'+
                '<label for="hospital">醫院</label> ' +
                '<input type="radio" name="resultType" value="residence" id="residence">' +
                //'<label for="residence"><img src="human.png" width="25px" height="25px"></label><br>'+
                '<label for="residence">戶籍地</label></div>');
        }
        else if (resultType == "residence") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>地點 : </b>' +
                '<input type="radio" name="resultType" value="hospital" id="hospital">' +
                //'<label for="hospital"><img src="hospital.png" width="25px" height="25px"></label>'+
                '<label for="hospital">醫院</label> ' +
                '<input type="radio" name="resultType" value="residence" id="residence" checked="checked">' +
                //'<label for="residence"><img src="human.png" width="25px" height="25px"></label><br>'+
                '<label for="residence">戶籍地</label></div>');
        }
        // Gender type: all or male or female
        if (genderType == "all") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>性別 : </b>' +
                '<input type="radio" name="genderType" value="all" id="all" checked="checked">' +
                '<label for="all">所有</label> ' +
                '<input type="radio" name="genderType" value="male" id="male">' +
                '<label for="male">男</label> ' +
                '<input type="radio" name="genderType" value="female" id="female">' +
                '<label for="female">女</label></div>');
        }
        else if (genderType == "male") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>性別 : </b>' +
                '<input type="radio" name="genderType" value="all" id="all">' +
                '<label for="all">所有</label> ' +
                '<input type="radio" name="genderType" value="male" id="male" checked="checked">' +
                '<label for="male">男</label> ' +
                '<input type="radio" name="genderType" value="female" id="female">' +
                '<label for="female">女</label></div>');
        }
        else if (genderType == "female") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>性別 : </b>' +
                '<input type="radio" name="genderType" value="all" id="all">' +
                '<label for="all">所有</label> ' +
                '<input type="radio" name="genderType" value="male" id="male">' +
                '<label for="male">男</label> ' +
                '<input type="radio" name="genderType" value="female" id="female" checked="checked">' +
                '<label for="female">女</label></div>');
        }
        // Data type: data or age
        if (dataType == "data") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>分布 : </b>' +
                '<input type="radio" name="dataType" value="data" id="data" checked="checked">' +
                '<label for="data">筆數</label> ' +
                '<input type="radio" name="dataType" value="age" id="age">' +
                '<label for="age">平均年齡</label></div>');
        }
        else if (dataType == "age") {
            this._div.innerHTML = this._div.innerHTML.concat(
                '<div class="radio">' +
                '<b>分布 : </b>' +
                '<input type="radio" name="dataType" value="data" id="data">' +
                '<label for="data">筆數</label> ' +
                '<input type="radio" name="dataType" value="age" id="age" checked="checked">' +
                '<label for="age">平均年齡</label></div>');
        }
        this._div.innerHTML = this._div.innerHTML.concat(
                '<b>透明度 :</b> <input type="range" id="opacitySlider" min="0" max="1" value="0.7" step="0.1" style="width:75px;" onchange="opacityChange();">' +
                '<span id="opacityValue"> 70%</span><br>');

        // Refresh the user selector in filter
        refreshFilter();
        // Redraw the type in information box if it is changed by user
        redrawInfoType();

        // Add a listener when user click the filter button
        L.DomEvent.on(filterButton, 'click', function (e) {
            // Close 
            filterBoxOpen = 0;
            filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
            
            // Add a listener when user click the filter button
            L.DomEvent.on(filterButton, 'click', function (e) {
                // Open
                filterBoxOpen = 1;
                filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
            });
        });
    }
};

// Add the filter box on map
filterBox.addTo(map);

// Disable dragging when user's cursor enters the element
filterBox.getContainer().addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
filterBox.getContainer().addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
});

// Add a listener when user click the filter button
L.DomEvent.on(filterButton, 'click', function (e) {
    // Open
    filterBoxOpen = 1;
    filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType); 
});

// Refresh the filterBox when user select 
function refreshFilter() {
    $('input:radio[name="boundaryType"]').change(function () {
        boundaryType = $('input:radio[name="boundaryType"]:checked').val();
        filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    });
    $('input:radio[name="resultType"]').change(function () {
        resultType = $('input:radio[name="resultType"]:checked').val();
        filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    });
    $('input:radio[name="genderType"]').change(function () {
        genderType = $('input:radio[name="genderType"]:checked').val();
        filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    });
    $('input:radio[name="dataType"]').change(function () {
        dataType = $('input:radio[name="dataType"]:checked').val();
        filterBox.update(filterBoxOpen, boundaryType, resultType, genderType, dataType);
    });
}

// When the opacity changed by user, change the choropleth layer's style
function opacityChange() {
    var span = document.getElementById("opacityValue");
    var opacity = document.getElementById("opacitySlider").value;
    span.innerHTML = " " + opacity * 100 + "%";
    // Reset the opacity style of choropleth layer
    choroplethLayer.setStyle({ fillOpacity: opacity });
    zoomChoroplethLayer.setStyle({ fillOpacity: opacity });
}

// Check the type in filter box that selected from user, then redraw the result
function redrawInfoType() {
    // If boundary type is changed 
    $('input:radio[name="boundaryType"]').change(
        // Redraw it
        function () {
            // Get the boundary type that select from user
            boundaryType = $('input:radio[name="boundaryType"]:checked').val();
            console.log(queryType, queryInput, boundaryType, resultType, genderType, dataType);
            // Show the loading box when running execution
            setTimeout(showLoading(1, 1000), 0);
            // If the query result is empty, then alert to user
            setTimeout(checkEmpty(), 1000);
            // Draw the choropleth result of easy search on map after 1 sec
            setTimeout(drawResultMap(townData), 1000);
            setTimeout(drawResultTree(), 1000);
        }
    );
    // If result type is changed
    $('input:radio[name="resultType"]').change(
        // Redraw it
        function () {
            // Get the result type that select from user
            resultType = $('input:radio[name="resultType"]:checked').val();
            console.log(queryType, queryInput, boundaryType, resultType, genderType, dataType);
            // Show the loading box when running execution
            setTimeout(showLoading(1, 1000), 0);
            // If the query result is empty, then alert to user
            setTimeout(checkEmpty(), 1000);
            // Draw the choropleth result of easy search on map after 1 sec
            setTimeout(drawResultMap(townData), 1000);
            setTimeout(drawResultTree(), 1000);
        }
    );
    // If gender type is changed
    $('input:radio[name="genderType"]').change(
        // Redraw it
        function () {
            // Get the gender type that select from user
            genderType = $('input:radio[name="genderType"]:checked').val();
            console.log(queryType, queryInput, boundaryType, resultType, genderType, dataType);
            // Show the loading box when running execution
            setTimeout(showLoading(1, 1000), 0);
            // If the query result is empty, then alert to user
            setTimeout(checkEmpty(), 1000);
            // Draw the choropleth result of easy search on map after 1 sec
            setTimeout(drawResultMap(townData), 1000);
            setTimeout(drawResultTree(), 1000);
        }
    );
    // If data type is changed
    $('input:radio[name="dataType"]').change(
        // Redraw it
        function () {
            // Get the data type that select from user
            dataType = $('input:radio[name="dataType"]:checked').val();
            console.log(queryType, queryInput, boundaryType, resultType, genderType, dataType);
            // Show the loading box when running execution
            setTimeout(showLoading(1, 1000), 0);
            // If the query result is empty, then alert to user
            setTimeout(checkEmpty(), 1000);
            // Draw the choropleth result of easy search on map after 1 sec
            setTimeout(drawResultMap(townData), 1000);
            setTimeout(drawResultTree(), 1000);
        }
    );
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
        console.log("Not Empty!");
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

// Get the ICD9 code to name data from "ICD9.csv", and store in ICD9_data
var ICD9_data = [];
setTimeout(function () {
    d3.csv("ICD9.csv", function(data) { ICD9_data = data; });
}, 0);

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
resultBox.update = function (resultBoxOpen) {
    // When result box is close
    if(resultBoxOpen == 0) {
         this._div.innerHTML = '<div class="resultButton"><input type="button" id="resultButton"></div>';
    }
    // When user open the result box
    else if(resultBoxOpen == 1) {
        // Search text on the result box
        var tableText = "", startYearText = year[0], endYearText = "", columnText = "", diseaseName = "";
        // When user search new data, get the new text about search query
        // Table text
        if (table == "r01_cd") tableText = "門診治療檔 (CD)";
        else if (table == "r01_dd") tableText = "住院費用檔 (DD)";
        else if (table == "r01_oo") tableText = "門診醫令檔 (OO)";
        else if (table == "r01_do") tableText = "住院醫令檔 (DO)";
        // Year text
        if (year.length > 1) endYearText = "~"+year[year.length-1];
        // Column text
        if (searchType == "easy") {
            if (queryType == "FUNC_TYPE") columnText = "就醫科別";
            else if (queryType == "ICD_OP_CODE") columnText = "手術代碼";
            else if (queryType == "ACODE_ICD9") {
                columnText = "國際疾病分類號";
                // Get ICD_CODE's corresponding disease name
                ICD9_data.forEach( function (d) {
                    if (d.ICD_CODE == queryInput) diseaseName = d.NAME;
                });
            }
            else if (queryType == "CURE_ITEM") columnText = "特定治療項目代號";
            else if (queryType == "ICD9CM_CODE") {
                columnText = "診斷代碼";
                // Get ICD_CODE's corresponding disease name
                ICD9_data.forEach( function (d) {
                    if (d.ICD_CODE == queryInput) diseaseName = d.NAME;
                });
            }
            else if (queryType == "BED_DAY") columnText = "住院天數";
            else if (queryType == "ORDER_TYPE") columnText = "醫令類別";
            else if (queryType == "DRUG_NO") columnText = "醫令代碼";
        }
        else { // searchType is complex
            if (table == "r01_cd") {
                if (FUNC_TYPE_query[0] != "") columnText = columnText.concat("就醫科別");
                if (ICD_OP_CODE_query[0] != "") columnText = columnText.concat(" 手術代碼");
                if (ACODE_ICD9_query[0] != "") columnText = columnText.concat(" 國際疾病分類號");
                if (CURE_ITEM_query[0] != "") columnText = columnText.concat(" 特定治療項目代號");
            }
            else if (table == "r01_dd") {
                if (FUNC_TYPE_query[0] != "") columnText = columnText.concat("就醫科別");
                if (ICD_OP_CODE_query[0] != "") columnText = columnText.concat(" 手術代碼");
                if (ICD9CM_CODE_query[0] != "") columnText = columnText.concat(" 診斷代碼");
                if (BED_DAY_query[0] != "") columnText = columnText.concat(" 住院天數");
            }
            queryInput = FUNC_TYPE_query+" "+ICD_OP_CODE_query+" "+ACODE_ICD9_query+" "+CURE_ITEM_query+" "+ICD9CM_CODE_query+" "+BED_DAY_query;
        }
        
        this._div.innerHTML = '<div class="resultButton"><input type="button" id="resultButton">'+
                                '<b style="font-size:16px; color:#777;"> 查詢結果</b></div>'+
                                '<table class="fixed">'+
                                '<col width="40px" />'+
                                '<col width="200px" />'+
                                    '<tr><td><b>資料: </b></td>'+
                                        '<td>'+tableText+'</td>'+
                                    '<tr><td><b>年份: </b></td>'+
                                        '<td>'+startYearText+endYearText+dateText+'</td></tr>'+
                                    '<tr><td><b>欄位: </b></td>'+
                                        '<td>'+columnText+'</td></tr>'+
                                    '<tr><td><b>查詢: </b></td>'+
                                        '<td>'+queryInput+" "+diseaseName+'</td></tr>'+
                                '<table>'+
                                '<div id="resultTree"></div>';
        
        // Draw result tree in the result box
        drawResultTree();
            
        // Add a listener when user click the result button
        L.DomEvent.on(resultButton, 'click', function (e) {
            // Close 
            resultBoxOpen = 0;
            resultBox.update(resultBoxOpen);

            // Add a listener when user click the result button
            L.DomEvent.on(resultButton, 'click', function (e) {
                // Open
                resultBoxOpen = 1;
                resultBox.update(resultBoxOpen);
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
        resultBox.update(resultBoxOpen); 
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
    var opacity = document.getElementById("opacitySlider").value;
    return {
        weight: 5,
        opacity: 1,
        color: '#666',
        dashArray: '',
        fillOpacity: opacity,
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
function refreshLegend(max, min) {
    if (checkEmpty() == true) {
        var changedLegend = legend;
    }
    else {
        // Create a control of color legend on changed map
        var changedLegend = L.control({ position: 'bottomright' });

        // Add a changed legend to show the color meanings
        changedLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = getGrades(max, min, 7),
                labels = [],
                from, to;
            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
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
    if (dataType == "age") {
        if (cellNumber == 7) grades = [0, 20, 30, 40, 50, 60, 70, 80];
        else grades = [0, 20, 40, 60, 70, 80];
    }
    else if (max < 10) {
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
function drawResultMap(data) {
    // Get the boundary data
    getBoundary(data);
    // Draw by county or town boundary
    if (boundaryType == "county") {
        if (playing == 0) drawLegend(countyBoundary);
        drawChoropleth(countyBoundary);
    }
    else {
        if (playing == 0) drawLegend(townBoundary);
        drawChoropleth(townBoundary);
    }
}

// Draw legend by data on map
function drawLegend(boundaryData) {
    // Find the max value in the result
    var max = findMax(boundaryData);
    // Find the min value in the result
    var min = findMin(boundaryData, max);
    console.log("min=" + min, "max=" + max);
    console.log("Draw Legend!")
    // Remove the original legend
    map.removeControl(legend);
    // Create a new legend that refresh the color data
    var changedLegend = refreshLegend(max, min);
    legend = changedLegend;
}

// Draw the choropleth layer and ouput the results
function drawChoropleth(boundaryData) {
    console.log("Draw Choropleth!");
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
    var opacity = document.getElementById("opacitySlider").value;
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: opacity,
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
    var opacity = document.getElementById("opacitySlider").value - 0.2;

    // Set the target county layer's style
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: opacity
    });

    // Set the popup
    if (boundaryType == "county") {
        if (dataType == "data") {
            popup.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
                .openOn(map);
        }
        else {
            popup.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>平均 ' + layer.feature.properties.Data + ' 歲')
                .openOn(map);
        }
    }
    else if (boundaryType == "town") {
        if (dataType == "data") {
            popup.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name +
                '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
                .openOn(map);
        }
        else {
            popup.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + 
                '</b><br>平均 ' + layer.feature.properties.Data + ' 歲')
                .openOn(map);
        }
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
var label = L.popup();

// When mouse click one county, then zoom in
function zoomToFeature(e) {
    var layer = e.target;

    // Zoom to target layer's bounds
    map.fitBounds(layer.getBounds());

    if (boundaryType == "county") {
        if (dataType == "data") {
            // Set the label
            label.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>'+
                '共 ' + layer.feature.properties.Data + ' 筆<br><br>' +
                '<input type="button" id="zoomTownButton" value="顯示鄉鎮區資訊">')
                .openOn(map);
        }
        else if (dataType == "age") {
            var detail = getAgeDetail(layer.feature.properties.C_Name, boundaryType, resultType, genderType);
            // Set the label
            label.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '</b><br>' +
                '平均 '+ layer.feature.properties.Data + ' 歲<br><br>'+
                '1-10  歲 : ' + detail[0] + ' 筆<br>' +
                '11-20 歲 : ' + detail[1] + ' 筆<br>' +
                '21-30 歲 : ' + detail[2] + ' 筆<br>' +
                '31-40 歲 : ' + detail[3] + ' 筆<br>' +
                '41-50 歲 : ' + detail[4] + ' 筆<br>' +
                '51-60 歲 : ' + detail[5] + ' 筆<br>' +
                '61-70 歲 : ' + detail[6] + ' 筆<br>' +
                '71-80 歲 : ' + detail[7] + ' 筆<br>' +
                '81 歲以上: ' + detail[8] + ' 筆<br><br>' +
                '<input type="button" id="zoomTownButton" value="顯示鄉鎮區資訊">')
                .openOn(map);
        }

        L.DomEvent.addListener(zoomTownButton, 'click', function (e) {
            drawZoomTown(layer.feature.properties.C_Name);
            map.closePopup(label);
        });
    }
    else if (boundaryType == "town") {
        if (dataType == "age") {
            var detail = getAgeDetail(layer.feature.properties.T_Name, boundaryType, resultType, genderType);
            // Set the label
            label.setLatLng(e.latlng)
                .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + '</b><br>' +
                '平均 '+ layer.feature.properties.Data + ' 歲<br><br>' +
                '1-10  歲 : ' + detail[0] + ' 筆<br>' +
                '11-20 歲 : ' + detail[1] + ' 筆<br>' +
                '21-30 歲 : ' + detail[2] + ' 筆<br>' +
                '31-40 歲 : ' + detail[3] + ' 筆<br>' +
                '41-50 歲 : ' + detail[4] + ' 筆<br>' +
                '51-60 歲 : ' + detail[5] + ' 筆<br>' +
                '61-70 歲 : ' + detail[6] + ' 筆<br>' +
                '71-80 歲 : ' + detail[7] + ' 筆<br>' +
                '81 歲以上: ' + detail[8] + ' 筆<br>')
                .openOn(map);
        }
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
}

// Draw the choropleth color on map
function zoomStyle(feature) {
    var opacity = document.getElementById("opacitySlider").value;
    return {
        weight: 2,
        opacity: 1,
        color: 'gray',
        dashArray: '3',
        fillOpacity: opacity,
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
    var opacity = document.getElementById("opacitySlider").value - 0.2;
    // Set the target county layer's style
    layer.setStyle({
        weight: 5,
        color: 'black',
        dashArray: '',
        fillOpacity: opacity
    });
    // Set the popup
    if (dataType == "data") {
        popup.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + 
            '</b><br>共 ' + layer.feature.properties.Data + ' 筆')
            .openOn(map);
    }
    else {
        popup.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + 
            '</b><br>平均 ' + layer.feature.properties.Data + ' 歲')
            .openOn(map);
    }
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
    if (dataType == "data") {
        label.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + '</b><br>' +
            '共 ' + layer.feature.properties.Data + ' 筆<br><br>' +
            '<input type="button" id="hideTownButton" value="隱藏鄉鎮區資訊">')
            .openOn(map);
    }
    else {
        label.setLatLng(e.latlng)
            .setContent('<b>' + layer.feature.properties.C_Name + '<br>' + layer.feature.properties.T_Name + '</b><br>' +
            '平均 ' + layer.feature.properties.Data + ' 歲<br><br>' +
            '<input type="button" id="hideTownButton" value="隱藏鄉鎮區資訊">')
            .openOn(map);
    }
    L.DomEvent.addListener(hideTownButton, 'click', function (e) {
        // Clean the zoom town color layer
        zoomChoroplethLayer.clearLayers();
        map.closePopup(label);
    });
}