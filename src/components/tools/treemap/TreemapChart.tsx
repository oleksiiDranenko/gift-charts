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

const transformGiftData = (
    gifts: GiftInterface[],
    chartType: 'change' | 'marketCap',
    timeGap: '24h' | '1w' | '1m'
): GiftData[] => {
    return gifts.map((gift) => {
        const now = gift.priceTon ?? 0;
        let then: number;
        switch (timeGap) {
            case '24h':
                then = gift.tonPrice24hAgo ?? now;
                break;
            case '1w':
                then = gift.tonPriceWeekAgo ?? now;
                break;
            case '1m':
                then = gift.tonPriceMonthAgo ?? now;
                break;
            default:
                then = now;
        }
        const percentChange = then === 0 ? 0 : ((now - then) / then) * 100;
        let size: number;
        let marketCap: number | undefined;

        if (chartType === 'change') {
            size = Math.abs(percentChange) + 1;
            size = Math.pow(size, 1.5);
            size *= 2;
        } else {
            marketCap = now * (gift.supply ?? 0);
            size = marketCap / 1000;
            size = Math.max(size, 1);
        }

        return {
            name: gift.name,
            percentChange: Number(percentChange.toFixed(2)),
            size: size,
            imageName: gift.image,
            price: now,
            marketCap: marketCap,
        };
    });
};

const preloadImages = (data: GiftData[]): Map<string, HTMLImageElement> => {
    const imageMap = new Map<string, HTMLImageElement>();
    data.forEach((item) => {
        const img = new Image();
        img.src = `/gifts/${item.imageName}.webp`;
        imageMap.set(item.imageName, img);
    });
    return imageMap;
};

