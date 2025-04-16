"use client";

import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ChartData {
  interest: string;
  count: number;
}

interface ResourceInterestsPieChartProps {
  data: ChartData[];
  loading: boolean;
}

const ResourceInterestsPieChart: React.FC<ResourceInterestsPieChartProps> = ({
  data,
  loading,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Group data into categories
  const processData = () => {
    const categories = {
      "Relationships & Identity": [
        "Romantic/Sexual Relationships",
        "Family",
        "Abuse",
        "Bullying",
        "Racial Identity",
        "Cultural Identity",
        "LGBTQ Identity",
        "Legal Issues",
        "Social Groups (General)",
      ],
      "Mental Health": [
        "Mental Health (General)",
        "Coping Skills",
        "Self Image",
        "Grief and Loss",
        "Addiction/Substance Abuse",
        "Internet/Tech/Social Media",
      ],
      "Physical Health": [
        "Nutrition",
        "Disordered Eating",
        "Fitness & Exercise",
        "Sexual Health",
        "Transgender Health",
        "Reproductive Health",
        "Sleep",
        "Physical Health (General)",
        "Chronic Illness/Disability",
        "Accessibility",
        "Housing",
      ],
    };

    // Initialize category counts with type safety
    const categoryCounts: Record<string, number> = {
      "Relationships & Identity": 0,
      "Mental Health": 0,
      "Physical Health": 0,
      Other: 0,
    };

    // Count interests by category
    data.forEach((item) => {
      let found = false;
      for (const [category, interests] of Object.entries(categories)) {
        if (interests.includes(item.interest)) {
          categoryCounts[category] += item.count;
          found = true;
          break;
        }
      }
      if (!found) {
        categoryCounts["Other"] += item.count;
      }
    });

    return Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({ category, count: count as number }));
  };

  // Colors for the pie chart
  const colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
  ];

  // Render a simple pie chart
  const renderPieChart = () => {
    if (!chartRef.current || loading || !data || data.length === 0) return;

    const processedData = processData();
    const total = processedData.reduce((sum, item) => sum + item.count, 0);

    // Clear previous chart
    chartRef.current.innerHTML = "";

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 200 200");
    chartRef.current.appendChild(svg);

    // Calculate pie chart
    let startAngle = 0;
    const centerX = 100;
    const centerY = 100;
    const radius = 80;

    // Create legend container
    const legendDiv = document.createElement("div");
    legendDiv.className = "mt-4 grid grid-cols-2 gap-2";
    chartRef.current.appendChild(legendDiv);

    // Draw pie slices
    processedData.forEach((item, index) => {
      const percentage = item.count / total;
      const endAngle = startAngle + percentage * 2 * Math.PI;

      // Calculate path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      // Create path element
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      const largeArcFlag = percentage > 0.5 ? 1 : 0;

      path.setAttribute(
        "d",
        `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`,
      );
      path.setAttribute("fill", colors[index % colors.length]);
      path.setAttribute("stroke", "#1f2937");
      path.setAttribute("stroke-width", "1");

      svg.appendChild(path);

      // Add text label for large segments
      if (percentage > 0.1) {
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", labelX.toString());
        text.setAttribute("y", labelY.toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "10");
        text.textContent = `${Math.round(percentage * 100)}%`;

        svg.appendChild(text);
      }

      // Add to legend
      const legendItem = document.createElement("div");
      legendItem.className = "flex items-center text-sm";

      const colorBox = document.createElement("span");
      colorBox.className = "inline-block w-3 h-3 mr-2";
      colorBox.style.backgroundColor = colors[index % colors.length];

      const label = document.createElement("span");
      label.className = "text-gray-300";
      label.textContent = `${item.category} (${item.count})`;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legendDiv.appendChild(legendItem);

      startAngle = endAngle;
    });
  };

  useEffect(() => {
    renderPieChart();
  }, [data, loading]);

  return (
    <Card className="p-6 bg-gray-800 border-0 shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">
        Resource Interest Categories
      </h2>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Loading chart data...</p>
        </div>
      ) : (
        <div ref={chartRef} className="h-64"></div>
      )}
    </Card>
  );
};

export default ResourceInterestsPieChart;
