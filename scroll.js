const steps = document.querySelectorAll('.step');
const textBox = document.getElementById('text-box');
const mapContainer = document.getElementById('map-container');

const texts = {
  1: `
    <strong>Central Park as an Island</strong><br>
    Central Park functions like an ecological island: an 840-acre green refuge surrounded by traffic,
    buildings, and infrastructure. For squirrels, there is no alternative habitat nearby:
    adaptation is not optional.
  `,
  2: `
    In October 2018, a team of researchers and 323 trained volunteers surveyed squirrels across Central Park
    over two weeks.<br><br>
    Each sighting recorded location, fur color, age group, and behavior, following a standardized
    ecological methodology adapted from wildlife population studies.
  `,
  3: `
    <strong>Not All Gray</strong><br>
    While often perceived as uniform, Central Park squirrels display remarkable variation in fur color.
    662 individuals were recorded as entirely black or cinnamon, with many more showing mixed patterns.
    <div class="legend">
      <span><i class="dot gray"></i>Gray (2,473)</span>
      <span><i class="dot black"></i>Black (103)</span>
      <span><i class="dot cinnamon"></i>Cinnamon (392)</span>
    </div>
  `,
  4: `
    <strong>Park Entrances & Human Activity</strong><br>
    Near park entrances, squirrels are more likely to remain close to people.
    Trash receptacles and visitor activity increase access to food,
    shaping bolder behavior.
  `
};

// LOAD SVG INLINE
fetch('assets/prova-web-ok.svg')
  .then(res => res.text())
  .then(svgText => {
    mapContainer.innerHTML = svgText;

    const svg = mapContainer.querySelector('svg');

    const layers = {
      base: svg.querySelector('#base'),
      all: svg.querySelector('#all'),
      color: svg.querySelector('#color'),
      entrance: svg.querySelector('#entrance'),
      approaches: svg.querySelector('#approaches')
    };

    // Init layers
    Object.values(layers).forEach(layer => {
      if (!layer) return;
      layer.style.opacity = 0;
      layer.style.transition = 'opacity 0.6s ease';
    });

    layers.base.style.opacity = 1;

    function activateStep(step) {
      if (!texts[step]) return;

      // reset non-base layers
      Object.keys(layers).forEach(key => {
        if (key !== 'base' && layers[key]) {
          layers[key].style.opacity = 0;
        }
      });

      if (step === "2" && layers.all) layers.all.style.opacity = 1;
      if (step === "3" && layers.color) layers.color.style.opacity = 1;
      if (step === "4") {
        if (layers.entrance) layers.entrance.style.opacity = 1;
        if (layers.approaches) layers.approaches.style.opacity = 1;
      }

      // text fade
      textBox.classList.add('hidden');
      setTimeout(() => {
        textBox.innerHTML = texts[step];
        textBox.classList.remove('hidden');
      }, 300);
    }

    // initial state
    activateStep("1");

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activateStep(entry.target.dataset.step);
        }
      });
    }, { threshold: 0.5 });

    steps.forEach(step => observer.observe(step));
  })
  .catch(err => console.error('SVG load error:', err));

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

  const nodes = [];
  const links = [];

  function getNode(name) {
    let node = nodes.find(d => d.name === name);
    if (!node) {
      node = { name };
      nodes.push(node);
    }
    return node;
  }


  data.forEach(d => {
    const source = getNode(d.source);
    const target = getNode(d.target);

    links.push({
      source,
      target,
      value: +d.value
    });
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
  

