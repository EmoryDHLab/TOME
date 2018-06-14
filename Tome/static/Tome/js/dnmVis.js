function convertTopicData(articleData) {
    var fData = [];
    articleData.forEach(function(article) {
        var dustDataPt = {
            name: article.title || "Article " + article.key,
            key: article.key
        }
        article.topics.forEach(function(t) {
            dustDataPt[t.key] = t.score;
        });
        fData.push(dustDataPt);
    });
    return fData;
}

const DNM = {
    tip: d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>"+ d.name +"</strong>";
            }),
    zoom: d3.behavior.zoom().scaleExtent([0.1, 10]),
    panelHeight: 50,
    width: .75 * (document.documentElement.clientWidth
        || document.body.clientWidth),
    height: 500,
    padding: 0,
    dustRadius: 3,
    magnetRadius: 10,
    keys: [],
    data: []
};


function render(id, fData, newKeys, wipeDust=false) {
    /**************************************************************************/
    /* BEGIN: initial variables                                               */
    /**************************************************************************/
    /**
     * General info about the window and the visualization
     */

    /*
     * fData is an array of objects where each object is a dust particle
     * the dust particles should have properties corresponding to each topic
     * needed. These topics should have been returned with the table data
     * the format should be:
     *  [
            {
                title: "<article title>",
                topics: [<key 1>, <key 2>, ...]
            }, ...
        ]
     */
    if (wipeDust) {
        DNM.data = [];
    }
    DNM.data = DNM.data.concat(fData);
    console.log(DNM.data);
    newKeys.forEach(function(key) { // get new keys
        var exists = DNM.keys.find(function(k){
            return k.name == key.name;
        }) != undefined;
        if (!exists) {
            DNM.keys.push(key);
        }
    })
    DNM.keys = DNM.keys.filter(function(k) { // remove old ones from vis
        var exists = newKeys.find(function(key){
            return k.name == key.name;
        }) != undefined;
        if (!exists) {
            d3.select(".magnet-group[data-key='" + k.name + "']").remove()
        }
        return exists;
    });
    console.log("DNM_K: ", DNM.keys);
    // keep track of the magnets that are active (clicked)
    DNM.keys.map(function(d) {
        // calculate the min and max for each
        d.min = d3.min(DNM.data, function(val) { return val[d.name]; });
        d.max = d3.max(DNM.data, function(val) { return val[d.name]; });
        d.active = true;
        return d;
    })
    var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                .on("dragstart", dragStart)
                .on("drag", dragMove)
                .on("dragend", dragEnd)

    function dragStart(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this)
            .classed({
                'grabbed': true
            });
    }

    function dragMove(d) {
        d3.select(this)
            .attr("cx", d.x = d3.event.x)
            .attr("cy", d.y = d3.event.y);
            // updateDust();
    }

    function dragEnd(d) {
        d3.select(this)
            .classed({
                'grabbed': false
            });
        // updateDust();
    }

    /**************************************************************************/
    /* END: initial variables                                                 */
    /**************************************************************************/


    // create the svg
    var svg = d3.select("#" + id+ ">svg");
    var container = svg.select('g');

    DNM.zoom.on("zoom", function() { return zoomed(container) });
    if (svg.empty()) {
        svg = d3.select("#" + id).append('svg')
                .attr('width', DNM.width)
                .attr('height', DNM.height)
                .attr('style', 'padding: ' + DNM.padding + 'px ' + DNM.padding + 'px;')
                .attr('viewBox', '0 0 500 500')
                .call(DNM.zoom)
                .on("dblclick.zoom", null);
        container = svg.append('g');
    }

    addMagnets(container, drag, wipeDust);
    addDustParticles(container, wipeDust);
}
d3.timer(updateDust);
function updateDust() {
    d3.selectAll('.dust-circle')
    .transition()
    .duration(100)
    .ease('quadOut')
        .attr('cx', function(d) {
            // current loc
            var dx = 0;
            DNM.keys.forEach(function(key) {
                var val = key.name; // get the magnet name
                var dustVal = d[val]; // get the associated
                // get the difference in distance
                var deltaX = key.x - d.x;
                // get the force scalar
                var scale = d3.scale.linear().domain([key.min, key.max]).range([0.0, 0.1]);
                if (dustVal < key.min || dustVal > key.max) {
                    throw Error("Dust " + d.name + " not normalizable")
                }
                var force = scale(dustVal);
                dx += deltaX * force;
            })
            d.x += dx;
            return d.x;
        })
        .attr('cy', function(d) {
            // current loc
            var dy = 0;
            DNM.keys
                .forEach(function(key) {
                    var val = key.name;
                    var dustVal = d[val];
                    // get the difference in distance
                    var deltaY = key.y - d.y;
                    // get the force scalar
                    var scale = d3.scale.linear()
                        .domain([key.min, key.max]).range([0.0, 0.1]);
                    if (dustVal < key.min || dustVal > key.max) {
                        throw Error("Dust " + d.name + " not normalizable")
                    }
                    var force = scale(dustVal);
                    dy += deltaY * force;
                });
            d.y += dy;
            return d.y;
        })
}

