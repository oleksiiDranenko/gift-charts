'use client'

import useVibrate from "@/hooks/useVibrate"
import { IndexDataInterface } from "@/interfaces/IndexDataInterface"
import { IndexInterface } from "@/interfaces/IndexInterface"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
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
import { useAppSelector } from "@/redux/hooks"

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, CategoryScale, Filler);

interface PropsInterface {
    index: IndexInterface,
    indexData: IndexDataInterface[]
}

export default function IndexChart({ index, indexData }: PropsInterface) {
    const vibrate = useVibrate()
    const giftsList = useAppSelector((state) => state.giftsList)
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ChartJS<"line">>(null);
    
    const [selectedPrice, setSelectedPrice] = useState<'ton' | 'usd'>('ton')
    const [percentChange, setPercentChange] = useState<number>(0)
    const [list, setList] = useState<IndexDataInterface[]>(indexData)
    const [listType, setListType] = useState<'1w' | '1m' | '3m' | 'all'>('1w')
    const [low, setLow] = useState<number>()
    const [high, setHigh] = useState<number>()
    const [gradient, setGradient] = useState<CanvasGradient | null>(null);
    const [newData, setNewData] = useState<IndexDataInterface>()

    // Prevent scroll when interacting with chart
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
    }, [])

    // Create gradient when percentChange changes
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        
        const topColor = percentChange >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        const bottomColor = percentChange >= 0 ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)';
        
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        setGradient(gradient);
    }, [percentChange]);

    // Calculate newData and append it to list on mount
    useEffect(() => {
        // Filter out preSale gifts
        const nonPreSaleGifts = giftsList.filter(gift => !gift.preSale);

        if (index.shortName === 'TMI') {
            let totalSupply = 0;
            for (let gift of nonPreSaleGifts) {
                totalSupply += gift.supply || 0;
            }
        
            if (totalSupply === 0) {
                const zeroData = {
                    _id: index._id,
                    indexId: index._id,
                    date: 'today',
                    priceTon: 0,
                    priceUsd: 0
                };
                setList([...indexData, zeroData]);
                setNewData(zeroData);
                return;
            }

            let currentTon = 0;
            let currentUsd = 0;
            for (let gift of nonPreSaleGifts) {
                const supply = gift.supply || 0;
                const priceTon = gift.priceTon || 0;
                const priceUsd = gift.priceUsd || 0;
                currentTon += (priceTon * supply * 100) / totalSupply;
                currentUsd += (priceUsd * supply * 100) / totalSupply;
            }
        
            currentTon = parseFloat(currentTon.toFixed(4));
            currentUsd = parseFloat(currentUsd.toFixed(4));
        
            const newDataPoint = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setNewData(newDataPoint);
            setList([...indexData, newDataPoint]); // Append newData on mount
        } 
        else if (index.shortName === 'R10') {
            let totalSupply = 0;
            for (let gift of nonPreSaleGifts) {
                if (gift.supply <= 10000) {
                    totalSupply += gift.supply || 0;
                }
            }
        
            if (totalSupply === 0) {
                const zeroData = {
                    _id: index._id,
                    indexId: index._id,
                    date: 'today',
                    priceTon: 0,
                    priceUsd: 0
                };
                setList([...indexData, zeroData]);
                setNewData(zeroData);
                return;
            }

            let currentTon = 0;
            let currentUsd = 0;
            for (let gift of nonPreSaleGifts) {
                if (gift.supply <= 10000) {
                    const supply = gift.supply || 0;
                    const priceTon = gift.priceTon || 0;
                    const priceUsd = gift.priceUsd || 0;
                    currentTon += (priceTon * supply * 10) / totalSupply;
                    currentUsd += (priceUsd * supply * 10) / totalSupply;
                }
            }
        
            currentTon = parseFloat(currentTon.toFixed(4));
            currentUsd = parseFloat(currentUsd.toFixed(4));

            const newDataPoint = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setNewData(newDataPoint);
            setList([...indexData, newDataPoint]); // Append newData on mount
        }    
        else if (index.shortName === 'TMC') {
            let currentTon = 0;
            let currentUsd = 0;
            for (let gift of nonPreSaleGifts) {
                const supply = gift.supply || 0;
                const priceTon = gift.priceTon || 0;
                const priceUsd = gift.priceUsd || 0;
                currentTon += priceTon * supply;
                currentUsd += priceUsd * supply;
            }

            const newDataPoint = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setNewData(newDataPoint);
            setList([...indexData, newDataPoint]); // Append newData on mount
        }
    }, [giftsList, index, indexData]);

    // Update list based on listType
    useEffect(() => {
        if (!newData) return;

        switch (listType) {
            case '1w':
                setList([...indexData.slice(-7), newData]);
                break;
            case '1m':
                setList([...indexData.slice(-30), newData]);
                break;
            case '3m':
                setList([...indexData.slice(-90), newData]);
                break;
            case 'all':
                setList([...indexData, newData]);
                break;
            default:
                break;
        }
    }, [listType, indexData, newData]);

    useEffect(() => {
        if (list.length === 0) return;

        const prices = list.map((item) => selectedPrice === 'ton' ? item.priceTon : item.priceUsd);

        if (selectedPrice === 'ton') {
            const firstData = list[0].priceTon;
            const lastData = list[list.length - 1].priceTon;
            const result = firstData === 0 ? 0 : parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));
            setPercentChange(result);
            setLow(Math.min(...prices));
            setHigh(Math.max(...prices));
        } else {
            const firstData = list[0].priceUsd;
            const lastData = list[list.length - 1].priceUsd;
            const result = firstData === 0 ? 0 : parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));
            setPercentChange(result);
            setLow(Math.min(...prices));
            setHigh(Math.max(...prices));
        }
    }, [selectedPrice, list]);

    const formatNumber = (number: number) => {
        if (number >= 1000 && number < 1000000 ) {
            const shortNumber = (number / 1000).toFixed(1);
            return `${shortNumber}K`;
        } else if (number >= 1000000) {
            const shortNumber = (number / 1000000).toFixed(1);
            return `${shortNumber}M`;
        }
        return number.toString();
    }

    const formatNumberWithDots = (number: number) => {
        const formattedNumber = new Intl.NumberFormat('de-DE').format(number);
        return formattedNumber;
    }

    const data = {
        labels: list.map((item) => {
            return item.date.slice(0,5);
        }),
        datasets: [
            {
                label: "Index Price",
                data: list.map((item) => {
                    return selectedPrice === 'ton' ? item.priceTon : item.priceUsd;
                }),                
                borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444", 
                borderWidth: 1,
                tension: 0, 
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: true,
                backgroundColor: gradient || (percentChange >= 0 
                    ? "rgba(34, 197, 94, 0.2)" 
                    : "rgba(239, 68, 68, 0.2)"),
                pointBackgroundColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                enabled: true, 
                mode: "index", 
                intersect: false, 
                callbacks: {
                    title: function (tooltipItems) {
                        const item = list[tooltipItems[0].dataIndex];
                        return item.date;
                    },
                    label: function (tooltipItem) {
                        return `Price: ${tooltipItem.raw} ${selectedPrice == 'ton' ? 'TON' : 'USD'}`;
                    },
                },
                external: function (context) {
                    const { chart, tooltip } = context;
                    const ctx = chart.ctx;
                    if (!tooltip || !tooltip.opacity) {
                        return;
                    }
                    const tooltipX = tooltip.caretX;
                    const tooltipY = tooltip.caretY;
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; 
                    ctx.moveTo(tooltipX, chart.chartArea.top);
                    ctx.lineTo(tooltipX, chart.chartArea.bottom);
                    ctx.moveTo(chart.chartArea.left, tooltipY);
                    ctx.lineTo(chart.chartArea.right, tooltipY);
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
                    maxTicksLimit: 3,
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
                    callback: function (value) {
                        return formatNumber(Number(value));
                    }
                },
                position: "right",
                suggestedMax: Math.max(...data.datasets[0].data) * 1.1,
                suggestedMin: Math.min(...data.datasets[0].data) * 0.9,
            },
        }
    };

    return (
        <div className="h-auto w-full pl-3 pr-3">
            <div className="w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center">
                <div className="h-full flex items-center">
                    <h1 className="flex flex-col">
                        <span className="text-xl font-bold">
                            {'📊 ' + index.shortName}
                        </span>
                        <span className="text-slate-500 text-sm flex justify-start">
                            {index.name}
                        </span>
                    </h1>
                </div>
                <div className="w-1/2 h-14 flex flex-row items-center justify-center bg-slate-800 bg-opacity-50 rounded-lg">
                    {
                        selectedPrice == 'ton' 
                        ? <Image 
                            alt="ton logo"
                            src='/images/ton.webp'
                            width={14}
                            height={14}
                            className="mr-1"
                          /> 
                        : <span className="text-base font-extrabold mr-1">$</span>
                    }
                    <span className="text-base font-extrabold">
                        {
                            selectedPrice == 'ton' 
                            ? formatNumberWithDots(Number(list[list.length -1]?.priceTon))
                            : formatNumberWithDots(Number(list[list.length -1]?.priceUsd))
                        }
                    </span>
                </div>
            </div>
        
            <div className="w-full mb-2 mt-5 flex flex-row justify-between">
                <div className="w-1/2 flex flex-row box-border">
                    <button 
                        className={`w-2/5 text-sm h-10 box-border ${selectedPrice == 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => {
                            setSelectedPrice('ton')
                            vibrate()
                        }}
                    >
                        TON
                    </button>
                    <button 
                        className={`w-2/5 text-sm h-10 box-border ${selectedPrice == 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                        onClick={() => {
                            setSelectedPrice('usd')
                            vibrate()
                        }}
                    >
                        USD
                    </button>
                </div>
                
                <div className="w-1/3 h-10 flex items-center justify-center">
                    <span className={`text-sm font-bold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {(percentChange > 0 ? '+' : '') + percentChange + '%'}
                    </span>
                </div>
            </div>
                
            <div className="w-full" ref={chartContainerRef}>
                <Line 
                    ref={chartRef}
                    data={data} 
                    options={options}
                />
            </div>
        
            <div className="w-full flex flex-row justify-between mt-3 gap-x-3">
                <span className="w-1/2 flex justify-center items-center h-10 bg-red-600 bg-opacity-40 rounded-lg">
                    Low: {low ? formatNumberWithDots(low) : null}
                </span>
                <span className="w-1/2 flex justify-center items-center h-10 bg-green-600 bg-opacity-40 rounded-lg">
                    High: {high ? formatNumberWithDots(high) : null}
                </span>
            </div>

            <div className="mb-1 mt-5 flex flex-col">
                <div className="w-full flex flex-row justify-between gap-x-3">
                    <button
                        className={`w-full text-sm h-10 ${listType == 'all' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                        onClick={() => {
                            setListType('all')
                            vibrate()
                        }}
                    >
                        All
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType == '3m' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                        onClick={() => {
                            setListType('3m')
                            vibrate()
                        }}
                    >
                        3m
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType == '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                        onClick={() => {
                            setListType('1m')
                            vibrate()
                        }}
                    >
                        1m
                    </button>
                    <button
                        className={`w-full text-sm h-10 ${listType == '1w' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                        onClick={() => {
                            setListType('1w')
                            vibrate()
                        }}
                    >
                        1w
                    </button>
                </div>
            </div>
        
            <div className="w-full p-3 mt-5 bg-slate-800 bg-opacity-50 rounded-lg">
                <h1 className="font-bold text-lg">
                    {index.name}
                </h1>
                <p className="font-light mt-3 text-slate-500">
                    {index.description}
                </p>
            </div>
        </div>
    )
}