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
} from "chart.js";
import { useAppSelector } from "@/redux/hooks"

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, CategoryScale);

interface PropsInterface {
    index: IndexInterface,
    indexData: IndexDataInterface[]
}


export default function IndexChart({ index, indexData }: PropsInterface) {

    const vibrate = useVibrate()

    const giftsList = useAppSelector((state) => state.giftsList)

    const chartContainerRef = useRef<HTMLDivElement>(null);
    
    const [selectedPrice, setSelectedPrice] = useState<'ton' | 'usd'>('ton')
    const [percentChange, setPercentChange] = useState<number>(0)
    const [list, setList] = useState<IndexDataInterface[]>(indexData)
    const [listType, setListType] = useState<'1m' | '3m' | 'all'>('1m')

    const [low, setLow] = useState<number>()
    const [high, setHigh] = useState<number>()

    // prevent scroll when interacting with chart
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

    useEffect(() => {
        
        if (index.shortName === 'TMI') {
            let totalSupply = 0;
        
            for (let gift of giftsList) {
                totalSupply += gift.supply;
            }
        
            let currentTon = 0;
            let currentUsd = 0;
        
            for (let gift of giftsList) {
                const supply = gift.supply || 0;
                const priceTon = gift.priceTon || 0;
                const priceUsd = gift.priceUsd || 0;
        
                currentTon += (priceTon * supply * 100) / totalSupply;
                currentUsd += (priceUsd * supply * 100) / totalSupply;
            }
        
            currentTon = parseFloat(currentTon.toFixed(4));
            currentUsd = parseFloat(currentUsd.toFixed(4));
        
            const newData: IndexDataInterface = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setList(prev => [...prev, newData]);
        } 
        
        else if (index.shortName === 'R10') {
            let totalSupply = 0;
        
            for (let gift of giftsList) {
                if (gift.supply <= 10000) {
                    totalSupply += gift.supply;
                }
            }
        
            let currentTon = 0;
            let currentUsd = 0;
        
            for (let gift of giftsList) {
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

            const newData: IndexDataInterface = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setList(prev => [...prev, newData]);
        }    
        else if (index.shortName === 'TMC') {
            let currentTon = 0;
            let currentUsd = 0;

            for (let gift of giftsList) {
                const supply = gift.supply || 0;
                const priceTon = gift.priceTon || 0;
                const priceUsd = gift.priceUsd || 0;

                currentTon += priceTon * supply
                currentUsd += priceUsd * supply
            }

            const newData: IndexDataInterface = {
                _id: index._id,
                indexId: index._id,
                date: 'today',
                priceTon: currentTon,
                priceUsd: currentUsd
            };
            
            setList(prev => [...prev, newData]);
        }
        

    }, [])

    useEffect(() => {
        if (list.length === 0) return

        const prices = list.map((item) => selectedPrice === 'ton' ? item.priceTon : item.priceUsd);

        if (selectedPrice === 'ton') {
            const firstData = list[0].priceTon;
            const lastData = list[list.length - 1].priceTon;
            const result = parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));
            setPercentChange(result);
            setLow(Math.min(...prices));
            setHigh(Math.max(...prices));
        } else {
            const firstData = list[0].priceUsd;
            const lastData = list[list.length - 1].priceUsd;
            const result = parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));
            setPercentChange(result);
            setLow(Math.min(...prices));
            setHigh(Math.max(...prices));
        }
    }, [selectedPrice, list])



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
        return formattedNumber
    }


    const data = {
        labels: list.map((item) => {
            return item.date.slice(0,5)
        }),

        datasets: [
            {
                label: "Gift Price",
                data: list.map((item) => {
                    return selectedPrice === 'ton' ? item.priceTon : item.priceUsd
                }),                
                borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444", 
                borderWidth: 1,
                tension: 0, 
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: true,
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
                        const item = list[tooltipItems[0].dataIndex]
                        
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
            grid: { color: "rgba(255, 255, 255, 0.1)" },
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
                color: "rgba(255, 255, 255, 0.1)",
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
                            ?
                            <Image 
                                alt="ton logo"
                                src='/images/ton.webp'
                                width={14}
                                height={14}
                                className="mr-1"
                            /> 
                            :
                            <span className="text-base font-extrabold mr-1">
                                $
                            </span>
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
                            className={`w-2/5 text-sm  h-10 box-border ${selectedPrice == 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                            onClick={() => {
                                setSelectedPrice('ton')
                                vibrate()
                            }}
                        >
                            TON
                        </button>
                        <button 
                            className={`w-2/5 text-sm  h-10 box-border ${selectedPrice == 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
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
                            {
                                (percentChange > 0 ? '+' : '') + percentChange + '%'
                            }
                        </span>
                    </div>
                    
                </div>
                
        
                
                <div className="w-full" ref={chartContainerRef}>
                    <Line 
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
