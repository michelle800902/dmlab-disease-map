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

    // Parse each date data to date format
    hospitalDateData.forEach(function(d) {
        d.x = parseDate(d.x); // 2012-01-01 to time
        d.y = +d.y;           // Data count of time
    });
    // Parse each month data to date format
    monthData.forEach(function(d) {
        d.x = parseDate(d.x); // 2012-01 to time
        d.y = +d.y;           // Data count of time
    });

    // Get the width of user window 
    var window_width = $(window).width(); 

    // Set the dimensions of the time line canvas
    var margin = { top: 10, right: 250, bottom: 60, left: 50 },  // Margin space of top time line
        height = 120 - margin.top - margin.bottom,               // Height of top time line
        width = window_width*0.8 - margin.right - margin.left,   // Width of all time line
        margin2 = { top: 85, right: 250, bottom: 20, left: 50 }, // Margin space of bottom time line
        height2 = 120 - margin2.top - margin2.bottom;            // Height of bottom time line

    // Set the range scale of time line
    var scaleX = d3.time.scale().range([0, width]),      // X axis range sacle of top time line
        scaleY = d3.scale.linear().range([height, 0]),   // Y axis range sacle of top time line
        scaleX2 = d3.time.scale().range([0, width]),     // X axis range sacle of bottom time line
        scaleY2 = d3.scale.linear().range([height2, 0]); // Y axis range sacle of bottom time line

     // Define the div for the tooltip when user mouseover on date point
    var tooltip = d3.select("#timeLine").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    // Adding speed slider on time line
    var speedSlider = d3.select("#timeLine").append("input")
        .attr("type", "range")
        .attr("orient", "vertical")
        .attr("id", "speedSlider")
        .attr("min", "-2")
        .attr("max", "2")
        .attr("value", "0")
        .attr("step", "1")
        .on("change", function() {
            var speed = document.getElementById("speedSlider").value;
            if (speed == -2) speedValue.text("最慢");
            else if (speed == -1) speedValue.text("很慢");
            else if (speed == 0) speedValue.text("適中");
            else if (speed == 1) speedValue.text("很快");
            else if (speed == 2) speedValue.text("最快");
        });

    // Adding speed value text
    var speedValue = d3.select("#timeLine").append("span")
        .attr("id", "speedValue")
        .text("適中");

    // Set the time buttons
    var bWidth = 35, bHeight = 35, // Button width and height
        bSpace = 5,                // Space between buttons
        x0 = 15, y0 = 15,          // X offset and Y offset
        defaultColor = "#aaa",     // Original color
        hoverColor = "#7777BB",    // Mouse hover color
        pressedColor = "#54278f",  // Mouse pressed color
        buttonState = "日";        // State of time button, which one is pressed

    // Define the time svg canvas
    var buttonSVG = d3.select("#timeLine").append("svg")
        .attr("id", "buttonSVG")
        .attr("width", 100)
        .attr("height", 100);
                        
    // Container for all time buttons
    var timeButtons = buttonSVG.append("g")
        .attr("id", "timeButtons"); 

    // Define time button labels
    var timeLabels = [['月', defaultColor], ['日', pressedColor]];

    // Groups for each time button (which will hold a rect and text)
    var timeButtonGroups = timeButtons.selectAll("g.button")
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
            updateButtonColors(d3.select(this), d3.select(this.parentNode));
            if (d3.select(this).select("text").text() == "月") {
                buttonState = "月";
                createTimeLine(monthData);
            }
            else if (d3.select(this).select("text").text() == "日") {
                buttonState = "日";
                createTimeLine(hospitalDateData);
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
    var playButtons = buttonSVG.append("g")
        .attr("id", "playButtons");  

    // Define play button labels
    var playLabels = [['播放', defaultColor], ['暫停', defaultColor]];

    // Groups for each play button (which will hold a rect and text)
    var playButtonGroups = playButtons.selectAll("g.button")
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
            // Change button color
            updateButtonColors(d3.select(this), d3.select(this.parentNode));
            // Play
            if (d3.select(this).select("text").text() == "播放") {
                playing = 1;
                d3.selectAll(".circle").remove();
                d3.selectAll("#playLine").remove();
                console.log("Playing!");
                var speed = document.getElementById("speedSlider").value; //Speed is -2 or -1 or 0 or 1 or 2
                var playingData = 0, playingSpeed = 0;
                if (buttonState == "月") {
                    playingData = monthData;
                    if (speed == -2)      playingSpeed = 60000; // 最慢
                    else if (speed == -1) playingSpeed = 40000; // 很慢
                    else if (speed == 0)  playingSpeed = 20000; // 適中
                    else if (speed == 1)  playingSpeed = 10000; // 很快
                    else if (speed == 2)  playingSpeed = 5000;  // 最快
                }
                else if (buttonState == "日") {
                    playingData = hospitalDateData;
                    if (speed == -2)      playingSpeed = 1000000; // 最慢
                    else if (speed == -1) playingSpeed = 800000;  // 很慢
                    else if (speed == 0)  playingSpeed = 500000;  // 適中
                    else if (speed == 1)  playingSpeed = 300000;  // 很快
                    else if (speed == 2)  playingSpeed = 100000;  // 最快
                }
                var playLine = d3.select("#timeSVG").append("line")
                    .attr("id", "playLine")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr({'x1': 0, 'y1': 5, 'x2': 0, 'y2': 50})
                    // .attr("display", "null")
                    //.style("color", "gray")
                    .transition()
                    .duration(playingSpeed)
                    .ease("linear")
                    .attr({'x1': width, 'y1': 5, 'x2': width, 'y2': 50})
                    .attrTween('x1', function (d, i, a) {
                        return function (t) {
                            var x_value = parseInt(d3.interpolate(a, width)(t));
                            drawPlayCircle(playingData, x_value);
                            return x_value;
                        }
                    });
            }
            // Pause
            else if(d3.select(this).select("text").text() == "暫停") {
                playing = 0;
                d3.select("#timeSVG").selectAll("#playLine").interrupt();
            }
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
    function drawPlayCircle(data, move) {
        // Remove the original circle
        d3.selectAll(".playCircle").remove();
        
        var x0 = scaleX.invert(move),
            i = bisectDate(data, x0, 1);
        if (i == data.length) i = i - 1;
        
        var d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.x > d1.x - x0 ? d1 : d0;
        // Define the circle when mouseover on line
        var playCircle = d3.select("#timeSVG").append("g")
            .attr("class", "playCircle")
            .style("display", "null");

        // Append the circle on it
        playCircle.append("circle")
            .attr("r", 3)
            .attr("fill", "#54278f")
            .attr("stroke", "#54278f")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the attribute of this circle
        playCircle.attr("transform", "translate(" + scaleX(d.x) + "," + scaleY(d.y)+ ")");

        // Set the tooltip div behind this circle
        tooltip.transition()		
                .duration(200)		
                .style("opacity", .7);
        
        if (buttonState == "月") {
            tooltip.html(formatMonth(d.x) + "<br/>"  + d.y + " 筆")
                .style("left", (scaleX(d.x)+210)+"px")
                .style("top", "20px");
            var month = formatMonth(d.x).substr(5, 2);
            if (month == "02")
                drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-28"));
            else if (month == "04" || month == "06" || month == "09" || month == "11")
                drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-30"));
            else 
                drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-31"));
        }
        else if (buttonState == "日") {
            tooltip.html(formatDate(d.x) + "<br/>"  + d.y + " 筆")
                .style("left", (scaleX(d.x)+210)+"px")
                .style("top", "20px");
            drawDateTown(formatDate(d.x), formatDate(d.x));
        }
    }

    // When the mouse click time button, change their color 
    function updateButtonColors(button, parent) {
        parent.selectAll("rect").attr("fill", defaultColor); // Back to original color
        button.select("rect").attr("fill", pressedColor); // Change to pressed color
    }

    // Create a new time line of initial data
    createTimeLine(hospitalDateData);

    // Create time line svg
    function createTimeLine(data) {  
        // Remove the original time line svg
        d3.select("#timeSVG").remove();
    
        // Define the time svg canvas
        var timeSVG = d3.select("#timeLine").append("svg")
            .attr("id", "timeSVG")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        
        // Stable the range of time line contents
        timeSVG.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Define the axis x and axis y
        var axisX = d3.svg.axis().scale(scaleX).orient("bottom"),        // Axis X of top time line 
            axisY = d3.svg.axis().scale(scaleY).orient("left").ticks(3), // Axis Y of top time line 
            axisX2 = d3.svg.axis().scale(scaleX2).orient("bottom");      // Axis X of top bottom line 

        // Define the brush to select time interval
        var brush = d3.svg.brush()
            .x(scaleX2)
            .on("brush", brushed)
            .on("brushend", brushend);

        // Define the area under data line 
        var area = d3.svg.area()
            .interpolate("monotone")
            .x(function(d) { return scaleX(d.x); })
            .y0(height)
            .y1(function(d) { return scaleY(d.y); });
        var area2 = d3.svg.area()
            .interpolate("monotone")
            .x(function(d) { return scaleX2(d.x); })
            .y0(height2)
            .y1(function(d) { return scaleY2(d.y); });
       
        // Define the focus
        var focus = timeSVG.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define the context
        var context = timeSVG.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        // Define the zoom
        var zoom = d3.behavior.zoom()
            //.scaleExtent([1, Infinity])
            .on("zoom", drawFocus);

        // Add rect cover the zoomed graph and attach zoom event.
        var rect = timeSVG.append("svg:rect")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("pointer-events", "all")
            .call(zoom)
            //.on("mouseover", function() { d3.selectAll(".circle").style("display", null); })
            //.on("mouseout", function() { d3.selectAll(".circle").style("display", "none"); })
            .on("mousemove", function() { if (playing == 0) drawCircle(d3.mouse(this)[0]); });

        // Scale the domain range of the data
        scaleX.domain(d3.extent(data.map(function(d) { return d.x; })));
        scaleY.domain([0, d3.max(data.map(function(d) { return d.y+(d.y)*0.2; }))]);
        scaleX2.domain(scaleX.domain());
        scaleY2.domain(scaleY.domain());

        // Set up zoom behavior
        zoom.x(scaleX);

        // Set the area on focus time line
        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);
        
        // Set the x axis on focus time line
        focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX);

        // Set the y axis on focus time line
        focus.append("g")
            .attr("class", "y axis")
            .call(axisY);

        // Set the area on context time line
        context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area2);

        // Set the x axis on context time line
        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(axisX2);

        // Set the brush on context time line
        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            //.attr("y", -6)
            .attr("width", width)
            .attr("height", height2);

        // Define the start text of time
        var timeStart = timeSVG.append("text")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        // Define the end text of time
        var timeEnd = timeSVG.append("text")
            .attr("transform", "translate(" + width + "," + margin.top + ")")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

        if (buttonState == "月") {
            timeStart.text(formatMonth(data[0].x));
            timeEnd.text(formatMonth(data[data.length-1].x));
        }
        else if (buttonState == "日") {
            timeStart.text(formatDate(data[0].x));
            timeEnd.text(formatDate(data[data.length-1].x));
        }

        // When user mouse drag the brush extent
        function brushed() {
            var interval = brush.extent();
            scaleX.domain(brush.empty() ? scaleX2.domain() : brush.extent());
            focus.select(".area").attr("d", area);
            focus.select(".x.axis").call(axisX);
            // Reset zoom scale's domain
            zoom.x(scaleX);
            // Set the text on start and end site of time line
            timeStart.text(formatDate(interval[0]));
            timeEnd.text(formatDate(interval[1]));
        }

        // When user mouse free the brush at ending time
        function brushend() {
            var interval = brush.extent();
            console.log(formatDate(interval[0]), formatDate(interval[1]));
            // Draw the date town of brushed date interval
            drawDateTown(formatDate(interval[0]), formatDate(interval[1]));
        }

        function drawFocus() {
            focus.select(".area").attr("d", area);
            focus.select(".x.axis").call(axisX);
            // Force changing brush range
            brush.extent(scaleX.domain());
            timeSVG.select(".brush").call(brush);
        }

        // Draw the circle when mouse move on the x axis of time line
        function drawCircle(move) {
            d3.selectAll(".circle").remove();
            d3.selectAll(".playCircle").remove();

            // Using move position to define date
            var x0 = scaleX.invert(move),
                i = bisectDate(data, x0, 1);
            if (i == data.length) i = i - 1;

            var d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.x > d1.x - x0 ? d1 : d0;

            // Define the circle when mouseover on line
            var circle = timeSVG.append("g")
                .attr("class", "circle");
                //.style("display", "none");

            // Append the circle on it
            circle.append("circle")
                .attr("r", 3)
                .attr("fill", "#54278f")
                .attr("stroke", "#54278f")
                .attr("cursor", "pointer")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on("mouseover", function() { 
                    // When user mouseover on circle, the circle become bigger
                    circle.selectAll("circle")
                        .attr("r", 7)
                        .attr("stroke-width", 2)
                        .attr("stroke", "#fff");
                })
                .on("mouseout", function() {
                    // Turn back to original small circle
                    circle.selectAll("circle")
                        .attr("r", 3)
                        .attr("stroke-width", 0)
                        .attr("stroke", "#54278f");	
                    // Let the tooltip disappear
                    tooltip.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });

            // Set the attribute of this circle
            circle.attr("transform", "translate(" + scaleX(d.x) + "," + scaleY(d.y)+ ")");
            // Set the tooltip div behind this circle
            tooltip.transition()		
                    .duration(200)		
                    .style("opacity", .7);
            
            if (buttonState == "月") {
                tooltip.html(formatMonth(d.x) + "<br/>"  + d.y + " 筆")
                    .style("left", (scaleX(d.x)+210) + "px")
                    .style("top", "20px");
                var month = formatMonth(d.x).substr(5, 2);
                circle.on("click", function() { 
                    if (month == "02")
                        drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-28"));
                    else if (month == "04" || month == "06" || month == "09" || month == "11")
                        drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-30"));
                    else 
                        drawDateTown(formatDate(d.x), formatMonth(d.x).concat("-31"));
                });
            }
            else if (buttonState == "日") {
                tooltip.html(formatDate(d.x) + "<br/>"  + d.y + " 筆")
                    .style("left", (scaleX(d.x)+210) + "px")
                    .style("top", "20px");
                circle.on("click", function() { drawDateTown(formatDate(d.x), formatDate(d.x)); });
            }
        }
    }
}