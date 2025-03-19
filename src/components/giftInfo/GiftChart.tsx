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
} from "chart.js";

import GiftInterface from "@/interfaces/GiftInterface"
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface"
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface"
import { useEffect, useState } from "react"
import Image from "next/image";


ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, CategoryScale);

interface PropsInterface {
    gift: GiftInterface | null,
    weekData: GiftWeekDataInterface[],
    lifeData: GiftLifeDataInterface[]
}

export default function GiftChart ({gift, weekData, lifeData}: PropsInterface) {
    
    const [selectedPrice, setSelectedPrice] = useState<'ton' | 'usd'>('ton')
    const [percentChange, setPercentChange] = useState<number>(0)
    const [list, setList] = useState<GiftLifeDataInterface[] | GiftWeekDataInterface[]>(weekData.slice(-24))
    const [listType, setListType] = useState<'24h' | '1w' | '1m' | 'all'>('24h')


    useEffect(() => {
        if(selectedPrice == 'ton') {
            const firstData = list[0].priceTon;
            const lastData = list[list.length - 1].priceTon;

            const result = parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));

            setPercentChange(result)
        } else {
            const firstData = list[0].priceUsd;
            const lastData = list[list.length - 1].priceUsd;

            const result = parseFloat(((lastData - firstData) / firstData * 100).toFixed(2));

            setPercentChange(result)
        }

    }, [selectedPrice, list])


    useEffect(() => {

        switch(listType) {
            case '24h': 
                setList(weekData.slice(-24))
                break;
            case '1w':
                setList(weekData)
                break;
            case '1m':
                setList(lifeData.slice(-30))
                break;
            case 'all':
                setList(lifeData)
                break;
        }

    }, [listType])

    const formatNumber = (number: number) => {
        if (number >= 1000) {
            const shortNumber = (number / 1000).toFixed(1);
            return `${shortNumber}K`;
          }
        return number.toString();
    }


    const data = {
        labels: list.map((item) => {
            return listType === '24h' ? item.time : item.date.slice(0,5)
        }),

        datasets: [
            {
                label: "Gift Price",
                data: list.map((item) => {
                    return selectedPrice == 'ton' ?  item.priceTon : item.priceUsd
                }),
                borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444", 
                borderWidth: 1,
                tension: 0, 
                pointRadius: 0,
                pointHoverRadius: 6,
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
                        return list[tooltipItems[0].dataIndex].date;
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
            ticks: { color: "rgba(255, 255, 255, 0.6)", padding: 10 },
            position: "right",
            suggestedMax: Math.max(...data.datasets[0].data) * 1.1,
        },
    }
  };
  

  return (
    <div className="h-screen w-screen pl-3 pr-3">

        <div className="w-full h-16 mt-5 flex flex-row justify-between items-center">
            <div className="h-full flex items-center">
                <Image 
                    alt="gift"
                    src={`/gifts/${gift?.image}.webp`}
                    width={55}
                    height={55}
                    className="mr-3 bg-slate-800 p-1 rounded-lg"
                />
                <h1 className="flex flex-col">
                    <span className="text-xl font-bold">
                        {gift?.name}
                    </span>
                    <span className="text-slate-500 text-sm flex justify-start">
                        {gift ? formatNumber(gift?.supply) : null}
                    </span>
                </h1>
            </div>
            <div className="w-1/3 h-14 flex flex-row items-center justify-center bg-slate-800 rounded-lg">
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
                        ? list[list.length -1]?.priceTon 
                        : list[list.length -1]?.priceUsd
                    }
                </span>
            </div>
        </div>


        <div className="w-full mb-2 mt-5 flex flex-row justify-between">
            <div className="w-1/2 flex flex-row box-border">
                <button 
                    className={`w-2/5 text-sm  h-10 box-border ${selectedPrice == 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                    onClick={() => setSelectedPrice('ton')}
                >
                    TON
                </button>
                <button 
                    className={`w-2/5 text-sm  h-10 box-border ${selectedPrice == 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : null }`}
                    onClick={() => setSelectedPrice('usd')}
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

        
        <Line 
            data={data} 
            options={options}
        />
        


        <div className="mb-1 mt-5  flex flex-col">
            <div className="w-full  flex flex-row justify-between">
                <button 
                    className={`w-1/5 text-sm  h-10  ${listType == 'all' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                    onClick={() => lifeData.length > 0 ? setListType('all') : null}
                >
                    All
                </button>
                <button 
                    className={`w-1/5 text-sm  h-10 ${listType == '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                    onClick={() => lifeData.length > 0 ? setListType('all') : null}
                >
                    1m
                </button>
                <button 
                    className={`w-1/5 text-sm h-10  ${listType == '1w' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                    onClick={() => setListType('1w')}
                >
                    1w
                </button>
                <button 
                    className={`w-1/5 text-sm  h-10  ${listType == '24h' ? 'rounded-lg bg-[#0098EA] font-bold' : null}`}
                    onClick={() => setListType('24h')}
                >
                    24h
                </button>
                                    
            </div>
        </div>
        
    </div>
);
}