const margin = { top: 40, right: 240, bottom: 60, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scalePoint()
    .domain(['Early Game', 'Mid-Game First Half', 'Mid-Game Second Half', 'Late Game'])
    .range([0, width])
    .padding(1);

const colorScale = d3.scaleOrdinal()
    .domain(['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania', 'Antarctica'])
    .range(d3.schemeSet2);  

const sizeScale = d3.scaleSqrt()
    .range([5, 40]); 

d3.csv("goal_distribution_by_team_and_phase_continent.csv").then(function(data) {
    data.forEach(function(d) {
        d.Goals = +d.Goals;
    });

    sizeScale.domain([0, d3.max(data, d => d.Goals)]);

    const sizeValues = [1, 10, 20, 30]; // Example goal counts

    const sizeLegend = svg.append("g")
        .attr("transform", `translate(${width + 100}, 100)`); // Position the legend

    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", -30)
        .text("Goals (size of bubbles)")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle");

    sizeValues.forEach((value, index) => {
        sizeLegend.append("circle")
            .attr("cx", 0)
            .attr("cy", index * 40)
            .attr("r", sizeScale(value))
            .style("fill", "#ccc")
            .style("opacity", 0.6);

        sizeLegend.append("text")
            .attr("x", 40 + sizeScale(sizeValues[sizeValues.length - 1])) // Align text to the right of the largest circle
            .attr("y", index * 40)
            .attr("dy", "0.35em")
            .text(`${value} goals`)
            .style("font-size", "12px");
    });

    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d['Match Phase'])).strength(1))
        .force("y", d3.forceY(height / 2).strength(0.1))
        .force("collide", d3.forceCollide(d => sizeScale(d.Goals) + 1))
        .on("tick", ticked);

    function ticked() {
        const bubbles = svg.selectAll(".bubble")
            .data(data)
            .join("circle")
            .attr("class", "bubble")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => sizeScale(d.Goals))
            .style("fill", d => colorScale(d.Continent));

        const labels = svg.selectAll(".label")
            .data(data)
            .join("text")
            .attr("class", "label")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", "0.35em")
            .style("text-anchor", "middle")
            .text(d => d.team);
    }

    svg.append("g")
        .attr("transform", `translate(0,${height + margin.bottom / 2})`)
        .call(d3.axisBottom(xScale));
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Goal Distribution by Match Phase and Team");

    const legend = svg.append("g")
        .attr("transform", `translate(${width + 100}, 300)`)
        .selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d);
});
