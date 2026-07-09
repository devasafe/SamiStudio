"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, DoubleSide, EdgesGeometry, LineBasicMaterial, Mesh, Material } from "three";
import { blueprintProgress } from "../core/progress-store";
import { phases } from "../timeline/phases";
import { easeOutCubic, phaseProgress } from "../utils/math";
import { RevealGroup } from "./reveal-group";

/**
 * Modelo provisório do Hero (Docs/22 FASE 4): sala de estar procedural.
 * Será substituído pelo projeto real da Sami via pipeline Blender (FASE 9).
 *
 * Narrativa de interior: wireframe técnico → casca → mobiliário →
 * detalhes → atmosfera de render final.
 */

const floorGeometry = new BoxGeometry(6, 0.1, 6);
const backWallGeometry = new BoxGeometry(6, 3, 0.12);
// Parede esquerda em segmentos, formando o vão da janela.
const leftWallLow = new BoxGeometry(0.12, 0.9, 6);
const leftWallTop = new BoxGeometry(0.12, 0.5, 6);
const leftWallFront = new BoxGeometry(0.12, 1.6, 1.6);
const leftWallBack = new BoxGeometry(0.12, 1.6, 1.6);

/** Casca do ambiente: piso e paredes, com wireframe que se dissolve. */
function RoomShell() {
  const solidRef = useRef<Mesh[]>([]);

  const wireMaterial = useMemo(
    () => new LineBasicMaterial({ color: "#8a929e", transparent: true, opacity: 1 }),
    []
  );

  const edges = useMemo(() => {
    const parts: Array<{ geometry: EdgesGeometry; position: [number, number, number] }> = [
      { geometry: new EdgesGeometry(floorGeometry), position: [0, -0.05, 0] },
      { geometry: new EdgesGeometry(backWallGeometry), position: [0, 1.5, -3.06] },
      { geometry: new EdgesGeometry(leftWallLow), position: [-3.06, 0.45, 0] },
      { geometry: new EdgesGeometry(leftWallTop), position: [-3.06, 2.75, 0] },
      { geometry: new EdgesGeometry(leftWallFront), position: [-3.06, 1.7, 2.2] },
      { geometry: new EdgesGeometry(leftWallBack), position: [-3.06, 1.7, -2.2] },
    ];
    return parts;
  }, []);

  useFrame(() => {
    const progress = blueprintProgress.get();
    // Casca aparece na fase shell.
    const shell = easeOutCubic(phaseProgress(progress, phases.shell.from, phases.shell.to));
    // Wireframe se dissolve conforme o mobiliário entra.
    const dissolve = phaseProgress(progress, phases.furniture.from, phases.furniture.to);

    wireMaterial.opacity = 1 - dissolve;

    solidRef.current.forEach((mesh) => {
      const material = mesh.material as Material & { opacity: number };
      material.transparent = shell < 1;
      material.opacity = shell;
    });
  });

  const registerMesh = (mesh: Mesh | null) => {
    if (mesh && !solidRef.current.includes(mesh)) {
      solidRef.current.push(mesh);
    }
  };

  return (
    <group>
      <group>
        {edges.map((part, index) => (
          <lineSegments
            key={index}
            geometry={part.geometry}
            material={wireMaterial}
            position={part.position}
          />
        ))}
      </group>

      <mesh ref={registerMesh} geometry={floorGeometry} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#b9a48c" roughness={0.7} transparent opacity={0} />
      </mesh>
      <mesh ref={registerMesh} geometry={backWallGeometry} position={[0, 1.5, -3.06]}>
        <meshStandardMaterial color="#f2efe9" roughness={0.95} transparent opacity={0} />
      </mesh>
      <mesh ref={registerMesh} geometry={leftWallLow} position={[-3.06, 0.45, 0]}>
        <meshStandardMaterial color="#f2efe9" roughness={0.95} transparent opacity={0} />
      </mesh>
      <mesh ref={registerMesh} geometry={leftWallTop} position={[-3.06, 2.75, 0]}>
        <meshStandardMaterial color="#f2efe9" roughness={0.95} transparent opacity={0} />
      </mesh>
      <mesh ref={registerMesh} geometry={leftWallFront} position={[-3.06, 1.7, 2.2]}>
        <meshStandardMaterial color="#f2efe9" roughness={0.95} transparent opacity={0} />
      </mesh>
      <mesh ref={registerMesh} geometry={leftWallBack} position={[-3.06, 1.7, -2.2]}>
        <meshStandardMaterial color="#f2efe9" roughness={0.95} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** Sofá contra a parede do fundo. */
function Sofa() {
  return (
    <group position={[0.2, 0, -2.1]}>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.3, 0.35, 0.95]} />
        <meshStandardMaterial color="#d8d3cb" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, -0.38]}>
        <boxGeometry args={[2.3, 0.55, 0.2]} />
        <meshStandardMaterial color="#d1ccc3" roughness={0.9} />
      </mesh>
      <mesh position={[-1.08, 0.6, 0]}>
        <boxGeometry args={[0.18, 0.5, 0.95]} />
        <meshStandardMaterial color="#d1ccc3" roughness={0.9} />
      </mesh>
      <mesh position={[1.08, 0.6, 0]}>
        <boxGeometry args={[0.18, 0.5, 0.95]} />
        <meshStandardMaterial color="#d1ccc3" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CoffeeTable() {
  return (
    <group position={[0.2, 0, -0.7]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 32]} />
        <meshStandardMaterial color="#8a7b66" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Sideboard() {
  return (
    <group position={[2.55, 0, -1.4]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.5, 0.9, 2.2]} />
        <meshStandardMaterial color="#a08d74" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Rug() {
  return (
    <mesh position={[0.2, 0.011, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.4, 2.4]} />
      <meshStandardMaterial color="#e4ddd2" roughness={1} />
    </mesh>
  );
}

function FloorLamp() {
  return (
    <group position={[-1.6, 0, -2.3]}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.6, 12]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.35, 24, 1, true]} />
        <meshStandardMaterial color="#f0e7d8" roughness={0.9} side={DoubleSide} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <group position={[2.5, 0, 1.6]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 20]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#6f7f5e" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function WallArt() {
  return (
    <group position={[0.2, 1.8, -2.97]}>
      <mesh position={[-0.55, 0, 0]}>
        <boxGeometry args={[0.9, 1.1, 0.04]} />
        <meshStandardMaterial color="#d9d2c7" roughness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.1, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.04]} />
        <meshStandardMaterial color="#c9c2b6" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Composição do ambiente com a ordem de reveal da timeline. */
