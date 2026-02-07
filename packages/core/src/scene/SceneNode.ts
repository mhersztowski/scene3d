export type NodeType = 'mesh' | 'light' | 'camera' | 'group';

export interface SceneNodeData {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  metadata?: Record<string, unknown>;
  children?: SceneNodeData[];
}

export class SceneNode {
  readonly id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parent: SceneNode | null = null;
  children: SceneNode[] = [];
  metadata: Record<string, unknown>;

  constructor(data: Partial<SceneNodeData> & { type: NodeType }) {
    this.id = data.id ?? crypto.randomUUID();
    this.name = data.name ?? `${data.type}-${this.id.slice(0, 6)}`;
    this.type = data.type;
    this.visible = data.visible ?? true;
    this.position = data.position ?? [0, 0, 0];
    this.rotation = data.rotation ?? [0, 0, 0];
    this.scale = data.scale ?? [1, 1, 1];
    this.metadata = data.metadata ?? {};
  }

  addChild(node: SceneNode): void {
    node.parent = this;
    this.children.push(node);
  }

  removeChild(id: string): SceneNode | null {
    const index = this.children.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const [removed] = this.children.splice(index, 1);
    removed.parent = null;
    return removed;
  }

  findById(id: string): SceneNode | null {
    if (this.id === id) return this;
    for (const child of this.children) {
      const found = child.findById(id);
      if (found) return found;
    }
    return null;
  }

  traverse(callback: (node: SceneNode) => void): void {
    callback(this);
    for (const child of this.children) {
      child.traverse(callback);
    }
  }

  toData(): SceneNodeData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.visible,
      position: [...this.position],
      rotation: [...this.rotation],
      scale: [...this.scale],
      metadata: { ...this.metadata },
      children: this.children.map((c) => c.toData()),
    };
  }
}
