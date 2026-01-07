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

 // ultimo box sparisce alla fine della map-story

const endOfMap = document.getElementById('end-of-map');

const endObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // siamo usciti dalla mappa → nascondi il box
      textBox.classList.add('hidden');
    }
  });
}, {
  threshold: 0
});

endObserver.observe(endOfMap);


