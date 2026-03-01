window.HELP_IMPROVE_VIDEOJS = false;

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

      function ensureVideoUnloaded(video) {
        if (!video || video.dataset.loaded !== "1") return;
        
        video.pause();
        video.removeAttribute('src'); // empty source
        while (video.firstChild) {
          video.removeChild(video.firstChild);
        }
        video.load();
        delete video.dataset.loaded;
      }

      // Optional: IntersectionObserver to load videos only when scrolled into view
      const io = ("IntersectionObserver" in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                ensureVideoLoaded(e.target);
              } else {
                ensureVideoUnloaded(e.target);
              }
            });
          }, { rootMargin: "600px" }) // margin to preload/un-unload
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
          grid.querySelectorAll(".more-results-video").forEach(v => {
              v.pause();
              // we don't necessarily want to unload here if they might show up again, 
              // but IntersectionObserver will handle it if they aren't intersecting.
          });
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

  function updatePoster(video) {
    if (video.dataset.posterMobile && video.dataset.posterDesktop) {
      if (window.innerWidth < 768) {
        video.poster = video.dataset.posterMobile;
      } else {
        video.poster = video.dataset.posterDesktop;
      }
    }
  }

  function ensureVideoLoaded(video) {
    if (!video || video.dataset.loaded === "1") return;

    updatePoster(video);

    // Only add playsinline if it's not already present in HTML
    if (!video.hasAttribute('playsinline')) {
      video.playsinline = true;
    }

    let source_mp4, source_webm;

    if (video.dataset.srcDesktopMp4 && window.innerWidth >= 768) {
      source_webm = document.createElement('source');
      source_webm.src = video.dataset.srcDesktopWebm;
      source_webm.type = 'video/webm';
      video.appendChild(source_webm);

      source_mp4 = document.createElement('source');
      source_mp4.src = video.dataset.srcDesktopMp4;
      source_mp4.type = 'video/mp4';
      video.appendChild(source_mp4);
    } else if (video.dataset.srcMobileMp4) {
      source_webm = document.createElement('source');
      source_webm.src = video.dataset.srcMobileWebm;
      source_webm.type = 'video/webm';
      video.appendChild(source_webm);
      
      source_mp4 = document.createElement('source');
      source_mp4.src = video.dataset.srcMobileMp4;
      source_mp4.type = 'video/mp4';
      video.appendChild(source_mp4);
    } else if (video.dataset.srcMp4) {
       source_webm = document.createElement('source');
      source_webm.src = video.dataset.srcWebm;
      source_webm.type = 'video/webm';
      video.appendChild(source_webm);

      source_mp4 = document.createElement('source');
      source_mp4.src = video.dataset.srcMp4;
      source_mp4.type = 'video/mp4';
      video.appendChild(source_mp4);
    }

    video.dataset.loaded = "1";
    video.load();
  }

  function ensureVideoUnloaded(video) {
    if (!video || video.dataset.loaded !== "1") return;
    
    video.pause();
    video.removeAttribute('src'); // empty source
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    video.load();
    delete video.dataset.loaded;
  }

  // Initial poster set
  lazyVideos.forEach(updatePoster);

  if ('IntersectionObserver' in window) {
    let lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(video) {
        if (video.isIntersecting) {
          ensureVideoLoaded(video.target);
        } else {
          ensureVideoUnloaded(video.target);
        }
      });
    }, { rootMargin: "600px" });

    lazyVideos.forEach(function(lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
})();

})