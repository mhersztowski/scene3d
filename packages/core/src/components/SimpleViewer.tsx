import { useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneGraph } from '../scene/SceneGraph';
import type { SceneNode } from '../scene/SceneNode';
import type { MeshNode, BufferGeometryData } from '../nodes/MeshNode';
import type { LightNode } from '../nodes/LightNode';
import type { CSSProperties, ReactElement } from 'react';

export interface SimpleViewerProps {
  sceneGraph?: SceneGraph;
  version?: number;
  showGrid?: boolean;
  selectedNodeId?: string | null;
  transformMode?: 'translate' | 'rotate' | 'scale';
  onNodeSelect?: (nodeId: string | null) => void;
  onTransformChange?: (nodeId: string, property: string, value: [number, number, number]) => void;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  className?: string;
  style?: CSSProperties;
}

function SelectableMesh({
  node,
  meshNode,
  isSelected,
  onSelect,
}: {
  node: SceneNode;
  meshNode: MeshNode;
  isSelected: boolean;
  onSelect?: (nodeId: string) => void;
}) {
  return (
    <mesh
      name={node.id}
      position={node.position}
      rotation={node.rotation}
      scale={node.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
    >
      <MeshGeometry type={meshNode.geometry.type} params={meshNode.geometry.params} bufferData={meshNode.geometry.bufferData} />
      <meshStandardMaterial
        color={meshNode.material.color}
        opacity={meshNode.material.opacity}
        transparent={meshNode.material.opacity < 1}
        wireframe={meshNode.material.wireframe}
        emissive={isSelected ? '#4fc3f7' : '#000000'}
        emissiveIntensity={isSelected ? 0.15 : 0}
      />
    </mesh>
  );
}

function GizmoControls({
  sceneGraph,
  selectedNodeId,
  transformMode,
  onTransformChange,
}: {
  sceneGraph: SceneGraph;
  selectedNodeId: string;
  transformMode: 'translate' | 'rotate' | 'scale';
  onTransformChange?: (nodeId: string, property: string, value: [number, number, number]) => void;
}) {
  const { scene } = useThree();
  const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const targetObject = useMemo(() => {
    return scene.getObjectByName(selectedNodeId) as THREE.Mesh | undefined;
  }, [scene, selectedNodeId]);

  const handleDragEnd = useCallback(() => {
    if (!targetObject || !onTransformChange) return;
    const node = sceneGraph.findNode(selectedNodeId);
    if (!node) return;

    const pos = targetObject.position.toArray() as [number, number, number];
    const rot: [number, number, number] = [targetObject.rotation.x, targetObject.rotation.y, targetObject.rotation.z];
    const scl = targetObject.scale.toArray() as [number, number, number];

    if (transformMode === 'translate') {
      onTransformChange(selectedNodeId, 'position', pos);
    } else if (transformMode === 'rotate') {
      onTransformChange(selectedNodeId, 'rotation', rot);
    } else if (transformMode === 'scale') {
      onTransformChange(selectedNodeId, 'scale', scl);
    }
  }, [targetObject, onTransformChange, sceneGraph, selectedNodeId, transformMode]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const callback = () => handleDragEnd();
    controls.addEventListener('mouseUp', callback);
    return () => controls.removeEventListener('mouseUp', callback);
  }, [handleDragEnd]);

  if (!targetObject) return null;

  return (
    <TransformControls
      ref={controlsRef}
      object={targetObject}
      mode={transformMode}
      size={0.7}
    />
  );
}

