import { SceneNode } from '../scene/SceneNode';
import type { SceneNodeData } from '../scene/SceneNode';

export type LightType = 'ambient' | 'directional' | 'point' | 'spot';

export interface LightNodeData extends SceneNodeData {
  type: 'light';
  lightType: LightType;
  color: string;
  intensity: number;
}

export class LightNode extends SceneNode {
  lightType: LightType;
  color: string;
  intensity: number;

  constructor(data?: Partial<LightNodeData>) {
    super({ ...data, type: 'light' });
    this.lightType = data?.lightType ?? 'directional';
    this.color = data?.color ?? '#ffffff';
    this.intensity = data?.intensity ?? 1;
  }

  override toData(): LightNodeData {
    return {
      ...super.toData(),
      type: 'light',
      lightType: this.lightType,
      color: this.color,
      intensity: this.intensity,
    };
  }
}
