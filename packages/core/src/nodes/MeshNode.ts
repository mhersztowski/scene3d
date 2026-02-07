import { SceneNode } from '../scene/SceneNode';
import type { SceneNodeData } from '../scene/SceneNode';

export type GeometryType = 'box' | 'sphere' | 'cylinder' | 'plane' | 'cone' | 'torus' | 'custom';

export interface BufferGeometryData {
  positions: number[];
  normals?: number[];
  indices?: number[];
}

export interface GeometryDescriptor {
  type: GeometryType;
  params?: Record<string, number>;
  bufferData?: BufferGeometryData;
  fileName?: string;
}

export interface MaterialDescriptor {
  color: string;
  opacity: number;
  wireframe: boolean;
}

export interface MeshNodeData extends SceneNodeData {
  type: 'mesh';
  geometry: GeometryDescriptor;
  material: MaterialDescriptor;
}

export class MeshNode extends SceneNode {
  geometry: GeometryDescriptor;
  material: MaterialDescriptor;

  constructor(data?: Partial<MeshNodeData>) {
    super({ ...data, type: 'mesh' });
    this.geometry = data?.geometry ?? { type: 'box' };
    this.material = data?.material ?? {
      color: '#4fc3f7',
      opacity: 1,
      wireframe: false,
    };
  }

  override toData(): MeshNodeData {
    return {
      ...super.toData(),
      type: 'mesh',
      geometry: { ...this.geometry },
      material: { ...this.material },
    };
  }
}
