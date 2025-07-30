import React, { useEffect, useRef, useState, useMemo } from 'react';
import { supabase } from '../utils/supabase';

// Enhanced Juicy Space Environment: more dynamic, vibrant, and exciting
const STAR_LAYERS = [
  { count: 100, speed: 0.02, size: [0.3, 1.2], opacity: 0.6, depth: 0.8 }, // far background
  { count: 70, speed: 0.08, size: [0.8, 2.2], opacity: 0.8, depth: 0.6 }, // mid background
  { count: 45, speed: 0.15, size: [1.2, 3], opacity: 0.95, depth: 0.4 }, // mid foreground
  { count: 25, speed: 0.25, size: [1.5, 3.5], opacity: 1, depth: 0.2 }, // near foreground
];
const SHOOTING_STAR_FREQ = 0.008; // slightly more frequent for juiciness

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Generate persistent star positions
const generateStarPositions = () => {
  const positions = {};
  STAR_LAYERS.forEach((layer, layerIndex) => {
    positions[layerIndex] = Array.from({ length: layer.count }, () => ({
      x: getRandom(0, 100),
      y: getRandom(0, 100),
      size: getRandom(...layer.size),
      opacity: layer.opacity * getRandom(0.7, 1),
      animationDelay: getRandom(0, 5),
      animationDuration: getRandom(4, 8),
      twinklePhase: getRandom(0, Math.PI * 2),
      twinkleSpeed: getRandom(0.5, 1.5)
    }));
  });
  return positions;
};

