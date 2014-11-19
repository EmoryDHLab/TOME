 $( document ).ready(function() {
  var numTopics = 11;
  var windowHeight = 300;
  var windowWidth = $("#pathBox").width();
  //top/left margins for the paths
  var x = 10;
  var y = 10;
  var padding = 5;
  var topicData;
  var pathWidth; //this variable changes the xscale and how many columns show on screen at once.
  var paths;
  var dates=[]; //an array of the dates for current topic model data.
  var w = window;

  //keeps track of the checked topics (what labels are selected) 
  var topicChecked = [true, true, true, true, true, true, true, true, true, true,true];
  var shiftPressed = false;
  
  var verticalGap = windowHeight/numTopics;
  var height = verticalGap/(numTopics/2);
  var oldScale = [1,1]; //initial X/Y scale is 1:1

  //information for which topics are currently selected
  var selectedTopic = [-1,-1];
  var somethingSelected = false;
  var numSelected = 0;
  var node1;
  var node2;
  var stOne;
  var stTwo;

//scale to determine thickness of the hexagon (height), which translates values in
//the domain 0.9-70 to the range 1-40. The domain is based off popularity values
//in the CSV, under the label "value"
var thicknessScale = d3.scale.linear()
  .domain([0.9,70]) //work on scraping domain straight from data ***
  .range([2,50]);

//three formats for parsing date-- one is for the ones that only have the year and month values,
//the other two are for the dates with year, month, and day values
var parseDate = d3.time.format("%Y-%m").parse;
var parseDate2 = d3.time.format("%Y-%m-%d").parse;
var parseDate3= d3.time.format("%m/%d/%Y").parse;

var mindate, maxdate; //these will be set when the data is loaded

var c = d3.scale.linear()
  .domain([0,11])
  .range([0,1]);

//creates xscale that takes in a date between min and max date and assigns it the corresponding position in the range
var xScale = d3.time.scale()
  .range([0, windowWidth]);

var yScale = d3.scale.linear()
              .domain([250, 2200])
              .range([2, 20]);

//xaxis
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .tickSize(-height, 0)
    .tickPadding(6);

    
//topics selected as the most relevant in the data set, the data set (narrowed down to these)
//can be found in a-month-shorter3.csv
var indices= [15,29,44,46,49,60,70,82,84,86,91];
var dataArray = [15,29,44,46,49,60,70,82,84,86,91]; //dataArray used when selecting/deselecting checkboxes

//colorscale to color each path
var color = d3.scale.category20();


/////////////////////////////////////////zoom information//////////////////////////////////////////////

//function called when user double clicks or two finger zooms on mousepad
var zoom = d3.behavior.zoom()
            .scale(1)
            .on("zoom", function(d){
              draw();
              }).x(xScale).scaleExtent([1,38]);

//draw function is called whenever the user zooms
//it updates the xScale and redraws the paths based off of the new scale
function draw(){
  svg.select("g.x.axis").call(xAxis);
  pathWidth = ((xScale(parseDate3(dates[1]))- xScale(parseDate3(dates[0])))*.75)/2;
  // paths.attr("d", function(d) { 
  //       var currTopicArray = w["arr_topic" + d];        
  //       return draw_Paths(currTopicArray);
  //     })
  d3.selectAll("path").remove();
  drawIndividPaths();
  updateSelectedPaths();
//console.log(paths);

}

//append an svg to the designated div for containing the paths
var svg = d3.select("#pathBox").append("svg")
  .attr("width", windowWidth)
  .attr("height", windowHeight)
  .append("g")
    .attr("transform", "translate(0,0)")
    .attr("transform","scale(1,1)")
    .call(zoom);
  
svg.append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("x", xScale(0))
    .attr("y", 0)
    .attr("width", windowWidth)
    .attr("height", windowHeight);


svg.append("rect")
    .attr("class", "pane")
    .attr("width", windowWidth)
    .attr("height", 300)
    .call(zoom);

  //adds the x axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform","translate(0,300)")
    .call(xAxis)
    .selectAll("text")
        .style("font-size", "10px");


  $(document).keydown(function (e) {
    if(e.shiftKey) {
      shiftPressed = true;
      console.log(shiftPressed);
    }
  });

  $(document).keyup(function (e) {
      shiftPressed = false;
  });
  
  function changeVals() {
   
    //resizes the paths based off window dimensions
    var tempScaleX =  document.getElementById("windowW").value/windowWidth;
    var tempScaleY = document.getElementById("windowH").value/windowHeight;
    oldScale[0]=oldScale[0]*tempScaleX;
    oldScale[1]=oldScale[1]*tempScaleY;
    
    //transitions the path to the new dimensions
    paths
      .transition()
      .duration(750)
      .attr("transform", "scale(" + oldScale[0] + " " + oldScale[1] +")");

    //updates the variables
    windowWidth = document.getElementById("windowW").value;
    windowHeight = document.getElementById("windowH").value;

    //transitions the svg element
    svg
      .transition()
      .duration(750)
      .attr("width", windowWidth).attr("height", windowHeight);
  }



//for each topic number in array indices, copy it to an array to keep track
for(i=0;i<indices.length;i++){
      w["arr_topic"+indices[i]] = [];
}

function draw_Paths(topicArray){

      var points = [];


      //making the points along the top of the path
      for(i=0;i<topicArray.length;i++){
        if (topicArray[i][3].relevance !=''){
           var tempX = x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
           var tempY1 = y+ (parseInt(topicArray[i][1].order)-1)*25
           var tempX2 = x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
           var tempY2 =  tempY1;
        }
        else {
          var tempX = x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
          var tempY1 = windowHeight;
          var tempX2 = x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
          var tempY2 =  tempY1;
        }
        points.push([tempX,tempY1]); //the leftmost point in each column
        points.push([tempX2,tempY2]); //the rightmost point in each column
      }

      //making the points along the bottom of the path to close off the shape
      for(i=topicArray.length-1;i>-1;i--){
        if(topicArray[i][3].relevance!=''){
          var tempY = y+(parseInt(topicArray[i][1].order)-1)*25+thicknessScale(topicArray[i][2].value); //minimum height of 10 px
          var tempX =  x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
          var tempX2 =  x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
          var tempY2 = tempY;
        }
        else{
          var tempY = windowHeight; //minimum height of 10 px
          var tempX =  x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
          var tempX2 =  x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
          var tempY2 = tempY;
        }
        points.push([tempX,tempY]);
        points.push([tempX2,tempY2]); 
      }
      
      return d3.svg.line()(points);   
  }
//createIndividualPaths takes in an array containing info on one topic
//it returns an array of lines that create paths related to that one topic.
function createIndividualPaths(topicArray){
  var currPoints = [];
  var lines= [];
  var currPath=[];
  var pathInProgress=0;
  //iterate through all points in array
  for(i=0; i<topicArray.length; i++){
    //if data has relevance, create points in the path
    if(topicArray[i][3].relevance !=''){
      //if there was not a path in progress, set pathInProgress to 1 
      if(pathInProgress == 0){
        pathInProgress=1;
      }
      var tempX1 = x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
      var tempY1 = y+ (parseInt(topicArray[i][1].order)-1)*25
      var tempX2 = x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
      var tempY2 =  tempY1; 
      currPath.push(i); //keep track of length of line and where in array data is coming from
      currPoints.push([tempX1,tempY1]);
      currPoints.push([tempX2,tempY2]);
    }
    else{
      //if pathInProgress==1, path just ended.
      //close up path and add the created line to lines[]
      if(pathInProgress==1){
        pathInProgress=0;
        for(k=currPath.length-1; k>-1;k--){
          //console.log("the location in the topicArray the data came from: "+ currPath[i]);
          var j=currPath[k];
         // console.log(j);
          var tempY1= y+(parseInt(topicArray[j][1].order)-1)*25+thicknessScale(topicArray[j][2].value); //minimum height of 10 px
          var tempX1 =  x+xScale(parseDate3(topicArray[j][0].date))+pathWidth;
          var tempX2 =  x+xScale(parseDate3(topicArray[j][0].date))-pathWidth;
          var tempY2 = tempY1;
          currPoints.push([tempX1, tempY1]);
          currPoints.push([tempX2,tempY2]);
        }
        lines.push(d3.svg.line()(currPoints)); //push newly created path to the array of lines that will be returned. 
        currPoints=[]; //clear currPoints[] so that a new set of points can be added to it.
        currPath=[]; //clear currPath[] so that the next set of relevant points can be logged. 
      }
    }
  }
  return lines;
}


//------------------------------------APPEND PATHS FOR FIRST TIME WITH SEPARATED BUT LINKED SECTIONS FOR EACH TOPIC--------------//


function drawIndividPaths(){
//iterate through all indicies. 
//for each index, make the paths associated to it.
paths2=[];
paths = [];


indices.forEach( function(d,i){
  var currColor = d.color = color(d);
  var topicIndex =  +d;
  var idTag = "topicPath" + d + "";
  var className = "#topicPath" + d + "";
  var dataArrayOfcurrTopicPaths = createIndividualPaths(w["arr_topic"+d]);
  var paths2=svg.selectAll(className)
    .data(dataArrayOfcurrTopicPaths)
    .enter()
      .append("svg:path")
      .attr("class", "topicPaths")
      .attr("d", function(d){return d;})
      .attr("fill", currColor)
      .attr("index", topicIndex)
      .attr("id", idTag)
      .attr("opacity", 0.5)
      .on("mouseover",function(d){mouseoverFunction(d3.select(this));})
      .on("mouseout",function(d){mouseoutFunction(d3.select(this));})
      .on("mousedown",function(d){pathsMousedownFunction(d3.select(this));});
  if (i==0){
    paths=paths.concat(paths2);
  }
  else if(i>0){
    paths2.forEach( function(d){
      d.forEach(function(d){
      paths[0].push(d);
      })
    })
  }
  });

paths=paths[0];

}


function mouseoverFunction(thisN){
  var thisNode = thisN;
  var currId= thisNode.attr("id");
  currId= "#"+currId;
  var currTopic=d3.selectAll(currId);
  var num = thisNode.attr("index");
  document.getElementById("highlighted").innerHTML = "Topic " + num;
  currTopic.attr("opacity",1)
           .attr("stroke","#000000")
           .attr("stroke-width", "1.5px");
}

function mouseoutFunction(thisN){
  thisNode = thisN;
  nodeIndex= thisNode.attr("index");
  if(!($.inArray(+nodeIndex, selectedTopic)>-1)){
    currId= thisNode.attr("id");
    currId= "#"+currId;
    var currTopic=d3.selectAll(currId);
    currTopic.attr("opacity",0.5)
             .attr("stroke","0")
             .attr("stroke-width", "0px");
  }
}
function pathsMousedownFunction(thisN){
    thisNode = thisN;
    currId= thisNode.attr("id");
    currId- "#" + currId;
    var topicPaths= d3.selectAll(currId);
    var allPaths=d3.selectAll(".topicPaths");

    //if the shift key is being pressed at the time of the click
    if(shiftPressed == true){

      //if nothing is currently selected
      if(numSelected==0){
        stOne= +thisNode.attr("index");
        selectedTopic= [stOne,-1];//replace selectedTopic[0] with that index
        numSelected++; //add to the count of selected nodes
        node1 =  thisNode; //node1 is the current node
        displayInfoBox(node1); //adding it to the bottom box
        somethingSelected=true; 

        //reset everything to deselected, select current node
         allPaths.attr("opacity",0.5)
          .attr("stroke","0");
      }
      //if something is selected
      else if (numSelected==1 && !($.inArray(+thisNode.attr("index"),selectedTopic) > -1)){
        console.log("it is getting through the if");
        stTwo=+thisNode.attr("index");
        if(!($.inArray(stTwo,selectedTopic)>-1)){
          selectedTopic=[stOne,stTwo]; //replace selectedTopic[1] with that index
          console.log(selectedTopic);
          numSelected++;
          node2 =  thisNode;
          displayCombinedInfoBox(node1,node2);
          somethingSelected=true;
      }}

      //remove from selection if shift is held and it is re-pressed
      else if($.inArray(+thisNode.attr("index"),selectedTopic) > -1){

        //deselect current node
        console.log("inarray");
        var loc=($.inArray(+thisNode.attr("index"),selectedTopic));
        //change it's value in selectedTopic back to -1
        selectedTopic[loc]=-1;

        //if -1 exists in selectedTopic[]
        if($.inArray(-1,selectedTopic)>=0){
          if(selectedTopic[0]==-1){
            if(selectedTopic[1]==-1){ //if both are -1, nothing is selected
              somethingSelected=false;
              numSelected=0;
            }
            else{ //if the second node is -1, one thing is selected
              console.log("this is happening");
              somethingSelected=true;
              displayInfoBox(node1);
              numSelected=1;
            }
          }
          else if (selectedTopic[1]==-1){ 
            if(selectedTopic[0]==-1){ //if both are -1, nothing is selected
              somethingSelected=false;
              numSelected=0;
            }
            else{ //if the first node is -1, one thing is selected
              somethingSelected=true;
              displayInfoBox(node1);
              numSelected=1;
            }
          }

        }
      }
      console.log($.inArray(thisNode.attr("index"),selectedTopic));
      console.log(selectedTopic);
    }
    //if shift is not being currently pressed
    else{
      //if you're clicking a previously selected topic,
      //deselect it
      if(+thisNode.attr("index")==selectedTopic[0]){
          stOne=-1;
          selectedTopic=[stOne,-1];
          somethingSelected=false;
          numSelected=0;
        }
      else if(+thisNode.attr("index")==selectedTopic[1]){
          stTwo=-1;
          selectedTopic=[stOne,stTwo];
          somethingSelected=false;
          numSelected=0;
        }
        //if it's not previously selected,
        //select it
        else{
          allPaths.attr("opacity",0.5)
          .attr("stroke","0");          
          stOne= +thisNode.attr("index");
          selectedTopic= [stOne,-1];//replace selectedTopic[0] with that index
          somethingSelected=true;
          displayInfoBox(thisNode);
          numSelected=1;
          node1=thisNode;
      }
    }
   updateSelectedPaths();
    if(!somethingSelected){
      displayDefault(); 
    } 
}


function updateSelectedPaths(){
   if(selectedTopic[0]!=-1){
      var path= "#topicPath"+selectedTopic[0]+"";
      var pathToHighlight=d3.selectAll(path);
      pathToHighlight.attr("opacity",1)
        .attr("stroke","#000000")
        .attr("stroke-width","1.5px");
    }
    if(selectedTopic[1]!=-1){
      var path= "#topicPath"+selectedTopic[0]+"";
      var pathToHighlight=d3.selectAll(path);
      pathToHighlight.attr("opacity",1)
        .attr("stroke","#000000")
        .attr("stroke-width","1.5px");
    }
}
function displayDefault(){
    document.getElementById("textBoxInner").innerHTML = "<h1>Default text</h1><hr>";
  }

//update the text at the bottom for the one selected node
function displayInfoBox(node) {
    var num = node.attr("index");
    var tempTitle = "<h1>Topic " + num + "</h1><button type='button'>Explore</button><button type='button'>Create Query</button><hr>";
    var tempContent = "Here is some temporary text about topic <b>" + num + "</b>-- eventually it will be replaced by visualizations once there is actual data being input.";
    document.getElementById("textBoxInner").innerHTML = tempTitle + "<br>" + tempContent;
}

 //update the text at the bottom for both selected nodes
function displayCombinedInfoBox(n1,n2){
    var num1 = n1.attr("index");
    var num2 = n2.attr("index");
    var tempTitle = "<h1>Topics " + num1 + " and " + num2 + "</h1><button type='button'>Explore</button><button type='button'>Create Query</button><hr>";
    var tempContent = "Here is some temporary text about topics <b> " + num1 + 
    " and " + num2 + "</b>-- eventually it will be replaced by visualizations once there is actual data being input.";
    document.getElementById("textBoxInner").innerHTML = tempTitle + "<br>" + tempContent;
}

//load the data and place it into an array where an array of data on each topic is located by looking
//for w["arr_topic<number>"] where <number> is the topic number.
d3.csv("a_month_shorter3.csv", function(error, data){
	topicData=data;
	topicData.forEach( function(d){

			w["arr_" + d.topicNum].push([{date:d.date},{order:d.order},{value: d.value}, {relevance:d.relevance}, {topicNum:d.topicNum}]);
		  

		});

  //for each item in topicData, see if its date has been added to the dates array.
  //if the date is not yet included in the dates array, add the date.
  topicData.forEach(function(d){
      if(dates.indexOf(d.date) ==-1){
        dates.push(d.date);
      }
  });

  //find the minimum and maximum dates in the data
  mindate=parseDate3(dates[0]);
  maxdate=parseDate3(dates[dates.length-1]);
  //update xScale domain
  xScale.domain([mindate, maxdate]);
  zoom.x(xScale);
  //determine the width of each column based on the distance between two dates in the current xScale
  pathWidth = ((xScale(parseDate3(dates[1]))- xScale(parseDate3(dates[0])))*.75)/2;
 



//-------------------------------------CREATE LABELS FOR CONTROL PANEL---------------------->

  //create labels in d3 related to each topic. 
  var topicDivs = d3.select("#toggleContainer").append("div")
  						.selectAll(".topicDiv")
  						.data(indices)
  							.enter()
  							.append('div')
  							.attr("class", "topicdiv");

  var topicLabels = topicDivs.selectAll('.topicLabel')
  						.data(function(d){return [d];})
  						.enter().append('label')
  						.attr("class", "topicLabel");
 


    //here, give each topic a color
  	topicDivs.style("background-color", function(d){
  			var c = d3.rgb(color(d));
  			var newColor = "rgba("+ c.r + "," + c.g + "," + c.b +"," +0.5 +")";
  			return newColor;})
        //when you hover over a label
        .on("mouseover", function(d){
                  d3.select(this).transition()
                    .style("background-color", function(d){
                    var c = d3.rgb(color(d));
                    var newColor = "rgba("+ c.r + "," + c.g + "," + c.b +"," +1 +")";
                    return newColor;}) //opacity of color is now 1 
                    .style("border", "3px solid rgba(0,0,0,1)"); //give it a border
                var a= dataArray.indexOf(d);
                        if(topicChecked[a]){
                    highlightPath(d); //highlight the corresponding path by making its opacity 1 and giving it a border.
                    }
                })
        //when the mouse stops hovering over a label
  			.on("mouseout", function(d){
  							d3.select(this).transition()
  								.style("background-color", function(d){
	  								var c = d3.rgb(color(d));
	  								var newColor = "rgba("+ c.r + "," + c.g + "," + c.b +"," +0.5 +")";
	  								return newColor;}) //opacity is 0.5 again
  								.style("border", "3px solid rgba(0,0,0,0)"); //remove border
  					            var a= dataArray.indexOf(d);
  					            if(topicChecked[a]){
  									deHighlightPath(d); //dehighlight corresponding path
  									}
  							})
  			.style("border", "3px solid rgba(0,0,0,0)")					
  			.style("height", "16px")
  			.style()
  			.on("click", function(d){
				var a= dataArray.indexOf(d);
				var tempChecked = topicChecked[a];
				topicChecked[a] = !tempChecked;
				labelChecked(); //if the label is clicked, update which paths should be shown
			})
			.style("padding-left","10px")
			.style("padding-top","3px");
  					
  	
  	//give each label text values.
  	topicLabels.attr("value", function(d){
  									return d;
  					})
  					.style("opacity",1)
  					.style("height", "20px")
  					.html( function(d){
  							var finalText = "<b>Topic Number: " + d + "</b> ";
  							return finalText;
  					});



//--------------------------------APPEND PATHS FOR FIRST TIME ------------------>

  // //iterate over dataArray and append that number of paths to the svg
//    paths5 = svg.selectAll(".topicPaths")
//     .data(indices) //adjust this to indicies
//     .enter()
//       .append("svg:path")
//       .attr("class","topicPaths")
//       .attr("d", function(d) { 
//       	var currTopicArray = w["arr_topic" + d]; 
//         return draw_Paths(currTopicArray);}) //d--the path for topic number (d)

//       .attr("fill", function(d) {
//            return d.color = color(d);}) //fills it with the corresponding color
//       .attr("index",function(d){return d;})
//       .attr("id", function(d){
//       				var idTag= "topicPath"+d+"";
//       				return idTag;}) //individual attribute for keeping track of each individual path
//       .attr("opacity",0.5);

// console.log(paths5);

drawIndividPaths();

var paths= svg.selectAll(".topicPaths");
console.log("paths2");
console.log(paths);
//--------------------------------------------ON HOVER FUNCTIONALITY FOR LABELS---------------->

//highligting paths when hovering over a label.
function deHighlightPath(num){
  if(!($.inArray(num,selectedTopic) > -1)){
  	var text="path#topicPath"+num+"";
  	var object= d3.selectAll(text);
  	object.transition().attr("opacity",0.5)
  			.attr("stroke","#000000")
              .attr("stroke-width","0px");
}
}

function highlightPath(num){
	var text="path#topicPath"+num+"";
	var object= d3.selectAll(text);
	object.transition().attr("opacity",1)
		.attr("stroke","#000000")
            .attr("stroke-width","1.5px");
}

function updateHighlightPath(){
    if(selectedTopic[0]!=-1 ) {
      var num1=selectedTopic[0];
      var text="path#topicPath"+num1+"";
      var object= d3.selectAll(text);
      object.transition().attr("opacity",1)
        .attr("stroke","#000000")
                .attr("stroke-width","1.5px");
    }
    if(selectedTopic[1]!=-1) {
      var num1=selectedTopic[1];
      var text="path#topicPath"+num1+"";
      var object= d3.selectAll(text);
      object.transition().attr("opacity",1)
        .attr("stroke","#000000")
                .attr("stroke-width","1.5px");
    }
}


function updateSelectedTopics(){
  var deselect0=true;
  var deselect1=true;

  for(i=0; i<indices.length; i++){
    if(parseInt(indices[i])==selectedTopic[0]){
      console.log(indices[i]);
      deselect0=false;
       console.log("deselect 0"+selectedTopic);
    }
    if(parseInt(indices[i])==selectedTopic[1]){
      console.log(indices[i]);
      deselect1=false;
       console.log("deselect1"+selectedTopic);
    }
  }

  if(deselect0){
      selectedTopic[0]=-1;
    }
    if(deselect1) {
      selectedTopic[1]=-1;
    }
     if($.inArray(-1,selectedTopic)>=0){
          if(selectedTopic[0]==-1){
            if(selectedTopic[1]==-1){ //if both are -1, nothing is selected
              somethingSelected=false;
              numSelected=0;
            }
            else{ //if the second node is -1, one thing is selected
              somethingSelected=true;
              displayInfoBox(node2);
              numSelected=1;
            }
          }
          else if (selectedTopic[1]==-1){ 
            if(selectedTopic[0]==-1){ //if both are -1, nothing is selected
              somethingSelected=false;
              numSelected=0;
            }
            else{ //if the first node is -1, one thing is selected
              somethingSelected=true;
              displayInfoBox(node1);
              numSelected=1;
            }
          }

        }
    console.log("what is selected?");
    console.log(selectedTopic);
}




//----------------------------------RESIZING WITH A WINDOW RESIZE----------------->

  window.onresize = function(event){
    var iw = $('body').innerWidth();
    var ww = $(window).width();
    var tempWindowWidth = ww*0.8 - 10;


      verticalGap = windowHeight/numTopics;
      height = verticalGap/(numTopics/2); 
   
      var tempScaleX =  tempWindowWidth/windowWidth;

      oldScale[0]=oldScale[0]*tempScaleX;

      paths
        .transition()
        .duration(250)
        .attr("transform", "scale(" + oldScale[0] + " 1)");

      windowWidth = tempWindowWidth;

      svg
        .transition()
        .duration(750)
        .attr("width", windowWidth).attr("height", windowHeight);
  }


  //---------------------------FOR CHANGING THE DATA WITH CHECKBOXES-----------------//

  function updateData(){
    var tempDataStr = ""
    for(i=0;i<dataArray.length;i++){ //for the length of the data array (always the number of topics)
      if(topicChecked[i]){ //if in the topicChecked array, the topic is checked
        if (tempDataStr == ""){
          tempDataStr += dataArray[i];
        }
        else{
          tempDataStr= tempDataStr + "," + dataArray[i];  //add that topic to tempDataStr
        } 
      }
    }
    var tempArrayd = tempDataStr.split(","); 
    indices= tempArrayd; //set the indices array to reflect which topics are actually checked "true" currently
  }

  	//updates things if a label gets "checked" or selected
    function labelChecked(){

    //update the paths in the div
    updateData();
    svg.selectAll("path").remove(); //removes all paths
    paths = svg.selectAll("path")
    .data(indices) //takes updated indices array
    .enter()
      .append("svg:path")
      .attr("d", function(d) { 
      	var currTopicArray = w["arr_topic" + d];
      return draw_Paths(currTopicArray);}) //redraws paths
      .attr("fill", function(d) {return d.color = color(d);})
      .attr("index",function(d){return d;})
      .attr("id", function(d){
      				var idTag= "topicPath"+d+"";
      				return idTag;})
      .attr("opacity",0.5)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"
      });


updateHighlightPath();
updateSelectedTopics();

//----------------FOR MAINTAINING MOUSEENTER/MOUSEDOWN AFTER CHECKBOX CHANGES--------------//

    // paths.on("mouseenter", function(){
    //     thisNode = d3.select(this);
    //     var num = thisNode.attr("index");
    //     document.getElementById("highlighted").innerHTML = "Topic " + num;
    //   });

  paths.on("mousedown", function(){

    console.log("Clicked a path");
    thisNode = d3.select(this)
    
    if(shiftPressed == true){
      console.log("Num selected:"+numSelected);
      if(numSelected==0){
        console.log("numSelected: 0"+thisNode.attr("index"));
        selectedTopic[0]=+thisNode.attr("index");
        numSelected=1;
        console.log("ADDING TO NUMSELECTEDX");
        node1 = thisNode;
        displayInfoBox(node1);
        somethingSelected=true;
//        console.log("Clicked 1 in shift");

         paths.attr("opacity",0.5)
          .attr("stroke","0");
          node1.attr("opacity",1);
          node1.attr("stroke","#000000");
          node1.attr("stroke-width","1.5px");
      }
      else if (numSelected==1){
//        console.log("Clicked 2 in shift");
        if((+thisNode.attr("index"))!=selectedTopic[0]){
          if (selectedTopic[0]==-1){
            console.log("Filling sT 0")
            selectedTopic[0]=(+thisNode.attr("index"));
            numSelected=2;
            node2 = thisNode;
            displayCombinedInfoBox(node1,node2);
            somethingSelected=true;

            node2.attr("opacity",1);
            node2.attr("stroke","#000000");
            node2.attr("stroke-width","1.5px");
          }
          else if(selectedTopic[1]==-1){
            console.log("Filling sT 1")
            selectedTopic[1]=(+thisNode.attr("index"));
            numSelected=2;
            node2 = thisNode;
            displayCombinedInfoBox(node1,node2);
            somethingSelected=true;

            node2.attr("opacity",1);
            node2.attr("stroke","#000000");
            node2.attr("stroke-width","1.5px");
          }
        }
      }
      //remove from selection if shift is held and it is re-pressed
      else if($.inArray((+thisNode.attr("index")),selectedTopic) > -1){
        thisNode.attr("opacity",0.5);
        thisNode.attr("stroke","0");
        selectedTopic[$.inArray((+thisNode.attr("index")),selectedTopic)]=-1;
        if($.inArray(-1,selectedTopic)>=0){
          if(selectedTopic[0]==-1){
            if(selectedTopic[1]==-1){
              somethingSelected=false;
              numSelected=0;
            }
            else{
              somethingSelected=true;
              displayInfoBox(node2);
              numSelected=1;
            }
          }
          else if (selectedTopic[1]==-1){
            if(selectedTopic[0]==-1){
              somethingSelected=false;
              numSelected=0;
            }
            else{
              somethingSelected=true;
              displayInfoBox(node1);
              numSelected=1;
            }
          }

        }
      }
    }
    //if not shift pressed
    else{
      if((+thisNode.attr("index"))==selectedTopic[0]){
          thisNode.attr("opacity",0.5);
          thisNode.attr("stroke","0");
          selectedTopic[0]=-1;
          if(selectedTopic[1]=-1){
            numSelected=0;
            somethingSelected=false;
          }
          else{
            numSelected=1;
          }
        }
        else if((+thisNode.attr("index")==selectedTopic[1])){
          thisNode.attr("opacity",0.5);
          thisNode.attr("stroke","0");
          selectedTopic[1]=-1;
          if(selectedTopic[0]=-1){
            numSelected=0;
            somethingSelected=false;
          }
          else{
            numSelected=1;
          }
        }
        else{
          paths.attr("opacity",0.5)
          .attr("stroke","0");
          thisNode.attr("opacity",1);
          thisNode.attr("stroke","#000000");
          thisNode.attr("stroke-width","1.5px");
          somethingSelected=true;
          displayInfoBox(thisNode);
          numSelected=1;
          node1=thisNode;
          selectedTopic[0]=node1.attr("index");
      }
    }
    if(!somethingSelected){
      displayDefault();
      paths.attr("opacity",0.5)
          .attr("stroke","0");
    }
    console.log(selectedTopic);
    console.log("Something selected? " + somethingSelected);
      console.log("Num selected? " + numSelected);

  });

}
draw();
}
);



//draw_Paths takes in an array containing information on one topic
//and returns the points for the entire path.
//this is the old functionality for creating paths. Trying to create a new way that is cleaner.
  

});