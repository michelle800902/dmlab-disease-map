// Get the width of user window
var window_width = $(window).width();

// Set the dimensions of the time line canvas
var margin = { top: 30, right: 200, bottom: 30, left: 50 },  // Margin space of top time line
    margin2 = { top: 125, right: 10, bottom: 8, left: 40 },  // Margin space of bottom time line
    height = 150 - margin.top - margin.bottom,               // Height of top time line
    width = parseInt(window_width*0.8 - margin.right - margin.left),   // Width of all time line
    height2 = 150 - margin2.top - margin2.bottom;            // Height of bottom time line

var xScale  = d3.time.scale().range([0, width]);
var xScale2 = d3.time.scale().range([0, width]); // Duplicate xScale for brushing ref later
var yScale  = d3.scale.linear().range([height, 0]);
var yScale2 = d3.scale.linear().range([height, 0]);

// Get ourbreak data
var outbreaks, openOutbreak = 1;

getOutbreak();

function parseToDate(data) {
    data.forEach(function(d) {
        d.date = parseDate(d.date);
    });
    return data;
}

// Draw the time line on the map
function drawTimeLine() {

    // Remove original speed slider
    d3.select("#speedSlider").remove();
    // Remove original speed value behind speed slider
    d3.select("#speedValue").remove();
    // Remove original time line svg
    d3.select("#timeLine").selectAll("svg").remove();
    // Remove original tooltip on time line
    d3.select("#timeLine").selectAll(".tooltip").remove();

    // Define the div for the tooltip when user mouseover on date point
    let tooltip = d3.select("#timeLine").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Adding speed slider on time line
    let speedSlider = d3.select("#timeLine").append("input")
        .attr("type", "range")
        .attr("orient", "vertical")
        .attr("id", "speedSlider")
        .attr("min", "-2")
        .attr("max", "2")
        .attr("value", "0")
        .attr("step", "1")
        .on("change", function() {
            var speed = document.getElementById("speedSlider").value;
            if (speed == -2)      speedValue.text("最慢");
            else if (speed == -1) speedValue.text("很慢");
            else if (speed == 0)  speedValue.text("適中");
            else if (speed == 1)  speedValue.text("很快");
            else if (speed == 2)  speedValue.text("最快");
        });

    // Adding speed value text
    let speedValue = d3.select("#timeLine").append("span")
        .attr("id", "speedValue")
        .text("適中");

    // Set the time buttons
    let bWidth = 35, bHeight = 35, // Button width and height
        bSpace = 5,                // Space between buttons
        x0 = 15, y0 = 15,          // X offset and Y offset
        defaultColor = "#aaa",     // Original color
        hoverColor = "#7777BB",    // Mouse hover color
        pressedColor = "#54278f";  // Mouse pressed color

    let dateCategories = [], monthCategories = [];
    let buttonState, timeLabels;

    // Parse each date data and month data to date format
    parseToDate(allDateData); 
    parseToDate(allMonthData);

    if (mode == 0) { // mode 0: search mode
        // State of time button, which one is pressed
        buttonState = "月";        
        // Define time button labels
        timeLabels = [['月', pressedColor], ['日', defaultColor]];

        parseToDate(cdcDateData);
        parseToDate(cdcMonthData);
        parseToDate(pttDateData);
        parseToDate(pttMonthData);    

        dateCategories.push( { name: "cdc", values: cdcDateData,  visible: true });
        dateCategories.push( { name: "ptt", values: pttDateData,  visible: true });
        monthCategories.push({ name: "cdc", values: cdcMonthData, visible: true });
        monthCategories.push({ name: "ptt", values: pttMonthData, visible: true });
    }
    else { // mode 1: simulate mode
        // State of time button, which one is pressed
        buttonState = "日";        
        // Define time button labels
        timeLabels = [['月', defaultColor], ['日', pressedColor]];

        parseToDate(cdcDateData);
        parseToDate(cdcMonthData);

        dateCategories.push( { name: "cdc", values: cdcDateData,  visible: true });
        dateCategories.push( { name: "ptt", values: cdcDateData,  visible: false });
        monthCategories.push({ name: "cdc", values: cdcMonthData, visible: true });
        monthCategories.push({ name: "ptt", values: cdcMonthData, visible: false });
    }

    outbreaks.forEach(function(d) {
        d.date = parseDate(d.time);
    });

    // Define the time svg canvas
    let buttonSVG = d3.select("#timeLine").append("svg")
        .attr("id", "buttonSVG")
        .attr("width", 100)
        .attr("height", 100);

    // Container for all time buttons
    let timeButtons = buttonSVG.append("g")
        .attr("id", "timeButtons");

    // // Define time button labels
    // let timeLabels = [['月', pressedColor], ['日', defaultColor]];

    // Groups for each time button (which will hold a rect and text)
    let timeButtonGroups = timeButtons.selectAll("g.button")
        .data(timeLabels)
        .enter()
        .append("g")
        .attr("class", "button")
        .style("cursor", "pointer")
        .on("mouseover", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor)
                d3.select(this).select("rect").attr("fill", hoverColor);
        })
        .on("mouseout", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor)
                d3.select(this).select("rect").attr("fill", defaultColor);
        })
        .on("click", function(d) {
            playing = 0;
            playing_x_value = 0;
            d3.selectAll("#playLine").interrupt();
            d3.selectAll("#playLine").remove();
            d3.selectAll(".tooltip").style("display", "none"); // Hide the tooltip on time line
            
            playButtons.selectAll("rect").attr("fill", defaultColor);
            updateButtonColors(d3.select(this), d3.select(this.parentNode));

            if (d3.select(this).select("text").text() == "月") {
                buttonState = "月";
                create(allMonthData, monthCategories);
            }
            else if (d3.select(this).select("text").text() == "日") {
                buttonState = "日";
                create(allDateData, dateCategories);
            }
        });

    // Adding a rect to each time button group
    timeButtonGroups.append("rect")
        .attr("class", "buttonRect")
        .attr("width", bWidth)
        .attr("height", bHeight)
        .attr("x", function(d, i) { return x0+(bWidth+bSpace)*i; })
        .attr("y", y0)
        .attr("rx", 5) // rx and ry give the rects rounded corners
        .attr("ry", 5)
        .attr("fill", function(d) { return d[1]; });

    // Adding text to each time button group, centered within the button rect
    timeButtonGroups.append("text")
        .attr("class", "buttonText")
        //.attr("font-family", "FontAwesome")
        .attr("x", function(d, i) { return x0 + (bWidth+bSpace)*i + bWidth/2; })
        .attr("y", y0+(bHeight/2))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .text(function(d) { return d[0]; });

    // Container for all play buttons
    let playButtons = buttonSVG.append("g")
        .attr("id", "playButtons");

    // Define play button labels
    let playLabels = [['播放', defaultColor], ['暫停', defaultColor]];

    let playing_x_value = 0;

    // Groups for each play button (which will hold a rect and text)
    let playButtonGroups = playButtons.selectAll("g.button")
        .data(playLabels)
        .enter()
        .append("g")
        .attr("class", "button")
        .style("cursor", "pointer")
        .on("mouseover", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor)
                d3.select(this).select("rect").attr("fill", hoverColor);
        })
        .on("mouseout", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor)
                d3.select(this).select("rect").attr("fill", defaultColor);
        })
        .on("click", function(d) {
            // Play
            if (d3.select(this).select("text").text() == "播放" &&
                d3.select(this).select("rect").attr("fill") != pressedColor) {
                playing = 1;
                d3.selectAll(".circle").remove();
                d3.selectAll("#playLine").remove();
                d3.selectAll(".tooltip").style("display", "");
                console.log("Playing!");
                let speed = document.getElementById("speedSlider").value; //Speed is -2 or -1 or 0 or 1 or 2
                let playingData = 0, playingSpeed = 0;
                if (buttonState == "月") {
                    playingData = allMonthData;
                    if (speed == -2)      playingSpeed = 60000; // 最慢
                    else if (speed == -1) playingSpeed = 40000; // 很慢
                    else if (speed == 0)  playingSpeed = 20000; // 適中
                    else if (speed == 1)  playingSpeed = 10000; // 很快
                    else if (speed == 2)  playingSpeed = 5000;  // 最快
                }
                else if (buttonState == "日") {
                    playingData = allDateData;
                    if (speed == -2)      playingSpeed = 800000; // 最慢
                    else if (speed == -1) playingSpeed = 600000; // 很慢
                    else if (speed == 0)  playingSpeed = 400000; // 適中
                    else if (speed == 1)  playingSpeed = 200000; // 很快
                    else if (speed == 2)  playingSpeed = 100000; // 最快

                    if (mode == 1) {
                        playingSpeed = 10000;
                    }
                }
                let playLine = d3.select("#timeSVG").append("line")
                    .attr("id", "playLine")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr({'x1': playing_x_value, 'y1': 5, 'x2': playing_x_value, 'y2': 50})
                    .transition()
                    .duration(playingSpeed)
                    .ease("linear")
                    .attr({'x1': width, 'y1': 5, 'x2': width, 'y2': 50})
                    .attrTween('x1', function (d, i, a) {
                        return function (t) {
                            playing_x_value = parseInt(d3.interpolate(a, width)(t));
                            drawPlay(playingData, playing_x_value);
                            if (playing_x_value == width) {
                                // Remove the original circle
                                d3.selectAll(".playCircle").remove();
                                // Hide the tooltip on time line
                                d3.selectAll(".tooltip").style("display", "none");
                                playing = 0;
                                playing_x_value = 0;
                                d3.selectAll("#playLine").remove();
                                playButtons.selectAll("rect").attr("fill", defaultColor);
                            }
                            return playing_x_value;
                        }
                    });
            }
            // Pause
            else if(d3.select(this).select("text").text() == "暫停") {
                console.log("Stop Playing!")
                d3.selectAll("#playLine").interrupt();
            }
            // Change button color
            updateButtonColors(d3.select(this), d3.select(this.parentNode));
        });

    // Adding a rect to each play button group
    playButtonGroups.append("rect")
        .attr("class", "buttonRect")
        .attr("width", bWidth)
        .attr("height", bHeight)
        .attr("x", function(d, i) { return x0+(bWidth+bSpace)*i; })
        .attr("y", (y0+bHeight+bSpace))
        .attr("rx", 5) // rx and ry give the rects rounded corners
        .attr("ry", 5)
        .attr("fill", function(d) { return d[1]; });

    // Adding text to each play button group, centered within the button rect
    playButtonGroups.append("text")
        .attr("class", "buttonText")
        //.attr("font-family", "FontAwesome")
        .attr("x", function(d, i) { return x0 + (bWidth+bSpace)*i + bWidth/2; })
        .attr("y", (y0+bHeight+bSpace)+(bHeight/2))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "white")
        .text(function(d) { return d[0]; });

    // Draw circle when playing time line
    function drawPlay(data, move) {
        // Remove the original circle
        d3.selectAll(".playCircle").remove();

        let x0 = xScale.invert(move),
            i = bisectDate(data, x0, 1);
        if (i == data.length) i = i - 1;

        let d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        // Define the circle when mouseover on line
        let playCircle1 = d3.select("#timeSVG").append("g")
            .attr("class", "playCircle")
            .style("display", "null");
        
        let playCircle2 = d3.select("#timeSVG").append("g")
            .attr("class", "playCircle")
            .style("display", "null");

        // Append the circle on it
        playCircle1.append("circle")
            .attr("r", 3)
            .attr("fill", "#9788CD")
            .attr("stroke", "#9788CD")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the attribute of this circle
        playCircle1.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.cdc)+ ")");
        
        if (mode == 0) {
            playCircle2.append("circle")
                .attr("r", 3)
                .attr("fill", "#D3779F")
                .attr("stroke", "#D3779F")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            playCircle2.attr("transform", "translate(" + xScale2(d.date) + "," + yScale2(d.ptt)+ ")");
        }
        

        // Set the tooltip div behind this circle
        tooltip.transition()
                .duration(200)
                .style("opacity", 0.6);

        let startDate = formatDate(d.date);
        let endDate = "";

        if (buttonState == "月") {
            tooltip.html(formatMonth(d.date) + "<br>cdc : "  + d.cdc + " 筆<br>ptt : " + d.ptt + " 筆")
                .style("left", (xScale(d.date)+210)+"px");

            let month = formatMonth(d.date).substr(5, 2);
            if (month == "02")
                endDate = formatMonth(d.date).concat("-28");
            else if (month == "04" || month == "06" || month == "09" || month == "11")
                endDate = formatMonth(d.date).concat("-30");
            else
                endDate = formatMonth(d.date).concat("-31");
        }
        else if (buttonState == "日") {
            if (mode == 0) {
                tooltip.html(formatDate(d.date) + "<br>cdc : "  + d.cdc + " 筆<br>ptt : " + d.ptt + " 筆")
                    .style("left", (xScale(d.date)+210)+"px");
            }
            else {
                tooltip.html(formatDate(d.date) + "<br>simulate : "  + d.cdc + " 筆<br>")
                    .style("left", (xScale(d.date)+210)+"px");
            }
            endDate = startDate;
        }
        
        drawDateCounty(startDate, endDate);

        if(mode == 0) refresh_marker(startDate, endDate);
    }

    // When the mouse click time button, change their color
    function updateButtonColors(button, parent) {
        parent.selectAll("rect").attr("fill", defaultColor); // Back to original color
        button.select("rect").attr("fill", pressedColor); // Change to pressed color
    }


    // Create a new time line of initial data
    if (mode == 0) create(allMonthData, monthCategories);
    else create(allDateData, dateCategories);
    
    
    ///////////////////////////////////////////////////////////////////////////////
    function create(data, categories) {
        // console.log("data", data);
        // console.log("categories", categories);

        // Remove the original time line svg
        d3.select("#timeSVG").remove();

        // Colors 
        let color = d3.scale.ordinal().range(["#9788CD", "#D3779F"]);  
        // xAxis for top timeline chart
        let xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        // xAxis for brush slider
        let xAxis2 = d3.svg.axis().scale(xScale2).orient("bottom");    
        // yAxis for cdc data in left
        let yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);  
        // yAxis for ptt data in right
        let yAxis2 = d3.svg.axis().scale(yScale2).orient("right").ticks(5); 

        let line = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.count); });

        let line2 = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale2(d.count); });

        let maxY; // Defined later to update yAxis

        let svg = d3.select("#timeLine").append("svg")
            .attr("id", "timeSVG")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom) //height + margin.top + margin.bottom
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Create invisible rect for mouse tracking
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)                                    
            .attr("x", 0) 
            .attr("y", 0)
            .attr("id", "mouse-tracker"); 

