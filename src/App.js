import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      selected_data:[]
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
  const data = this.state.data
  const maxSum = d3.sum([
    d3.max(data, d => d.GPT4),
    d3.max(data, d => d.Gemini),
    d3.max(data, d => d.Palm2),
    d3.max(data, d => d.Claude),
    d3.max(data, d => d.Llama31)
  ]);

  
}
  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <svg></svg>
      </div>
    );
  }
}

export default App;