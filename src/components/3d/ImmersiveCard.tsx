"use client";

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ImmersiveCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  intensity?: number;
  interactive?: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
}

// 3D model of a card that follows mouse movement
function CardModel({ 
  depth = 0.05, 
  backgroundColor = '#ffffff',
  intensity = 0.5,
  interactive = true
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  
  // Handle mouse movement
  useFrame(({ mouse }) => {
    if (!mesh.current || !interactive || isReducedMotion) return;
    
    const rotationIntensity = 0.25 * intensity;
    mesh.current.rotation.x = (mouse.y * viewport.height) / 100 * rotationIntensity;
    mesh.current.rotation.y = (mouse.x * viewport.width) / 100 * rotationIntensity * -1;
  });

  return (
    <mesh
      ref={mesh}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered && interactive && !isReducedMotion ? [1.02, 1.02, 1.02] : [1, 1, 1]}
    >
      <boxGeometry args={[2, 1, depth]} />
      <meshStandardMaterial
        color={backgroundColor}
        metalness={0.2}
        roughness={0.8}
        envMapIntensity={intensity}
      />
    </mesh>
  );
}

// Main component
export function ImmersiveCard({
  children,
  className,
  depth = 0.05,
  intensity = 0.5,
  interactive = true,
  backgroundColor = '#ffffff',
  backgroundImage
}: ImmersiveCardProps) {
  const isReducedMotion = useUIStore(state => state.isReducedMotion);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div 
        className={cn(
          "relative rounded-xl overflow-hidden",
          "bg-card text-card-foreground shadow-md",
          className
        )}
      >
        {children}
      </div>
    );
  }
  
  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden",
      "bg-card text-card-foreground",
      className
    )}>
      {!isReducedMotion && (
        <div 
          className="absolute inset-0 z-0"
          style={{ height: '100%', pointerEvents: 'none' }}
        >
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 35 }}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <CardModel 
              depth={depth} 
              backgroundColor={backgroundColor} 
              intensity={intensity}
              interactive={interactive}
            />
            <ContactShadows
              position={[0, -0.5, 0]}
              opacity={0.4}
              scale={5}
              blur={2}
              far={1}
            />
            <Environment preset="city" />
          </Canvas>
        </div>
      )}
      
      <motion.div 
        className="relative z-10 h-full backdrop-blur-[1px] backdrop-saturate-150"
        style={{ 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        whileHover={!isReducedMotion && interactive ? { scale: 1.01 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <div className="relative z-10 h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default ImmersiveCard;
