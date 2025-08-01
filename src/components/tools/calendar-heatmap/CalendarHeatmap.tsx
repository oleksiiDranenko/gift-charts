'use client'

import Image from "next/image";

// Define the shape of the data
interface MonthlyData {
  month: string; // e.g., "Jan", "Feb"
  percentChange: number; // e.g., 5.2 for +5.2%, -3.4 for -3.4%
}

// Props for the CalendarHeatmap component
interface CalendarHeatmapProps {
  data?: MonthlyData[]; // Optional data prop
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  // Test data for all 12 months
  const testData: MonthlyData[] = [
    { month: 'Jan', percentChange: 5.2 },
    { month: 'Feb', percentChange: -3.4 },
    { month: 'Mar', percentChange: 0 },
    { month: 'Apr', percentChange: 2.1 },
    { month: 'May', percentChange: -1.8 },
    { month: 'Jun', percentChange: 4.0 },
    { month: 'Jul', percentChange: -0.5 },
    { month: 'Aug', percentChange: 3.3 },
    { month: 'Sep', percentChange: -2.7 },
    { month: 'Oct', percentChange: 1.5 },
    { month: 'Nov', percentChange: -4.1 },
    { month: 'Dec', percentChange: 0.8 },
  ];

  // Use provided data or fall back to test data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const completeData = months.map((month, index) => {
    const found = (data || testData).find((item) => item.month === month);
    return {
      month,
      percentChange: found ? found.percentChange : 0,
    };
  });

  // Function to determine background color based on percent change
  const getColor = (percentChange: number): string => {
    if (percentChange > 0) {
      // Green shades for positive change
      return 'bg-green-500';
    } else if (percentChange < 0) {
      // Red shades for negative change
      return 'bg-red-500';
    } else {
      // Neutral for no change
      return 'bg-gray-300';
    }
  };

  return (
    <div className='w-full mt-3'>
			<div className="mb-3">
				<div className="w-full flex items-center">
														<Image
																alt="gift"
																src={`/gifts/plushPepe.webp`}
																width={55}
																height={55}
																className={`mr-3 p-1 rounded-lg bg-secondaryTransparent `}
														/>
														<h1 className="flex flex-col">
																<span className="text-xl font-bold">
																		Plush Pepe
																</span>
																<span className="text-secondaryText text-sm flex justify-start">
																		Yearly performance
																</span>
														</h1>
												</div>
			</div>
			<div className="w-full bg-secondaryTransparent rounded-lg overflow-hidden">
			<div className='text-secondaryText p-1 text-center'>
				2025
			</div>
      <div className="grid grid-cols-4 md:grid-cols-6">
        {completeData.map((item, index) => (
          <div
            key={index}
            className={`aspect-square flex flex-col border border-background items-center justify-center text-xl ${getColor(
              item.percentChange
            )}`}
            title={`${item.month}: ${item.percentChange.toFixed(2)}%`} // Tooltip for details
          >
            <span className="text-base font-bold">{item.month}</span>
            <span className="text-sm">
              {item.percentChange > 0 ? '+' : ''}
              {item.percentChange.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
		</div>
  );
};

export default CalendarHeatmap;