'use client'

import { useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Chart as ReactChart, ChartProps } from 'react-chartjs-2';
import { parse } from 'date-fns';
import GiftLifeDataInterface from '@/interfaces/GiftLifeDataInterface';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables, CandlestickController, CandlestickElement);

type CandlestickData = { x: number; o: number; h: number; l: number; c: number };

interface PropsInterface {
    data: GiftLifeDataInterface[];
}

export default function CandleChart({ data }: PropsInterface) {
    const chartRef = useRef<Chart<'candlestick', CandlestickData[], unknown> | null | undefined>(null);

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
                upColor: '#00ff00',
                downColor: '#ff0000',
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
                },
                title: {
                    display: false,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: 0,
                    autoSkip: true,
                    maxTicksLimit: 5,
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: {
                type: 'linear' as const,
                position: 'right',
                title: {
                    display: false,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawTicks: true,
                    tickLength: 10,
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
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
