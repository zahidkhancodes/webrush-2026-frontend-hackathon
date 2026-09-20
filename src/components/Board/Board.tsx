/**
 * @module Board
 * @description Entity relationship graph visualization using HTML5 Canvas with d3-force layout.
 * Features responsive canvas sizing, accessible list fallback, and mobile-first defaults.
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3-force';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Edge } from '../../types';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  label: string;
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
}

/**
 * The Board — a conspiracy-style entity relationship graph.
 * Defaults to list view on mobile for performance and accessibility.
 */
export const Board: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsList, setViewAsList] = useState(false);

  // Removed default to list on mobile to preserve interactive functionality
  useEffect(() => {
    // Optionally we can initialize with list view based on some other condition, 
    // but for now, we want the canvas graph to render on mobile.
  }, []);

  useEffect(() => {
    fetch('/data/edges.json')
      .then((res) => res.json())
      .then((data: Edge[]) => {
        const nodeMap = new Map<string, GraphNode>();

        data.forEach((edge) => {
          [edge.source, edge.target].forEach((id) => {
            if (!nodeMap.has(id)) {
              const [type, ...labelParts] = id.split(':');
              nodeMap.set(id, {
                id,
                group: type,
                label: labelParts.join(':'),
                radius: 4,
              });
            }
          });
          nodeMap.get(edge.source)!.radius += edge.weight * 0.1;
          nodeMap.get(edge.target)!.radius += edge.weight * 0.1;
        });

        // Cap radius for visual balance
        for (const node of nodeMap.values()) {
          node.radius = Math.min(node.radius, 22);
        }

        setNodes(Array.from(nodeMap.values()));
        setLinks(data as unknown as GraphLink[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /** Canvas rendering with resize observer */
  useEffect(() => {
    if (loading || viewAsList || !canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const width = container?.clientWidth ?? canvas.clientWidth;
    const height = container?.clientHeight ?? canvas.clientHeight;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: unknown) => (d as GraphNode).id)
          .distance(50)
          .strength((d: unknown) => (d as GraphLink).weight * 0.01),
      )
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: unknown) => (d as GraphNode).radius + 2));

    let frameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw links with bloom glow
      ctx.strokeStyle = 'rgba(91, 46, 140, 0.2)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(91, 46, 140, 0.4)';
      ctx.shadowBlur = 4;

      ctx.beginPath();
      links.forEach((link: unknown) => {
        const l = link as { source: { x: number; y: number }; target: { x: number; y: number } };
        if (l.source.x != null && l.target.x != null) {
          ctx.moveTo(l.source.x, l.source.y);
          ctx.lineTo(l.target.x, l.target.y);
        }
      });
      ctx.stroke();

      // Draw nodes
      ctx.shadowBlur = 0;
      nodes.forEach((node: unknown) => {
        const n = node as GraphNode & { x: number; y: number };
        if (n.x == null || n.y == null) return;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = n.group === 'artist' ? '#E9E5DA' : '#E8C547';
        ctx.fill();
        ctx.strokeStyle = 'rgba(91, 46, 140, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      simulation.stop();
      cancelAnimationFrame(frameId);
    };
  }, [nodes, links, loading, viewAsList]);

  const toggleView = useCallback(() => setViewAsList((v) => !v), []);

  /** Sorted links for list view */
  const sortedLinks = useMemo(
    () => [...links].sort((a, b) => b.weight - a.weight).slice(0, 100),
    [links],
  );

  if (loading) return <LoadingSpinner message="Loading the Board…" size="lg" />;

  return (
    <div className="flex-col gap-4 w-full">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <h2 className="h2-display" style={{ margin: 0 }}>The Board</h2>
          <div className="flex gap-3 items-center">
            <span className="text-faded" style={{ fontSize: 'var(--fs-xs)' }}>
              {nodes.length} entities · {links.length} connections
            </span>
            <button className="btn btn-ghost btn-sm" onClick={toggleView}>
              {viewAsList ? '◉ Graph' : '☰ List'}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas / List */}
      <div
        ref={containerRef}
        className={`surface-night board-canvas-container${viewAsList ? '' : ''}`}
        style={viewAsList ? { background: 'var(--paper)', height: '65vh', overflow: 'auto' } : undefined}
      >
        {viewAsList ? (
          <div style={{ padding: 'var(--spacing-4)' }}>
            <div className="table-responsive">
              <table className="evidence-table" aria-label="Entity co-occurrence table">
                <thead>
                  <tr>
                    <th scope="col">Entity 1</th>
                    <th scope="col">Entity 2</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Co-occurrences</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLinks.map((link, i) => {
                    const src = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
                    const tgt = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
                    return (
                      <tr key={i}>
                        <td>{src}</td>
                        <td>{tgt}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{link.weight}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {links.length > 100 && (
              <p className="text-faded" style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--fs-xs)' }}>
                Showing top 100 of {links.length} connections.
              </p>
            )}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
            aria-label={`Force-directed graph showing ${nodes.length} entities and ${links.length} connections`}
            role="img"
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center" style={{ fontSize: 'var(--fs-xs)' }}>
        <div className="flex gap-2 items-center">
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#E9E5DA', border: '1px solid var(--faded)', display: 'inline-block' }} />
          <span className="text-faded">Artist</span>
        </div>
        <div className="flex gap-2 items-center">
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#E8C547', display: 'inline-block' }} />
          <span className="text-faded">Category / Merchant</span>
        </div>
        <div className="flex gap-2 items-center">
          <span style={{ width: 20, height: 2, background: 'rgba(91,46,140,0.5)', display: 'inline-block' }} />
          <span className="text-faded">Co-occurrence</span>
        </div>
      </div>
    </div>
  );
};
