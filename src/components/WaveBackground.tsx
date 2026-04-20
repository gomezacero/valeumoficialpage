import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { ShaderMaterial, Vector2, PlaneGeometry } from 'three';

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Capa 1: Olas principales lentas
    float wave1 = sin(pos.x * 1.8 + uTime * 0.4) * 0.18;
    float wave2 = sin(pos.y * 2.2 + uTime * 0.3) * 0.14;

    // Capa 2: Olas cruzadas medias
    float wave3 = sin((pos.x + pos.y) * 1.2 + uTime * 0.55) * 0.10;
    float wave4 = cos((pos.x - pos.y) * 1.6 + uTime * 0.45) * 0.08;

    // Capa 3: Detalle fino
    float wave5 = sin(pos.x * 4.0 + pos.y * 3.0 + uTime * 0.8) * 0.04;
    float wave6 = cos(pos.x * 3.5 - pos.y * 2.5 + uTime * 0.65) * 0.03;

    // Influencia del mouse: ola radial desde la posicion del cursor
    float dist = distance(uv, uMouse);
    float mouseWave = sin(dist * 12.0 - uTime * 3.0) * 0.12 * smoothstep(0.6, 0.0, dist);

    pos.z = wave1 + wave2 + wave3 + wave4 + wave5 + wave6 + mouseWave;
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Colores de marca Valeum
    vec3 cyan = vec3(0.0, 0.824, 1.0);       // #00d2ff
    vec3 purple = vec3(0.44, 0.0, 1.0);      // #7000ff
    vec3 darkBlue = vec3(0.0, 0.157, 0.47);  // #002878
    vec3 magenta = vec3(0.55, 0.0, 1.0);     // #8c00ff
    vec3 deepNavy = vec3(0.0, 0.043, 0.102); // #000b1a

    // Mezcla basada en posicion y elevacion
    float t = vUv.x * 0.6 + sin(uTime * 0.15) * 0.15;
    vec3 color = mix(darkBlue, cyan, smoothstep(0.0, 0.7, t));
    color = mix(color, purple, smoothstep(0.3, 0.9, vUv.y) * 0.65);

    // Highlights en las crestas de las olas
    float crest = smoothstep(0.15, 0.4, vElevation);
    color = mix(color, magenta, crest * 0.4);
    color = mix(color, cyan * 1.3, crest * 0.2);

    // Sombras en los valles
    float valley = smoothstep(-0.1, -0.3, vElevation);
    color = mix(color, deepNavy, valley * 0.6);

    // Fade suave en los bordes para integrarse con el fondo
    float edgeFade = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x)
                   * smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.75, vUv.y);

    // Intensidad general reducida para ser un fondo sutil
    gl_FragColor = vec4(color * 0.55, edgeFade * 0.75);
  }
`;

function WaveMesh() {
  const meshRef = useRef<any>(null);
  const mouseRef = useRef(new Vector2(0.5, 0.5));
  const targetMouseRef = useRef(new Vector2(0.5, 0.5));
  const { size } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0.5, 0.5) },
  }), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.set(
        e.clientX / size.width,
        1.0 - e.clientY / size.height
      );
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as ShaderMaterial;
    mat.uniforms.uTime.value += delta;

    // Suavizar movimiento del mouse (lerp)
    mouseRef.current.lerp(targetMouseRef.current, 0.05);
    mat.uniforms.uMouse.value.copy(mouseRef.current);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.8, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[5, 5, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

interface WaveBackgroundProps {
  className?: string;
}

function getInitialUseFallback() {
  if (typeof window === 'undefined') return true;
  if (window.innerWidth < 768) return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
  return false;
}

export default function WaveBackground({ className = '' }: WaveBackgroundProps) {
  const [useFallback, setUseFallback] = useState(getInitialUseFallback);

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setUseFallback(window.innerWidth < 768 || mqMotion.matches);
    window.addEventListener('resize', check, { passive: true });
    mqMotion.addEventListener?.('change', check);
    return () => {
      window.removeEventListener('resize', check);
      mqMotion.removeEventListener?.('change', check);
    };
  }, []);

  // En mobile o prefers-reduced-motion, usar fallback CSS (no cargar Three.js canvas)
  if (useFallback) {
    return <div className={`valeum-hero-container absolute inset-0 ${className}`} />;
  }

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.8, 2.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <WaveMesh />
      </Canvas>
    </div>
  );
}