// Starfield with parallax and idle animation, no meteors
const Starfield = () => {
  const starPositions = useMemo(() => generateStarPositions(), []);
  const scrollY = useRef(0);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      requestAnimationFrame(() => {
        document.querySelectorAll('.star-parallax').forEach((el, i) => {
          const layer = STAR_LAYERS[i];
          const translateY = scrollY.current * layer.speed;
          const scale = 1 + (scrollY.current * 0.0001 * layer.depth);
          el.style.transform = `translateY(${translateY}px) scale(${scale})`;
        });
        document.querySelectorAll('.living-grid').forEach((el) => {
          const translateY = scrollY.current * 0.03;
          const scale = 1 + (scrollY.current * 0.00005);
          el.style.transform = `translateY(${translateY}px) scale(${scale})`;
        });
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Idle twinkle/animation for stars
  useEffect(() => {
    let frame;
    const animate = () => {
      document.querySelectorAll('.star').forEach((el, i) => {
        const twinkle = 0.7 + 0.3 * Math.sin(Date.now() / 1200 + i);
        el.style.opacity = twinkle;
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="starfield pointer-events-none">
      {/* Juicy Nebula Clouds */}
      <div className="nebula-cloud nebula-blue" />
      <div className="nebula-cloud nebula-purple" />
      <div className="nebula-cloud nebula-pink" />
      <div className="nebula-cloud nebula-cyan" />
      {/* Cosmic Dust Particles */}
      <div className="cosmic-dust" />
      {STAR_LAYERS.map((layer, i) => (
        <div key={i} className={`star-parallax absolute inset-0`} style={{zIndex: i}}>
          {starPositions[i].map((star, j) => (
            <div
              key={j}
              className="star"
              style={{
                top: `${star.y}vh`,
                left: `${star.x}vw`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
                filter: `blur(${i === 0 ? 0.2 : i === 1 ? 0.1 : 0}px)`,
                transform: `translateZ(${layer.depth * 100}px)`
              }}
            />
          ))}
        </div>
      ))}
      {/* Enhanced Aurora/nebula overlay */}
      <div className="aurora-overlay" />
    </div>
  );
};

const LivingOrbs = () => {
  const orbPositions = useMemo(() => [
    { class: 'orb-blue', delay: 0, duration: 45, size: 'large' },
    { class: 'orb-purple', delay: -12, duration: 52, size: 'medium' },
    { class: 'orb-teal', delay: -24, duration: 48, size: 'large' },
    { class: 'orb-white', delay: -36, duration: 55, size: 'small' },
    { class: 'orb-pink', delay: -48, duration: 38, size: 'medium' },
    { class: 'orb-cyan', delay: -60, duration: 42, size: 'large' },
    { class: 'orb-gold', delay: -72, duration: 50, size: 'medium' },
    { class: 'orb-magenta', delay: -84, duration: 44, size: 'small' }
  ], []);

  return (
    <div className="living-background">
      {orbPositions.map((orb, i) => (
        <div 
          key={i}
          className={`living-orb ${orb.class} ${orb.size}`}
          style={{
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`
          }}
        />
      ))}
    </div>
  );
};

const FloatingParticles = () => {
  const particlePositions = useMemo(() => 
    Array.from({ length: 20 }, () => ({
      x: getRandom(0, 100),
      y: getRandom(0, 100),
      delay: getRandom(-30, 0),
      duration: getRandom(25, 45),
      size: getRandom(1, 3)
    })), []
  );

  return (
    <div className="floating-particles">
      {particlePositions.map((particle, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
};

const Layout = ({ children }) => {
  // State for mobile menu and auth menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAuthMenuOpen, setMobileAuthMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const lastScrollY = useRef(0);

  // Smart logo click handler - scroll to top if on homepage, navigate to homepage if on other pages
  const handleLogoClick = () => {
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index';
    
    if (isHomepage) {
      // If already on homepage, scroll to top smoothly
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } else {
      // If on another page, navigate to homepage
      window.location.href = '/';
    }
    setMobileMenuOpen(false);
    setMobileAuthMenuOpen(false);
  };

  // Smooth scroll handlers for navbar
  const handleNavScroll = (id) => (e) => {
    e.preventDefault();
    // Close mobile menus
    setMobileMenuOpen(false);
    setMobileAuthMenuOpen(false);
    
    // Try to find the target element
    const el = document.getElementById(id);
    
    if (el) {
      // If element exists, scroll to it
      el.scrollIntoView({ behavior: 'smooth' });
      // Update URL without page reload
      window.history.pushState(null, null, `#${id}`);
    } else {
      // If element doesn't exist, navigate to homepage with hash
      // This handles cases where the target section is on a different page
      if (window.location.pathname !== '/') {
        window.location.href = `/#${id}`;
      } else {
        // If already on homepage but element not found, try again after a short delay
        // This handles cases where the section might not be mounted yet
        setTimeout(() => {
          const retryEl = document.getElementById(id);
          if (retryEl) {
            retryEl.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, null, `#${id}`);
          }
        }, 100);
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setMobileAuthMenuOpen(false);
    }
  };

  // Toggle auth menu
  const toggleAuthMenu = (e) => {
    e.stopPropagation();
    setMobileAuthMenuOpen(!mobileAuthMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('nav') && !e.target.closest('button[aria-label="Toggle menu"]')) {
        setMobileMenuOpen(false);
        setMobileAuthMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Smart sticky navbar state
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 24);
      if (currentScrollY < 16) {
        setShowNav(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      if (currentScrollY > lastScrollY.current && currentScrollY > 64) {
        setShowNav(false); // scrolling down
      } else if (currentScrollY < lastScrollY.current) {
        setShowNav(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser());
    return () => { listener?.subscription?.unsubscribe?.(); };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Background Elements */}
      <LivingOrbs />
      <div className="living-grid" />
      <FloatingParticles />
      <Starfield />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 p-3 md:p-4 navbar-glass border-b border-white/10 transition-all duration-500 ${
          showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${scrolled ? 'shadow-lg' : ''}`}
        style={{
          backdropFilter: scrolled ? 'blur(40px) saturate(200%)' : 'blur(32px) saturate(180%)',
          background: scrolled
            ? 'linear-gradient(90deg, rgba(20,24,40,0.97) 0%, rgba(30,34,54,0.92) 100%)'
            : 'linear-gradient(90deg, rgba(24,28,48,0.82) 0%, rgba(40,44,74,0.72) 100%)',
          borderBottom: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 2px 24px 0 rgba(0,0,0,0.08)' : '0 1px 8px 0 rgba(0,0,0,0.04)',
          animation: !scrolled ? 'gradient-shift 8s ease-in-out infinite' : undefined
        }}
      >
        <div className="md:hidden fixed top-4 right-4 z-50 flex items-center space-x-2" style={{
          transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
          transform: showNav ? 'translateY(0)' : 'translateY(-100px)',
          opacity: showNav ? 1 : 0,
          pointerEvents: showNav ? 'auto' : 'none'
        }}>
          {/* Profile/Auth Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMobileAuthMenuOpen(!mobileAuthMenuOpen);
              setMobileMenuOpen(false);
            }}
            className="p-2 bg-black/30 backdrop-blur-md rounded-lg hover:bg-black/50 transition-colors"
            aria-label="Account options"
            aria-expanded={mobileAuthMenuOpen}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          
          {/* Hamburger Menu Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
              setMobileAuthMenuOpen(false);
            }}
            className="p-2 bg-black/30 backdrop-blur-md rounded-lg hover:bg-black/50 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Auth Menu */}
        {mobileAuthMenuOpen && (
          <div 
            className="md:hidden fixed top-16 right-4 z-50 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 space-y-1">
              <a
                href="/login"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setMobileAuthMenuOpen(false)}
              >
                Sign In
              </a>
              <a
                href="#signup"
                onClick={(e) => {
                  handleNavScroll('signup')(e);
                  setMobileAuthMenuOpen(false);
                }}
                className="block px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-md transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
        
        <div className="container-premium">
          <div className="flex flex-col md:flex-row items-center md:justify-between justify-center">
            <div className="w-full flex justify-between items-center md:justify-start mb-0 md:mb-0">
              <button 
                onClick={handleLogoClick}
                className="text-2xl font-bold gradient-text-futuristic hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                style={{letterSpacing: '0.01em'}}
                aria-label="Go to homepage or scroll to top"
              >
                Riva
              </button>
              
              {/* Desktop Auth Buttons - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-4 ml-4">
                {!user ? (
                  <>
                    <a
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-white hover:text-blue-300 transition-colors"
                    >
                      Sign In
                    </a>
                    <a
                      href="#signup"
                      onClick={handleNavScroll('signup')}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all shadow-lg"
                    >
                      Get Started
                    </a>
                  </>
                ) : (
                  <a 
                    href="/dashboard" 
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-full transition-all shadow-lg"
                  >
                    Dashboard
                  </a>
                )}
              </div>
            </div>
            
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" onClick={handleNavScroll('services')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium border-b-2 border-transparent hover:border-blue-400 pb-1">Services</a>
              <a href="#lead-examples" onClick={handleNavScroll('lead-examples')} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium border-b-2 border-transparent hover:border-blue-400 pb-1">Portfolio</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium border-b-2 border-transparent hover:border-blue-400 pb-1">Contact</a>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div className={`md:hidden w-full mt-4 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col space-y-4 py-4 border-t border-white/10">
              <a 
                href="#services" 
                onClick={(e) => { handleNavScroll('services')(e); setMobileMenuOpen(false); }}
                className="text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
              >
                Services
              </a>
              <a 
                href="#lead-examples" 
                onClick={(e) => { handleNavScroll('lead-examples')(e); setMobileMenuOpen(false); }}
                className="text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
              >
                Portfolio
              </a>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
              >
                Contact
              </a>
              
              {/* Mobile Auth Buttons - Only show if not logged in */}
              {!user && (
                <div className="pt-2 space-y-2">
                  <a
                    href="/login"
                    className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="#signup"
                    onClick={(e) => {
                      handleNavScroll('signup')(e);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {(mobileMenuOpen || mobileAuthMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => {
            setMobileMenuOpen(false);
            setMobileAuthMenuOpen(false);
          }}
        />
      )}
      
      {/* Add padding to main content to account for fixed navbar */}
      <main className="relative z-10 pt-24 md:pt-28">
        {children}
      </main>
    </div>
  );
};

export default Layout;