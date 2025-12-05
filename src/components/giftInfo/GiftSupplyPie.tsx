"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useTranslations } from "next-intl";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GiftSupplyPieProps {
  initSupply: number;
  supply: number;
  upgradedSupply: number;
}

export default function GiftSupplyPie({
  initSupply,
  supply,
  upgradedSupply,
}: GiftSupplyPieProps) {
  const translate = useTranslations("giftInfo");

  const burnedSupply = initSupply - supply;
  const notUpgraded = supply - upgradedSupply;

  const pct = (v: number) =>
    initSupply > 0 ? ((v / initSupply) * 100).toFixed(2) + "%" : "0%";

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e"]; // blue, red, green

  const data = {
    labels: [],
    datasets: [
      {
        data: [notUpgraded, burnedSupply, upgradedSupply],
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS, // <—— ensures no fading or desaturation
        borderWidth: 0,
        hoverOffset: 0, // <—— prevents slice from lifting / shadowing
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className='w-full lg:w-1/2 flex flex-row gap-x-3 rounded-3xl p-3 bg-secondaryTransparent'>
      <div className='w-full'>
        <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1 border-b-2 border-background dark:border-secondary'>
          <span className='w-full text-secondaryText'>
            {translate("upgraded")}
          </span>
          <span>{pct(upgradedSupply)}</span>
        </div>

        <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1 border-b-2 border-background dark:border-secondary'>
          <span className='w-full text-secondaryText'>
            {translate("notUpgraded")}
          </span>
          <span>{pct(notUpgraded)}</span>
        </div>

        <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1'>
          <span className='w-full text-secondaryText'>
            {translate("burnt")}
          </span>
          <span>{pct(burnedSupply)}</span>
        </div>
      </div>

      <div className='w-full flex items-center justify-center'>
        <Pie data={data} options={options} width={150} height={150} />
      </div>
    </div>
  );
}