function SceneRenderer({
  sceneGraph,
  version,
  selectedNodeId,
  onNodeSelect,
}: {
  sceneGraph?: SceneGraph;
  version?: number;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
}) {
  const objects = useMemo(() => {
    if (!sceneGraph) return [];
    const result: ReactElement[] = [];

    sceneGraph.traverse((node: SceneNode) => {
      if (node === sceneGraph.root) return;
      if (!node.visible) return;

      if (node.type === 'mesh') {
        const meshNode = node as unknown as MeshNode;
        result.push(
          <SelectableMesh
            key={node.id}
            node={node}
            meshNode={meshNode}
            isSelected={node.id === selectedNodeId}
            onSelect={onNodeSelect}
          />,
        );
      } else if (node.type === 'light') {
        const lightNode = node as unknown as LightNode;
        switch (lightNode.lightType) {
          case 'ambient':
            result.push(
              <ambientLight
                key={node.id}
                color={lightNode.color}
                intensity={lightNode.intensity}
              />,
            );
            break;
          case 'point':
            result.push(
              <pointLight
                key={node.id}
                position={node.position}
                color={lightNode.color}
                intensity={lightNode.intensity}
              />,
            );
            break;
          case 'directional':
          default:
            result.push(
              <directionalLight
                key={node.id}
                position={node.position}
                color={lightNode.color}
                intensity={lightNode.intensity}
              />,
            );
        }
      }
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneGraph, version, selectedNodeId, onNodeSelect]);

  return <group>{objects}</group>;
}

function CustomBufferGeometry({ data }: { data: BufferGeometryData }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    if (data.normals) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
    }
    if (data.indices) {
      geo.setIndex(data.indices);
    }
    if (!data.normals) {
      geo.computeVertexNormals();
    }
    return geo;
  }, [data]);

  return <primitive object={geometry} attach="geometry" />;
}

function MeshGeometry({
  type,
  params,
  bufferData,
}: {
  type: string;
  params?: Record<string, number>;
  bufferData?: BufferGeometryData;
}) {
  switch (type) {
    case 'custom':
      if (!bufferData) return <boxGeometry />;
      return <CustomBufferGeometry data={bufferData} />;
    case 'sphere':
      return <sphereGeometry args={[params?.['radius'] ?? 1, 32, 32]} />;
    case 'cylinder':
      return (
        <cylinderGeometry
          args={[
            params?.['radiusTop'] ?? 1,
            params?.['radiusBottom'] ?? 1,
            params?.['height'] ?? 2,
            32,
          ]}
        />
      );
    case 'plane':
      return (
        <planeGeometry args={[params?.['width'] ?? 10, params?.['height'] ?? 10]} />
      );
    case 'cone':
      return (
        <coneGeometry args={[params?.['radius'] ?? 1, params?.['height'] ?? 2, 32]} />
      );
    case 'torus':
      return (
        <torusGeometry
          args={[params?.['radius'] ?? 1, params?.['tube'] ?? 0.4, 16, 100]}
        />
      );
    case 'box':
    default:
      return (
        <boxGeometry
          args={[
            params?.['width'] ?? 1,
            params?.['height'] ?? 1,
            params?.['depth'] ?? 1,
          ]}
        />
      );
  }
}

function SceneContent({
  sceneGraph,
  version,
  showGrid,
  selectedNodeId,
  transformMode,
  onNodeSelect,
  onTransformChange,
}: {
  sceneGraph?: SceneGraph;
  version?: number;
  showGrid: boolean;
  selectedNodeId?: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  onNodeSelect?: (nodeId: string | null) => void;
  onTransformChange?: (nodeId: string, property: string, value: [number, number, number]) => void;
}) {
  const selectedNode = selectedNodeId && sceneGraph ? sceneGraph.findNode(selectedNodeId) : null;
  const showGizmo = selectedNode?.type === 'mesh';

  return (
    <>
      <OrbitControls makeDefault />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      {showGrid && <gridHelper args={[20, 20, '#444444', '#333333']} />}
      <SceneRenderer
        sceneGraph={sceneGraph}
        version={version}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect}
      />
      {showGizmo && sceneGraph && selectedNodeId && (
        <GizmoControls
          sceneGraph={sceneGraph}
          selectedNodeId={selectedNodeId}
          transformMode={transformMode}
          onTransformChange={onTransformChange}
        />
      )}
    </>
  );
}

export function SimpleViewer({
  sceneGraph,
  version,
  showGrid = true,
  selectedNodeId,
  transformMode = 'translate',
  onNodeSelect,
  onTransformChange,
  width = '100%',
  height = '100%',
  backgroundColor = '#2a2a2a',
  className,
  style,
}: SimpleViewerProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        style={{ background: backgroundColor }}
        onPointerMissed={() => onNodeSelect?.(null)}
      >
        <SceneContent
          sceneGraph={sceneGraph}
          version={version}
          showGrid={showGrid}
          selectedNodeId={selectedNodeId}
          transformMode={transformMode}
          onNodeSelect={onNodeSelect}
          onTransformChange={onTransformChange}
        />
      </Canvas>
    </div>
  );
}
