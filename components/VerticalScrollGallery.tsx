import React, { useRef, useEffect } from 'react';
import { FLOWERS } from '../constants';
import type { Flower } from '../types';

const FlowerCard: React.FC<{ flower: Flower }> = ({ flower }) => {
  return (
    <div className="flex flex-col items-center justify-start p-4 w-72 h-64 select-none">
      <div className="w-48 h-48 flex items-center justify-center">
        <img 
          src={flower.imageUrl} 
          alt={flower.name} 
          className="max-w-full max-h-full object-contain pointer-events-none" 
          draggable="false"
        />
      </div>
      <p className="mt-4 font-lora-serif italic text-xl text-stone-800">{flower.name}</p>
    </div>
  );
};

const VerticalScrollGallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const momentumID = useRef<number | null>(null);
  const isDown = useRef(false);
  
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);
  const velX = useRef(0);
  const velY = useRef(0);

  const beginMomentumTracking = () => {
    cancelMomentumTracking();
    momentumID.current = requestAnimationFrame(momentumLoop);
  };

  const cancelMomentumTracking = () => {
    if (momentumID.current !== null) {
      cancelAnimationFrame(momentumID.current);
      momentumID.current = null;
    }
  };

  const momentumLoop = () => {
    const el = galleryRef.current;
    if (!el) return;
    
    el.scrollLeft += velX.current;
    el.scrollTop += velY.current;
    velX.current *= 0.95; // Apply friction
    velY.current *= 0.95;
    
    if (Math.abs(velX.current) > 0.5 || Math.abs(velY.current) > 0.5) {
      momentumID.current = requestAnimationFrame(momentumLoop);
    } else {
      cancelMomentumTracking();
    }
  };

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      e.preventDefault();
      
      const dx = e.clientX - lastMouseX.current;
      const dy = e.clientY - lastMouseY.current;

      el.scrollLeft -= dx;
      el.scrollTop -= dy;

      velX.current = -dx;
      velY.current = -dy;

      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
    };

    const onMouseUp = () => {
      if(isDown.current) {
        isDown.current = false;
        el.classList.remove('grabbing');
        beginMomentumTracking();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDown.current = true;
      el.classList.add('grabbing');
      lastMouseX.current = e.clientX;
      lastMouseY.current = e.clientY;
      velX.current = 0;
      velY.current = 0;
      cancelMomentumTracking();
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
    
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelMomentumTracking();
      velY.current += e.deltaY * 0.5;
      beginMomentumTracking();
    };


    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelMomentumTracking();
    };
  }, []);

  return (
    <div 
      ref={galleryRef} 
      className="absolute inset-0 grid grid-cols-6 content-start gap-x-16 gap-y-8 pt-40 pb-40 px-8 overflow-auto cursor-grab no-scrollbar"
    >
      {FLOWERS.map(flower => (
        <FlowerCard key={flower.id} flower={flower} />
      ))}
    </div>
  );
};

export default VerticalScrollGallery;
