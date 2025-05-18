'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import type { ChartConfiguration, ChartDataset } from 'chart.js';
import type { TreemapDataPoint } from 'chartjs-chart-treemap';
import type GiftInterface from '@/interfaces/GiftInterface'; // Adjust import path if needed

Chart.register(TreemapController, TreemapElement);

// Define GiftData for chart use
interface GiftData {
  name: string;
  percentChange: number;
  size: number;
  imageName: string;
  [key: string]: any;
}

// Convert GiftInterface[] to GiftData[]
// Convert GiftInterface[] to GiftData[]
const transformGiftData = (gifts: GiftInterface[]): GiftData[] => {
  return gifts.map((gift) => {
    const now = gift.priceTon ?? 0;
    const then = gift.tonPrice24hAgo ?? now;

    // Avoid division by zero for percent change calculation
    const percentChange = then === 0 ? 0 : ((now - then) / then) * 100;

    // Adjust size based on percentChange with a larger scaling factor for more contrast
    let size = Math.abs(percentChange) + 1;  // Ensure no zero or negative values
    size = Math.pow(size, 1.5);  // Apply exponential scaling for more noticeable differences
    size *= 2;  // Increase the multiplier to make the blocks bigger and more noticeable

    return {
      name: gift.name,
      percentChange: Number(percentChange.toFixed(2)),
      size: size,  // Use the adjusted size
      imageName: gift.image,
    };
  });
};



// Preload images
const preloadImages = (data: GiftData[]): Map<string, HTMLImageElement> => {
  const imageMap = new Map<string, HTMLImageElement>();
  data.forEach((item) => {
    const img = new Image();
    img.src = `/gifts/${item.imageName}.webp`;
    imageMap.set(item.imageName, img);
  });
  return imageMap;
};

const imagePlugin = {
  id: 'treemapImages',
  afterDatasetDraw(chart: Chart) {
    const { ctx, data } = chart;
    const dataset = data.datasets[0] as any;
    const imageMap = dataset.imageMap as Map<string, HTMLImageElement>;

    dataset.tree.forEach((item: GiftData, index: number) => {
      const meta = chart.getDatasetMeta(0).data[index] as any;
      if (!meta) return;

      const { x, y, width, height } = meta;
      const img = imageMap.get(item.imageName);
      if (img && img.complete && width > 0 && height > 0) {
        const baseSize = Math.min(Math.max(width / 6, 16), 300);
        const imgAspect = img.width / img.height;

        let drawWidth = baseSize;
        let drawHeight = baseSize / imgAspect;
        if (drawHeight > baseSize) {
          drawHeight = baseSize;
          drawWidth = baseSize * imgAspect;
        }

        const fontSize = Math.min(Math.max(width / 10, 8), 18);
        const textLines = 2;
        const lineSpacing = 4;
        const textHeight = fontSize * textLines + lineSpacing;
        const totalContentHeight = drawHeight + textHeight + lineSpacing;

        const startY = y + (height - totalContentHeight) / 2;
        const imageX = x + (width - drawWidth) / 2;
        const imageY = startY;

        ctx.drawImage(img, imageX, imageY, drawWidth, drawHeight);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';

        const centerX = x + width / 2;
        const textY1 = imageY + drawHeight + fontSize + lineSpacing / 2;
        const textY2 = textY1 + fontSize + lineSpacing;

        // Bold font for item name
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillText(item.name, centerX, textY1);

        // Regular font for percentChange
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText(`${item.percentChange}%`, centerX, textY2);
      }
    });
  },
};

// Props type
interface TreemapChartProps {
  data: GiftInterface[];
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'treemap', TreemapDataPoint[], unknown> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const transformed = transformGiftData(data);
    const imageMap = preloadImages(transformed);

    const dataset: ChartDataset<'treemap', TreemapDataPoint[]> & {
  tree: GiftData[];
  key: string;
  imageMap?: Map<string, HTMLImageElement>;
  backgroundColor: (context: any) => string;
  spacing?: number;
  borderWidth?: number;
  borderColor?: string;
} = {
  label: 'NFT Gifts',
  data: [],
  tree: transformed,  // Use the transformed data
  key: 'size',  // Make sure 'size' is being used for block sizing
  imageMap,
  backgroundColor: (context: any) => {
    const percent = context.raw?._data?.percentChange || 0;
    return percent >= 0 ? '#008000' : '#E50000';  // Green for positive, Red for negative
  },
  spacing: 0,
  borderWidth: 0.5,
  borderColor: '#000',
};


    const config: ChartConfiguration<'treemap', TreemapDataPoint[], unknown> = {
      type: 'treemap',
      data: { datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
      plugins: [imagePlugin],
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className='relative' style={{ width: '100%', minHeight: '600px' }}>
      <p className='z-50 absolute top-0 left-0 text-xs opacity-50'>
        @gift_charts
      </p>
      <canvas ref={canvasRef}/>
    </div>
  );
};

export default TreemapChart;