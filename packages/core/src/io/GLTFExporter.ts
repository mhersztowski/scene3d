import { GLTFExporter as ThreeGLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';
import type { SceneGraph } from '../scene/SceneGraph';
import type { SceneNode } from '../scene/SceneNode';
import type { MeshNode } from '../nodes/MeshNode';
import type { LightNode } from '../nodes/LightNode';

export class GLTFExporter {
  static async export(graph: SceneGraph): Promise<Blob> {
    const threeScene = GLTFExporter.buildThreeScene(graph);
    const exporter = new ThreeGLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        threeScene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else {
            const json = JSON.stringify(result, null, 2);
            resolve(new Blob([json], { type: 'model/gltf+json' }));
          }
        },
        reject,
        { binary: false },
      );
    });
  }

  private static buildThreeScene(graph: SceneGraph): THREE.Scene {
    const scene = new THREE.Scene();

    function processNode(node: SceneNode): THREE.Object3D | null {
      let obj: THREE.Object3D | null = null;

      switch (node.type) {
        case 'mesh': {
          const meshNode = node as unknown as MeshNode;
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(meshNode.material.color),
          });
          obj = new THREE.Mesh(geometry, material);
          break;
        }
        case 'light': {
          const lightNode = node as unknown as LightNode;
          obj = new THREE.DirectionalLight(
            new THREE.Color(lightNode.color),
            lightNode.intensity,
          );
          break;
        }
        case 'group':
          obj = new THREE.Group();
          break;
      }

      if (obj) {
        obj.name = node.name;
        obj.position.set(...node.position);
        obj.rotation.set(...node.rotation);
        obj.scale.set(...node.scale);

        for (const child of node.children) {
          const childObj = processNode(child);
          if (childObj) obj.add(childObj);
        }
      }

      return obj;
    }

    for (const child of graph.root.children) {
      const obj = processNode(child);
      if (obj) scene.add(obj);
    }

    return scene;
  }
}
