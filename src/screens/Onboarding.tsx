import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AppContext';

const SLIDES = [
  {
    title: "Discover African-origin manga, manhwa, and novels.",
    image: "https://picsum.photos/seed/slide1/800/1200",
  },
  {
    title: "Follow creators building the next story universes.",
    image: "https://picsum.photos/seed/slide2/800/1200",
  },
  {
    title: "Read, unlock, support, and collect stories you love.",
    image: "https://picsum.photos/seed/slide3/800/1200",
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const { continueAsGuest } = useAuth();

  const handleGuest = () => {
    continueAsGuest();
    navigate('/home');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black-core overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={SLIDES[currentIndex].image}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black-core from-10% via-black-core/80 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-12 w-full max-w-lg mx-auto">
        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full overflow-hidden bg-white/20`}
            >
              <motion.div 
                className="h-full bg-lemon-muted"
                initial={{ width: "0%" }}
                animate={{ width: idx <= currentIndex ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.h2
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-4xl font-bold leading-[1.1] mb-10"
          >
            {SLIDES[currentIndex].title}
          </motion.h2>
        </AnimatePresence>

        {currentIndex === SLIDES.length - 1 ? (
          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')} fullWidth>
              Get Started
            </Button>
            <div className="flex gap-3">
              <Button variant="glass" size="lg" onClick={() => navigate('/auth?mode=signin')} className="flex-1">
                Sign In
              </Button>
              <Button variant="glass" size="lg" onClick={handleGuest} className="flex-1 text-white/40">
                Guest
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={handleNext} fullWidth>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
