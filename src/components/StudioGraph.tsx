import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { InstagramProfile } from '../types';
import { ProfilePreviewContent } from './ProfilePreview';

interface StudioGraphProps {
  profiles: InstagramProfile[];
  onSelectProfile: (profile: InstagramProfile) => void;
}

type GroupBy = 'category' | 'locationCountry' | 'visualStyle' | 'designTags';

export const StudioGraph: React.FC<StudioGraphProps> = ({ profiles, onSelectProfile }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [colorBy, setColorBy] = useState<GroupBy | 'none'>('designTags');
  const [hoveredProfile, setHoveredProfile] = useState<{ profile: InstagramProfile, x: number, y: number } | null>(null);

  // Define color scales for nodes
  const colorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeTableau10);
  }, []);

  // Prepare graph data
  const { nodes, links, colorDomain } = useMemo(() => {
    const graphNodes: any[] = [];
    const graphLinks: any[] = [];
    const groupMap = new Map<string, any>();
    const colors = new Set<string>();

    // Helper to normalize visual styles into broader categories
    const normalizeStyle = (styleStr: string) => {
      const lower = styleStr.toLowerCase();
      if (lower.includes('cinematic')) return 'Cinematic';
      if (lower.includes('minimal') || lower.includes('clean')) return 'Minimalista';
      if (lower.includes('dark') || lower.includes('moody') || lower.includes('low key')) return 'Dark / Moody';
      if (lower.includes('bright') || lower.includes('light') || lower.includes('high key')) return 'Luminoso / Bright';
      if (lower.includes('vintage') || lower.includes('retro') || lower.includes('film')) return 'Vintage / Film';
      if (lower.includes('street') || lower.includes('urban')) return 'Street / Urban';
      if (lower.includes('editorial') || lower.includes('fashion')) return 'Editorial';
      if (lower.includes('documentary') || lower.includes('reportage')) return 'Documentary';
      if (lower.includes('vibrant') || lower.includes('colorful') || lower.includes('pop')) return 'Vibrante / Pop';
      if (lower.includes('black and white') || lower.includes('b&w') || lower.includes('monochrome') || lower.includes('bianco e nero')) return 'Bianco e Nero';
      if (lower.includes('natural') || lower.includes('organic') || lower.includes('earthy')) return 'Naturale / Organico';
      if (lower.includes('surreal') || lower.includes('abstract')) return 'Surreale / Astratto';
      if (lower.includes('geometric') || lower.includes('architettur')) return 'Architetturale / Geometrico';
      
      // Fallback: take the first word or two to avoid super long strings
      const firstPart = styleStr.split(',')[0]?.trim();
      if (firstPart && firstPart.length > 20) {
        return firstPart.substring(0, 20) + '...';
      }
      return firstPart || 'Altro';
    };

    profiles.forEach(profile => {
      const ai = profile.aiAnalysis;
      if (!ai) return;

      // Determine grouping value
      let groupValues: string[] = [];
      if (groupBy === 'category') groupValues = [ai.category || 'Altro'];
      else if (groupBy === 'locationCountry') groupValues = [ai.locationCountry || 'Sconosciuta'];
      else if (groupBy === 'visualStyle') groupValues = [normalizeStyle(ai.visualStyle || '')];
      else if (groupBy === 'designTags') groupValues = ai.designTags && ai.designTags.length > 0 ? ai.designTags : ['Altro'];

      if (!groupValues || groupValues.length === 0) groupValues = ['Altro'];

      // Determine color value
      let colorValue = '';
      if (colorBy === 'category') colorValue = ai.category || 'Altro';
      else if (colorBy === 'locationCountry') colorValue = ai.locationCountry || 'Sconosciuta';
      else if (colorBy === 'visualStyle') colorValue = normalizeStyle(ai.visualStyle || '');
      else if (colorBy === 'designTags') colorValue = ai.designTags && ai.designTags.length > 0 ? ai.designTags[0] : 'Altro';

      if (colorValue) colors.add(colorValue);

      const profileNode = { 
        id: profile.id, 
        label: ai.displayName || profile.username, 
        type: 'profile', 
        profile,
        radius: 6,
        colorValue
      };
      graphNodes.push(profileNode);

      // Create links for every group value this profile belongs to
      groupValues.forEach(groupValue => {
        if (!groupMap.has(groupValue)) {
          const groupNode = { 
            id: `group-${groupValue}`, 
            label: groupValue, 
            type: 'group', 
            radius: 15, // Base radius, will be updated
            count: 0
          };
          groupMap.set(groupValue, groupNode);
          graphNodes.push(groupNode);
        }

        const groupNode = groupMap.get(groupValue);
        groupNode.count += 1;
        
        graphLinks.push({
          source: profileNode.id,
          target: `group-${groupValue}`,
          value: 1
        });
      });
    });

    // Update radius of group nodes based on their counts
    graphNodes.forEach(node => {
      if (node.type === 'group') {
        // Base size 15, plus scaled by count. Math.sqrt makes it scale visually proportionally to area
        node.radius = 15 + Math.sqrt(node.count) * 4;
      }
    });

    return { nodes: graphNodes, links: graphLinks, colorDomain: Array.from(colors) };
  }, [profiles, groupBy, colorBy]);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    containerRef.current.innerHTML = '';

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Add zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    const g = svg.append('g');

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        // Find the group node (target) to adjust distance based on its radius
        const targetNode = nodes.find(n => n.id === d.target || n.id === d.target.id);
        const targetRadius = targetNode?.radius || 15;
        return targetRadius + 35; // Base distance plus the group's radius
      }))
      .force('charge', d3.forceManyBody().strength((d: any) => d.type === 'group' ? -500 : -30))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    const link = g.append('g')
      .attr('stroke', '#3f3f46')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1);

    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Group nodes
    nodeGroup.filter(d => d.type === 'group')
      .append('circle')
      .attr('r', d => d.radius)
      .attr('fill', '#c5a059')
      .attr('stroke', '#121216')
      .attr('stroke-width', 2);

    nodeGroup.filter(d => d.type === 'group')
      .append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => d.radius + 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e2e2')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Profile nodes
    nodeGroup.filter(d => d.type === 'profile')
      .append('circle')
      .attr('r', d => d.radius)
      .attr('fill', (d: any) => colorBy !== 'none' && d.colorValue ? colorScale(d.colorValue) : '#8e8e9a')
      .attr('stroke', '#121216')
      .attr('stroke-width', 1.5)
      .on('mouseover', function(event, d: any) {
        d3.select(this)
          .attr('fill', '#ffffff')
          .attr('r', d.radius * 1.5);
        
        // Show custom tooltip
        if (d.profile) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setHoveredProfile({ profile: d.profile, x, y });
        }
      })
      .on('mousemove', function(event, d: any) {
         if (d.profile) {
          const [x, y] = d3.pointer(event, containerRef.current);
          setHoveredProfile(prev => prev ? { ...prev, x, y } : null);
         }
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('fill', colorBy !== 'none' && d.colorValue ? colorScale(d.colorValue) : '#8e8e9a')
          .attr('r', d.radius);
          
        setHoveredProfile(null);
      })
      .on('click', (event, d: any) => {
        if (d.type === 'profile') {
          onSelectProfile(d.profile);
        }
      });
      
    // We can remove the native title since we have a custom tooltip now
    nodeGroup.filter(d => d.type === 'group')
      .append('title')
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onSelectProfile]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-[#0a0a0b] border border-[#26262b] rounded-sm relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap max-w-sm">
        <select 
          className="bg-[#121216] border border-[#26262b] text-[#e2e2e2] text-xs px-3 py-1.5 rounded-sm outline-none focus:border-[#c5a059]"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as GroupBy)}
        >
          <option value="category">Raggruppa per Ruolo</option>
          <option value="designTags">Raggruppa per Tipo Design</option>
          <option value="locationCountry">Raggruppa per Nazione</option>
          <option value="visualStyle">Raggruppa per Stile</option>
        </select>
        
        <select 
          className="bg-[#121216] border border-[#26262b] text-[#e2e2e2] text-xs px-3 py-1.5 rounded-sm outline-none focus:border-[#c5a059]"
          value={colorBy}
          onChange={(e) => setColorBy(e.target.value as GroupBy | 'none')}
        >
          <option value="none">Nessun Colore</option>
          <option value="category">Colora per Ruolo</option>
          <option value="designTags">Colora per Tipo Design</option>
          <option value="locationCountry">Colora per Nazione</option>
          <option value="visualStyle">Colora per Stile</option>
        </select>
      </div>
      
      {colorBy !== 'none' && colorDomain && colorDomain.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#121216]/90 backdrop-blur-sm border border-[#26262b] rounded-sm p-3 flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto max-w-[200px]">
          <div className="text-[10px] uppercase tracking-wider text-[#8e8e9a] font-semibold mb-1">Legenda Colori</div>
          {colorDomain.sort().map(val => (
            <div key={val} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colorScale(val) }} />
              <span className="text-[11px] text-[#e2e2e2] truncate" title={val}>{val}</span>
            </div>
          ))}
        </div>
      )}
      
      {nodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[#8e8e9a] text-sm">
          Analizza qualche profilo per visualizzare il grafico di rete.
        </div>
      ) : (
        <>
          <div ref={containerRef} className="w-full h-full overflow-hidden relative" />
          
          {hoveredProfile && (
            <div 
              className="absolute z-50 w-72 bg-[#121216] border border-[#26262b] rounded-sm shadow-2xl p-4 text-white pointer-events-none"
              style={{
                left: Math.min(hoveredProfile.x + 15, (containerRef.current?.clientWidth || 0) - 300),
                top: Math.min(hoveredProfile.y + 15, (containerRef.current?.clientHeight || 0) - 200),
              }}
            >
              <ProfilePreviewContent profile={hoveredProfile.profile} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
