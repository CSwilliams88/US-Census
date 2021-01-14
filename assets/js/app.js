// set width and height of svg
var svgWidth = 960;
var svgHeight = 500;

// set margins
var margin = {
  top: 20,
  right: 40,
  bottom: 110,  // add padding on bottom margin to make room for additional x-axis labels
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg wrapper and append a SVG group that will hold the scatter plot and place according to margins defined above
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// append a SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";   

// function used for updating x-scale varible upon click on axis label
function xScale(healthRiskData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthRiskData, d => d[chosenXAxis]) * 0.8,
    d3.max(healthRiskData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width])

  return xLinearScale;
}

// add y scale updater
// function used for updating y-scale varible upon click on axis label
function yScale(healthRiskData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthRiskData, d => d[chosenYAxis]) * 0.8,
    d3.max(healthRiskData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0])

  return yLinearScale;
}

// function used for updating xAxis varible upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis varible upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles in x position
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to new circles in y position
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


// function used for updating text group with a transition to new text in x position
function renderXText(textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));  

  return textGroup;
}

// function used for updating text group with a transition to new text in y position
function renderYText(textGroup, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]) + 5); // offset to the north need to adjust to center in circle

  return textGroup;
}

////////////////////////////////////////////////////////////////////////////
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var labelX = "Poverty(%): "
  }
  else if (chosenXAxis === "age") {
    var labelX = "Age: "
  }
  else if (chosenXAxis === "income") {
    var labelX = "Income: "
  }

  if (chosenYAxis === "healthcare") {
    var labelY = "Healthcare(%): "
  }
  else if (chosenYAxis === "smokes") {
    var labelY = "Smokes(%): "
  }
  else if (chosenYAxis === "obesity") {
    var labelY = "Obese(%): "
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")  // d3-tip better looking pop out than "tooltip"
    .offset([-5, 0])  // add some space between the tag and circle
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`)
    });

  circlesGroup.call(toolTip).on("mouseover", toolTip.show).on("mouseout", toolTip.hide)

  return circlesGroup
};
/////////////////////////////////////////////////////////////////////////////////

// retrieve data from the csv file an execute below, need .then for promise
d3.csv("assets/data/data.csv").then(function(healthRiskData, err) {  
  if (err) throw err;
  console.log(healthRiskData)

  // parse data
  healthRiskData.forEach(function(data) {
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthRiskData, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(healthRiskData, chosenYAxis);


  // create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale)
  var leftAxis = d3.axisLeft(yLinearScale)

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis 
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
    
  // append text
  var textGroup = chartGroup.append("g")
    .selectAll("text")
    .data(healthRiskData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))  
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)  // offset to the north need to adjust to center in circle
    .text(d => d.abbr)
    .attr("font-size", "13px")
    .attr("stroke", "#ff1a1a")
    .attr("text-anchor", "middle")
    .attr("fill", "#ff1a1a");
    

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthRiskData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)  // change size of circle
    .attr("fill", "#99b3ff") // change color #89bdd3
    .attr("stroke", "e3e3e3")
    .attr("opacity", "0.5");

  // Create group for multiple x-axis labels called labelsGroupX
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)  /// this one is active
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (median)");

  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (median)");


  // Create group for multiple y-axis labels called labelsGroupY
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${width - 840}, ${height / 2})`);  //width - 840 to line up with y axis

  var healthCareLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)") // rotate 90 degrees
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "healthcare")
    .classed("active", true)  /// this one is active
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)") // rotate 90 degrees
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)") // rotate 90 degrees
    .attr("x", 0)
    .attr("y", -60)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

 
  // updateToolTip function for chosenX, Y, circlesGroup and textGroup
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup)

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection  
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)

        // updates x scale for new data
        xLinearScale = xScale(healthRiskData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
       

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // update text
        textGroup = renderXText(textGroup, xLinearScale, chosenXAxis)

        

        // changes classes to bold text with click
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        } 
    });

  // y axis labels event listener
  labelsGroupY.selectAll("text")
  .on("click", function() {
    // get value of selection  
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {
      // replaces chosenYAxis with value
      chosenYAxis = value;
      console.log(chosenYAxis)

      // updates y scale for new data
      yLinearScale = yScale(healthRiskData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
      

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

      // update text
      textGroup = renderYText(textGroup, yLinearScale, chosenYAxis)

      

      // changes classes to bold text with click selection
      if (chosenYAxis === "healthcare") {
        healthCareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      } 
  });
});