//for slider part-----------------------------------------------------------------------------------

        // Brushing context box container
        let context = svg.append("g") 
            .attr("transform", "translate(" + 0 + "," + 105 + ")")
            .attr("class", "context");

        //append clip path for lines plotted, hiding those part out of bounds
        svg.append("defs")
            .append("clipPath") 
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height); 

//end slider part----------------------------------------------------------------------------------- 

        color.domain(["cdc", "ptt"]);

        //console.log("categories", categories);

        xScale.domain(d3.extent(data, function(d) { return d.date; })); // extent = highest and lowest points, domain is data, range is bouding box
        xScale2.domain(xScale.domain()); // Setting a duplicate xdomain for brushing reference later
        yScale.domain( [0, d3.max(categories[0].values, function(value) { return value.count+value.count*0.2; })]); // cdc y scale
        yScale2.domain([0, d3.max(categories[1].values, function(value) { return value.count+value.count*0.2; })]); // ptt y scale


//for slider part-----------------------------------------------------------------------------------

        // let brush = d3.svg.brush()//for slider bar at the bottom
        //   .x(xScale2) 
        //   .on("brush", brushed);

        // context.append("g") // Create brushing xAxis
        //   .attr("class", "x axis2")
        //   .attr("transform", "translate(0," + height2 + ")")
        //   .call(xAxis2);

        // let contextArea = d3.svg.area() // Set attributes for area chart in brushing context graph
        //   .interpolate("monotone")
        //   .x(function(d) { return xScale2(d.date); }) // x is scaled to xScale2
        //   .y0(height2) // Bottom line begins at height2 (area chart not inverted) 
        //   .y1(0); // Top line of area, 0 (area chart not inverted)

        // //plot the rect as the bar at the bottom
        // context.append("path") // Path is created using svg.area details
        //   .attr("class", "area")
        //   .attr("d", contextArea(categories[1].values)) // pass first categories data .values to area path generator 
        //   .attr("fill", "#fff")
        //   .attr("opacity", 0.3);

        // //append the brush for the selection of subsection  
        // context.append("g")
        //   .attr("class", "x brush")
        //   .call(brush)
        //   .selectAll("rect")
        //   .attr("height", height2) // Make brush rects same height 
        //   .attr("fill", "#E6E7E8")
        //   .attr("opacity", 0.5);

