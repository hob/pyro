import React from 'react'
import {getColorThresholds} from './common/thresholds.js'

const CONTAINER_ID = "historyGraph";

class LineGraph extends React.Component {
  constructor(props) {
    super(props)
    this.readings = props['readings']
    this.margins = {
        left: 50,
        right: 0,
        top: 10,
        bottom: 25
    }
    this.bisectDate = d3.bisector(function(d) { return d.d; }).left;
    this.NUM_AXIS_LABELS = 6;
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onFocusMove = this.onFocusMove.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
  }

  render() {
    this.container = <div id={CONTAINER_ID}></div>;
    return this.container;
  }

  componentDidMount() {
    window.addEventListener("resize", this.onWindowResize)
    this.initDimensions();
    this.processRawData();
    this.createGraph();
    this.initGradient();
    this.initX();
    this.initY();
    this.initLine();
    this.addLine();
    this.addX();
    this.addY();
    this.addFocus();
  }

  readingAdded() {
      this.endTime = this.readings[this.readings.length - 1].d;
      this.xScale.domain(d3.extent(this.readings, function(d) {return d.d}));
      this.maxYScale = d3.max(this.readings, function(d) {return d.t});
      this.yScale.domain([0, this.maxYScale]).nice();
      this.graph.select("g.x.axis").call(this.xAxis);
      this.graph.selectAll("path").data([this.readings]).attr("d", this.line);
  }

  onWindowResize() {
      d3.select("#" + CONTAINER_ID).select("svg").remove();
      this.createGraph();
      this.initDimensions();
      this.initGradient();
      this.initX();
      this.initY();
      this.initLine();
      this.addLine();
      this.addX();
      this.addY();
      this.addFocus();
  }

  initDimensions() {
      let container = document.getElementById(CONTAINER_ID);
      this.width = container.offsetWidth - this.margins.left - this.margins.right;
      this.height = container.offsetHeight - this.margins.top - this.margins.bottom;
  }

  processRawData() {
      this.startTime = this.readings[0].d;
      this.endTime = this.readings[this.readings.length -1].d;
      this.maxYScale = 0;
      this.minYScale = 1000;
      for(var i=0;i<this.readings.length;i++) {
          var temp = this.readings[i].t
          this.maxYScale = Math.max(this.maxYScale, temp);
          this.minYScale = Math.min(this.minYScale, temp);
      }
  }

  createGraph() {
      // Add an SVG element with the desired dimensions
      this.graph = d3.select("#" + CONTAINER_ID).append("svg:svg")
          .classed("line-graph", true)
          .append("svg:g")
          .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
  }

  initGradient() {
      var maxGradientTemp = getColorThresholds().keys().next().value; //Assume the 1st is the hottest
      var rangeInUse = this.maxYScale - this.minYScale;
      var y1 = -(this.minYScale / rangeInUse) * 100 + "%";
      var y2 = (maxGradientTemp / this.maxYScale) * 100 + "%";
      var gradient = this.graph.append("defs")
          .append("linearGradient")
          .attr("id", "temperatureGradient")
          .attr("x1", "0%")
          .attr("y1", y1)
          .attr("x2", "0%")
          .attr("y2", y2)
          .attr("spreadMethod", "pad");
      this.createGradientStops(gradient);
  }

  createGradientStops(gradient) {
      var i = 0;
      var thresholdCount = getColorThresholds().size;
      for(var [temp, color] of getColorThresholds()) {
          var percentage = (i / thresholdCount * 100)+ "%";
          gradient.append("stop")
                  .attr("offset", percentage)
                  .attr("stop-color",color)
                  .attr("stop-opacity", 1);
          i += 1;
      }
  }

  initLine() {
      this.line = d3.line()
                    .x((data) => this.xScale(data.d))
                    .y((data) => this.yScale(data.t));
  }
  initX() {
      this.xScale = d3.scaleTime()
                      .domain([this.startTime, this.endTime])
                      .range([0, this.width]);
      this.xAxis = d3.axisBottom(this.xScale)
                     .ticks(this.NUM_AXIS_LABELS)
                     .tickSize(-this.height);
  }

  initY() {
      this.yScale = d3.scaleLinear()
                      .domain([0, this.maxYScale])
                      .range([this.height, 0])
                      .nice();
      this.yAxis = d3.axisLeft(this.yScale)
                     .ticks(this.NUM_AXIS_LABELS)
                     .tickSize(-this.width);
  }
  addX() {
      this.graph.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")")
          .call(this.xAxis);
  }
  addY() {
      this.graph.append("svg:g")
          .attr("class", "y axis left")
          .attr("transform", "translate(-10,0)")
          .call(this.yAxis);
  }
  addLine() {
      this.graph.append("path")
                .data([this.readings])
                .attr("class", "line")
                .attr("d", this.line)
                .style("stroke","url(#temperatureGradient)");
  }
  addFocus() {
      this.focus = this.graph.append("g").style("display", "none");
      this.focus.append("circle")
                .attr("class", "y")
                .style("fill", "#800026")
                .style("stroke", "#fd8d3c")
                .style("stroke-width","3px")
                .attr("r", 6);
      this.focusText = this.focus.append("text")
                      .attr("x", 9)
                      .attr("dy", ".35em")
                      .attr("id","focusText");
      this.mouseTarget = this.graph.append("rect")
                                   .attr("width", this.width)
                                   .attr("height", this.height)
                                   .style("fill", "none")
                                   .style("pointer-events", "all")
                                   .on("mouseover", this.onFocusIn)
                                   .on("touchstart", () => (this.onFocusIn(), this.onFocusMove()))
                                   .on("mouseout", this.onFocusOut)
                                   .on("mousemove", this.onFocusMove)
                                   .on("touchmove", this.onFocusMove);
  }
  onFocusMove() {
      var x = d3.mouse(this.mouseTarget.node())[0],
          x0 = this.xScale.invert(x),
          i = this.bisectDate(this.readings, x0, 1),
          d0 = this.readings[i - 1],
          d1 = this.readings[i],
          d = x0 - d0.d > d1.d - x0 ? d1 : d0,
          dx = (this.xScale(d.d) - 9), //The hard-coded 9 pixels compensates for the -9 pixel translate of the line in css
          dy = this.yScale(d.t);

      this.focus.select("circle.y")
          .attr("transform", "translate(" + dx + "," + dy + ")");
      this.focusText.text(d.t.toFixed(2) + " " + d.d.toLocaleTimeString()).attr("transform","translate(" + dx + "," + dy + ")");
  }
  onFocusIn() {
      this.focus.style("display", null);
  }
  onFocusOut() {
      this.focus.style("display", "none");
  }

}

export default LineGraph;
