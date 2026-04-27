import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black-core text-cream-soft overflow-hidden relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        {/* Animated lemon-drop abstract mark */}
        <div className="relative w-16 h-16 mb-8 flex justify-center items-center">
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 90, 180, 270, 360],
               borderRadius: ["20%", "50%", "30%", "50%", "20%"]
             }}
             transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
             className="absolute inset-0 border-2 border-lemon-muted opacity-50"
           />
           <motion.div 
             animate={{ scale: [0.8, 1, 0.8] }}
             transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
             className="w-6 h-6 bg-lemon-muted rounded-full shadow-[0_0_30px_rgba(232,197,71,0.5)]"
           />
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display font-black text-5xl md:text-7xl tracking-tighter"
        >
          LEMONADE<span className="text-lemon-muted">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 text-sm font-medium tracking-widest uppercase text-white/50"
        >
          Stories become worlds.
        </motion.p>
      </motion.div>

      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lemon-muted/5 via-black-core to-black-core opacity-50 pointer-events-none" />
    </div>
  );
}
