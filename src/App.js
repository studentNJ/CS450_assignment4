import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[],
    };
    this.colors = {
      GPT4: "#e41a1c",
      Gemini: "#377eb8",
      Palm2: "#4daf4a",
      Claude: "#984ea3",
      Llama31: "#ff7f00",
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
renderChart = () => {
  const data = this.state.data;
  if (data.length === 0) return;

  const keys = ["GPT4", "Gemini", "Palm2", "Claude", "Llama31"];
  const svg = d3.select("svg");
  const width = 800;
  const height = 600;
  const margin = { top: 30, right: 20, bottom: 30, left: 50 };

  svg.selectAll("*").remove(); // Clear existing

  const g = svg
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Date))
    .range([0, width - margin.left - margin.right]);

  const maxSum = d3.max(data, (d) =>
    keys.reduce((sum, key) => sum + d[key], 0)
  );

  const yScale = d3
    .scaleLinear()
    .domain([-maxSum / 4, maxSum])
    .range([height - margin.top - margin.bottom, 0]);

  const stack = d3
    .stack()
    .keys(keys)
    .offset(d3.stackOffsetWiggle);

  const areaGenerator = d3
    .area()
    .x((d) => xScale(d.data.Date))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(d3.curveCardinal);

  const series = stack(data);

  const tooltip = d3.select("#tooltip");

  g.selectAll("path")
    .data(series)
    .enter()
    .append("path")
    .attr("d", (d) => areaGenerator(d))
    .attr("fill", (d, i) => this.colors[keys[i]])
    .attr("opacity", 0.9)
    .on("mousemove", (event, d) => {
      const [x, y] = d3.pointer(event);
      const model = d.key;

      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 80}px`)
        .style("display", "block");

      this.drawBarChart(data, model);
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  // Axes
  const xAxis = d3.axisBottom(xScale).ticks(12);
  const yAxis = d3.axisLeft(yScale);

  g.append("g")
    .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
    .call(xAxis);

  g.append("g").call(yAxis);

  // Legend
  //const models = ['GPT4', 'Gemini', 'Palm2', 'Claude', 'Llama31'];
  const modelLabels = ['GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'];
  const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
  
  // Clear previous legend
  d3.select('.legend-container').selectAll("*").remove();
  
  // Draw vertically stacked legend
  const legend = d3.select('.legend-container')
    .selectAll('g')
    .data(modelLabels)
    .join('g')
    .attr('transform', (d, i) => `translate(10, ${i * 25 + 10})`); // 25px spacing per item
  
  legend.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', (d, i) => colors[i]);
  
  legend.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .text(d => d)
    .style('font-size', '12px')
    .attr('fill', '#333');
};

drawBarChart = (data, model) => {
  const barWidth = 250;
  const barHeight = 120;
  const margin = { top: 10, right: 10, bottom: 20, left: 30 };

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d3.timeFormat("%b")(d.Date)))
    .range([margin.left, barWidth - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[model])])
    .range([barHeight - margin.bottom, margin.top]);

  const svg = d3
    .select("#bar-tooltip")
    .attr("width", barWidth)
    .attr("height", barHeight);

  svg.selectAll("*").remove();

  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d3.timeFormat("%b")(d.Date)))
    .attr("y", (d) => y(d[model]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => barHeight - margin.bottom - y(d[model]))
    .attr("fill", this.colors[model]);

  svg
    .append("g")
    .attr("transform", `translate(0,${barHeight - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));
};

render() {
  return (
    <div>
      <FileUpload set_data={this.set_data}></FileUpload>

      <svg style={{ width: 800, height: 600 }}>
        <g className="container"></g>
      </svg>
      <div
          id="tooltip"
          style={{
            position: "absolute",
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "10px",
            display: "none",
            pointerEvents: "none",
          }}
        >
          <svg id="bar-tooltip"></svg> </div>
      <svg style={{ width: 400, height: 150 }}>
          <g className="legend-container"></g>
      </svg>
    </div>
  );
}
}

export default App;