//end slider part-----------------------------------------------------------------------------------

        // draw line graph
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        if (mode == 0) {
            svg.append("g")
                .attr("class", "y axis")
                .style("fill", "#9788CD")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("x", -10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("fill", "#9788CD")
                .text("cdc");

            svg.append("g")
                .attr("class", "y axis2")
                .style("fill", "#D3779F")
                .attr("transform", "translate(" + width + ", 0)")
                .call(yAxis2)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -20)
                .attr("x", -10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("fill", "#D3779F")
                .text("ptt");
        }
        else {
            svg.append("g")
                .attr("class", "y axis")
                .style("fill", "#9788CD")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("x", -10)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("fill", "#9788CD")
                .text("simulate");
        }
        
            
        let issue = svg.selectAll(".issue")
            .data(categories) // Select nested data and append to new svg group elements
            .enter().append("g")
            .attr("class", "issue");   

        issue.append("path")
            .attr("class", "line")
            .style("pointer-events", "none") // Stop line interferring with cursor
            .attr("id", function(d) {
                return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
            })
            .attr("d", function(d) { 
                // If array key "visible" = true then draw line, if not then don't 
                if (d.name == "cdc") return d.visible ? line(d.values) : null; 
                else return d.visible ? line2(d.values) : null;
            })
            .attr("clip-path", "url(#clip)") //use clip path to make irrelevant part invisible
            .style("stroke", function(d) { return color(d.name); });

        // draw legend
        let legendSpace = 50 / categories.length; // 450/number of issues (ex. 40)    

        issue.append("rect")
            .attr("width", 10)
            .attr("height", 10)                                    
            .attr("x", width + (margin.right/3) - 15) 
            .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
            .attr("fill",function(d) {
                return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
            })
            .style("opacity", function(d) {
                return d.visible ? 1 : .0;
            })
            .attr("class", "legend-box")
            .on("click", function(d){   // On click make d.visible 
                d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

                issue.select("path")
                    .transition()
                    .attr("d", function(d){
                        // If d.visible is true then draw line for this d selection
                        if (d.name == "cdc") return d.visible ? line(d.values) : null; 
                        else return d.visible ? line2(d.values) : null;
                    })

                issue.select("rect")
                    .transition()
                    .attr("fill", function(d) {
                        return d.visible ? color(d.name) : "#F1F1F2";
                    });
            })
            .on("mouseover", function(d){
                d3.select(this)
                    .transition()
                    .attr("fill", function(d) { return color(d.name); });
                d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
                    .transition()
                    .style("stroke-width", 3);  
            })
            .on("mouseout", function(d){
                d3.select(this)
                    .transition()
                    .attr("fill", function(d) {
                        return d.visible ? color(d.name) : "#F1F1F2";
                    });

                d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
                    .transition()
                    .style("stroke-width", 2);
            })
        
        if (mode == 0) {
            issue.append("text")
                .attr("x", width + (margin.right/3)) 
                .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); }) 
                .style("fill", function(d) { return color(d.name); }) 
                .text(function(d) { return d.name; });
        }
        else {
            issue.append("text")
                .attr("x", width + (margin.right/3)) 
                .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); }) 
                .style("fill", function(d) { return color(d.name); }) 
                .text(function(d) { 
                    if (d.name == "cdc") return "simulate";
                    else return "";
                });
        }
        

        if (mode == 0) {
            // Outbreak point
            svg.append("g").append("circle")
                .attr("r", 5)
                .style("fill", "red")
                .style("stroke", "white")
                // .style("pointer", "cursor")
                .attr("transform", "translate(" +(width+57)+ ", 74)")
                .on("click", function() {
                    if (openOutbreak == 1) {
                        d3.selectAll(".outbreakCircle").remove();
                        openOutbreak = 0;
                    }
                    else {
                        drawOutbreak();
                    }
                });
               
            svg.append("text")
                .attr("fill", "red")
                .text("outbreak")
                .attr("transform", "translate(" +(width+66)+ ", 77)");
        }
        
        //drawOutbreak();

