import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, selected }) => {
  return (
    <div className="relative flex flex-col items-center gap-3 w-64">
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />

      {/* Visuals */}
      <div className="relative">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-blue-600/40 blur-2xl rounded-full scale-150 transition-opacity duration-500 ${selected ? 'opacity-100' : 'opacity-50'}`}></div>

        {/* Main Circle */}
        <div className={`relative w-24 h-24 rounded-full bg-[#101622] border-4 flex items-center justify-center shadow-2xl z-10 transition-colors duration-300 ${selected ? 'border-white shadow-blue-500/50' : 'border-[#2b6cee]'}`}>
          <span className="material-symbols-outlined text-4xl text-[#2b6cee]">castle</span>
        </div>
      </div>

      {/* Label Badge */}
      <div className="bg-[#101622]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#2b6cee]/50 text-white font-bold text-sm tracking-wide shadow-lg text-center min-w-[120px]">
        {data.label}
      </div>

      {/* Type Label */}
      <div className="text-[10px] text-[#2b6cee]/80 uppercase tracking-widest font-bold">Primary Hub</div>
    </div>
  );
});
