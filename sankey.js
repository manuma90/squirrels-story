// Mobile
const isMobile = window.innerWidth < 768;

// Setup base D3 Sankey
const width = 1200;
const height = isMobile ? 900 : 500;


const svg = d3.select('#sankey-container')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('width', '100%')
  .attr('height', height);

// caricare il CSV
d3.csv('assets/data/Sankey_ColorAgeBehavior.csv').then(data => {

  console.log('First row:', data[0]);

  const nodes = [];
  const links = [];

  // 1️⃣ Costruisci la lista dei nodi (UNICI)
  data.forEach(d => {
    if (!nodes.find(n => n.name === d.source)) {
      nodes.push({ name: d.source });
    }
    if (!nodes.find(n => n.name === d.target)) {
      nodes.push({ name: d.target });
    }
  });

  // 2️⃣ Costruisci i link usando STRINGHE
  data.forEach(d => {
    const value = +d.value;
    if (!isNaN(value)) {
      links.push({
        source: d.source,
        target: d.target,
        value
      });
    }
  });

  console.log('Nodes:', nodes);
  console.log('Links:', links);

  // 3️⃣ Costruire layout sankey
  const sankey = d3.sankey()
    .nodeId(d => d.name)     // 🔑 FONDAMENTALE
    .nodeWidth(14)
    .nodePadding(24)
    .extent([[0, 0], [width, height]]);

  const graph = sankey({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

// 4️⃣ Disegnare i link (flussi)
const linkPaths = svg.append('g')
  .selectAll('path')
  .data(graph.links)
  .join('path')
  .attr('class', d => `link source-${d.source.name.toLowerCase()}`)
  .attr('d', d3.sankeyLinkHorizontal())
  .attr('fill', 'none')
  .attr('stroke', '#A8ADA6')
  .attr('stroke-width', d => Math.max(1, d.width))
  .attr('opacity', 0.4);

  // 5️⃣ Disegnare i nodi
  const node = svg.append('g')
    .selectAll('g')
    .data(graph.nodes)
    .join('g');

  node.append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('height', d => d.y1 - d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('fill', '#000');

  // 6️⃣ Etichette
  node.append('text')
    .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
    .text(d => d.name)
    .style('font-family', 'Open Sans')
    .style('font-size', '14px')
    .style('fill', '#0e3506');

  // 7️⃣ Valori numerici
  node.append('text')
    .attr('x', d => (d.x0 + d.x1) / 2)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('text-anchor', 'middle')
    .text(d => d.value)
    .style('font-family', 'Open Sans')
    .style('font-size', '12px')
    .style('fill', '#ffffff')
    .style('pointer-events', 'none');

});