function drawOutbreak() {
    openOutbreak = 1;

    outbreaks.forEach(function(o) {
        let x0 = o.date,
            i = bisectDate(data, x0, 1);
        if (i == data.length) i = i - 1;

        let d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        // Append the circle of outbreak on ptt line
        d3.select("#timeSVG").append("g")
            .attr("class", "outbreakCircle")
            .append("circle")
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke", "white")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("transform", "translate(" + (xScale2(d.date)+margin.left) + "," + (yScale2(d.ptt)+margin.top)+ ")");
    });          
    
}

        // Hover line 
        let hoverLineGroup = svg.append("g") 
            .attr("class", "hover-line");

        let hoverLine = hoverLineGroup // Create line with basic attributes
            .append("line")
            .attr("id", "hover-line")
            .attr("x1", 10).attr("x2", 10) 
            .attr("y1", 0).attr("y2", height)
            .style("pointer-events", "none") // Stop line interferring with cursor
            .style("opacity", 0)             // Set initial line's opacity to zero 
            .style("display", "none");

        var hoverDate = hoverLineGroup
            .append('text')
            .attr("class", "hover-text")
            .attr("y", height - (height-30)) // hover date text position
            .attr("x", width - 150)          // hover date text position
            .style("fill", "#E6E7E8");

        let focus = issue.select("g") // create group elements to house tooltip text
            .attr("class", "focus"); 

        // Add mouseover events for hover line.
        d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
        .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
        .on("mouseout", function() {
            if (playing == 0) {
                hoverDate.text(null);                            // on mouseout remove text for hover date
                d3.select("#hover-line").style("opacity", 1e-6); // on mouse out making line invisible
                // Remove the original circle
                d3.selectAll(".playCircle").remove();
                // Hide the tooltip on time line
                d3.selectAll(".tooltip").style("display", "none");
            }
        });

        function mousemove() {
            if (playing == 0) {
                let mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
                let graph_x = xScale.invert(mouse_x); // 
                
                let format = d3.time.format('%d %b %Y'); // Format hover date text to show three letter month and full year
                
                // Scale mouse position to xScale date and format it to show month and year
                hoverDate.text(format(graph_x))
                    .attr("transform", "translate(-5,-10)"); 
                
                d3.select("#hover-line") // select hover-line and changing attributes to mouse position
                    .attr("x1", mouse_x) 
                    .attr("x2", mouse_x)
                    .style("opacity", 1); // Making line visible

                let x0 = xScale.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                
                // Remove the original circle
                d3.selectAll(".playCircle").remove();
                // Display the tooltip
                d3.selectAll(".tooltip").style("display", "");

                // Define the circle when mouseover on line
                let playCircle1 = d3.select("#timeSVG").append("g")
                    .attr("class", "playCircle")
                    .style("display", "null");
                
                let playCircle2 = d3.select("#timeSVG").append("g")
                    .attr("class", "playCircle")
                    .style("display", "null");

                // Append the circle on it
                playCircle1.append("circle")
                    .attr("r", 3)
                    .attr("fill", "#9788CD")
                    .attr("stroke", "#9788CD")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Set the attribute of this circle
                playCircle1.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.cdc)+ ")");

                if (mode == 0) {
                    playCircle2.append("circle")
                        .attr("r", 3)
                        .attr("fill", "#D3779F")
                        .attr("stroke", "#D3779F")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    playCircle2.attr("transform", "translate(" + xScale2(d.date) + "," + yScale2(d.ptt)+ ")");
                }
                
                // Set the tooltip div behind this circle
                tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.6);

                let startDate = formatDate(d.date);
                let endDate = "";

                if (buttonState == "月") {
                    tooltip.html(formatMonth(d.date) + "<br>cdc : "  + d.cdc + " 筆<br>ptt : " + d.ptt + " 筆")
                        .style("left", (xScale(d.date)+210)+"px");

                    let month = formatMonth(d.date).substr(5, 2);
                    if (month == "02")
                        endDate = formatMonth(d.date).concat("-28");
                    else if (month == "04" || month == "06" || month == "09" || month == "11")
                        endDate = formatMonth(d.date).concat("-30");
                    else
                        endDate = formatMonth(d.date).concat("-31");
                }
                else if (buttonState == "日") {
                    if (mode == 0) {
                        tooltip.html(formatDate(d.date) + "<br>cdc : "  + d.cdc + " 筆<br>ptt : " + d.ptt + " 筆")
                            .style("left", (xScale(d.date)+210)+"px");
                    }
                    else {
                        tooltip.html(formatDate(d.date) + "<br>simulate : "  + d.cdc + " 筆<br>")
                            .style("left", (xScale(d.date)+210)+"px");
                    }
                    endDate = startDate;
                }
            }
        }; 

        //for brusher of the slider bar at the bottom
        function brushed() {

            xScale.domain(brush.empty() ? xScale2.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent 

            svg.select(".x.axis") // replot xAxis with transition when brush used
                .transition()
                .call(xAxis);

            issue.select("path") // Redraw lines based on brush xAxis scale and domain
                .transition()
                .attr("d", function(d) {
                    // If d.visible is true then draw line for this d selection
                    if (d.name == "cdc") return d.visible ? line(d.values) : null; 
                    else return d.visible ? line2(d.values) : null; 
                });
        };     

        function findMaxY(data){  // Define function "findMaxY"
            let maxYValues = data.map(function(d) { 
                if (d.visible){
                    return d3.max(d.values, function(value) { // Return max rating value
                        return value.count+value.count*0.2; 
                    });
                }
            });
            return d3.max(maxYValues);
        } 
    }
}


/*********************** Draw outbreak of ptt articles on time line ***********************/

function getOutbreak() {
    //start_pg();
    $.ajax({
        url: "/get_outbreak/", 
        data: {   
        },
        //dataType: "json",
        method: "GET",
        //xhr:refresh_pg,
        success: function(response) {
            outbreaks = response;
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

