import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HierarchyNode, InvestmentItem } from '../types';
import { transformDataToHierarchy, formatCurrency } from '../utils/dataTransform';

interface SunburstChartProps {
  data: InvestmentItem[];
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    name: string;
    value: number;
    percentage: number;
    path: string;
  } | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !wrapperRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = wrapperRef.current.clientWidth;
    const height = width; // Keep it square
    const radius = width / 6;

    const hierarchyData = transformDataToHierarchy(data);

    // Create Hierarchy
    const root = d3.hierarchy<HierarchyNode>(hierarchyData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create Partition
    // IMPORTANT FIX: Explicitly cast the result of partition() to HierarchyRectangularNode
    // This tells TypeScript that the nodes now have x0, y0, x1, y1 properties
    const partitionLayout = d3.partition<HierarchyNode>()
      .size([2 * Math.PI, root.height + 1]);
    
    const rootNode = partitionLayout(root) as d3.HierarchyRectangularNode<HierarchyNode>;

    const rootValue = rootNode.value || 1;

    // Define Arc
    // We type the arc generator to expect HierarchyRectangularNode
    const arc = d3.arc<d3.HierarchyRectangularNode<HierarchyNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`) // Make it responsive
      .style("font", "10px sans-serif");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Colors
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const getSegmentColor = (d: d3.HierarchyRectangularNode<HierarchyNode>) => {
      if (d.depth === 0) return "transparent";
      
      // Level 1: Use defined category color
      if (d.depth === 1) {
          return d.data.color || color(d.data.name);
      }
      
      // Level 2 & 3: Inherit from Level 1 ancestor
      let ancestor = d;
      while (ancestor.depth > 1 && ancestor.parent) {
        ancestor = ancestor.parent;
      }
      
      const baseColor = ancestor.data.color || color(ancestor.data.name);
      
      const c = d3.color(baseColor);
      if (c) {
          if (d.depth === 2) {
             c.opacity = 0.8;
          } else if (d.depth === 3) {
             c.opacity = 0.6;
          }
          return c.toString();
      }
      return baseColor;
    };

    // Draw Arcs
    // IMPORTANT FIX: Use rootNode (which is typed as Rectangular) instead of root
    const path = g.append("g")
      .selectAll("path")
      .data(rootNode.descendants().slice(1))
      .join("path")
      .attr("fill", d => getSegmentColor(d))
      .attr("fill-opacity", d => 1)
      .attr("d", d => arc(d)) // Explicit arrow function helps TS inference
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        const percentage = ((d.value || 0) / rootValue) * 100;
        
        // Construct breadcrumb path
        const sequence = d.ancestors().map(n => n.data.name).reverse().slice(1).join(" > ");

        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          name: d.data.name,
          value: d.value || 0,
          percentage: percentage,
          path: sequence
        });

        // Highlight effect
        path.attr("fill-opacity", 0.3); // Dim all
        
        // Highlight current and ancestors
        const sequenceNodes = new Set(d.ancestors());
        path.filter(node => sequenceNodes.has(node))
            .attr("fill-opacity", 1)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

      })
      .on("mousemove", (event) => {
        setTooltip(prev => prev ? ({ ...prev, x: event.clientX, y: event.clientY }) : null);
      })
      .on("mouseleave", () => {
        setTooltip(null);
        path.attr("fill-opacity", 1)
            .attr("stroke", "none");
      });

    // Add Labels
    g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(rootNode.descendants().slice(1)) // Use rootNode here too
      .join("text")
      .attr("transform", function(d) {
        // d is now correctly typed as HierarchyRectangularNode, so x0/x1/y0/y1 exist
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .style("font-size", d => d.depth === 1 ? "12px" : "10px")
      .style("font-weight", d => d.depth === 1 ? "bold" : "normal")
      .style("fill", d => {
          const bgColor = getSegmentColor(d);
          // IMPORTANT FIX: Explicitly convert to RGB to safely access r, g, b properties
          const c = d3.color(bgColor)?.rgb();
          if(c) {
              const yiq = ((c.r * 299) + (c.g * 587) + (c.b * 114)) / 1000;
              return yiq >= 128 ? 'black' : 'white';
          }
          return 'black';
      })
      .text(d => {
          if ((d.x1 - d.x0) > 0.15) return d.data.name.substring(0, 15) + (d.data.name.length > 15 ? '...' : ''); 
          return "";
      });
      
      // Inner Circle Text (Total)
      g.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "-0.5em")
       .style("font-size", "14px")
       .style("font-weight", "bold")
       .style("fill", "#333")
       .text("总资产");
       
      g.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "1.0em")
       .style("font-size", "12px")
       .style("fill", "#666")
       .text(formatCurrency(rootValue));


  }, [data]);

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto" ref={wrapperRef}>
      <svg ref={svgRef} className="w-full h-full drop-shadow-xl"></svg>
      
      {/* Tooltip */}
      {tooltip && tooltip.visible && (
        <div 
            className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-2xl pointer-events-none text-sm transition-opacity duration-150"
            style={{ 
                left: Math.min(tooltip.x + 15, window.innerWidth - 250), 
                top: Math.min(tooltip.y + 15, window.innerHeight - 150)
            }}
        >
          <div className="font-bold text-gray-400 mb-1 text-xs">{tooltip.path}</div>
          <div className="text-lg font-bold mb-2">{tooltip.name}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-400">金额:</span>
            <span className="font-mono text-right">{formatCurrency(tooltip.value)}</span>
            <span className="text-gray-400">占比:</span>
            <span className="font-mono text-right text-green-400">{tooltip.percentage.toFixed(2)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunburstChart;