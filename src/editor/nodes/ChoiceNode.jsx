import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * ChoiceNode - Represents a branching choice point in the narrative.
 * Has one input and multiple outputs for different options.
 */
export default memo(({ data, selected }) => {
    // Get number of options from data, default to 2
    const optionCount = data.options?.length || 2;

    return (
        <div className="relative flex flex-col items-center gap-2">
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-purple-500 !w-3 !h-3"
            />

            {/* Main Box */}
            <div className={`w-48 min-h-20 rounded-xl bg-[#101622] border-2 p-4 shadow-xl transition-all duration-300 ${selected
                    ? 'border-white shadow-lg shadow-purple-500/30'
                    : 'border-purple-500/50 hover:border-purple-500'
                }`}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-purple-500">call_split</span>
                    <span className="text-purple-400 text-[10px] uppercase font-bold tracking-wider">Choice Point</span>
                </div>

                {/* Label */}
                <div className="text-white text-sm font-medium leading-snug">
                    {data.label || 'What do you do?'}
                </div>

                {/* Options Preview */}
                {data.options && data.options.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {data.options.map((opt, i) => (
                            <div key={i} className="text-[11px] text-purple-300/70 flex items-center gap-1">
                                <span className="text-purple-500">→</span>
                                <span className="truncate">{opt || `Option ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Output handles - positioned at bottom */}
            <div className="relative w-48 h-4">
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="option_0"
                    className="!bg-purple-500 !w-2.5 !h-2.5 !-bottom-1"
                    style={{ left: '25%' }}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="option_1"
                    className="!bg-purple-500 !w-2.5 !h-2.5 !-bottom-1"
                    style={{ left: '75%' }}
                />
                {optionCount > 2 && (
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="option_2"
                        className="!bg-purple-500 !w-2.5 !h-2.5 !-bottom-1"
                        style={{ left: '50%' }}
                    />
                )}
            </div>

            {/* Decorative glow on selection */}
            {selected && (
                <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full -z-10" />
            )}
        </div>
    );
});
