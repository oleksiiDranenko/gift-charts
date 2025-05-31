'use client';

import React, { useEffect, useRef } from 'react';
import type GiftInterface from '@/interfaces/GiftInterface';
import type { TreemapDataPoint, TreemapScriptableContext } from 'chartjs-chart-treemap';

interface GiftData {
    name: string;
    percentChange: number;
    size: number;
    imageName: string;
    price: number;
    marketCap?: number;
    [key: string]: any;
}

interface CustomTreemapDataset {
    data: TreemapDataPoint[];
    tree: GiftData[];
    key: string;
    imageMap?: Map<string, HTMLImageElement>;
    backgroundColor: (ctx: TreemapScriptableContext) => string;
    spacing?: number;
    borderWidth?: number;
    borderColor?: string;
    hoverBackgroundColor?: (ctx: TreemapScriptableContext) => string;
    hoverBorderColor?: string;
}

const updateInteractivity = (chart: any) => {
  const zoomLevel = chart.getZoomLevel?.() ?? 1;
  chart.options.plugins.zoom.pan.enabled = zoomLevel > 1;
  chart.options.events = zoomLevel > 1
    ? ['mousemove', 'click', 'touchstart', 'touchmove', 'touchend']
    : [];
  
  const canvas = chart.canvas as HTMLCanvasElement;
  if (canvas) {
    canvas.style.cursor = zoomLevel > 1 ? 'pointer' : 'default';
  }

  chart.update('none');
};

const transformGiftData = (
  gifts: GiftInterface[],
  chartType: 'change' | 'marketCap',
  timeGap: '24h' | '1w' | '1m',
  currency: 'ton' | 'usd'
): GiftData[] => {
    return gifts.map((gift) => {
        const now = currency === 'ton' ? (gift.priceTon ?? 0) : (gift.priceUsd ?? 0);
        let then: number;
        switch (timeGap) {
            case '24h':
                then = currency === 'ton' ? (gift.tonPrice24hAgo ?? now) : (gift.usdPrice24hAgo ?? now);
                break;
            case '1w':
                then = currency === 'ton' ? (gift.tonPriceWeekAgo ?? now) : (gift.usdPriceWeekAgo ?? now);
                break;
            case '1m':
                then = currency === 'ton' ? (gift.tonPriceMonthAgo ?? now) : (gift.usdPriceMonthAgo ?? now);
                break;
            default:
                then = now;
        }
        const percentChange = then === 0 ? 0 : ((now - then) / then) * 100;
        let size: number;
        let marketCap: number | undefined;

        if (chartType === 'change') {
            size = Math.pow(Math.abs(percentChange) + 1, 1.5) * 2;
        } else {
            marketCap = now * (gift.supply ?? 0);
            size = Math.max(marketCap / 1000, 1);
        }

        return {
            name: gift.name,
            percentChange: Number(percentChange.toFixed(2)),
            size,
            imageName: gift.image,
            price: now,
            marketCap,
        };
    });
};

const preloadImages = (data: GiftData[]): Map<string, HTMLImageElement> => {
    const map = new Map();
    data.forEach(({ imageName }) => {
        const img = new Image();
        img.src = `/gifts/${imageName}.webp`;
        map.set(imageName, img);
    });
    return map;
};

