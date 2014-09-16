$( document ).ready(function() {
var width = 1200,
    h = 500;
var padding = 5;

var zoomLevel = 1; //to keep track of zoom, currently not functional
var hexagonHeight=30; //the height of the hexagons
var hexagonEdge = 5; //the length of the edge of the hexagon

var yearlyTopic = {};
var w = window;
var bottomY=h-50;

svg = d3.select("#timeline")
  .append("svg")
  .attr("width", width)
  .attr("height", h)
  .attr("transform","scale(11,11)");

//two formats for parsing date-- one is for the ones that only have the year and month values,
//the other is for the dates with year, month, and day values
var parseDate = d3.time.format("%Y-%m").parse;
var parseDate2 = d3.time.format("%Y-%m-%d").parse;


//date range for this dataset
var mindate = parseDate("1845-09"),
  maxdate = parseDate("1861-05");

var xScale = d3.time.scale()
  .domain([mindate, maxdate])
  .range([padding, width - padding * 2]);

var yScale = d3.scale.linear()
              .domain([250, 2200])
              .range([2, 20]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

//scale to determine thickness of the hexagon (height), which translates values in
//the domain 0.9-70 to the range 1-40. The domain is based off popularity values
//in the CSV, under the label "value"
var thicknessScale = d3.scale.linear()
  .domain([0.9,70])
  .range([1,40]);

//updates events and paths on zoom
var zoom = d3.behavior.zoom()
  .scale(11)
  .on("zoom", function(){
      svg.select("g").call(xAxis).selectAll("text").style("font-size", "10px");

      update_events();
      update_paths();

  }).x(xScale)
  .scaleExtent([10, 35])

//----------------ZOOM BUTTONS, CURRENTLY NOT FUNCTIONAL---------------//
$("#zoomIn").click(function(e) {
  zoomLevel++; 

  //make sure it doesn't go above 3, which is week level
  if(zoomLevel>3){
    zoomLevel=3;
  }
  else{ //only call zoomFunction if there is a change
    zoomFunction();
  }

});

$("#zoomOut").click(function(e) {
  zoomLevel--;

  //make sure it doesn't go below 0, which is the decade level
  if(zoomLevel<0){
    zoomLevel=0;
  }
  else{ 
    zoomFunction();
  }
  
});

function zoomFunction(){

  if(zoomLevel==0){
    console.log("ZOOM LEVEL 0");
  }
  else if(zoomLevel==1){
    console.log("ZOOM LEVEL 1");
  }
  else if(zoomLevel==2){
    console.log("ZOOM LEVEL 2");
  }
  else if(zoomLevel==3){
    console.log("ZOOM LEVEL 3");
  }
}
//----------------END ZOOM BUTTONS---------------//

//adds the background rectangle to the SVG
var rect = svg.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("class","backgroundRect")
                .attr("width", width-100)
                .attr("height", h)
                .attr("opacity", 0)
                .call(zoom);

//adds the x axis
svg.append("g")
    .attr("class", "xaxis")
    .attr("transform","translate(0,450)")
    .call(xAxis)

    .selectAll("text")
        .style("font-size", "10px");

//---------------------------------------------------
var labels=[];
for (var i=0;i<100;i++){
  labels[i]="topic"+i;
}

var nums=[];
for (var i=0;i<11;i++){
  nums[i]=i;
}

//topics selected as the most relevant in the data set, the data set (narrowed down to these)
//can be found in a-month-shorter3.csv
var indices = [15,29,44,46,49,60,70,82,84,86,91];

//creates colors, then uses a linear scale to assign colors
var colours = ["#6363FF", "#6373FF", "#63A3FF", "#63E3FF", "#63FFFB", "#63FFCB",
               "#63FF9B", "#63FF6B", "#7BFF63", "#BBFF63", "#DBFF63", "#FBFF63", 
               "#FFD363", "#FFB363", "#FF8363", "#FF7363", "#FF6364"];
var heatmapColour = d3.scale.linear()
  .domain(d3.range(0, 1, 1.0 / (colours.length - 1)))
  .range(colours);

var c = d3.scale.linear()
  .domain([0,11])
  .range([0,1]);

//for each topic, copy it to an array to keep track
for(i=0;i<indices.length;i++){
      w["arr_topic"+indices[i]] = [];
}

var line;
var lineData;

//iterates through the CSV and creates lines, and putting
//the line at the very bottom if it doesn't have a relevance

d3.csv("a-month-shorter3.csv", function(d) {
  var tempEnd = d.date + "-15"; //adding -15 to the date is saying day 15, which is halfway through the month
  var tx1 = xScale(parseDate(d.date));
  var tx2= xScale(parseDate(d.date))+30;
  var ty = (parseInt(d.order)-1)*40+thicknessScale(d.value)/2;

  //if there's no relevance
  if(d.relevance!=""){
    w["arr_"+d.topicNum].push([d.date, ty]); //leftmost point in the box
    w["arr_"+d.topicNum].push([tempEnd,ty]); //rightmost point
  }
 
  else{
    w["arr_"+d.topicNum].push([d.date, bottomY]); //leftmost point in the box
    w["arr_"+d.topicNum].push([tempEnd,bottomY]); //rightmost point
  }
  
}, function(error, rows) {
  
  //for each topic, run the functions to create the lines 
  for(var element in indices){
    var tempLineDataStr = "arr_topic" + indices[element];
    printThings(tempLineDataStr);
    drawThings(tempLineDataStr);
  }
  csvRows = rows;
});

//drawThings in a separate function so it can be called upon update
//adds lines and detects onclick events, which will call the function lineClick
function drawThings(lineDataStr){
      
    svg.append("path")
      .datum(lineData)
        .attr("class", "line")
        .attr("id", function(d){
          return ("line" + d[0].id);
        })
        .attr("d", line)
        .attr("stroke", function(d){
          var tempInt = d[0].id;
            tempInt = parseInt(tempInt);
            return heatmapColour(c(indices.indexOf(tempInt)));
        })
        .on("click",function(d){
          var tempID = "#line" + d[0].id;
          lineClick(tempID);
        })
        ;
 

}


//printThings in a separate function so it can be called upon update
//updates the data of that topic (lineDataStr = "arr_topic1", "arr_topic2", etc)
//within the array w[x], where x is the topic number.
function printThings(lineDataStr){
    line = d3.svg.line()
      .x(function(d) { 
        if(d.date.length>7){ //if it contains the -15 day, which means  
          return xScale(parseDate2(d.date)); 
        }
        else{
          return xScale(parseDate(d.date)); 
        }
      })
      .y(function(d) { return d.y; })

    lineData = w[lineDataStr].map(function(d) {
      return {
         date: d[0],
         y: d[1],
         id: lineDataStr.replace("arr_topic","")
      };
     });
}

//for some reason I can't get addClass/toggleClass to work
function lineClick(lineID){
  //lineID = "path" + lineID + ".line";
  //$(lineID).addClass("active");
  $(lineID).css("stroke","black");
  $(lineID).css("stroke-width","2px");
  $(lineID).css("opacity","1");

  //lineID is in the format "#line60" --topicClass would be ".topic60"
  var topicClass = ".topic"+lineID.slice(-2);
  $(topicClass).css("opacity","1");
}



//the function that creates the hexagons for each time piece
//the commented out parts are redundant, but there for the record
//point 1 is the leftmost (9 oclock position), and the points are in clockwise order
function pathPiece(d){
  var points = [];
  var endDate = d.date + "-15";
  var tempX1 = xScale(parseDate(d.date));
  var tempY1 = (parseInt(d.order)-1)*40 + thicknessScale(d.value)/2;

  var tempX2 = xScale(parseDate(d.date)) + hexagonEdge;
  var tempY2 = (parseInt(d.order)-1)*40;

  var tempX3 = xScale(parseDate2(endDate))-hexagonEdge;
  //var tempY3 = tempY2;

  var tempX4 = xScale(parseDate2(endDate));
  //var tempY4 = tempY1;

  //var tempX5 = tempX3;
  var tempY5 = (parseInt(d.order)-1)*40 + thicknessScale(d.value);

  //var tempX6 = tempX2;
  //var tempY6 = tempY5;

  //points.push([tempX1,tempY1]);

  points = [[tempX1,tempY1],
            [tempX2,tempY2],
            [tempX3,tempY2],
            [tempX4,tempY1],
            [tempX3,tempY5],
            [tempX2,tempY5]
          ];
  return d3.svg.line()(points);
}

function draw_events(){
      //iterates through all rows in the CSV file
      d3.csv("a-month-shorter3.csv", function(data){
      var articles = svg.selectAll("path.article").data(data)
      articles.enter()
        .append("path")
          .attr("d", function(d) { 
              if(d.relevance!=""){
                return pathPiece(d);
              }
            })
          .attr("class", "article")
          .attr("class", function(d){return "article " +d.topicNum;})
          .attr("topic",function(d){return d.topicNum;})
          .style("fill", function(d){
            var tempInt = d.topicNum;
            tempInt = tempInt.replace("topic","");
            tempInt = parseInt(tempInt);
            return heatmapColour(c(indices.indexOf(tempInt)));
          })
          .style("opacity", function(d){
              return 0.5;
            })
          .on("mouseover", function(d){
              d3.select(this).style({opacity:'1',})
          })
          .on("mouseout", function(d){
              d3.select(this).style({opacity:'0.5',})
          })
          .on("click",function(d){
              clickFunction(d);
          })
      articles.exit()
            .remove();

    });

}

function update_events(){
  console.log(zoom.scale());
/*    return svg.selectAll("rect.article")
        .attr("x", function(d){return xScale(parseDate(d.date))})    */
    svg.selectAll("path.article")
      .attr("d", function(d){
        if(d.relevance!=""){
                return pathPiece(d);
              }

      })
}

function update_paths(){
    svg.selectAll("path.line").remove()
        drawThings();
  
  for(var element in indices){
    var tempLineDataStr = "arr_topic" + indices[element];
   printThings(tempLineDataStr);
    drawThings(tempLineDataStr);
  }
}

function clickFunction(d){

  var tempStr = ".article." + d.topicNum;
  console.log(d.topicNum);
  //$(tempStr).addClass("activeRect");
  $(tempStr).css("opacity","1");
  
  var tempStr2 = "#line"+d.topicNum.replace("topic","");
  $(tempStr2).css("opacity","1"); 

}

var lines = svg.selectAll("path.line");
lines.on("mousedown",function(){
  thisNode = d3.select(this);
  //console.log(this.attr("id"));
});

draw_events();
});
//draw_events(flights)