function magScale(scl) {
    return Math.max(DNM.magnetRadius, DNM.magnetRadius/Math.sqrt(scl));
}

function zoomed(container) {
    zoomHelper(container, d3.event.translate, d3.event.scale);
}

function resetZoomPan(id) {
    var container = d3.select("#" + id + " svg>g")
    DNM.zoom.scale(1).translate([0,0]);
    zoomHelper(container, DNM.zoom.translate(), 1, 500);
}

function zoomBy(id, amount) {
    var container = d3.select("#" + id + " svg>g")
    s = DNM.zoom.scale();
    DNM.zoom.scale(s + amount);
    zoomHelper(container, DNM.zoom.translate(), DNM.zoom.scale(), 500);
}

function zoomIn(id) {
    zoomBy(id, 0.1);
}

function zoomOut(id) {
    zoomBy(id, -0.1);
}

function zoomHelper(container, translate, scale, duration=0) {
    if (duration > 0) {
        container = container.transition().duration(500)
    }
    container.attr('transform',
        'translate(' + translate + ') scale(' + scale + ')');

    d3.selectAll('.magnet-circle')
        .attr("r", magScale(scale));
}


function checkMagnets() {
    for (var i = 0; i < DNM.keys.length; i++) {
        var alreadyPlaced =d3.selectAll('.magnet-group')
            .filter("[data-key='" + DNM.keys[i].name + "']").empty()
        if (!alreadyPlaced) {
            return false;
        }
    }
    return true;
}

function addMagnets(container, drag, wipeDust) {
    // create the magnet circles
    var magnets = container.selectAll('.magnet-group')
                        .data(DNM.keys)
                        .enter()
                        .append('g')
                            .attr('class', 'magnet-group')
                            .attr('data-key', function(d) {
                                console.log(d.name);
                                return d.name;})
    try {
        magnets.call(DNM.tip);
    } catch (err) {
        console.log("Could not load tips");
    }
    // create the magnet circles
    magnets.append('circle')
        .attr('class', 'magnet-circle grabbable')
        .attr('r', function(d, i) {
            return DNM.magnetRadius;
        })
        .attr('fill', function(d) {
            return d.fill;
        })
        .call(drag)
        .on('mousemove', DNM.tip.show)
        .on('mouseout', DNM.tip.hide);
    if (wipeDust) {
        d3.selectAll('circle.magnet-circle')
            .attr('cx', function(d, i) {
                d.x = DNM.height * .3 * Math.cos(i * 2 * Math.PI / DNM.keys.length) + DNM.width/2;
                return d.x;
            })
            .attr('cy', function(d, i) {
                d.y =  DNM.height * .3 * Math.sin(i * 2 * Math.PI / DNM.keys.length) + DNM.height/2;
                return d.y;
            })
    }
    return magnets;
}

function addDustParticles(container, reset) {
    console.log(DNM.data);
    console.log(reset);
    if (reset) {
        container.selectAll('.dust-group').remove();
    }
    var dust = container.selectAll('.dust-group')
                        .data(DNM.data)
                        .enter()
                        .append('g')
                        .attr('class', 'dust-group article')
                        .attr('data-key', function(d) { return d.key; });

    // add in the dust
    dust.append('circle')
        .attr('class', 'dust-circle')
        .attr('cx', function (d) {
            var rand = Math.random() * (DNM.width);
            d.x = rand;
            console.log(d.x);
            return d.x;
        })
        .attr('cy', function (d) {
            var rand = Math.random() * (DNM.height - DNM.panelHeight);
            d.y = rand;
            console.log(d.y);
            return d.y;
        })
        .attr('r', DNM.dustRadius)
        .attr()
        .on('mouseover', DNM.tip.show)
        .on('mouseout', DNM.tip.hide);
    return dust;
}

function renderFromArticleData(id, articleData, newKeys, wipeDust) {
    console.log(articleData);
    render(id, convertTopicData(articleData), newKeys, wipeDust);
    console.log("RENDERED");
}