export function TempInterior() {
  const furniture = phases.furniture;
  const details = phases.details;
  const span = furniture.to - furniture.from;
  const detailSpan = details.to - details.from;

  return (
    <group>
      <RoomShell />

      {/* Mobiliário principal, em sequência (stagger dentro da fase). */}
      <RevealGroup from={furniture.from} to={furniture.from + span * 0.5}>
        <Sofa />
      </RevealGroup>
      <RevealGroup from={furniture.from + span * 0.25} to={furniture.from + span * 0.75}>
        <CoffeeTable />
      </RevealGroup>
      <RevealGroup from={furniture.from + span * 0.5} to={furniture.to}>
        <Sideboard />
      </RevealGroup>

      {/* Detalhes do render. */}
      <RevealGroup from={details.from} to={details.from + detailSpan * 0.5}>
        <Rug />
      </RevealGroup>
      <RevealGroup from={details.from + detailSpan * 0.2} to={details.from + detailSpan * 0.7}>
        <FloorLamp />
      </RevealGroup>
      <RevealGroup from={details.from + detailSpan * 0.4} to={details.from + detailSpan * 0.9}>
        <Plant />
      </RevealGroup>
      <RevealGroup from={details.from + detailSpan * 0.5} to={details.to}>
        <WallArt />
      </RevealGroup>
    </group>
  );
}