const imagePlugin = (chartType: 'change' | 'marketCap', currency: 'ton' | 'usd') => ({
    id: 'treemapImages',
    afterDatasetDraw(chart: any) {
        const { ctx, data } = chart;
        const dataset = data.datasets[0] as any;
        const imageMap = dataset.imageMap as Map<string, HTMLImageElement>;
        const scale = chart.getZoomLevel ? chart.getZoomLevel() : 1;

        ctx.save();
        ctx.scale(scale, scale);

        dataset.tree.forEach((item: GiftData, index: number) => {
            const meta = chart.getDatasetMeta(0).data[index] as any;
            if (!meta) return;
            const x = meta.x / scale, y = meta.y / scale;
            const width = meta.width / scale, height = meta.height / scale;
            const img = imageMap.get(item.imageName);
            if (!img?.complete || width <= 0 || height <= 0) return;

            const minSize = Math.min(width, height);
            const baseSize = Math.min(Math.max(minSize / 6, 5), 500);
            const imgAspect = img.width / img.height;
            let drawWidth = baseSize, drawHeight = baseSize / imgAspect;
            if (drawHeight > baseSize) {
                drawHeight = baseSize;
                drawWidth = baseSize * imgAspect;
            }

            const fontSize = Math.min(Math.max(minSize / 10, 1), 18);
            const priceFontSize = fontSize * 0.8;
            const lineSpacing = Math.min(Math.max(minSize / 40, 1), 8);
            const totalContentHeight = drawHeight + (fontSize * 2 + priceFontSize) + lineSpacing * 3;
            const startY = y + (height - totalContentHeight) / 2;
            const centerX = x + width / 2;

            ctx.drawImage(img, x + (width - drawWidth) / 2, startY, drawWidth, drawHeight);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';

            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillText(item.name, centerX, startY + drawHeight + fontSize + lineSpacing);

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText(chartType === 'change' ? `${item.percentChange >= 0 ? '+' : ''}${item.percentChange}%` :
                ((item.marketCap ?? 0) / 1000 >= 1000
                    ? `${((item.marketCap ?? 0) / 1e6).toFixed(1)}M ${currency === 'ton' ? '💎' : '$'}`
                    : `${((item.marketCap ?? 0) / 1000).toFixed(1)}K ${currency === 'ton' ? '💎' : '$'}`),
                centerX, startY + drawHeight + fontSize * 2 + lineSpacing * 2);

            ctx.font = `${priceFontSize}px sans-serif`;
            ctx.fillText(chartType === 'change'
                ? `${item.price.toFixed(2)} ${currency === 'ton' ? '💎' : '$'}`
                : `${item.percentChange >= 0 ? '+' : ''}${item.percentChange}%`, centerX,
                startY + drawHeight + fontSize * 2 + priceFontSize + lineSpacing * 3);

            if (index === 0) {
                ctx.font = `15px sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.textAlign = 'right';
                ctx.fillText('@gift_charts', x + width - 5, y + height - 5);
            }
        });

        ctx.restore();
    },
});

interface TreemapChartProps {
    data: GiftInterface[];
    chartType: 'change' | 'marketCap';
    timeGap: '24h' | '1w' | '1m';
    currency: 'ton' | 'usd';
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data, chartType, timeGap, currency }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        let Chart: any, TreemapController: any, TreemapElement: any, chartjsPluginZoom: any;

        const initializeChart = async () => {
            if (!window) return;
            try {
                const chartModule = await import('chart.js/auto');
                const treemapModule = await import('chartjs-chart-treemap');
                const zoomModule = await import('chartjs-plugin-zoom');

                Chart = chartModule.default;
                TreemapController = treemapModule.TreemapController;
                TreemapElement = treemapModule.TreemapElement;
                chartjsPluginZoom = zoomModule.default;

                Chart.register(TreemapController, TreemapElement, chartjsPluginZoom);

                const ctx = canvasRef.current?.getContext('2d');
                if (!ctx || !data?.length) return;

                chartRef.current?.destroy();

                const transformed = transformGiftData(data, chartType, timeGap, currency);
                const imageMap = preloadImages(transformed);

                const config: any = {
                    type: 'treemap',
                    data: { datasets: [{
                        data: [],
                        tree: transformed,
                        key: 'size',
                        imageMap,
                        backgroundColor: (ctx: TreemapScriptableContext) => {
                          const dataset = ctx.dataset as CustomTreemapDataset;
                          const val = dataset.tree?.[ctx.dataIndex]?.percentChange ?? 0;
                          return val > 0 ? '#008000' : val < 0 ?'#E50000' : "#808080";
                        },
                        hoverBackgroundColor: (ctx: TreemapScriptableContext) => {
                          const dataset = ctx.dataset as CustomTreemapDataset;
                          const val = dataset.tree?.[ctx.dataIndex]?.percentChange ?? 0;
                          return val >= 0 ? '#008000' : '#E50000';
                        },
                        hoverBorderColor: '#000'
                    }] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false },
                            zoom: {
                                zoom: { wheel: { enabled: false }, pinch: { enabled: false }, mode: 'xy' },
                                pan: {
                                    enabled: false,
                                    mode: 'xy',
                                    onPan: ({ chart }: any) => updateInteractivity(chart),
                                    beforePan: ({ chart }: any) => (chart.getZoomLevel?.() ?? 1) > 1,
                                },
                            },
                        },
                        events: [],
                    },
                    plugins: [imagePlugin(chartType, currency)]
                };

                chartRef.current = new Chart(ctx, config);
                updateInteractivity(chartRef.current);
            } catch (err) {
                console.error(err);
            }
        };

        initializeChart();
        return () => {
            chartRef.current?.destroy();
        };
    }, [data, chartType, timeGap, currency]);

    return (
        <div className='w-full flex flex-col items-center'>
            <div className='w-full lg:w-1/2 mb-3 flex gap-2'>
                <button
                  className='w-full text-sm h-10 rounded-lg bg-[#0098EA]'
                  onClick={() => {
                    chartRef.current?.resetZoom();
                    chartRef.current?.update('none');
                    updateInteractivity(chartRef.current);
                  }}>
                  Reset Zoom
                </button>
              
                <div className='w-full flex flex-row gap-x-2'>
                    <button
                      className='w-full text-sm h-10 rounded-lg bg-[#0098EA]'
                      onClick={() => {
                        const zoom = chartRef.current.getZoomLevel?.() ?? 1;
                        const newZoom = Math.max(1, zoom - 0.5);
                        if (newZoom === 1) {
                          chartRef.current?.resetZoom();
                        } else {
                          chartRef.current.zoom(newZoom / zoom);
                        }
                        chartRef.current?.update('none');
                        updateInteractivity(chartRef.current);
                      }}>-
                    </button>
                  
                    <button
                      className='w-full text-sm h-10 rounded-lg bg-[#0098EA]'
                      onClick={() => {
                        const zoom = chartRef.current.getZoomLevel?.() ?? 1;
                        const newZoom = Math.min(10, zoom + 0.3);
                        chartRef.current.zoom(newZoom / zoom);
                        chartRef.current?.update('none');
                        updateInteractivity(chartRef.current);
                      }}>+
                    </button>
                </div>
            </div>
            <div style={{ width: '100%', minHeight: '600px' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default TreemapChart;