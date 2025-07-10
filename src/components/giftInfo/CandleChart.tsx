'use client'

import { useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Chart as ReactChart, ChartProps } from 'react-chartjs-2';
import { parse } from 'date-fns';
import GiftLifeDataInterface from '@/interfaces/GiftLifeDataInterface';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

Chart.register(...registerables, CandlestickController, CandlestickElement);

type CandlestickData = { x: number; o: number; h: number; l: number; c: number };

interface PropsInterface {
    data: GiftLifeDataInterface[];
}

export default function CandleChart({ data }: PropsInterface) {
    const chartRef = useRef<Chart<'candlestick', CandlestickData[], unknown> | null | undefined>(null);

    const { theme, resolvedTheme } = useTheme()

    const chartData: ChartProps<'candlestick', CandlestickData[], unknown>['data'] = {
        datasets: [
            {
                label: 'Price (TON)',
                data: data.map((item) => {
                    const parsedDate = parse(item.date, 'dd-MM-yyyy', new Date());
                    return {
                        x: parsedDate.getTime(),
                        o: item.openTon || 0,
                        h: item.highTon || 0,
                        l: item.lowTon || 0,
                        c: item.closeTon || 0,
                    };
                }),
                borderColor: '#ffffff',
                upColor: '#14cc00',
                downColor: '#ff0303',
            } as any,
        ],
    };

    const prices = data.map((item) => [item.openTon, item.highTon, item.lowTon, item.closeTon]).flat().filter((v): v is number => typeof v === 'number');
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    const options: ChartProps<'candlestick', CandlestickData[], unknown>['options'] = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
                title: (tooltipItems) => {
                    const item = data[tooltipItems[0].dataIndex];
                    return item.date;
                },
                label: (tooltipItem) => {
                    const item = data[tooltipItem.dataIndex];
                    return `Open: ${item.openTon} TON, Close: ${item.closeTon} TON`;
                },
            },
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'day',
                displayFormats: {
                    day: 'dd-MM',
                },
            },
            ticks: {
                source: 'data', // Align ticks with data points
                autoSkip: true, // Prevent overlap
                maxTicksLimit: 10, // Allow up to 10 ticks (adjust as needed)
                color: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                padding: 0,
                maxRotation: 0,
                minRotation: 0,
                callback: (value, index, ticks) => {
                    // Show ticks every 5 days based on data index
                    const tickInterval = 5; // Adjust interval (e.g., 5 for every 5 days)
                    if (index % tickInterval === 0) {
                        return format(new Date(value), 'dd-MM');
                    }
                    return null; // Skip ticks that don't match the interval
                },
            },
            title: {
                display: false,
            },
            grid: {
                color: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            },
        },
        y: {
            type: 'linear' as const,
            position: 'right',
            title: {
                display: false,
            },
            grid: {
                color: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                drawTicks: true,
                tickLength: 10,
            },
            ticks: {
                color: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                padding: 10,
            },
            suggestedMax: maxPrice * 1.1,
            suggestedMin: minPrice * 0.9,
        },
    },
};

    return (
        <div className="h-auto w-full">
            <ReactChart
                ref={chartRef}
                type="candlestick"
                data={chartData}
                options={options}
            />
        </div>
    );
}