const imagePlugin = (chartType: 'change' | 'marketCap') => ({
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

            const x = meta.x / scale;
            const y = meta.y / scale;
            const width = meta.width / scale;
            const height = meta.height / scale;

            const img = imageMap.get(item.imageName);
            if (img && img.complete && width > 0 && height > 0) {
                const baseSize = Math.min(Math.max(width / 6, 5), 500);
                const imgAspect = img.width / img.height;

                let drawWidth = baseSize;
                let drawHeight = baseSize / imgAspect;
                if (drawHeight > baseSize) {
                    drawHeight = baseSize;
                    drawWidth = baseSize * imgAspect;
                }

                const fontSize = Math.min(Math.max(width / 10, 1), 18);
                const priceFontSize = fontSize * 0.8;
                const textLines = 3;
                const lineSpacing = Math.min(Math.max(width / 20, 2), 8);
                const textHeight = (fontSize * 2 + priceFontSize) + lineSpacing * 2;
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
                const textY3 = textY2 + priceFontSize + lineSpacing;

                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillText(item.name, centerX, textY1);

                ctx.font = `${fontSize}px sans-serif`;
                if (chartType === 'change') {
                    ctx.fillText(`${item.percentChange >= 0 ? '+' : ''}${item.percentChange}%`, centerX, textY2);
                } else {
                    const marketCapK = (item.marketCap ?? 0) / 1000;
                    const displayText = marketCapK >= 1000 
                        ? `${(marketCapK / 1000).toFixed(1)}M 💎`
                        : `${marketCapK.toFixed(1)}K 💎`;
                    ctx.fillText(displayText, centerX, textY2);
                }

                ctx.font = `${priceFontSize}px sans-serif`;
                if (chartType === 'change') {
                    ctx.fillText(`${item.price.toFixed(2)} 💎`, centerX, textY3);
                } else {
                    ctx.fillText(`${item.percentChange >= 0 ? '+' : ''}${item.percentChange}%`, centerX, textY3);
                }

                if (index === 0) {
                    const watermarkFontSize = Math.min(Math.max(width / 12, 10), 14);
                    ctx.font = `${watermarkFontSize}px sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.textAlign = 'right';
                    const watermarkText = '@gift_charts';
                    const watermarkX = x + width - 5;
                    const watermarkY = y + height - 5;
                    ctx.fillText(watermarkText, watermarkX, watermarkY);
                }
            }
        });

        ctx.restore();
    },
});

interface TreemapChartProps {
    data: GiftInterface[];
    chartType: 'change' | 'marketCap';
    timeGap: '24h' | '1w' | '1m';
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data, chartType, timeGap }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        let Chart: any, TreemapController: any, TreemapElement: any, chartjsPluginZoom: any;

        // Dynamically import Chart.js and plugins only on the client side
        const initializeChart = async () => {
            if (typeof window === 'undefined') {
                console.log('Skipping chart initialization on server');
                return;
            }

            console.log('Initializing chart on client');

            // Dynamic imports
            const chartModule = await import('chart.js/auto');
            const treemapModule = await import('chartjs-chart-treemap');
            const zoomModule = await import('chartjs-plugin-zoom');

            Chart = chartModule.default;
            TreemapController = treemapModule.TreemapController;
            TreemapElement = treemapModule.TreemapElement;
            chartjsPluginZoom = zoomModule.default;

            // Register plugins
            Chart.register(TreemapController, TreemapElement, chartjsPluginZoom);

            if (!canvasRef.current || !data || data.length === 0) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const transformed = transformGiftData(data, chartType, timeGap);
            const imageMap = preloadImages(transformed);

            const dataset: CustomTreemapDataset = {
                data: [],
                tree: transformed,
                key: 'size',
                imageMap,
                backgroundColor: (ctx: TreemapScriptableContext) => {
                    const dataset = ctx.dataset as CustomTreemapDataset;
                    const percent = dataset.tree?.[ctx.dataIndex]?.percentChange ?? 0;
                    return percent >= 0 ? '#008000' : '#E50000';
                },
                spacing: 0,
                borderWidth: 0.5,
                borderColor: '#000',
                hoverBackgroundColor: (ctx: TreemapScriptableContext) => {
                    const dataset = ctx.dataset as CustomTreemapDataset;
                    const percent = dataset.tree?.[ctx.dataIndex]?.percentChange ?? 0;
                    return percent >= 0 ? '#008000' : '#E50000';
                },
                hoverBorderColor: '#000',
            };

            const config: any = {
                type: 'treemap',
                data: { datasets: [dataset] },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                        zoom: {
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true,
                                    // Custom pinch handler to enforce proportional zooming
                                    modifier: (chart: any, event: any) => {
                                        const { scale } = event;
                                        // Use the same scale factor for both axes
                                        const zoomFactor = scale > 1 ? 1.1 : 0.9; // Adjust zoom speed
                                        chart.zoom(zoomFactor); // Apply uniform zoom
                                        return false; // Prevent default non-proportional zoom
                                    },
                                },
                                mode: 'xy',
                            },
                            pan: {
                                enabled: true,
                                mode: 'xy',
                            },
                            limits: {
                                x: { min: 'original', max: 'original' },
                                y: { min: 'original', max: 'original' },
                            },
                        },
                    },
                    events: ['wheel', 'touchstart', 'touchmove', 'touchend'],
                },
                plugins: [imagePlugin(chartType)],
            };

            chartRef.current = new Chart(ctx, config);
        };

        initializeChart();

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'r' && chartRef.current) {
                chartRef.current.resetZoom();
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeydown);
        }

        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
            if (typeof window !== 'undefined') {
                window.removeEventListener('keydown', handleKeydown);
            }
        };
    }, [data, chartType, timeGap]);

    return (
        <div className='w-full'>
            <div className='mb-3'>
                <button
                    className='w-full text-sm h-10 rounded-lg bg-[#0098EA]'
                    onClick={() => chartRef.current?.resetZoom()}
                >
                    Reset Zoom
                </button>
            </div>
            <div style={{ width: '100%', minHeight: '600px' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default TreemapChart;