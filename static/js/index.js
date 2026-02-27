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

        const src_mp4 = video.dataset.srcMp4 || video.dataset.src;
        const src_webm = video.dataset.srcWebm;

        if (src_webm) {
          const source_webm = document.createElement("source");
          source_webm.src = src_webm;
          source_webm.type = "video/webm";
          video.appendChild(source_webm);
        }
        if (src_mp4) {
          const source_mp4 = document.createElement("source");
          source_mp4.src = src_mp4;
          source_mp4.type = "video/mp4";
          video.appendChild(source_mp4);
        }

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

  // ---- Controls: only show controls when the user clicks a video ----
  // Uses event delegation so it works for videos loaded later too.
  document.addEventListener("click", (e) => {
    const v = e.target.closest("video");
    if (!v) return;
    v.controls = true;
  });

(function () {
  function getAspect(video) {
    return (video.videoWidth && video.videoHeight)
      ? (video.videoWidth / video.videoHeight)
      : (16 / 9);
  }

  function layoutGrid(grid) {
    const vids = grid.querySelectorAll("video");
    if (vids.length < 2) return;

    const rL = getAspect(vids[0]);
    const rR = getAspect(vids[1]);

    grid.style.gridTemplateColumns = `${rL}fr ${rR}fr`;
  }

  function initGrid(grid) {
    const relayout = () => layoutGrid(grid);

    relayout(); // initial (fallback aspect)
    grid.querySelectorAll("video").forEach(v => v.addEventListener("loadedmetadata", relayout));

    const ro = new ResizeObserver(relayout);
    ro.observe(grid);
  }

  // IMPORTANT: only apply to the *two-column* compare grids
  document.querySelectorAll(".compare-grid").forEach(grid => {
    // skip inner 1-col / 2-col image grids if you want:
    const style = getComputedStyle(grid);
    if (!style.gridTemplateColumns || style.gridTemplateColumns.split(" ").length < 2) return;
    initGrid(grid);
  });
})();

(function () {
  const lazyVideos = document.querySelectorAll('.lazy-video');

  if ('IntersectionObserver' in window) {
    let lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(video) {
        if (video.isIntersecting) {
          const videoTarget = video.target;
          videoTarget.muted = true;
          videoTarget.playsinline = true;
          videoTarget.loop = true;

          let source_mp4, source_webm;

          if (videoTarget.dataset.srcDesktopMp4 && window.innerWidth >= 768) {
            source_webm = document.createElement('source');
            source_webm.src = videoTarget.dataset.srcDesktopWebm;
            source_webm.type = 'video/webm';
            videoTarget.appendChild(source_webm);

            source_mp4 = document.createElement('source');
            source_mp4.src = videoTarget.dataset.srcDesktopMp4;
            source_mp4.type = 'video/mp4';
            videoTarget.appendChild(source_mp4);
          } else if (videoTarget.dataset.srcMobileMp4) {
            source_webm = document.createElement('source');
            source_webm.src = videoTarget.dataset.srcMobileWebm;
            source_webm.type = 'video/webm';
            videoTarget.appendChild(source_webm);
            
            source_mp4 = document.createElement('source');
            source_mp4.src = videoTarget.dataset.srcMobileMp4;
            source_mp4.type = 'video/mp4';
            videoTarget.appendChild(source_mp4);
          } else if (videoTarget.dataset.srcMp4) {
             source_webm = document.createElement('source');
            source_webm.src = videoTarget.dataset.srcWebm;
            source_webm.type = 'video/webm';
            videoTarget.appendChild(source_webm);

            source_mp4 = document.createElement('source');
            source_mp4.src = videoTarget.dataset.srcMp4;
            source_mp4.type = 'video/mp4';
            videoTarget.appendChild(source_mp4);
          }


          videoTarget.load();
          videoTarget.play();

          lazyVideoObserver.unobserve(videoTarget);
        }
      });
    }, { rootMargin: "200px" });

    lazyVideos.forEach(function(lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
})();

})