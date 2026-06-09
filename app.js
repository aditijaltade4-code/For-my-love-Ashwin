document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. DYNAMIC THEME ENGINE ("Renovation Menu")
  // ==========================================
  const settingsTrigger = document.getElementById('settings-trigger');
  const renovationMenu = document.getElementById('renovation-menu');
  const settingsClose = document.getElementById('settings-close');
  const themeSwatches = document.querySelectorAll('.theme-swatch');

  // Toggle Drawer
  settingsTrigger.addEventListener('click', () => {
    renovationMenu.classList.add('open');
  });

  settingsClose.addEventListener('click', () => {
    renovationMenu.classList.remove('open');
  });

  // Close drawer if clicked outside
  document.addEventListener('click', (e) => {
    if (!renovationMenu.contains(e.target) && !settingsTrigger.contains(e.target) && renovationMenu.classList.contains('open')) {
      renovationMenu.classList.remove('open');
    }
  });

  // Theme Swap Handler
  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      // Remove active class from all swatches
      themeSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      // Update body data-theme attribute
      const selectedTheme = swatch.getAttribute('data-theme');
      if (selectedTheme === 'cozy-morning') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', selectedTheme);
      }
    });
  });


  // ==========================================
  // 2. SPLIT-PANE WEATHER WINDOW
  // ==========================================
  const weatherData = {
    user1: { name: 'Ashwin', defaultWeather: 'rainy', temp: '22°C', label: 'Rainy afternoon' },
    user2: { name: 'Aditi', defaultWeather: 'night', temp: '18°C', label: 'Starlit night' }
  };

  const weatherSelectUser1 = document.getElementById('weather-user1');
  const weatherSelectUser2 = document.getElementById('weather-user2');

  function updatePaneWeather(paneId, status) {
    const pane = document.getElementById(paneId);
    const effectLayer = pane.querySelector('.weather-effect-layer');
    const iconEl = pane.querySelector('.weather-icon');
    const descEl = pane.querySelector('.loc-desc');
    const tempEl = pane.querySelector('.temp');

    // Reset styles and clear existing animations
    pane.className = 'window-pane';
    pane.classList.add(status);
    effectLayer.innerHTML = '';

    // Update details based on status
    let iconClass = 'fa-sun';
    let description = 'Sunny Day';
    let temp = '26°C';

    if (status === 'sunny') {
      iconClass = 'fa-sun';
      description = 'Warm sunbeam';
      temp = '26°C';
      // Create soft floating dust particles in solar rays
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'snowflake'; // re-use circular shape
        particle.style.background = 'rgba(255, 255, 255, 0.4)';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = particle.style.height = `${Math.random() * 4 + 2}px`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        effectLayer.appendChild(particle);
      }
    } else if (status === 'rainy') {
      iconClass = 'fa-cloud-showers-heavy';
      description = 'Rainy afternoon';
      temp = '22°C';
      
      // Inject raindrops
      for (let i = 0; i < 35; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * -30}px`;
        drop.style.animationDelay = `${Math.random() * 1.5}s`;
        drop.style.animationDuration = `${Math.random() * 0.5 + 0.8}s`;
        effectLayer.appendChild(drop);
      }
    } else if (status === 'snowy') {
      iconClass = 'fa-snowflake';
      description = 'Soft snowfall';
      temp = '-2°C';

      // Inject snowflakes
      for (let i = 0; i < 25; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.top = `${Math.random() * -20}px`;
        flake.style.width = flake.style.height = `${Math.random() * 6 + 4}px`;
        flake.style.animationDelay = `${Math.random() * 3}s`;
        flake.style.animationDuration = `${Math.random() * 2 + 2}s`;
        effectLayer.appendChild(flake);
      }
    } else if (status === 'night') {
      iconClass = 'fa-moon';
      description = 'Starlit night';
      temp = '18°C';

      // Inject stars
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = star.style.height = `${Math.random() * 3 + 1}px`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        effectLayer.appendChild(star);
      }
    }

    // Set updated values
    iconEl.className = `weather-icon fa-solid ${iconClass}`;
    descEl.textContent = description;
    tempEl.textContent = temp;
  }

  // Initialize defaults
  updatePaneWeather('pane-user1', weatherData.user1.defaultWeather);
  updatePaneWeather('pane-user2', weatherData.user2.defaultWeather);

  // Bind change listeners to select controls in theme menu
  weatherSelectUser1.addEventListener('change', (e) => {
    updatePaneWeather('pane-user1', e.target.value);
  });
  weatherSelectUser2.addEventListener('change', (e) => {
    updatePaneWeather('pane-user2', e.target.value);
  });


  // ==========================================
  // 3. REAL-TIME "LEAVE A LIGHT ON" DESK LAMP
  // ==========================================
  const deskLamp = document.getElementById('desk-lamp');

  deskLamp.addEventListener('click', () => {
    const isNowOn = deskLamp.classList.toggle('lamp-on');
    
    // Simulate real-time sync with database console explanation
    console.log(`[Realtime Sync] Desk Lamp State Changed: ${isNowOn ? 'ON' : 'OFF'}`);
    console.log(
      `%cTo synchronize this live across two users, connect Firebase RTDB as follows:
      
      // 1. Reference database path for the lamp state:
      const lampRef = firebase.database().ref('rooms/sharedRoom/deskLamp');
      
      // 2. Writing changes when user clicks:
      deskLamp.addEventListener('click', () => {
        const nextState = !deskLamp.classList.contains('lamp-on');
        lampRef.set(nextState);
      });
      
      // 3. Listening for value changes to update other user's screen instantly:
      lampRef.on('value', (snapshot) => {
        const isLampOn = snapshot.val();
        if (isLampOn) {
          deskLamp.classList.add('lamp-on');
        } else {
          deskLamp.classList.remove('lamp-on');
        }
      });`,
      'color: #d1b06c; font-family: monospace; font-size: 12px; line-height: 1.5;'
    );
  });


  // ==========================================
  // 4. INTERACTIVE MEMORY FRAMES & MODALS
  // ==========================================
  const photoFrames = document.querySelectorAll('.photo-frame');
  const galleryModal = document.getElementById('gallery-modal');
  const galleryClose = document.getElementById('gallery-close');

  photoFrames.forEach(frame => {
    frame.addEventListener('click', () => {
      galleryModal.classList.add('open');
      galleryModal.setAttribute('aria-hidden', 'false');
    });
    // Support Enter/Space accessibility
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        frame.click();
      }
    });
  });

  galleryClose.addEventListener('click', () => {
    galleryModal.classList.remove('open');
    galleryModal.setAttribute('aria-hidden', 'true');
  });

  // Close modal when clicking dark overlay
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
      galleryClose.click();
    }
  });


  // ==========================================
  // 5. THE COUNTDOWN CALENDAR
  // ==========================================
  // Set target date: 45 days in the future for simulation
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  targetDate.setHours(targetDate.getHours() + 6);
  targetDate.setMinutes(targetDate.getMinutes() + 30);

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      clearInterval(countdownTimer);
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      document.querySelector('.calendar-footer').innerHTML = 'Reunited! ❤️';
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // Update calendar initially and launch interval
  updateCountdown();
  const countdownTimer = setInterval(updateCountdown, 1000);


  // ==========================================
  // 6. THE DESK NOTEBOOK ("Open When" Letters)
  // ==========================================
  const deskNotebook = document.getElementById('desk-notebook');
  const notebookModal = document.getElementById('notebook-modal');
  const notebookClose = document.getElementById('notebook-close');

  const envelopeCards = document.querySelectorAll('.envelope-card');
  const letterModal = document.getElementById('letter-modal');
  const letterClose = document.getElementById('letter-close');
  const letterTitle = document.getElementById('letter-title');
  const letterBody = document.getElementById('letter-body');

  const lettersContent = {
    'miss-me': {
      title: 'Open when you miss me',
      body: `Hey my favorite person, \n\nWhenever the miles feel a bit too long and my voice feels too far, close your eyes and take a deep breath. Remember that every single day brings us closer to being in the same room, sharing the same sun, and making new memories. You are my favorite thought. Distance is only temporary, but my love for you is forever. I miss you tons.`
    },
    'cant-sleep': {
      title: "Open when you can't sleep",
      body: `Hey sleepyhead, \n\nStill awake? I wish I could be there to tuck you in, play with your hair, and whisper silly stories until you fall asleep. Think of this letter as a warm, cozy hug wrapping around you. Close your eyes, listen to the quiet, and rest easy knowing you're the last thing on my mind before I sleep, and the first when I wake. Sweet dreams!`
    },
    'sad-day': {
      title: 'Open when you have a bad day',
      body: `Hey beautiful, \n\nI’m sorry today wasn't kind to you. If I were there, I’d make your favorite warm tea and listen to you vent for hours, or just sit beside you in comfortable silence. Please don't be too hard on yourself. You are incredibly strong, kind, and capable. Tomorrow is a brand new page, and I'll be here cheering you on, no matter what. Love you.`
    },
    'need-laugh': {
      title: 'Open when you need a smile',
      body: `Hey you, \n\nDid you know that sea otters hold hands when they sleep so they don't drift apart? Or that cows have best friends and get stressed when they are separated? Well, just like them, I'm stuck to you in spirit! Think of my goofy laugh and the silly faces I make just to hear you giggle. Smile, because you have the prettiest laugh in the world, and it makes my entire day.`
    }
  };

  // Open Notebook Envelopes Overlay
  deskNotebook.addEventListener('click', () => {
    notebookModal.classList.add('open');
    notebookModal.setAttribute('aria-hidden', 'false');
  });

  deskNotebook.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      deskNotebook.click();
    }
  });

  notebookClose.addEventListener('click', () => {
    notebookModal.classList.remove('open');
    notebookModal.setAttribute('aria-hidden', 'true');
  });

  // Close notebook modal on backdrop click
  notebookModal.addEventListener('click', (e) => {
    if (e.target === notebookModal) {
      notebookClose.click();
    }
  });

  // Envelope Clicks
  envelopeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const noteId = card.getAttribute('data-note-id');
      const letterData = lettersContent[noteId];

      if (letterData) {
        letterTitle.textContent = letterData.title;
        // Format newlines into HTML breaks
        letterBody.innerHTML = letterData.body.replace(/\n/g, '<br>');
        
        // Open the letter modal
        letterModal.classList.add('open');
        letterModal.setAttribute('aria-hidden', 'false');
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close individual letter
  letterClose.addEventListener('click', () => {
    letterModal.classList.remove('open');
    letterModal.setAttribute('aria-hidden', 'true');
  });

  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) {
      letterClose.click();
    }
  });

});
