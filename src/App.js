import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      selected_data:[],
      sentimentColors : { positive: "green", negative: "red", neutral: "gray" }
    };
  }
  componentDidMount(){
    this.renderChart()
  }
  componentDidUpdate(){
    this.renderChart()
}
set_data = (csv_data) => {
  this.setState({ data: csv_data });
}
renderChart=()=>{
  var margin ={left:50,right:150,top:10,bottom:10},width = 500,height=300;
  var innerWidth = width - margin.left - margin.right
  var innerHeight = height - margin.top - margin.bottom
  //Grab our state variables and intialize them
  const data = this.state.data
  const sentimentColors = this.state.sentimentColors
  //Scale to the dimensions of the SVG
  const scaleHeight = d3.scaleLinear().domain([d3.min(data, d => d["Dimension 2"]), d3.max(data, d => d["Dimension 2"])]).range([margin.top + 5, innerHeight -5])
  const scaleWidth = d3.scaleLinear().domain([d3.min(data, d => d["Dimension 1"]), d3.max(data, d => d["Dimension 1"])]).range([margin.left + 5, innerWidth -5])
  
  var brush = d3.brush().on('start brush', (e) => {
    //Unpack rectangular corners of brush for use in filtering
    const [[x0, y0] ,[x1, y1]] = e.selection
    var filtered_data = data.filter(item=>{
      return scaleWidth(item['Dimension 1']) >= x0 && scaleWidth(item['Dimension 1']) <= x1 && scaleHeight(item['Dimension 2']) >= y0 && scaleHeight(item['Dimension 2']) <= y1
  })
  this.setState({selected_data: filtered_data})
  })


  d3.select('svg').attr('width', width).attr('height', height).selectAll('circle').data(data).join(

    enter => enter.append('circle')
    .attr('cx', (d) => scaleWidth(d["Dimension 1"]))
    .attr('cy', (d) => scaleHeight(d["Dimension 2"]))
    .attr('r', 5)
    .attr('fill', (d) => sentimentColors[d["PredictedSentiment"]]),

    update=> update
    .attr('cx', (d) => scaleWidth(d["Dimension 1"]))
    .attr('cy', (d) => scaleHeight(d["Dimension 2"]))
    .attr('r', 5)
    .attr('fill', (d) => sentimentColors[d["PredictedSentiment"]]),
    
    exit => exit.remove()
  )
  d3.select('svg').call(brush)
  


}
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item"> 
          <h2>Projected Tweets</h2> 
            <svg> </svg> 
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2> 
            {this.state.selected_data.map(item=> <p style={{color: this.state.sentimentColors[item['PredictedSentiment']]}}>{item['Tweets']}</p>)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;