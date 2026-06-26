class RomanticAudioManager {
  constructor() {
    this.audioCtx = null;
    this.synthPlaying = false;
    this.synthIntervalId = null;
    this.gainNode = null;
    this.filterNode = null;
    this.delayNode = null;
    this.delayGain = null;

    // Music playlist tracks (Royalty free high-quality ambient tracks)
    this.playlist = [
      {
        title: "Our Special Song",
        artist: "My Love",
        url: "my_loveneww.mp3",
        isSynth: false
      },
      {
        title: "Ethereal Love (Piano)",
        artist: "Antigravity Synth",
        url: "synth", // uses Web Audio synth
        isSynth: true
      },
      {
        title: "Serenade of the Stars",
        artist: "Acoustic Romantic",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // fallback beautiful track
        isSynth: false
      }
    ];

    this.currentTrackIndex = 0;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
    this.volume = 0.5;

    this.onTrackChange = null;
    this.onPlayStateChange = null;
    this.onTimeUpdate = null;

    // State variables for special interrupting songs (gallery/secret)
    this.specialAudioElement = null;
    this.specialPlaying = false;
    this.specialPlayCount = 0;

    this.initAudioElement();
  }

  initAudioCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      // Low pass filter to make it sound warm and cozy
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(900, this.audioCtx.currentTime);

      // Dreamy delay effect
      this.delayNode = this.audioCtx.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(0.35, this.audioCtx.currentTime);

      this.delayGain = this.audioCtx.createGain();
      this.delayGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

      // Connect nodes:
      // Synth -> Filter -> Delay -> DelayGain -> Filter
      // Filter -> Gain -> Destination
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.delayNode); // feedback
      this.delayGain.connect(this.filterNode); // feed delayed signal back to filter

      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initAudioElement() {
    this.audioElement.volume = this.volume;

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate && !this.playlist[this.currentTrackIndex].isSynth) {
        const percent = (this.audioElement.currentTime / this.audioElement.duration) * 100 || 0;
        this.onTimeUpdate(percent);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.nextTrack();
    });
  }

  setVolume(vol) {
    this.volume = parseFloat(vol);
    this.audioElement.volume = this.volume;
    if (this.specialAudioElement) {
      this.specialAudioElement.volume = this.volume;
    }
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex];
  }

  play() {
    if (this.specialPlaying) {
      this.stopSpecialSong(false);
    }
    const track = this.playlist[this.currentTrackIndex];
    if (track.isSynth) {
      this.audioElement.pause();
      this.startSynth();
    } else {
      this.stopSynth();
      this.initAudioCtx(); // initialize just in case
      this.audioElement.src = track.url;
      this.audioElement.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
    }
    if (this.onPlayStateChange) this.onPlayStateChange(true);
    if (this.onTrackChange) this.onTrackChange(track);
  }

  pause() {
    if (this.specialPlaying && this.specialAudioElement) {
      this.specialAudioElement.pause();
    }
    this.audioElement.pause();
    this.stopSynth();
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  togglePlay() {
    if (this.specialPlaying) {
      if (this.specialAudioElement.paused) {
        this.specialAudioElement.play().catch(e => console.log("Special audio play blocked:", e));
        if (this.onPlayStateChange) this.onPlayStateChange(true);
      } else {
        this.specialAudioElement.pause();
        if (this.onPlayStateChange) this.onPlayStateChange(false);
      }
      return;
    }
    const isPlaying = this.synthPlaying || !this.audioElement.paused;
    if (isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack() {
    if (this.specialPlaying) {
      this.stopSpecialSong(false);
    }
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.play();
  }

  prevTrack() {
    if (this.specialPlaying) {
      this.stopSpecialSong(false);
    }
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.play();
  }

  seek(percent) {
    if (this.specialPlaying && this.specialAudioElement && this.specialAudioElement.duration) {
      this.specialAudioElement.currentTime = (percent / 100) * this.specialAudioElement.duration;
      return;
    }
    const track = this.playlist[this.currentTrackIndex];
    if (!track.isSynth && this.audioElement.duration) {
      this.audioElement.currentTime = (percent / 100) * this.audioElement.duration;
    }
  }

  /* Web Audio Synthesizer: Sweet, dreamy arpeggios */
  startSynth() {
    if (this.synthPlaying) return;
    this.initAudioCtx();
    this.synthPlaying = true;

    // Love Chord Progression: Cmaj9 -> Am9 -> Fmaj9 -> G9
    const progressions = [
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9 (C3, E3, G3, B3, D4)
      [110.00, 146.83, 164.81, 196.00, 220.00], // Am9 (A2, D3, E3, G3, A3)
      [87.31, 130.81, 174.61, 220.00, 261.63],  // Fmaj9 (F2, C3, F3, A3, C4)
      [98.00, 146.83, 196.00, 246.94, 293.66]   // G9 (G2, D3, G3, B3, D4)
    ];

    let chordIndex = 0;
    let step = 0;

    const playArpeggioStep = () => {
      if (!this.synthPlaying) return;

      const chord = progressions[chordIndex];
      // Pick a note from chord arpeggiated
      const note = chord[step % chord.length];

      this.playSynthNote(note);

      step++;
      if (step % 8 === 0) {
        chordIndex = (chordIndex + 1) % progressions.length;
      }
    };

    // Trigger immediately and then on interval
    playArpeggioStep();
    this.synthIntervalId = setInterval(playArpeggioStep, 450); // Lofi tempo
  }

  stopSynth() {
    this.synthPlaying = false;
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  playSynthNote(frequency) {
    if (!this.audioCtx) return;

    const time = this.audioCtx.currentTime;

    // Create oscillator
    const osc = this.audioCtx.createOscillator();
    // Triangle wave has a soft, flute/epiano tone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, time);

    // Sine wave layered slightly for sub bass
    const subOsc = this.audioCtx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(frequency / 2, time);

    // Note Gain Envelope
    const noteGain = this.audioCtx.createGain();
    noteGain.gain.setValueAtTime(0, time);
    // Soft attack (adds luxury ambient feel)
    noteGain.gain.linearRampToValueAtTime(0.2, time + 0.08);
    // Exponential decay/sustain
    noteGain.gain.exponentialRampToValueAtTime(0.06, time + 0.3);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

    // Connect nodes
    osc.connect(noteGain);
    subOsc.connect(noteGain);
    noteGain.connect(this.filterNode);
    this.delayNode.connect(noteGain); // send to delay feedback node too

    osc.start(time);
    subOsc.start(time);
    osc.stop(time + 2.0);
    subOsc.stop(time + 2.0);
  }

  playSpecialSong(url) {
    this.stopSpecialSong(false);

    // Pause background music (main audio element and synth)
    this.audioElement.pause();
    this.stopSynth();

    // Lazy initialize the special audio element
    if (!this.specialAudioElement) {
      this.specialAudioElement = new Audio();
      this.specialAudioElement.crossOrigin = "anonymous";
      this.specialAudioElement.addEventListener('timeupdate', () => {
        if (this.specialPlaying && this.onTimeUpdate) {
          const percent = (this.specialAudioElement.currentTime / this.specialAudioElement.duration) * 100 || 0;
          this.onTimeUpdate(percent);
        }
      });
    }

    this.specialAudioElement.src = url;
    this.specialAudioElement.volume = this.volume;
    this.specialPlayCount = 0;
    this.specialPlaying = true;

    this.specialAudioElement.onended = () => {
      this.specialPlayCount++;
      if (this.specialPlayCount < 2) {
        this.specialAudioElement.currentTime = 0;
        this.specialAudioElement.play().catch(e => console.log("Special audio play blocked by browser:", e));
      } else {
        this.stopSpecialSong(true);
      }
    };

    this.specialAudioElement.play().catch(e => console.log("Special audio play blocked by browser:", e));

    if (this.onPlayStateChange) this.onPlayStateChange(true);
    if (this.onTrackChange) {
      const isGallery = url.includes("gellery") || url.includes("gallery");
      this.onTrackChange({
        title: isGallery ? "Gallery Memories 📸" : "Secret Code Unlocked 🔐",
        artist: "Special Moment",
        isSynth: false
      });
    }
  }

  stopSpecialSong(resumeBg = true) {
    if (this.specialAudioElement) {
      this.specialAudioElement.pause();
      this.specialAudioElement.onended = null;
    }
    this.specialPlaying = false;
    if (resumeBg) {
      this.play();
    }
  }
}
window.RomanticAudioManager = RomanticAudioManager;