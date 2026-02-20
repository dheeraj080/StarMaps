interface SunProps {
  distance: number;
}

export function Sun({ distance }: SunProps) {
  return (
    <group position={[distance, 20, 50]}>
      <mesh>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial color="#FFDD00" />
      </mesh>

      <pointLight intensity={30000} decay={2} color="#ffffee" />

      <directionalLight intensity={2.0} position={[0, 0, 0]} />
    </group>
  );
}
