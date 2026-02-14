import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, selected }) => {
  // Determine style based on type (mission, alley, locked, burned)
  // We'll use data.burnState or data.type to differentiate visuals if needed
  // Default to "Mission" style (Gold)

  const isBurned = data.isBurned;
  const isAlley = data.type === 'alley';

  let mainColor = 'text-yellow-500';
  let borderColor = 'border-yellow-500';
  let bgColor = 'bg-yellow-500/10';
  let icon = 'priority_high';
  let subText = 'Active Path';

  if (isBurned) {
      mainColor = 'text-red-500';
      borderColor = 'border-gray-600';
      bgColor = 'bg-gray-800/50';
      icon = 'lock_reset';
      subText = 'Thread Burned';
  } else if (isAlley) {
      mainColor = 'text-green-500';
      borderColor = 'border-green-500/50';
      bgColor = 'bg-green-500/10';
      icon = 'psychology';
      subText = 'Side Content';
  }

  return (
    <div className={`relative flex flex-col items-center gap-2 transition-opacity duration-300 ${isBurned ? 'opacity-60 grayscale' : 'opacity-100'}`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />

      {/* Box */}
      <div className={`w-16 h-16 rounded-xl bg-[#101622] border-2 flex items-center justify-center shadow-2xl transition-all duration-300 ${selected ? 'border-white shadow-lg shadow-white/20' : borderColor}`}>
        <span className={`material-symbols-outlined text-2xl ${isBurned ? 'text-gray-400' : mainColor}`}>
            {icon}
        </span>
      </div>

      {/* Label Badge */}
      <div className={`${bgColor} backdrop-blur px-3 py-1 rounded border ${isBurned ? 'border-gray-700' : borderColor.replace('border-', 'border-') + '/30'}`}>
        <span className={`${isBurned ? 'text-gray-400' : mainColor} font-bold text-xs uppercase whitespace-nowrap`}>
            {data.label}
        </span>
      </div>

      {/* Subtext */}
      {subText && (
         <div className={`flex items-center gap-1 text-[10px] uppercase font-bold ${isBurned ? 'text-red-500' : mainColor + '/80'}`}>
            {isBurned && <span className="material-symbols-outlined text-[10px]">local_fire_department</span>}
            {!isBurned && isAlley && <span className="material-symbols-outlined text-[10px]">check_circle</span>}
            <span>{subText}</span>
         </div>
      )}
    </div>
  );
});
