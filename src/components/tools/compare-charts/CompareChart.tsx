'use client'

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    Tooltip,
    CategoryScale,
    ChartOptions,
    Filler,
} from "chart.js";
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useEffect, useRef, useState } from "react";
import useVibrate from "@/hooks/useVibrate";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, CategoryScale, Filler);

interface PropsInterface {
    gifts: GiftInterface[] | null;
    weekData: (GiftWeekDataInterface[])[];
    lifeData: (GiftLifeDataInterface[])[];
    isInfoHidden: boolean,
	listType: '24h' | '1w' | '1m' | 'all',
	setListType(input: '24h' | '1w' | '1m' | 'all'): void
}

interface DatasetInterface {
    label: string;
    data: (number | null)[];
    borderColor: string;
    borderWidth: number;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
    fill: boolean;
    pointBackgroundColor: string;
    backgroundColor: string | CanvasGradient;
}

export default function CompareCharts({ gifts, weekData, lifeData, isInfoHidden, listType, setListType }: PropsInterface) {
    const vibrate = useVibrate();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ChartJS<"line">>(null);

    const [selectedPrice, setSelectedPrice] = useState<'ton' | 'usd'>('ton');
    const [list, setList] = useState<(GiftLifeDataInterface[] | GiftWeekDataInterface[])[]>([]);
    const [datasets, setDatasets] = useState<DatasetInterface[]>([]);

    useEffect(() => {
        const chartContainer = chartContainerRef.current;
        if (!chartContainer) return;

        const preventScroll = (e: TouchEvent) => {
            e.preventDefault();
        };

        chartContainer.addEventListener("touchstart", preventScroll, { passive: false });
        chartContainer.addEventListener("touchmove", preventScroll, { passive: false });
        chartContainer.addEventListener("touchend", preventScroll, { passive: false });

        const handleClickOutside = (e: MouseEvent) => {
            const chartCanvas = chartContainer.querySelector("canvas");
            if (chartCanvas && !chartCanvas.contains(e.target as Node)) {
                const chartInstance = ChartJS.getChart(chartCanvas);
                if (chartInstance) {
                    chartInstance.setActiveElements([]);
                    chartInstance.tooltip?.setActiveElements([], { x: 0, y: 0 });
                    chartInstance.update();
                }
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            chartContainer.removeEventListener("touchstart", preventScroll);
            chartContainer.removeEventListener("touchmove", preventScroll);
            chartContainer.removeEventListener("touchend", preventScroll);
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!weekData.length && !lifeData.length) {
            setList([]);
            return;
        }

        let newList: (GiftLifeDataInterface[] | GiftWeekDataInterface[])[] = [];
        switch (listType) {
            case '1m':
                newList = lifeData.map((data, index) => [...data.slice(-30), ...(weekData[index]?.slice(-1) || [])]);
                break;
            case 'all':
                newList = lifeData.map((data, index) => [...data, ...(weekData[index]?.slice(-1) || [])]);
                break;
            case '1w':
                newList = weekData.map(data => [...data]);
                break;
            case '24h':
                newList = weekData.map(data => [...data.slice(-24)]);
                break;
        }

        const maxLength = Math.max(...newList.map(data => data.length));

        newList = newList.map(data => {
            const paddingLength = maxLength - data.length;
            const padding = Array(paddingLength).fill(null);
            return [...padding, ...data];
        });

        setList(newList);
    }, [listType, weekData, lifeData]);

    useEffect(() => {  
        if (!list.length || !gifts?.length) {
            setDatasets([]);
            return;
        }

        const colors = [
            "#22c55e",
            "#0098EA",
            "#f43f5e",
            "#d946ef",
            "#f59e0b",
        ];

        const newDatasets: DatasetInterface[] = list.map((data, index) => {
            const color = colors[index % colors.length];
            let backgroundColor: string | CanvasGradient = `${color}20`;

            if (chartRef.current) {
                const chart = chartRef.current;
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, `${color}80`);
                gradient.addColorStop(1, `${color}00`);
                backgroundColor = gradient;
            }

            return {
                label: gifts[index]?.name || `Gift ${index + 1}`,
                data: data.map((item: any) =>
                    item === null ? null : parseFloat((selectedPrice === 'ton' ? item.priceTon : item.priceUsd).toFixed(1))
                ),
                borderColor: color,
                borderWidth: 1,
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: true,
                pointBackgroundColor: color,
                backgroundColor,
            };
        });

        setDatasets(newDatasets);
    }, [list, selectedPrice, gifts]);

    let index = list.findIndex(subArray =>
        subArray.every(item => item !== null && item.date !== undefined && typeof item.date === 'string')
    );

    const labels = list[index]?.map((item: any) => listType === '24h' && item.time ? item.time.slice(0,5) : item.date.slice(0, 5)) || [];

    const formatNumber = (number: number) => {
        if (number >= 1000) {
            const shortNumber = (number / 1000).toFixed(1);
            return `${shortNumber}K`;
        }
        return number.toFixed(1);
    };

    const data = {
        labels,
        datasets,
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { display: true },
            title: { display: false },
            tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function (tooltipItem) {
                        const value = parseFloat(tooltipItem.raw as string).toFixed(1);
                        return `${tooltipItem.dataset.label}: ${value} ${selectedPrice === 'ton' ? 'TON' : 'USD'}`;
                    },
                },
                external: function (context) {
                    const { chart, tooltip } = context;
                    const ctx = chart.ctx;

                    if (!tooltip || !tooltip.opacity) {
                        return;
                    }

                    const tooltipX = tooltip.caretX;
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";

                    ctx.moveTo(tooltipX, chart.chartArea.top);
                    ctx.lineTo(tooltipX, chart.chartArea.bottom);

                    ctx.stroke();
                    ctx.restore();
                },
            },
        },
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
                grid: { color: "rgba(255, 255, 255, 0.05)" },
                ticks: {
                    color: "rgba(255, 255, 255, 0.6)",
                    padding: 0,
                    autoSkip: true,
                    maxTicksLimit: 5,
                    maxRotation: 0,
                    minRotation: 0,
                },
            },
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                    drawTicks: true,
                    tickLength: 10,
                },
                ticks: {
                    color: "rgba(255, 255, 255, 0.6)",
                    padding: 10,
                    callback: (value) => formatNumber(value as number),
                },
                position: "right",
            },
        },
    };

    return (
        <div className="h-auto w-full">
            {!isInfoHidden &&
                <div className="w-full mb-2 flex flex-row justify-between">
                    <div className="w-1/2 flex flex-row box-border">
                        <button
                            className={`w-2/5 text-sm h-10 box-border ${selectedPrice === 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                            onClick={() => {
                                setSelectedPrice('ton');
                                vibrate();
                            }}
                        >
                            TON
                        </button>
                        <button
                            className={`w-2/5 text-sm h-10 box-border ${selectedPrice === 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                            onClick={() => {
                                setSelectedPrice('usd');
                                vibrate();
                            }}
                        >
                            USD
                        </button>
                    </div>
                </div>
            }

            <div className="relative" ref={chartContainerRef}>
                {datasets.length === 0 ? (
                    <div>No data available</div>
                ) : (
                    <Line ref={chartRef} data={data} options={options} />
                )}
            </div>

            <div className="mb-1 mt-5 flex flex-col">
                <div className="w-full flex flex-row justify-between gap-x-3">
                    <button
                        className={`w-full text-sm h-10 ${listType === 'all' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                        onClick={() => {
                            if (lifeData.length > 0) setListType('all');
                            vibrate();
                        }}
                    >
                        All
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType === '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                        onClick={() => {
                            if (lifeData.length > 0) setListType('1m');
                            vibrate();
                        }}
                    >
                        1m
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType === '1w' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                        onClick={() => {
                            if (weekData.length > 0) setListType('1w');
                            vibrate();
                        }}
                    >
                        1w
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType === '24h' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                        onClick={() => {
                            if (weekData.length > 0) setListType('24h');
                            vibrate();
                        }}
                    >
                        24h
                    </button>
                </div>
            </div>
        </div>
    );
}