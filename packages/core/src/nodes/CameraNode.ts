import { SceneNode } from '../scene/SceneNode';
import type { SceneNodeData } from '../scene/SceneNode';

export interface CameraNodeData extends SceneNodeData {
  type: 'camera';
  fov: number;
  near: number;
  far: number;
}

export class CameraNode extends SceneNode {
  fov: number;
  near: number;
  far: number;

  constructor(data?: Partial<CameraNodeData>) {
    super({ ...data, type: 'camera' });
    this.fov = data?.fov ?? 75;
    this.near = data?.near ?? 0.1;
    this.far = data?.far ?? 1000;
  }

  override toData(): CameraNodeData {
    return {
      ...super.toData(),
      type: 'camera',
      fov: this.fov,
      near: this.near,
      far: this.far,
    };
  }
}
