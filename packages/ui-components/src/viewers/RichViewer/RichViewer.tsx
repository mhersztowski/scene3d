import { useMemo } from 'react';
import type { RichViewerProps } from '@mhersztowski/scene3d-ui-core';
import { useToggle } from '@mhersztowski/scene3d-ui-core';
import { SimpleViewer, SceneGraph, MeshNode, LightNode } from '@mhersztowski/scene3d-core';
import styles from './RichViewer.module.css';

export function RichViewer({
  className,
  style,
  showControls = true,
}: RichViewerProps) {
  const [isFullscreen, toggleFullscreen] = useToggle(false);

  const sceneGraph = useMemo(() => {
    const graph = new SceneGraph();

    const box = new MeshNode({
      name: 'Demo Box',
      geometry: { type: 'box' },
      material: { color: '#4fc3f7', opacity: 1, wireframe: false },
    });
    graph.addNode(box);

    const light = new LightNode({
      name: 'Light',
      lightType: 'directional',
      position: [5, 10, 5],
      intensity: 1,
    });
    graph.addNode(light);

    return graph;
  }, []);

  return (
    <div className={`${styles['viewer']} ${className ?? ''}`} style={style}>
      <SimpleViewer
        sceneGraph={sceneGraph}
        className={styles['canvas']}
      />

      {showControls && (
        <div className={styles['controls']}>
          <button
            className={styles['controlButton']}
            onClick={() => {}}
            title="Reset Camera"
          >
            &#x21BA;
          </button>
          <button
            className={styles['controlButton']}
            onClick={() => {}}
            title="Zoom In"
          >
            +
          </button>
          <button
            className={styles['controlButton']}
            onClick={() => {}}
            title="Zoom Out"
          >
            &minus;
          </button>
          <button
            className={`${styles['controlButton']} ${isFullscreen ? styles['controlButtonActive'] : ''}`}
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            &#x26F6;
          </button>
        </div>
      )}
    </div>
  );
}
