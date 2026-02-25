window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 2,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
            pagination: false,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    (function () {
      const grid = document.getElementById("more-results-grid");
      const btn = document.getElementById("more-results-toggle");
      if (!grid || !btn) return;

      function ensureVideoLoaded(video) {
        if (!video || video.dataset.loaded === "1") return;
        const src = video.dataset.src;
        if (!src) return;

        // Create <source> only when we decide to load
        const source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);

        video.dataset.loaded = "1";
        video.load();
      }

      // Load the first 4 immediately (so your default view works)
      const initial = grid.querySelectorAll(".more-results-item:nth-child(-n+4) .more-results-video");
      initial.forEach(ensureVideoLoaded);

      // Optional: IntersectionObserver to load videos only when scrolled into view
      const io = ("IntersectionObserver" in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                ensureVideoLoaded(e.target);
                io.unobserve(e.target);
              }
            });
          }, { rootMargin: "200px" })
        : null;

      function observeVisibleVideos() {
        const visibleVideos = grid.querySelectorAll(".more-results-item:not([style*='display: none']) .more-results-video");
        visibleVideos.forEach(v => {
          if (io) io.observe(v);
          else ensureVideoLoaded(v); // fallback: load immediately
        });
      }

      // Observe initial ones (and load when near viewport)
      observeVisibleVideos();

      btn.addEventListener("click", () => {
        const expanded = grid.classList.toggle("expanded");
        btn.textContent = expanded ? "Show fewer results" : "Show all results";

        // Once expanded, start observing/loading newly revealed videos
        observeVisibleVideos();

        // Optional: if collapsing, pause videos to reduce CPU
        if (!expanded) {
          grid.querySelectorAll(".more-results-video").forEach(v => v.pause());
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    })();

})
