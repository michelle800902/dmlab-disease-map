// Draw result tree diagram by county
function drawResultTree() {
    // Get the result of all county and store in countyTree
    getResult(countyBoundary);

    // Remove the original result tree
    d3.select("#resultSVG").remove();

    var margin = {top: 20, right: 10, bottom: 20, left: 10},
        width = 250 - margin.left - margin.right,
        barHeight = 20;
        //barWidth = width * .8;
    var i = 0,
        duration = 400,
        root = countyTree[0];

    // Define the tree of nodes
    var tree = d3.layout.tree()
        .nodeSize([0, 20]);

    // Define the links between nodes
    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    // Define the svg of this result tree
    var svg = d3.select("#resultTree").append("svg")
        .attr("id", "resultSVG")
        .append("g")
        .attr("width", width + margin.left + margin.right)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    update(root);

    function update(source) {
        // Compute the new tree layout
        var nodes = tree.nodes(root);
        // Set the height 
        var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

        // Transition when tree be opened
        d3.select("#resultSVG")
            .attr("width", width)
            .attr("height", height);
        d3.select(self.frameElement)
            .transition()
            .duration(duration)
            .style("height", height + "px");

        // Compute the layout
        nodes.forEach(function(n, i) {
            n.x = i * barHeight;
        });

        // Update the nodes data
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .style("opacity", 1e-6);

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect")
            .attr("y", -barHeight / 2)
            .attr("height", barHeight)
            .attr("width", barWidth)
            .style("fill", barColor)
            .on("click", function (d) {
                click(d);
                drawClickCounty(d.name);
            })
            .on("mouseover", function (d) { 
                d3.select(this).style("fill-opacity", .7);
                drawMouseoverCounty(d.name); 
            })
            .on("mouseout", function () {
                d3.select(this).style("fill-opacity", .5);
                mouseoverLayer.clearLayers();
            });

        nodeEnter.append("text")
            .attr("dy", 3.5)
            .attr("dx", 5.5)
            .text(function(d) { return d.name+" "+d.data; });

        // Transition nodes to their new position.
        if (playing == 0) {
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);
        }
        else {
            nodeEnter.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                .style("opacity", 1);
        }
        
        node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .style("opacity", 1)
            .select("rect")
            .style("fill", barColor);

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .style("opacity", 1e-6)
            .remove();

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(tree.links(nodes), function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } 
        else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    // Get the bar width
    function barWidth(d) {
        return d._children ? width * .8 : d.children ? width * .8 : width * .3 + checkGrade(d.data)*10;
    }

    // Get the bar color
    function barColor(d) {
        return d._children ? "#3182bd" : d.children ? "#c6dbef" : getColor(checkGrade(d.data));
    }
}

// Save the data result into countyTree.js
function getResult(boundaryData) {
    countyTreeInitialize();
    for (var i = 0; i < boundaryData.features.length; i++) {
        for (var j = 0; j < countyTree[0].children.length; j++) {
            for (var k = 0; k < countyTree[0].children[j].children.length; k++) {
                if (boundaryData.features[i].properties.C_Name == countyTree[0].children[j].children[k].name) {
                    countyTree[0].children[j].children[k].data = boundaryData.features[i].properties.Data;
                    break;
                }
            }
        }
    }
    if (dataType == "data") {
        for (var i = 0; i < countyTree.length; i++) {
            for (var j = 0; j < countyTree[i].children.length; j++) {
                for (var k = 0; k < countyTree[i].children[j].children.length; k++) {
                    countyTree[i].children[j].data = countyTree[i].children[j].data + countyTree[i].children[j].children[k].data;
                }
                countyTree[i].data = countyTree[i].data + countyTree[i].children[j].data;
            }
        }
    }
    else {
        for (var i = 0; i < countyTree.length; i++) {
            var countArea = 0; // Count the number of none zero age area
            for (var j = 0; j < countyTree[i].children.length; j++) {
                var countCounty = 0; // Count the number of none zero age county
                for (var k = 0; k < countyTree[i].children[j].children.length; k++) {
                    countyTree[i].children[j].data = parseFloat(countyTree[i].children[j].data) + parseFloat(countyTree[i].children[j].children[k].data);
                    if (parseFloat(countyTree[i].children[j].children[k].data) != 0.0) countCounty++;
                    if (k == countyTree[i].children[j].children.length-1 && countyTree[i].children[j].data != 0.0) 
                        countyTree[i].children[j].data = (countyTree[i].children[j].data / countCounty).toFixed(1); 
                }
                countyTree[i].data = parseFloat(countyTree[i].data) + parseFloat(countyTree[i].children[j].data);
                if (parseFloat(countyTree[i].children[j].data) != 0.0) countArea++;
                if (j == countyTree[i].children.length-1 && countyTree[i].data != 0.0)
                    countyTree[i].data = (countyTree[i].data / countArea).toFixed(1);
            }
        }
    }
}

// Initialize the countyTree.js
function countyTreeInitialize() {
    if (dataType == "data") {
        for (var i = 0; i < countyTree.length; i++) {
            for (var j = 0; j < countyTree[i].children.length; j++) {
                for (var k = 0; k < countyTree[i].children[j].children.length; k++) {
                    countyTree[i].children[j].children[k].data = 0;
                }
                countyTree[i].children[j].data = 0;
            }
            countyTree[i].data = 0;
        }
    }
    else {
        for (var i = 0; i < countyTree.length; i++) {
            for (var j = 0; j < countyTree[i].children.length; j++) {
                for (var k = 0; k < countyTree[i].children[j].children.length; k++) {
                    countyTree[i].children[j].children[k].data = (0).toFixed(1);
                }
                countyTree[i].children[j].data = (0).toFixed(1);
            }
            countyTree[i].data = (0).toFixed(1);
        }
    }
}