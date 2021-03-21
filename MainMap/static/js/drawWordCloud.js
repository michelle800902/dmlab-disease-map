function getWordCloud(countyName) {
    start_pg();
    $.ajax({
        url: "/get_word_cloud/", 
        data: {
            location: countyName     
        },
        //dataType: "json",
        method: "GET",
        xhr: refresh_pg,
        success: function(response) {
            openWordCloud();
            drawWordCloud(countyName, response);
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


function openWordCloud() {
    $("body").append('<div class="modal modal-external fade" id="0" tabindex="-1" role="dialog" aria-labelledby="0"><i class="loading-icon fa fa-circle-o-notch fa-spin"></i></div>');

    $("#" + "0" + ".modal").on("show.bs.modal", function () {
        var _this = $(this);

        _this.append(`
        <div class="modal-item-detail modal-dialog" role="document">
            <div class="modal-content">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <div id="wordCloud" style="width:800px;"></div>
            </div>
        </div>`);

        _this.on("hidden.bs.modal", function () {
            $(".pac-container").remove();
            _this.remove();
        });
    });

    $("#" + "0" + ".modal").modal("show");

    function timeOutActions(_this){
        setTimeout(function(){
            if( _this.find(".map").length ){
                if( _this.find(".modal-dialog").attr("data-address") ){
                    simpleMap( 0, 0, "map-modal", _this.find(".modal-dialog").attr("data-marker-drag"), _this.find(".modal-dialog").attr("data-address") );
                }
                else {
                    simpleMap( _this.find(".modal-dialog").attr("data-latitude"), _this.find(".modal-dialog").attr("data-longitude"), "map-modal", _this.find(".modal-dialog").attr("data-marker-drag") );
                }
            }
            initializeOwl();
            initializeFitVids();
            _this.addClass("show");
        }, 200);
    }
}


function drawWordCloud(countyName, wordData) {

    d3.select("div#wordCloud").selectAll("svg").remove();

    let margin = {top: 10, right: 0, bottom: 10, left: 0},
        width = 280 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    let categories = d3.keys(d3.nest().key(function(d) { return "topic"+d.category; }).map(wordData));
    let color = d3.scale.ordinal().range(["#66c2a5","#fc8d62","6baed6","#e78ac3","#a6d854","9c9ede","e7969c"]);
    let fontSize = d3.scale.pow().exponent(5).domain([0,1]).range([14,80]);

    let clouds = [];
    for (var i = 0; i < categories.length; i++) {
        clouds.push([]);
    }
    let count = 0;
    for (var i = wordData.length-1; i >= 0; i--) {
        clouds[wordData[count].category].push(wordData[i]);
        count++;
    }

    let svg, wordCloud;

    function newLayout(cloud_num, cloud_data, cloud_index) {
        svg = d3.select("div#wordCloud").append("svg")
            .attr("id", "cloud"+cloud_index)
            .attr("width", (width + margin.left + margin.right))
            .attr("height", (height + margin.top + margin.bottom))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        wordCloud = d3.select("#cloud"+cloud_index).append("g")
            .attr("id", "wordCloud"+cloud_index)
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

        d3.layout.cloud()
            .timeInterval(10)
            .size([width, height])
            .words(cloud_data)
            .rotate(function(d) { return 0; })
            .font('monospace')
            //.fontSize(function(d,i) { return fontSize(Math.random()); })
            .fontSize(function(d,i) { return fontSize(d.word_size*100); })
            .text(function(d) { return d.word; })
            .spiral("archimedean")
            .on("end", draw)
            .start();

        function draw(words) {
            let keyword, topicID;

            d3.select("#cloud"+cloud_index).selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .attr('class','word')
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", function(d) { return d.font; })
                .style("fill", function(d) { return color(d.category); })
                .attr("text-anchor", "middle")
                .attr("transform", function(d) { return "translate(" + [d.x+(width/2), d.y+(height/1.5)] + ")rotate(" + d.rotate + ")"; })
                .text(function(d) { return d.text; })
                .on("mouseover", function (d) { 
                    d3.select(this).style("opacity", 1)
                        .style("font-size", (d.size+20) + "px")
                        .style("font-weight", "bold")
                        .style("text-shadow", "3px 3px 3px #666")
                        .style("cursor", "pointer");
                })
                .on("mouseout", function (d) {
                    d3.select(this).style("opacity", .8)
                        .style("font-size", d.size + "px")
                        .style("font-weight", "normal")
                        .style("text-shadow", "none");
                })
                .on("click", function(d) {
                    keyword = d.word;
                    topicID = d.category;
                });

            let cc = clickcancel();
            d3.select("#cloud"+cloud_index).selectAll("text").call(cc);
            cc.on("click", function() { // Click to show vec2word similarity
                getWord2Vec(countyName, keyword);
            })
            .on("dblclick", function() { // Double-click to show article on map
                getDocument(countyName, keyword, topicID);
                map.closePopup(label);
            });
        }
    }

    for (var i = 0; i < categories.length; i++) {
        newLayout(categories.length, clouds[i], i);
    }

}

// Distinguish click and double-click in D3
function clickcancel() {
    let event = d3.dispatch('click', 'dblclick');
    function cc(selection) {
        let down,
            tolerance = 5,
            last,
            wait = null;
        // euclidean distance
        function dist(a, b) {
            return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
        }
        selection.on('mousedown', function() {
            down = d3.mouse(document.body);
            last = +new Date();
        });
        selection.on('mouseup', function() {
            if (dist(down, d3.mouse(document.body)) > tolerance) {
                return;
            } else {
                if (wait) {
                    window.clearTimeout(wait);
                    wait = null;
                    event.dblclick(d3.event);
                } else {
                    wait = window.setTimeout((function(e) {
                        return function() {
                            event.click(e);
                            wait = null;
                        };
                    })(d3.event), 300);
                }
            }
        });
    };
    return d3.rebind(cc, event, 'on');
}

function getDocument(countyName, keyword, topicID) {
    start_pg();
    $.ajax({
        url: "/get_document2/", 
        data: {
            location: countyName,
            keyword: keyword,
            topic_number: topicID 
        },
        //dataType: "json",
        method: "GET",
        xhr: refresh_pg,
        success: function(response) {
            //console.log(response)
            listDocument(countyName, keyword, response);
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


function listDocument(countyName, keyword, data) {
    console.log(countyName, keyword, data);

    $("body").append('<div class="modal modal-external fade" id="0" tabindex="-1" role="dialog" aria-labelledby="0"><i class="loading-icon fa fa-circle-o-notch fa-spin"></i></div>');

    $("#0.modal").on("show.bs.modal", function () {
        var _this = $(this);

        if (data != "None") {
            _this.append(listHtml(countyName, keyword, data));
        }
        else {
            _this.append(`
            <div class="modal-item-detail modal-dialog" role="document">
                <div class="modal-content">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <div class="section-title" style="margin-left:10px;">
                        <h2 style="font-size:16px;">${countyName} 未搜尋到 "${keyword}" 相關文章</h2>
                    </div>
                </div>
            </div>`);
        }

        _this.on("hidden.bs.modal", function () {
            // $(lastClickedMarker).removeClass("active");
            $(".pac-container").remove();
            _this.remove();
        });
    });

    $("#0.modal").modal("show");

}

function listHtml(countyName, keyword, data) {
    let return_content = `
    <div class="modal-item-detail modal-dialog" role="document">
        <div class="modal-content">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="section-title" style="margin-left:10px;">
                <h2 style="font-size:16px;">${countyName} 搜尋 "${keyword}" 相關文章</h2>
            </div>`;
    
    data.forEach(function(d, idx) {
        if( !(d.id in all_response_data) ){
            all_response_data[d.id] = d;
        }
        return_content = return_content + `
        <div class="section-title" style="margin-left:10px;">
            <h2 style="font-size:16px;">${idx+1}. 
                <a id=${d.id} target="_blank" style="font-size:16px; cursor:pointer;" onclick="openModal(${d.id});">${d.title}</a>
            </h2>
        </div>`;
                
    });

    return_content = return_content + `</div></div>`;
                
    return return_content;
}


