import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import confetti from 'canvas-confetti';

// Import audio files
import orchestraMusic from '/audio/romantic-orchestra.mp3';
import cheerSound from '/audio/crowd-cheer.mp3';

const LOVE_QUOTES = [
  "Every love story is beautiful, but ours is my favorite",
  "In all the world, there is no heart for me like yours",
  "I've fallen in love many times... always with you",
  "A hundred hearts would be too few to carry all my love for you",
  "You are my today and all of my tomorrows",
  "Love is not finding someone to live with, it's finding someone you can't live without"
];

const BALLOON_EMOJIS = ['🎈', '❤️', '💖', '💝', '🎀', '🌹', '✨'];

function App() {
  const [phase, setPhase] = useState('wiki');
  const [showButtons, setShowButtons] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const cheerSoundRef = useRef(null);
  const particlesRef = useRef(null);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);

  useEffect(() => {
    // Initialize particles.js with slower, smoother settings
    if (window.particlesJS && phase !== 'wiki') {
      particlesRef.current = window.particlesJS('particles-js', {
        particles: {
          number: { value: 60, density: { enable: true, value_area: 1000 } },
          color: { value: "#ffffff" },
          shape: {
            type: "heart",
            stroke: { width: 1, color: "#ffffff" },
          },
          opacity: {
            value: 0.6,
            random: true,
            animation: { enable: true, speed: 0.5, minimumValue: 0.3, sync: false }
          },
          size: {
            value: 6,
            random: true,
            animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false }
          },
          line_linked: {
            enable: true,
            distance: 180,
            color: "#ffffff",
            opacity: 0.4,
            width: 1.5
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            random: true,
            straight: false,
            outMode: "out",
            bounce: false,
            attract: { enable: true, rotateX: 800, rotateY: 1500 }
          }
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onHover: { 
              enable: true, 
              mode: "grab"
            },
            onClick: { 
              enable: true, 
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 180,
              line_linked: {
                opacity: 0.8
              }
            },
            push: {
              particles_nb: 3
            }
          }
        },
        retina_detect: true
      });
    }
  }, [phase]);

  // Initialize audio elements
  useEffect(() => {
    audioRef.current = new Audio(orchestraMusic);
    audioRef.current.volume = 0.7;
    audioRef.current.preload = 'auto';

    cheerSoundRef.current = new Audio(cheerSound);
    cheerSoundRef.current.volume = 0.5;
    cheerSoundRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (cheerSoundRef.current) {
        cheerSoundRef.current.pause();
        cheerSoundRef.current.src = '';
      }
    };
  }, []);

  // Handle audio playback
  const playAudio = useCallback(async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (error) {
      console.log('Error playing audio:', error);
    }
  }, []);

  // Handle user interaction to start audio
  const handlePageClick = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      playAudio();
    }
  }, [hasInteracted, playAudio]);

  // Main sequence with slower transitions
  useEffect(() => {
    const sequence = async () => {
      setPhase('wiki');
      try {
        // Longer wiki phase
        await new Promise(resolve => setTimeout(resolve, 6000));
        setPhase('transition');
        // Slower transition
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPhase('hmm');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setPhase('preQuestion');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setPhase('question');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setShowButtons(true);
      } catch (error) {
        console.error('Error in sequence:', error);
      }
    };
    sequence();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleYes = async () => {
    try {
      if (cheerSoundRef.current) {
        cheerSoundRef.current.currentTime = 0;
        await cheerSoundRef.current.play();
      }
    } catch (error) {
      console.log('Error playing cheer sound:', error);
    }
    
    // Longer confetti animation
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors: ['#ff1493', '#ff69b4', '#ff0066'],
        gravity: 0.5,
        scalar: 1.2
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors: ['#ff1493', '#ff69b4', '#ff0066'],
        gravity: 0.5,
        scalar: 1.2
      });
    }, 200);

    setPhase('success');
  };

  const RejectionMessage = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass-card">
        <h2 className="text-3xl font-bold mb-3 question-text">
          Huh?? Are u fr?? 😤
        </h2>
        <p className="text-white text-xl mb-4">
          Let's try again... hmp!
        </p>
      </div>
    </div>
  );

  const handleNo = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase('rejection');
    setShowButtons(false);
    setShowRejectionMessage(true);
    
    // Show rejection message for 3 seconds before restarting
    setTimeout(() => {
      setShowRejectionMessage(false);
      setPhase('wiki');
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 4000));
        setPhase('transition');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPhase('hmm');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setPhase('preQuestion');
        await new Promise(resolve => setTimeout(resolve, 4000));
        setPhase('question');
        // Initialize and play audio
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(error => {
            console.log('Error playing audio:', error);
          });
        }
        await new Promise(resolve => setTimeout(resolve, 4000));
        setShowButtons(true);
      };
      sequence();
    }, 3000);
  };

  const addToCalendar = () => {
    // Format the event details
    const eventDetails = {
      title: "Valentine's Date 💝",
      description: "A special Valentine's date!",
      start: "2024-02-14T18:00:00",
      end: "2024-02-14T21:00:00",
      location: "Details to follow"
    };

    // Create Google Calendar URL
    const calendarUrl = new URL('https://calendar.google.com/calendar/render');
    calendarUrl.searchParams.append('action', 'TEMPLATE');
    calendarUrl.searchParams.append('text', eventDetails.title);
    calendarUrl.searchParams.append('details', eventDetails.description);
    calendarUrl.searchParams.append('location', eventDetails.location);
    calendarUrl.searchParams.append('dates', `${eventDetails.start.replace(/[-:]/g, '')}/${eventDetails.end.replace(/[-:]/g, '')}`);

    // Open in new tab
    window.open(calendarUrl.toString(), '_blank');
  };

  const SuccessView = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass-card success-container">
        <lord-icon
          src="https://cdn.lordicon.com/lupuorrc.json"
          trigger="loop"
          colors="primary:#ffffff,secondary:#ffd1dc"
          style={{ 
            width: '120px', 
            height: '120px',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
          }}
          aria-label="Celebration animation">
        </lord-icon>
        <h2 className="text-3xl font-bold mb-3 question-text">
          Yay! You said yes! 🎉
        </h2>
        <div className="success-details">
          <div className="date-details">
            <div className="text-center mb-2 text-white text-xl">
              Save the date ❤️
            </div>
            <div className="date-info">
              <div className="text-lg text-white/90 flex items-center justify-center">
                <span className="date-time">February 14, 2024</span>
                <span className="mx-2">•</span>
                <span className="date-time">6-9 PM</span>
              </div>
              <div className="text-sm text-white/80 mt-1 text-center">
                Details to follow
              </div>
              <button 
                onClick={addToCalendar}
                className="calendar-button mt-4"
                aria-label="Add to Google Calendar"
              >
                <span className="calendar-icon">📅</span>
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 ${
        phase === 'wiki' ? 'bg-white' : 'romantic-bg'
      }`}
      onClick={handlePageClick}
    >
      <div id="particles-js"></div>
      {phase !== 'wiki' && (
        <>
          <div className="geometric-hearts" />
          <div className="geometric-heart-3d geometric-heart-top-right" />
          <div className="geometric-heart-3d geometric-heart-bottom-left" />
        </>
      )}
      <div className="decorative-border" />

      {phase === 'wiki' && (
        <div className="wiki-content wiki-fade-out">
          <div className="wiki-sidebar">
            <nav>
              <ul className="list-none p-0">
                <li><a href="#" className="wiki-link">Main page</a></li>
                <li><a href="#" className="wiki-link">Contents</a></li>
                <li><a href="#" className="wiki-link">Current events</a></li>
                <li><a href="#" className="wiki-link">Random article</a></li>
                <li><a href="#" className="wiki-link">About Wikipedia</a></li>
                <li><a href="#" className="wiki-link">Contact us</a></li>
                <li><a href="#" className="wiki-link">Donate</a></li>
              </ul>
            </nav>
          </div>

          <div className="wiki-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/225px-Wikipedia-logo-v2.svg.png" 
                 alt="Wikipedia Logo" 
                 className="wiki-logo" />
            <div className="wiki-search">
              <input type="text" placeholder="Search Wikipedia" />
            </div>
          </div>

          <div className="wiki-navigation">
            <a href="#" className="wiki-link">Article</a>
            <a href="#" className="wiki-link">Talk</a>
            <a href="#" className="wiki-link">Read</a>
            <a href="#" className="wiki-link">Edit</a>
            <a href="#" className="wiki-link">View history</a>
          </div>

          <h1 className="wiki-title">Heart</h1>
          <div className="wiki-subtitle">From Wikipedia, the free encyclopedia</div>

          <div className="wiki-infobox">
            <div className="wiki-infobox-title">Heart</div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Diagram_of_the_human_heart_%28cropped%29.svg/230px-Diagram_of_the_human_heart_%28cropped%29.svg.png" 
                 alt="Human Heart Diagram" />
            <div className="wiki-infobox-data">
              <span className="wiki-infobox-label">Latin</span>
              <span>cor</span>
              <span className="wiki-infobox-label">System</span>
              <span>Circulatory system</span>
              <span className="wiki-infobox-label">Location</span>
              <span>Chest</span>
            </div>
      </div>

          <p>
            This article is about the internal organ. For other uses, see <a href="#" className="wiki-link">Heart (disambiguation)</a>.
          </p>

          <p>
            The <strong>heart</strong> is a muscular <a href="#" className="wiki-link">organ</a> found in humans and other <a href="#" className="wiki-link">animals</a>. 
            This organ pumps <a href="#" className="wiki-link">blood</a> through the <a href="#" className="wiki-link">blood vessels</a> of the 
            <a href="#" className="wiki-link">circulatory system</a>. The pumped blood carries oxygen and nutrients to the body, while carrying 
            metabolic waste such as <a href="#" className="wiki-link">carbon dioxide</a> to the <a href="#" className="wiki-link">lungs</a>.
          </p>

          <p>
            In humans, the heart is approximately the size of a closed fist and is located between the lungs, in the middle compartment of the 
            chest, called the <a href="#" className="wiki-link">mediastinum</a>.
        </p>
      </div>
      )}

      {phase === 'hmm' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card">
            <h2 className="text-4xl text-white font-bold animate-fade-in">
              Hmm...
            </h2>
          </div>
        </div>
      )}

      {phase === 'preQuestion' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="glass-card">
            <h2 className="text-4xl text-white font-bold animate-fade-in">
              Gi, I just wanna ask
            </h2>
          </div>
        </div>
      )}

      {phase === 'question' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`glass-card ${showButtons ? 'with-buttons' : ''}`}>
            <h2 className="question-text">
              Will you be my Valentine?
            </h2>
            
            {showButtons && (
              <div className="button-container">
                <button
                  onClick={handleYes}
                  className="modern-button yes-button"
                >
                  <span>Yes</span>
                  <span className="button-icon">💝</span>
                </button>
                <button
                  onClick={handleNo}
                  className="modern-button no-button"
                >
                  <span>No</span>
                  <span className="button-icon">💔</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'success' && <SuccessView />}
      {showRejectionMessage && <RejectionMessage />}
    </div>
  );
}

export default App;
