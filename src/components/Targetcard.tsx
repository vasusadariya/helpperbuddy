import React from "react";
import { MoreVertical } from "lucide-react";
import { PieChart } from "react-minimal-pie-chart";

const TargetCard: React.FC = () => {
  const percentage = 75.55;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Monthly Target</h3>
          <p className="text-gray-500">Target you&apos;ve set for each month</p>
        </div>
        <button>
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Semi-circle progress bar with smooth curve and large size */}
      <div className="relative flex justify-center my-8">
        <div className="w-60 h-80 overflow-hidden"> {/* Increased size */}
          <PieChart
            data={[
              { value: percentage, color: "#6366F1" }, // Progress color
              { value: 100 - percentage, color: "#E5E7EB" }, // Remaining color
            ]}
            totalValue={100}
            startAngle={180} // Starts from left
            lengthAngle={180} // Makes it a semi-circle
            lineWidth={10} // Thicker for a smooth curve
            animate
            rounded // Ensures rounded edges for smoothness
          />
        </div>

        {/* Centered text under the semi-circle */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center mt-14">
          <span className="text-4xl font-semibold">{percentage}%</span>
          <span className="text-green-500 text-lg">+10%</span>
        </div>
      </div>

      <p className="text-center text-gray-600">
        You earn $3287 today, it&apos;s higher than last month. Keep up your good work!
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-gray-500">Target</p>
          <p className="font-semibold">$20K <span className="text-red-500">↓</span></p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Revenue</p>
          <p className="font-semibold">$20K <span className="text-green-500">↑</span></p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Today</p>
          <p className="font-semibold">$20K <span className="text-green-500">↑</span></p>
        </div>
      </div>
    </div>
  );
};

export default TargetCard;
