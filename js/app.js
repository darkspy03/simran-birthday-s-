document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Particles Engine
  const particles = new RomanticParticles('bg-canvas');

  // 2. Initialize AudioManager
  const audio = new RomanticAudioManager();

  // 3. Initialize Games & Surprises
  const game = new RomanticGameManager(audio, particles);

  // 4. Global State variables
  let cursorX = 0, cursorY = 0;
  let bearX = 0, bearY = 0;
  let targetX = 0, targetY = 0;
  let activeTab = 'landing-tab';
  let chatIntervalId = null;

  // 5. Loading Screen Simulation (simulates assets loading)
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  
  const loadingPhrases = [
    "Gathering stardust...",
    "Counting heartbeats...",
    "Unfolding love letters...",
    "Measuring the distance...",
    "Blooming flowers...",
    "Connecting hearts..."
  ];

  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        const barContainer = document.querySelector('.loader-bar-container');
        if (barContainer) barContainer.style.display = 'none';
        if (loaderText) loaderText.style.display = 'none';

        const entryBtn = document.getElementById('loader-entry-btn');
        if (entryBtn) {
          entryBtn.style.display = 'block';
          entryBtn.classList.remove('hidden');
          entryBtn.addEventListener('click', () => {
            audio.initAudioCtx();
            audio.play();
            loader.classList.add('fade-out');
          });
        } else {
          loader.classList.add('fade-out');
        }
      }, 400);
    }
    loaderBar.style.width = `${progress}%`;
    const phraseIdx = Math.floor((progress / 100) * loadingPhrases.length);
    if (loadingPhrases[phraseIdx]) {
      loaderText.textContent = loadingPhrases[phraseIdx];
    }
  }, 120);

  // 6. Custom Mouse Cursor and Sparkle Trail
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
    targetX = e.clientX;
    targetY = e.clientY;
  });

  document.addEventListener('mousedown', () => {
    cursor.style.width = '30px';
    cursor.style.height = '30px';
    cursor.style.borderColor = 'var(--accent-purple)';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.borderColor = 'var(--cursor-color)';
  });

  // 7. Teddy Bear Follower Ease Loop
  const teddy = document.getElementById('teddy-follower');
  function animateTeddy() {
    const dx = targetX - bearX;
    const dy = targetY - bearY;
    
    // Smooth ease interpolation
    bearX += dx * 0.06;
    bearY += dy * 0.06;
    
    teddy.style.left = `${bearX + 22}px`;
    teddy.style.top = `${bearY + 28}px`;

    // Flip teddy bear horizontally based on movement direction
    if (Math.abs(dx) > 0.5) {
      const scaleX = dx > 0 ? 1 : -1;
      teddy.style.transform = `translate(-50%, -50%) scaleX(${scaleX})`;
    }
    
    requestAnimationFrame(animateTeddy);
  }
  animateTeddy();

  // 8. Navigation & Tab Routing
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.page-section');

  function switchTab(tabId) {
    // Stop special audio if switching away from the respective tab
    if (audio.specialPlaying) {
      const specialUrl = audio.specialAudioElement ? audio.specialAudioElement.src.toLowerCase() : '';
      if (specialUrl.includes('gellery') && tabId !== 'gallery-tab') {
        audio.stopSpecialSong(true);
      } else if (specialUrl.includes('secrect') && tabId !== 'secret-tab') {
        audio.stopSpecialSong(true);
      }
    }

    activeTab = tabId;
    sections.forEach(sec => {
      if (sec.id === tabId) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    navItems.forEach(item => {
      if (item.dataset.target === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Reset scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Handle section triggers
    if (tabId === 'story-tab') {
      triggerChatSimulation();
      triggerTimelineAnimation();
    } else {
      clearChatSimulation();
    }

    if (tabId === 'reasons-tab') {
      // Lazy load 100 cards if empty
      lazyLoadReasonsGrid();
    }

    if (tabId === 'gallery-tab') {
      // Lazy render gallery
      lazyLoadGallery();

      // Start gallery song if not already playing it
      const isAlreadyPlayingGallery = audio.specialPlaying && 
        audio.specialAudioElement && 
        audio.specialAudioElement.src.toLowerCase().includes('gellery');
      if (!isAlreadyPlayingGallery) {
        audio.playSpecialSong('1st gellery song.mp3');
      }
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.target;
      switchTab(target);
    });
  });

  document.getElementById('enter-story-btn').addEventListener('click', () => {
    switchTab('story-tab');
  });

  // 9. Floating Panel Toggles (Music, Visual Effects, Theme)
  const themeToggle = document.getElementById('theme-toggle');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicExpanded = document.getElementById('music-expanded-panel');
  const effectsToggleBtn = document.getElementById('effects-panel-btn');
  const effectsExpanded = document.getElementById('effects-expanded-panel');

  // Dark Mode Toggle
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update theme toggle icon
    const icon = themeToggle.querySelector('i');
    if (newTheme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      particles.setMode('stars'); // switch to star night sky automatically
      updateActiveEffectBtn('stars');
    } else {
      icon.className = 'fa-solid fa-moon';
      particles.setMode('hearts'); // back to romantic pink hearts
      updateActiveEffectBtn('hearts');
    }
    
    // Play light synth sound on click
    game.playShortChime(600);
  });

  // Music Widget Toggle
  musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    musicExpanded.classList.toggle('show');
    effectsExpanded.classList.remove('show');
  });

  // Effects Widget Toggle
  effectsToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    effectsExpanded.classList.toggle('show');
    musicExpanded.classList.remove('show');
  });

  // Close floating menus on body click
  document.addEventListener('click', () => {
    musicExpanded.classList.remove('show');
    effectsExpanded.classList.remove('show');
  });

  // Prevent closing when clicking inside panels
  musicExpanded.addEventListener('click', (e) => e.stopPropagation());
  effectsExpanded.addEventListener('click', (e) => e.stopPropagation());

  // 10. Music Player Interactivity Controls
  const playBtn = document.getElementById('player-play-btn');
  const nextBtn = document.getElementById('player-next-btn');
  const prevBtn = document.getElementById('player-prev-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const progressFill = document.getElementById('player-progress-fill');
  const progressBar = document.getElementById('player-progress-bar');
  const disc = document.getElementById('album-art');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');

  audio.onPlayStateChange = (isPlaying) => {
    if (isPlaying) {
      playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
      disc.classList.add('playing');
    } else {
      playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
      disc.classList.remove('playing');
    }
  };

  audio.onTrackChange = (track) => {
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    disc.textContent = track.isSynth ? '💖' : '🎵';
  };

  audio.onTimeUpdate = (percent) => {
    progressFill.style.width = `${percent}%`;
  };

  playBtn.addEventListener('click', () => audio.togglePlay());
  nextBtn.addEventListener('click', () => audio.nextTrack());
  prevBtn.addEventListener('click', () => audio.prevTrack());
  
  volumeSlider.addEventListener('input', (e) => {
    audio.setVolume(e.target.value);
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    audio.seek(percent);
  });

  // Piano Synth custom button on Landing Page
  document.getElementById('play-ambient-btn').addEventListener('click', () => {
    audio.initAudioCtx();
    audio.currentTrackIndex = 0; // synthesizer index
    audio.play();
  });

  // 11. Custom Particle Effects selections
  const effectButtons = document.querySelectorAll('.effects-select-btn');
  const trailCheckbox = document.getElementById('trail-checkbox');

  function updateActiveEffectBtn(effect) {
    effectButtons.forEach(btn => {
      if (btn.dataset.effect === effect) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  effectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.effect;
      particles.setMode(mode);
      updateActiveEffectBtn(mode);
      game.playShortChime(500);
    });
  });

  trailCheckbox.addEventListener('change', (e) => {
    particles.trailEnabled = e.target.checked;
  });

  // 12. Typewriter Intro text on Home Page
  const typewriterPhrases = [
    "Every second with you is a beautiful blessing... ❤️",
    "No distance can fade the colors of our love... 🌸",
    "You are my absolute best friend and favorite distraction... 🧸",
    "Waiting for the day we finally share the same zip code... ✈️🏠",
    "I love you more than all the stars in the midnight sky... ✨"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typewriterEl = document.getElementById('typewriter-text');

  function typeText() {
    const currentPhrase = typewriterPhrases[phraseIndex];
    
    if (isDeleting) {
      typewriterEl.innerHTML = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typewriterEl.innerHTML = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 30 : 65;

    if (!isDeleting && charIndex === currentPhrase.length) {
      speed = 2800; // Hold full sentence
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
      speed = 500; // pause before typing next
    }

    setTimeout(typeText, speed);
  }
  typeText();

  // 13. Live Love Timer & Birthday Countdown Counter
  // Anniversary Date: October 12, 2024 at 18:00:00
  const anniversaryDate = new Date('2024-10-12T18:00:00');
  
  function updateLoveTimer() {
    const now = new Date();
    const diffMs = now - anniversaryDate;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    const exactSecs = Math.floor((diffMs / 1000) % 60);

    const dDays = document.getElementById('t-days');
    const dHours = document.getElementById('t-hours');
    const dMins = document.getElementById('t-mins');
    const dSecs = document.getElementById('t-secs');

    if (dDays && dHours && dMins && dSecs) {
      dDays.textContent = days.toString().padStart(2, '0');
      dHours.textContent = hours.toString().padStart(2, '0');
      dMins.textContent = mins.toString().padStart(2, '0');
      dSecs.textContent = exactSecs.toString().padStart(2, '0');
    }
  }
  setInterval(updateLoveTimer, 1000);

  // Birthday Countdown: June 27
  const bDayVal = document.getElementById('target-birthday-date');
  function updateBirthdayTimer() {
    const now = new Date();
    let currentYear = now.getFullYear();
    let bday = new Date(`${currentYear}-06-27T00:00:00`);
    
    if (now > bday) {
      // Birthday passed this year, countdown for next year
      bday = new Date(`${currentYear + 1}-06-26T00:00:00`);
    }

    if (bDayVal) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      bDayVal.textContent = bday.toLocaleDateString(undefined, options);
    }

    const diffMs = bday - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    const secs = Math.floor((diffMs / 1000) % 60);

    const bDays = document.getElementById('b-days');
    const bHours = document.getElementById('b-hours');
    const bMins = document.getElementById('b-mins');
    const bSecs = document.getElementById('b-secs');

    if (bDays && bHours && bMins && bSecs) {
      bDays.textContent = days.toString().padStart(2, '0');
      bHours.textContent = hours.toString().padStart(2, '0');
      bMins.textContent = mins.toString().padStart(2, '0');
      bSecs.textContent = secs.toString().padStart(2, '0');
    }
  }
  setInterval(updateBirthdayTimer, 1000);

  // 14. Story Timeline Generation & Scroll Animation
  const timelineContainer = document.getElementById('timeline-container');
  ROMANTIC_DATA.timelineEvents.forEach(evt => {
    const card = document.createElement('div');
    card.className = 'timeline-item';
    card.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card glass-card">
        <div class="timeline-date">${evt.date}</div>
        <h3>${evt.title}</h3>
        <p>${evt.desc}</p>
      </div>
    `;
    timelineContainer.appendChild(card);
  });

  function triggerTimelineAnimation() {
    const items = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
  }

  // Initialize timeline animation observer right away on page load
  triggerTimelineAnimation();

  // 15. Chat Simulation Sequence
  const chatMessages = document.getElementById('chat-messages-wrap');
  const typingIndicator = document.getElementById('chat-typing-indicator');

  function triggerChatSimulation() {
    clearChatSimulation();
    chatMessages.innerHTML = '';
    chatMessages.appendChild(typingIndicator);

    let scriptIndex = 0;
    
    function loadNextMessage() {
      if (scriptIndex >= ROMANTIC_DATA.chatScript.length) {
        // loop or stop
        return;
      }
      
      const msg = ROMANTIC_DATA.chatScript[scriptIndex];
      typingIndicator.style.display = 'flex';
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // simulate thinking gap
      const typingTime = 1200 + msg.text.length * 30;
      chatIntervalId = setTimeout(() => {
        typingIndicator.style.display = 'none';

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender === 'him' ? 'sent' : 'received'}`;
        bubble.textContent = msg.text;

        chatMessages.appendChild(bubble);
        chatMessages.appendChild(typingIndicator); // keep typing indicator at bottom
        
        setTimeout(() => {
          bubble.classList.add('show');
          chatMessages.scrollTop = chatMessages.scrollHeight;
          // Play click sound
          game.playShortChime(msg.sender === 'him' ? 480 : 540);
        }, 50);

        scriptIndex++;
        // gap before next message typing starts
        chatIntervalId = setTimeout(loadNextMessage, 2000);
      }, typingTime);
    }

    loadNextMessage();
  }

  function clearChatSimulation() {
    if (chatIntervalId) {
      clearTimeout(chatIntervalId);
      chatIntervalId = null;
    }
  }

  // 16. Lazy Load 100 Reasons flip cards
  let reasonsLoaded = false;
  function lazyLoadReasonsGrid() {
    if (reasonsLoaded) return;
    reasonsLoaded = true;

    const reasonsGrid = document.getElementById('reasons-card-grid');
    reasonsGrid.innerHTML = '';

    ROMANTIC_DATA.reasons.forEach((reason, index) => {
      const card = document.createElement('div');
      card.className = 'reason-card';
      
      // Rotate through a rich set of romantic icons
      const icons = [
        'fa-heart',
        'fa-star',
        'fa-crown',
        'fa-gem',
        'fa-fire-flame-curved',
        'fa-music',
        'fa-dove',
        'fa-feather-pointed',
        'fa-infinity',
        'fa-moon'
      ];
      const icon = icons[index % icons.length];

      card.innerHTML = `
        <div class="reason-card-inner">
          <div class="reason-card-front">
            <i class="fa-solid ${icon}"></i>
            <div class="reason-card-number">#${index + 1}</div>
          </div>
          <div class="reason-card-back">
            ${reason}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        game.playShortChime(350 + (index % 10) * 30);
      });

      reasonsGrid.appendChild(card);
    });
  }

  // 17. Multi-page Love Letter and Envelope Animation
  const envelope = document.getElementById('envelope-box');
  const letterPrevBtn = document.getElementById('letter-prev-btn');
  const letterNextBtn = document.getElementById('letter-next-btn');
  const pageIndicator = document.getElementById('letter-page-indicator');
  const letterTextContent = document.getElementById('letter-text-content');

  let letterPageIndex = 0;

  envelope.addEventListener('click', () => {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      audio.initAudioCtx();
      game.playJoyfulSynthArpeggio();
      // Show letter controls after envelope opens
      setTimeout(() => {
        const letterControls = document.querySelector('.letter-controls');
        if (letterControls) letterControls.classList.add('visible');
        renderLetterPage();
      }, 800);
    }
  });

  function renderLetterPage() {
    const pageData = ROMANTIC_DATA.letters[letterPageIndex];
    if (!pageData) return;

    letterTextContent.innerHTML = pageData.content;
    pageIndicator.textContent = `Page ${pageData.page} of ${ROMANTIC_DATA.letters.length}`;

    // Adjust button visibility
    letterPrevBtn.style.opacity = letterPageIndex === 0 ? '0.4' : '1';
    letterPrevBtn.style.pointerEvents = letterPageIndex === 0 ? 'none' : 'auto';
    letterNextBtn.style.opacity = letterPageIndex === ROMANTIC_DATA.letters.length - 1 ? '0.4' : '1';
    letterNextBtn.style.pointerEvents = letterPageIndex === ROMANTIC_DATA.letters.length - 1 ? 'none' : 'auto';
  }

  letterPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (letterPageIndex > 0) {
      letterPageIndex--;
      renderLetterPage();
      game.playShortChime(420);
    }
  });

  letterNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (letterPageIndex < ROMANTIC_DATA.letters.length - 1) {
      letterPageIndex++;
      renderLetterPage();
      game.playShortChime(460);
    }
  });

  // 18. Gallery Module Integration
  let galleryLoaded = false;
  let carouselIndex = 0;

  function lazyLoadGallery() {
    if (galleryLoaded) return;
    galleryLoaded = true;

    const track = document.getElementById('carousel-track-container');
    const masonry = document.getElementById('masonry-grid');
    if (!track || !masonry) return;

    track.innerHTML = '';
    masonry.innerHTML = '';

    // Render slider items
    ROMANTIC_DATA.galleryImages.forEach((img, index) => {
      // 1. Slider Card
      const slide = document.createElement('div');
      slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
      slide.innerHTML = `
        <div class="polaroid">
          <div class="polaroid-img-wrap">
            <img src="${img.url}" alt="Memory image ${index + 1}">
          </div>
          <div class="polaroid-caption">${img.caption}</div>
        </div>
      `;
      slide.addEventListener('click', () => {
        if (index !== carouselIndex) {
          carouselIndex = index;
          updateCarousel();
        } else {
          openLightbox(index);
        }
      });
      track.appendChild(slide);

      // 2. Masonry items
      const item = document.createElement('div');
      item.className = 'polaroid glass-card';
      item.style.cursor = 'zoom-in';
      item.innerHTML = `
        <div class="polaroid-img-wrap" style="height: 250px;">
          <img src="${img.url}" alt="Memory image ${index + 1}">
        </div>
        <div class="polaroid-caption">${img.caption}</div>
      `;
      item.addEventListener('click', () => {
        openLightbox(index);
      });
      masonry.appendChild(item);
    });

    updateCarousel();
  }

  function updateCarousel() {
    const track = document.getElementById('carousel-track-container');
    const slides = document.querySelectorAll('.carousel-slide');
    if (!track || slides.length === 0) return;

    // Center selected card
    const containerWidth = track.parentElement.offsetWidth;
    const cardWidth = 300; // width of slide
    const gap = 30;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2) - gap;

    const transformOffset = -carouselIndex * (cardWidth + gap) + centerOffset;
    track.style.transform = `translateX(${transformOffset}px)`;

    slides.forEach((slide, idx) => {
      if (idx === carouselIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  // Update slider on resize
  window.addEventListener('resize', () => {
    if (activeTab === 'gallery-tab') {
      updateCarousel();
    }
  });

  // Lightbox View
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img-el');
  const lightboxCaption = document.getElementById('lightbox-caption-el');
  const lightboxClose = document.getElementById('lightbox-close-btn');
  const lightboxPrev = document.getElementById('lightbox-prev-btn');
  const lightboxNext = document.getElementById('lightbox-next-btn');
  
  let lightboxIndex = 0;
  let activeLightboxSet = 'gallery'; // 'gallery' or 'secret'

  function openLightbox(index, set = 'gallery') {
    lightboxIndex = index;
    activeLightboxSet = set;
    const imgSet = set === 'gallery' ? ROMANTIC_DATA.galleryImages : ROMANTIC_DATA.secretImages;
    const imgData = imgSet[lightboxIndex];
    if (!imgData) return;

    lightboxImg.src = imgData.url;
    lightboxCaption.textContent = imgData.caption;
    lightbox.classList.add('show');
    game.playShortChime(600);
  }

  window.openLightbox = openLightbox;

  function closeLightbox() {
    lightbox.classList.remove('show');
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    const imgSet = activeLightboxSet === 'gallery' ? ROMANTIC_DATA.galleryImages : ROMANTIC_DATA.secretImages;
    if (lightboxIndex > 0) {
      openLightbox(lightboxIndex - 1, activeLightboxSet);
    } else {
      openLightbox(imgSet.length - 1, activeLightboxSet); // loop
    }
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    const imgSet = activeLightboxSet === 'gallery' ? ROMANTIC_DATA.galleryImages : ROMANTIC_DATA.secretImages;
    if (lightboxIndex < imgSet.length - 1) {
      openLightbox(lightboxIndex + 1, activeLightboxSet);
    } else {
      openLightbox(0, activeLightboxSet); // loop
    }
  });

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  // Global modal close button
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    document.getElementById('romantic-modal').classList.remove('show');
  });

  // ── NEW FEATURE 1: Scroll Progress Bar ──
  const scrollBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollBar) scrollBar.style.width = `${scrollPercent}%`;
  }, { passive: true });

  // ── NEW FEATURE 2: Birthday Banner (auto shows on June 27) ──
  const birthdayBanner = document.getElementById('birthday-banner');
  const today = new Date();
  if (birthdayBanner && today.getMonth() === 5 && today.getDate() === 27) {
    birthdayBanner.style.display = 'block';
    // Push main content down to avoid overlap
    document.querySelector('main').style.paddingTop = '50px';
    // Auto confetti burst on birthday!
    setTimeout(() => {
      particles.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 200);
      particles.setMode('confetti');
    }, 3000);
  }

  // ── NEW FEATURE 3: Celebrate Button ──
  const celebrateBtn = document.getElementById('celebrate-btn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      particles.triggerExplosion(window.innerWidth / 2, window.innerHeight / 2, 120);
      particles.setMode('confetti');
      game.playJoyfulSynthArpeggio();
      celebrateBtn.style.transform = 'scale(1.3) rotate(360deg)';
      setTimeout(() => {
        celebrateBtn.style.transform = '';
        setTimeout(() => particles.setMode('hearts'), 4000);
      }, 400);
    });
  }

  // ── NEW FEATURE 4: Enhanced Avatar Hover on Landing ──
  const avatarEl = document.querySelector('.landing-avatar');
  if (avatarEl) {
    avatarEl.addEventListener('click', () => {
      const rect = avatarEl.getBoundingClientRect();
      particles.triggerExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
      game.playShortChime(600);
    });
    avatarEl.addEventListener('mouseenter', () => {
      avatarEl.style.transform = 'scale(1.1)';
      avatarEl.style.boxShadow = '0 0 45px var(--accent-pink-glow), 0 0 80px rgba(255,45,85,0.3)';
    });
    avatarEl.addEventListener('mouseleave', () => {
      avatarEl.style.transform = '';
      avatarEl.style.boxShadow = '';
    });
  }

  // ── NEW FEATURE 5: Double-click anywhere to show love sparkles ──
  document.addEventListener('dblclick', (e) => {
    particles.triggerExplosion(e.clientX, e.clientY, 30);
    game.playShortChime(440 + Math.random() * 200);
  });

  // ── NEW FEATURE 6: Blow Candles Button ──
  const blowCandlesBtn = document.getElementById('blow-candles-btn');
  const birthdayCake = document.getElementById('birthday-cake');
  if (blowCandlesBtn && birthdayCake) {
    blowCandlesBtn.addEventListener('click', () => {
      birthdayCake.classList.add('blown');
      blowCandlesBtn.textContent = '🎉 You blew the candles! Make a wish!';
      blowCandlesBtn.disabled = true;
      game.playJoyfulSynthArpeggio();
      particles.triggerExplosion(window.innerWidth / 2, window.innerHeight / 3, 150);
      particles.setMode('confetti');
      // Relight candles after 6s
      setTimeout(() => {
        birthdayCake.classList.remove('blown');
        blowCandlesBtn.textContent = 'Blow Candles 💨';
        blowCandlesBtn.disabled = false;
        particles.setMode('hearts');
      }, 6000);
    });
  }

  // ── NEW FEATURE 7: Dual Clock (same timezone IST) ──
  function updateDualClocks() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const clockHim = document.getElementById('clock-him');
    const clockHer = document.getElementById('clock-her');
    if (clockHim) clockHim.textContent = timeStr;
    if (clockHer) clockHer.textContent = timeStr;
  }
  updateDualClocks();
  setInterval(updateDualClocks, 1000);

  // ── NEW FEATURE 8: Virtual Hug Button ──
  const sendHugBtn = document.getElementById('send-hug-btn');
  if (sendHugBtn) {
    sendHugBtn.addEventListener('click', () => {
      // Create flying hearts across the screen
      const hearts = ['🤗', '💕', '🫂', '❤️', '💗', '💖', '💝', '🥰'];
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const el = document.createElement('div');
          el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
          el.style.cssText = `
            position: fixed;
            font-size: ${1.5 + Math.random() * 2}rem;
            left: ${Math.random() * 100}vw;
            top: 110vh;
            z-index: 9999;
            pointer-events: none;
            animation: flyHeart 3s ease-out forwards;
          `;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 3200);
        }, i * 180);
      }
      game.playJoyfulSynthArpeggio();
      game.showModal('Hug Sent! 🤗💕', 'I just sent you the warmest, tightest virtual hug across all 417 km! Close your eyes and feel my arms around you, my love. I miss you so much! ❤️');
    });
  }

});
