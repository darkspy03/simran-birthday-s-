class RomanticGameManager {
  constructor(audioManager, particlesEngine) {
    this.audio = audioManager;
    this.particles = particlesEngine;
    this.passcode = "";
    this.correctPasscode = "0510"; // October 5 - His Birthday 🎂
    this.noBtnEscapes = 0;
    this.noBtnTexts = [
      "No? 😒",
      "Really? 🥺",
      "Think again! 🧐",
      "Impossible! 🙅‍♀️",
      "Try YES 😂",
      "No way! 🚫",
      "Error: Try again! ⚠️",
      "Nice try! 😜"
    ];

    this.init();
  }

  init() {
    this.initProposalGame();
    this.initFlowerGarden();
    this.initPasscodePortal();
    this.initComplimentTicker();
    this.initGiftBox();
    this.initCoupons();
    this.initSecretGallery();
  }

  /* 1. Funny Proposal Game */
  initProposalGame() {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const proposalArea = document.getElementById('proposal-game-area');

    if (!noBtn || !yesBtn || !proposalArea) return;

    const escapeNoButton = (e) => {
      e.preventDefault();
      this.noBtnEscapes++;

      // 1. Move button randomly within the area
      const areaRect = proposalArea.getBoundingClientRect();
      const btnRect = noBtn.getBoundingClientRect();

      // Calculate max width/height boundaries inside the container
      const maxX = areaRect.width - btnRect.width;
      const maxY = areaRect.height - btnRect.height;

      const randomX = Math.max(10, Math.min(Math.random() * maxX, maxX - 10));
      const randomY = Math.max(10, Math.min(Math.random() * maxY, maxY - 10));

      noBtn.style.position = 'absolute';
      noBtn.style.left = `${randomX}px`;
      noBtn.style.top = `${randomY}px`;

      // 2. Shrink NO button and rotate
      const scale = Math.max(0.35, 1 - this.noBtnEscapes * 0.08);
      const rotation = (Math.random() - 0.5) * 40; // -20deg to 20deg
      noBtn.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

      // 3. Change text
      const textIndex = this.noBtnEscapes % this.noBtnTexts.length;
      noBtn.textContent = this.noBtnTexts[textIndex];

      // 4. Grow YES button
      const yesScale = 1 + this.noBtnEscapes * 0.18;
      yesBtn.style.transform = `scale(${yesScale})`;
      yesBtn.style.boxShadow = `0 0 ${20 + this.noBtnEscapes * 5}px var(--accent-pink-glow)`;
    };

    // Trigger on both hover and touchstart
    noBtn.addEventListener('mouseenter', escapeNoButton);
    noBtn.addEventListener('touchstart', escapeNoButton, { passive: false });

    noBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showModal("Access Denied 😂❤️", "Nice try, my love! But you're locked in forever! You have no choice but to stay with me! ❤️");
    });

    yesBtn.addEventListener('click', () => {
      // Fullscreen celebration
      const rect = yesBtn.getBoundingClientRect();
      this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 150);
      this.particles.setMode('confetti');

      // Triumphant sound chord using synth
      this.playJoyfulSynthArpeggio();

      this.showModal("I Knew You'd Say YES! 🥰", "Will you be mine forever? Yes, a thousand times YES! I love you to the moon and back, my beautiful Simran! ❤️ Let's continue our amazing journey together!");

      // Reset NO button
      noBtn.style.position = 'relative';
      noBtn.style.left = '0';
      noBtn.style.top = '0';
      noBtn.style.transform = 'scale(1) rotate(0deg)';
      noBtn.textContent = "NO 😒";
      this.noBtnEscapes = 0;
      yesBtn.style.transform = 'scale(1)';
      yesBtn.style.boxShadow = `0 4px 15px var(--accent-pink-glow)`;
    });
  }

  /* Play a joyful synth chime on success */
  playJoyfulSynthArpeggio() {
    this.audio.initAudioCtx();
    const ctx = this.audio.audioCtx;
    if (!ctx) return;

    const time = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6 scale

    notes.forEach((freq, idx) => {
      const noteTime = time + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.9);
    });
  }

  /* 2. Virtual Flower Garden */
  initFlowerGarden() {
    const gardenGrid = document.getElementById('garden-grid');
    if (!gardenGrid) return;

    gardenGrid.innerHTML = ''; // clear grid

    const flowerTypes = ['rose', 'tulip', 'sunflower', 'orchid', 'rose', 'tulip', 'sunflower', 'orchid'];
    const flowerNames = ['Rose of Passion', 'Sweet Tulip', 'Joyful Sunflower', 'Graceful Orchid', 'Heart Rose', 'Blush Tulip', 'Golden Sunflower', 'Royal Orchid'];

    flowerTypes.forEach((type, index) => {
      const slot = document.createElement('div');
      slot.className = `flower-slot flower-${type}`;

      const secretText = ROMANTIC_DATA.flowerSecrets[index];

      slot.innerHTML = `
        <div class="flower-svg-wrap">
          <span class="flower-bubble">${secretText}</span>
          <svg class="flower-svg" viewBox="0 0 80 80">
            <path class="flower-stem" d="M 40 40 L 40 80" />
            <path class="flower-leaves" d="M 40 60 C 25 55, 30 50, 40 55 C 55 50, 50 55, 40 60" />
            <g class="flower-petals">
              <circle cx="40" cy="18" r="14" />
              <circle cx="20" cy="30" r="14" />
              <circle cx="32" cy="48" r="14" />
              <circle cx="48" cy="48" r="14" />
              <circle cx="60" cy="30" r="14" />
            </g>
            <circle class="flower-center" cx="40" cy="30" r="8" />
          </svg>
        </div>
        <span class="flower-label">${flowerNames[index]}</span>
      `;

      slot.addEventListener('click', () => {
        // Bloomed status
        const isBloomed = slot.classList.contains('bloomed');
        if (!isBloomed) {
          slot.classList.add('bloomed');
          // Confetti blast on click
          const rect = slot.getBoundingClientRect();
          this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 20);
          this.playShortChime(440 + index * 60);
        } else {
          slot.classList.remove('bloomed');
        }
      });

      gardenGrid.appendChild(slot);
    });
  }

  playShortChime(freq) {
    this.audio.initAudioCtx();
    const ctx = this.audio.audioCtx;
    if (!ctx) return;
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.7);
  }

  /* 3. Password Lock & Coupon Dashboard */
  initPasscodePortal() {
    const keypad = document.getElementById('keypad');
    const dots = document.querySelectorAll('.passcode-dot');
    const errorMsg = document.getElementById('secret-error-msg');
    const lockScreen = document.getElementById('secret-lock-screen');
    const secretContent = document.getElementById('secret-dashboard');

    if (!keypad || !dots || !errorMsg || !lockScreen || !secretContent) return;

    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.keypad-btn');
      if (!btn) return;

      const val = btn.dataset.val;

      if (val === 'clear') {
        this.passcode = "";
        errorMsg.textContent = "";
        this.updatePasscodeDots();
      } else if (val === 'enter') {
        if (this.passcode === this.correctPasscode) {
          // Success! Unlock section
          lockScreen.classList.add('hidden');
          secretContent.classList.remove('hidden');
          this.playJoyfulSynthArpeggio();
          this.particles.triggerExplosion(window.innerWidth/2, window.innerHeight/2, 100);
          this.audio.playSpecialSong('secrect code song.mp3');
        } else {
          // Failure
          this.passcode = "";
          this.updatePasscodeDots();
          errorMsg.textContent = this.getRandomFailMessage();
          // Shake keypad
          const box = document.querySelector('.passcode-wrapper');
          box.style.animation = 'none';
          box.offsetHeight; /* trigger reflow */
          box.style.animation = 'shake 0.5s ease';
          this.playShortChime(150); // low warning chime
        }
      } else {
        if (this.passcode.length < 4) {
          this.passcode += val;
          this.updatePasscodeDots();
          this.playShortChime(500 + this.passcode.length * 80);
        }
      }
    });
  }

  updatePasscodeDots() {
    const dots = document.querySelectorAll('.passcode-dot');
    dots.forEach((dot, index) => {
      if (index < this.passcode.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  getRandomFailMessage() {
    const messages = [
      "Wrong code! Only my love knows this secret! 💕",
      "Hint: Enter your lover's birthday date (DDMM) 🎂",
      "Are you really Simran? Only she knows this! 😂",
      "Hmm, do you remember his birthday? Hint: October 5 🍂",
      "Access Denied! Try again, beautiful! ❤️"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /* 4. Coupons Shop */
  initCoupons() {
    const grid = document.getElementById('coupons-grid');
    if (!grid) return;

    grid.innerHTML = ''; // clear

    // Load redeemed list from localstorage
    let redeemed = JSON.parse(localStorage.getItem('redeemedCoupons') || '[]');

    ROMANTIC_DATA.loveCoupons.forEach(coupon => {
      const card = document.createElement('div');
      const isRedeemed = redeemed.includes(coupon.id);

      card.className = `coupon-card glass-card ${isRedeemed ? 'redeemed' : ''}`;
      card.id = `coupon-${coupon.id}`;

      card.innerHTML = `
        <h4 class="coupon-title">${coupon.title}</h4>
        <p class="coupon-desc">${coupon.desc}</p>
        <div class="coupon-footer">
          <span class="coupon-status">${isRedeemed ? 'REDEEMED ✅' : 'AVAILABLE'}</span>
          ${isRedeemed ? '' : `<button class="btn-romantic redeem-coupon-btn" style="padding:6px 12px; font-size:0.75rem;" data-id="${coupon.id}">Redeem</button>`}
        </div>
      `;

      grid.appendChild(card);
    });

    grid.addEventListener('click', (e) => {
      const btn = e.target;
      if (!btn.classList.contains('redeem-coupon-btn')) return;

      const couponId = parseInt(btn.dataset.id);
      this.redeemCoupon(couponId);
    });
  }

  redeemCoupon(id) {
    let redeemed = JSON.parse(localStorage.getItem('redeemedCoupons') || '[]');
    if (redeemed.includes(id)) return;

    redeemed.push(id);
    localStorage.setItem('redeemedCoupons', JSON.stringify(redeemed));

    // Reload UI
    this.initCoupons();

    // Trigger visual confetti
    const rect = document.getElementById(`coupon-${id}`).getBoundingClientRect();
    this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 60);

    this.showModal("Coupon Redeemed! 🎟️💖", "You have successfully claimed this love coupon! Screenshot this page and send it to me to claim your surprise! I can't wait to make it happen! ❤️");
  }

  /* 5. Secret Surprise Gift Box */
  initGiftBox() {
    const giftbox = document.getElementById('surprise-giftbox');
    if (!giftbox) return;

    giftbox.addEventListener('click', () => {
      if (giftbox.classList.contains('open')) return;

      // Shake animation first
      giftbox.classList.add('shake');

      setTimeout(() => {
        giftbox.classList.remove('shake');
        giftbox.classList.add('open');

        // Confetti explosion
        const rect = giftbox.getBoundingClientRect();
        this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 100);
        this.particles.setMode('confetti');

        this.playJoyfulSynthArpeggio();

        setTimeout(() => {
          this.showModal("A Magical Gift for You! 🎁✨", "Surprise, my love! Inside this box is a virtual box of infinity kisses, warm hugs, and a promise to build our dream cottage with the blue roof. You are my absolute world! ❤️");
          // reset after modal closed or after some delay
          setTimeout(() => {
            giftbox.classList.remove('open');
          }, 8000);
        }, 1000);

      }, 800);
    });
  }

  /* 6. Compliment Ticker */
  initComplimentTicker() {
    const ticker = document.getElementById('compliment-ticker');
    const text = document.getElementById('compliment-text');

    if (!ticker || !text) return;

    const showCompliment = () => {
      const idx = Math.floor(Math.random() * ROMANTIC_DATA.compliments.length);
      text.textContent = ROMANTIC_DATA.compliments[idx];

      ticker.classList.add('show');

      // hide after 6 seconds
      setTimeout(() => {
        ticker.classList.remove('show');
      }, 6000);
    };

    // run every 15 seconds
    setInterval(showCompliment, 15000);
    setTimeout(showCompliment, 3000); // initial trigger
  }

  /* 7. Secret Photos Gallery */
  initSecretGallery() {
    const grid = document.getElementById('secret-gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';

    ROMANTIC_DATA.secretImages.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'polaroid glass-card';
      card.style.cursor = 'zoom-in';
      card.innerHTML = `
        <div class="polaroid-img-wrap" style="height: 250px;">
          <img src="${img.url}" alt="Secret Memory ${index + 1}">
        </div>
        <div class="polaroid-caption">${img.caption}</div>
      `;

      card.addEventListener('click', () => {
        if (window.openLightbox) {
          window.openLightbox(index, 'secret');
        }
      });

      grid.appendChild(card);
    });
  }

  /* Global helper to present gorgeous modal popups */
  showModal(title, textContent) {
    const modal = document.getElementById('romantic-modal');
    const mTitle = document.getElementById('modal-title');
    const mText = document.getElementById('modal-text');

    if (!modal || !mTitle || !mText) return;

    mTitle.textContent = title;
    mText.innerHTML = textContent;

    modal.classList.add('show');
  }
}
window.RomanticGameManager = RomanticGameManager;
