$( document ).ready(function() {
  var numTopics = 11;
  var windowHeight = 300;
  var windowWidth = $("#pathBox").width();
  //top/left margins for the paths
  var x = 10;
  var y = 10;
  var padding = 5;
  var topicData;
  var pathWidth =20;

 //append an svg to the designated div for containing the paths
  var svg = d3.select("#pathBox").append("svg")
    .attr("width", windowWidth)
    .attr("height", windowHeight);
    //.attr("overflow", "visible");

  //keeps track of the checked topics 
  var topicChecked = [true, true, true, true, true, true, true, true, true, true,true];
  var shiftPressed = false;

  var width = (windowWidth/numTopics)*.75; //width of each column
  var g = (windowWidth/numTopics)*.25; //space between columns	
  var verticalGap = windowHeight/numTopics;
  var height = verticalGap/(numTopics/2);
  var oldScale = [1,1]; //initial X/Y scale is 1:1

//scale to determine thickness of the hexagon (height), which translates values in
//the domain 0.9-70 to the range 1-40. The domain is based off popularity values
//in the CSV, under the label "value"
var thicknessScale = d3.scale.linear()
  .domain([0.9,70]) //work on scraping domain straight from data ***
  .range([2,50]);

//two formats for parsing date-- one is for the ones that only have the year and month values,
//the other is for the dates with year, month, and day values
var parseDate = d3.time.format("%Y-%m").parse;
var parseDate2 = d3.time.format("%Y-%m-%d").parse;
var parseDate3= d3.time.format("%m/%d/%Y").parse;
//date range for this dataset
var mindate = parseDate("1845-09"),
  maxdate = parseDate("1861-05");


var c = d3.scale.linear()
  .domain([0,11])
  .range([0,1]);

var xScale = d3.time.scale()
  .domain([mindate, maxdate])
  .range([0, windowWidth*10]);

var yScale = d3.scale.linear()
              .domain([250, 2200])
              .range([2, 20]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(d3.time.years)
    .orient("top");

//adds the x axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform","translate(0,300)")
    .call(xAxis)
    .selectAll("text")
        .style("font-size", "10px");

    
//topics selected as the most relevant in the data set, the data set (narrowed down to these)
//can be found in a-month-shorter3.csv
var indices = [15,29,44,46,49,60,70,82,84,86,91];
var dataArray = [15,29,44,46,49,60,70,82,84,86,91]; //dataArray used when selecting/deselecting checkboxes

//colorscale to color each path
var color = d3.scale.category20();


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
var w = window;

  

//-------------------HERE, WORK ON GETTING CORRECT HEIGHTS-------//




//for each topic, copy it to an array to keep track
for(i=0;i<indices.length;i++){
      w["arr_topic"+indices[i]] = [];
}

//load the data and place it into an array where an array of data on each topic is located by looking
//for w["arr_topic<number>"] where <number> is the topic number.
d3.csv("a_month_shorter3.csv", function(error, data){
	topicData=data;
	topicData.forEach( function(d){

			w["arr_" + d.topicNum].push([{date:d.date},{order:d.order},{value: d.value}, {relevance:d.relevance}, {topicNum:d.topicNum}]);
		
		})



//working on new draw_Paths takes in an array containing information on one topic
//and returns the points for the entire path.
  function draw_Paths(topicArray){

      var points = [];
      //making the points along the top of the path

      for(i=0;i<topicArray.length;i++){
      	//var tempX = x + i*width + i*g;
       // var tempX2 = x + (i+1)*width + i*g;
       //console.log(parseDate3(topicArray[i][0].date));
		 var tempX = x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
		  var tempY1 = y+ (parseInt(topicArray[i][1].order)-1)*25
		 var tempX2 = x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
		  var tempY2 =  tempY1;
		  points.push([tempX,tempY1]); //the leftmost point in each column
	      points.push([tempX2,tempY2]); //the rightmost point in each column
}
      //making the points along the bottom of the path to close off the shape
      for(i=topicArray.length-1;i>-1;i--){
        //var randHeighttemp= i*1.5+10;
        //var tempX = x + (i+1)*width + i*g;
       // var tempX2 = x + i*width + i*g;
        var tempY = y+(parseInt(topicArray[i][1].order)-1)*25+thicknessScale(topicArray[i][2].value); //minimum height of 10 px
        var tempX =  x+xScale(parseDate3(topicArray[i][0].date))+pathWidth;
        var tempX2 =  x+xScale(parseDate3(topicArray[i][0].date))-pathWidth;
        var tempY2 = tempY;
        points.push([tempX,tempY]);
        points.push([tempX2,tempY2]); 
      }
      return d3.svg.line()(points);
      
  }
//---------------END HEIGHT WORK ------------------------------//




  //create labels in d3 related to each topic. 
  var topicLabels = d3.select("#toggleContainer").append("div")
  						.selectAll("label")
  						.data(indices)
  	topicLabels.enter()
  			.append("div")
  			.attr("class", "topicLabels")
  			.append("label")
  			.attr("class","topicName");

  	//give each label, text, color, and "on click" functionality to select/deselect paths.
  	topicLabels.select(".topicName")
  					.attr("value", function(d){
  									return d;
  					})
  					.style("border", "5px")
  					.style("height", "20px")
  					.style("background-color", function(d){

  												return color(d);})
  					.style("opacity", 0.5)
  					.on("mouseover", function(d){
  								d3.select(this).transition()
  									.style("opacity",1);
  									// .style("background-color", function(d){
  									// 		return d3.rgb(color(d)).darker();
  									// 	});
  								})
  					.on("mouseout", function(d){
  							d3.select(this).transition()
  								.style("opacity", 0.5);
  								// .style("background-color", function(d){
  								// 		return color(d);});
  								})
  					
  					.on("click", function(d){
  								var a= dataArray.indexOf(d);
  								var tempChecked = topicChecked[a];
  								topicChecked[a] = !tempChecked;
  								labelChecked();
  							})
  					.html( function(d){
  							var finalText = "Topic Number: " + d + " ";
  							return finalText;
  					});



  	topicLabels.exit().remove();


  //iterate over dataArray and append that number of paths to the svg
  var paths = svg.selectAll(".topicPaths")
    .data(indices) //adjust this to indicies
    .enter()
      .append("svg:path")
      .attr("class","topicPaths")
      .attr("d", function(d) { 
      	var currTopicArray = w["arr_topic" + d];
      	
      	
      return draw_Paths(currTopicArray);}) //d--the path for topic number (d)
      .attr("fill", function(d) {
           return d.color = color(d);}) //fills it with the corresponding color
      .attr("index",function(d){return d;}) //individual attribute for keeping track of each individual path
      .attr("opacity",0.5)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"
    });

  //mouseover functionality-- currently updates the text in the "highlighted" div to show
  //which topic is currently being moused over
  paths.on("mouseenter", function(){
    thisNode = d3.select(this)
    var num = thisNode.attr("index");
    document.getElementById("highlighted").innerHTML = "Topic " + num;
  });

  //selectedTopic w/2 elements to be replaced by topic number -- 2 paths can be highlighted at one time
  var selectedTopic = [-1,-1];
  var somethingSelected = false;
  var numSelected = 0;
  var node1;
  var node2;

  //clicking functionality
  paths.on("mousedown", function(){

    thisNode = d3.select(this)

    //if the shift key is being pressed at the time of the click
    if(shiftPressed == true){
      //if nothing is currently selected
      if(numSelected==0){
        selectedTopic[0]=thisNode.attr("index");//replace selectedTopic[0] with that index
        numSelected++; //add to the count of selected nodes
        node1 = thisNode; //node1 is the current node
        displayInfoBox(node1); //adding it to the bottom box
        somethingSelected=true; 

        //reset everything to deselected, select current node
         paths.attr("opacity",0.5)
          .attr("stroke","0");
          node1.attr("opacity",1);
          node1.attr("stroke","#000000");
          node1.attr("stroke-width","1.5px");
      }
      //if something is selected
      else if (numSelected==1){
        selectedTopic[1]=thisNode.attr("index"); //replace selectedTopic[1] with that index
        numSelected++;
        node2 = thisNode;
        displayCombinedInfoBox(node1,node2);
        somethingSelected=true;

        //select current node
        node2.attr("opacity",1);
        node2.attr("stroke","#000000");
        node2.attr("stroke-width","1.5px");
      }
      //remove from selection if shift is held and it is re-pressed
      else if($.inArray(thisNode.attr("index"),selectedTopic) > -1){
        //deselect current node
        thisNode.attr("opacity",0.5);
        thisNode.attr("stroke","0");
        //change it's value in selectedTopic back to -1
        selectedTopic[$.inArray(thisNode.attr("index"),selectedTopic)]=-1;

        //if -1 exists in selectedTopic[]
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
      }
    }
    //if shift is not being currently pressed
    else{
      //if you're clicking a previously selected topic,
      //deselect it
      if(thisNode.attr("index")==selectedTopic[0]){
          thisNode.attr("opacity",0.5);
          thisNode.attr("stroke","0");
          selectedTopic[0]=-1;
          somethingSelected=false;
          numSelected=0;
        }
        //if it's not previously selected,
        //select it
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
      }
    }
    if(!somethingSelected){
      displayDefault(); 
    }

  });

  //default text
  function displayDefault(){
    document.getElementById("textBoxInner").innerHTML = "<h1>Default text</h1><hr>";
  }

  //update the text at the bottom for the one selected node
  function displayInfoBox(node) {
      var num = node.attr("index");
      selectedTopic = num;
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

//RESIZING WITH A WINDOW RESIZE----------------->

  window.onresize = function(event){
    var iw = $('body').innerWidth();
    var ww = $(window).width();
    var tempWindowWidth = ww*0.8 - 10;


      width = (windowWidth/numTopics)*.75;
      g = (windowWidth/numTopics)*.25;   
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

  //------------------FOR CHANGING THE DATA WITH CHECKBOXES-----------------//

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
      .attr("opacity",0.5)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"
      });

//----------------FOR MAINTAINING MOUSEENTER/MOUSEDOWN AFTER CHECKBOX CHANGES--------------//

    paths.on("mouseenter", function(){
        thisNode = d3.select(this);
        var num = thisNode.attr("index");
        document.getElementById("highlighted").innerHTML = "Topic " + num;
      });

  paths.on("mouseenter", function(){
    thisNode = d3.select(this)
  //  displayInfoBox(thisNode);
    var num = thisNode.attr("index");
    document.getElementById("highlighted").innerHTML = "Topic " + num;
  });

  var selectedTopic = [-1,-1];
  var somethingSelected = false;
  var numSelected = 0;
  var node1;
  var node2;

  paths.on("mousedown", function(){

    console.log("Clicked a path");
    thisNode = d3.select(this)
    
    if(shiftPressed == true){
      console.log("Num selected:"+numSelected);
      if(numSelected==0){
        selectedTopic[0]=thisNode.attr("index");
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
        if(thisNode.attr("index")!=selectedTopic[0]){
          if (selectedTopic[0]==-1){
            console.log("Filling sT 0")
            selectedTopic[0]=thisNode.attr("index");
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
            selectedTopic[1]=thisNode.attr("index");
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
      else if($.inArray(thisNode.attr("index"),selectedTopic) > -1){
        thisNode.attr("opacity",0.5);
        thisNode.attr("stroke","0");
        selectedTopic[$.inArray(thisNode.attr("index"),selectedTopic)]=-1;
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
      if(thisNode.attr("index")==selectedTopic[0]){
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
        else if(thisNode.attr("index")==selectedTopic[1]){
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

}}
);

});





//--------------THIS SECTION IS JUST FOR MAKING DUMMY DATA------------------//

  // function shuffle(o){
  //     for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  //     return o;
  // }

  //   var arr0= [0,1,2,3,4,5,6,7,8,9];
  //   var arr1= [0,1,2,3,4,5,6,7,8,9];
  //   var arr2= [0,1,2,3,4,5,6,7,8,9];
  //   var arr3= [0,1,2,3,4,5,6,7,8,9];
  //   var arr4= [0,1,2,3,4,5,6,7,8,9];
  //   var arr5= [0,1,2,3,4,5,6,7,8,9];
  //   var arr6= [0,1,2,3,4,5,6,7,8,9];
  //   var arr7= [0,1,2,3,4,5,6,7,8,9];
  //   var arr8= [0,1,2,3,4,5,6,7,8,9];
  //   var arr9= [0,1,2,3,4,5,6,7,8,9];

  //   list = [arr0,arr1,arr2,arr3,arr4,arr5,arr6,arr7,arr8,arr9];

  //   //shuffles list so that the "topics" are in various order
  //   for(i=0;i<10;i++){
  //     list[i]=shuffle(list[i]);
  //   }

  //   var tempArray = [];

  //   var w = window;

  //   //shuffles each topic's ordering 
  //   for(i=0;i<10;i++){
  //     w["arr_"+i] = [];
  //   }
  //   for(i=0;i<10;i++){
  //     for(j=0;j<10;j++){
  //         w["arr_"+i].push(list[j].indexOf(i));
  //     }
  //   } 

//--------------------END DUMMY DATA SECTION----------------------//





//function that takes in the "topic number" and spits out the associated path
  // function flowChart(topicNum){

  //     var points = [];

  //     //making the points along the top of the path
  //     for(i=0;i<10;i++){
  //       var tempX = x + i*width + i*g;
  //       var tempX2 = x + (i+1)*width + i*g;
  //       var tempY = y+(w["arr_"+topicNum][i]*verticalGap); //Y value determined by the topic's order at "time" i
  //       var tempY2 = tempY;
  //       points.push([tempX,tempY]); //the leftmost point in each column
  //       points.push([tempX2,tempY2]); //the rightmost point in each column
  //     }
  //     //making the points along the bottom of the path to close off the shape
  //     for(i=9;i>-1;i--){
  //       //var randHeighttemp= i*1.5+10;
  //       var randHeight = thicknessScale(w["arr_"+topicNum][i]);
  //     //  var randHeight = Math.floor((Math.random()*height)+10); //minimum height of 10 px
  //       var tempX = x + (i+1)*width + i*g;
  //       var tempX2 = x + i*width + i*g;
  //       var tempY = y+(w["arr_"+topicNum][i]*verticalGap)+randHeight;
  //       var tempY2 = tempY;
  //       points.push([tempX,tempY]);
  //       points.push([tempX2,tempY2]); 
  //     }
          
  //     return d3.svg.line()(points);
      
  // }