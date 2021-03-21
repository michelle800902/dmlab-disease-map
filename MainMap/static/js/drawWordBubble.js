function getWord2Vec(countyName, keyword) {
    console.log(countyName, keyword);
    start_pg();
    $.ajax({
        url: "/get_word2vec/", 
        data: {
            location: countyName,
            keyword: keyword    
        },
        //dataType: "json",
        method: "GET",
        xhr: refresh_pg,
        success: function(response) {
            drawWordBubble(countyName, keyword, response);
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

function drawWordBubble(countyName, keyword, wordData) {

    d3.select("div#wordCloud").selectAll("svg").remove();

    let width = 600,
        height = 400,
        padding = 1.5, // separation between same-color nodes
        clusterPadding = 6, // separation between different-color nodes
        maxRadius = 12;

    //let color = d3.scale.category20();
    let color = d3.scale.ordinal().range(["aec7e8"]);

    // Push the keyword into data
    wordData.push({word: keyword, size: 1.00000});

    wordData.forEach(function(d) {
        d.size = +d.size;
    });

    let cs = ["0"];      // cluster categories
    let n = wordData.length, // total number of nodes
        m = cs.length;   // number of distinct clusters

    //create clusters and nodes
    let clusters = new Array(m);
    let nodes = [];
    for (var i = 0; i<n; i++) {
        nodes.push(create_nodes(wordData, i));
    }

    let force = d3.layout.force()
        .nodes(nodes)
        .size([width, height])
        .gravity(.02)
        .charge(0)
        .on("tick", tick)
        .start();

    // Append back button
    let backButton = d3.select("div#wordCloud")
        .append("input")
        .attr("type", "button")
        .attr("id", "backButton")
        .attr("value", "返回")
        .style("margin-left", "10px")
        .style("margin-left", "10px")
        .on("click", function() {
            getWordCloud(countyName);
            d3.select("#backButton").remove();
        });

    let svg = d3.select("div#wordCloud").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Search Word
    svg.append("text")
        .style("font-size", "16px")
        .style("fill", "gray")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(120, 40)"; })
        .text(countyName);

    svg.append("text")
        .style("font-size", "16px")
        .style("fill", "gray")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(120, 60)"; })
        .text("疫情輿情");

    svg.append("text")
        .style("font-size", "50px")
        .style("fill", color(0))
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(120, 120)"; })
        .text('"'+keyword+'"')
        
    svg.append("text")
        .style("font-size", "16px")
        .style("fill", "gray")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(120, 160)"; })
        .text("相關詞");

    let node = svg.selectAll("circle")
        .data(nodes)
        .enter().append("g").call(force.drag);

    node.append("circle")
        .style("fill", function(d) { return color(d.cluster); })
        .attr("r", function(d){ return d.radius; })

    node.append("text")
        .attr("dy", "-0.5em")
        .style("font-size", function(d) { return "16px"; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.text; });

    node.append("text")
        .attr("dy", "1em")
        .style("font-size", function(d) { return "14px"; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.size; })
        .style("fill", "gray");


    function create_nodes(wordData, node_counter) {
        let circleSize = d3.scale.pow().exponent(5).domain([0,1]).range([30,50]);
        let i = cs.indexOf(wordData[node_counter].group),
            r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            d = {
                cluster: i,
                size: wordData[node_counter].size.toFixed(5),
                radius: circleSize(wordData[node_counter].size),
                text: wordData[node_counter].word,
                x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
                y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;

        return d;
    };

    function tick(e) {
        node.each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
        .attr("transform", function (d) {
            var k = "translate(" + d.x + "," + d.y + ")";
            return k;
        })

    }

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
        return function (d) {
            let cluster = clusters[d.cluster];
            if (cluster === d) return;
            let x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
            if (l != r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
        };
    }

    // Resolves collisions between d and all other circles.
    function collide(alpha) {
        let quadtree = d3.geom.quadtree(nodes);
        return function (d) {
            let r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== d)) {
                    let x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                    if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        };
    }

    Array.prototype.contains = function(v) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === v) return true;
        }
        return false;
    };

}
