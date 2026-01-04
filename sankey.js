// Setup base D3 Sankey
const width = 1200;
const height = 500;

const svg = d3.select('#sankey-container')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('width', '100%')
  .attr('height', height);

// caricare il CSV

d3.csv('assets/data/Sankey_ColorAgeBehavior.csv').then(data => {

  console.log('First row:', data[0]); // 👈 DEBUG FONDAMENTALE

  const nodes = [];
  const links = [];

  function getNode(name) {
    if (!name) return null; // 👈 protezione extra

    let node = nodes.find(d => d.name === name);
    if (!node) {
      node = { name };
      nodes.push(node);
    }
    return node;
  }

  data.forEach(d => {

    // ⚠️ ADATTA QUESTE TRE RIGHE SE I NOMI DEL CSV SONO DIVERSI
    const sourceName = d.source || d.Source;
    const targetName = d.target || d.Target;
    const value = +d.value || +d.Value;

    const source = getNode(sourceName);
    const target = getNode(targetName);

    if (source && target && value) {
      links.push({
        source,
        target,
        value
      });
    }
  });

  console.log('Nodes:', nodes);
  console.log('Links:', links);

  // 👉 QUI sotto continuerà il codice del sankey (layout, svg, ecc.)

});


// costruire layout sankey

   const sankey = d3.sankey()
    .nodeWidth(14)
    .nodePadding(24)
    .extent([[0, 0], [width, height]]);

  const graph = sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
  });
 
// disegnare i link (flussi

  svg.append('g')
    .selectAll('path')
    .data(graph.links)
    .join('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('fill', 'none')
    .attr('stroke', d => {
      return (
        d.source.name === 'Juvenile' ||
        d.source.name === 'Adult'
      )
        ? '#1BD600'
        : '#A8ADA6';
    })
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('opacity', 0.9);


// disegnare i nodi

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


// etichette

    node.append('text')
    .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr('y', d => (d.y0 + d.y1) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
    .text(d => d.name)
    .style('font-family', 'Open Sans')
    .style('font-size', '14px')
    .style('fill', '#0e3506');


// valori numerici

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
  

