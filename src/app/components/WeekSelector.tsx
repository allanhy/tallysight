import React from 'react';
import { WeekSelectorProps } from '@/app/types/components';

// This component lets users pick a week (current or past)
export default function WeekSelector({ selectedWeek, onChange }: WeekSelectorProps) {
    return (
        <div className="mb-6 bg-black">
            <select 
                value={selectedWeek === 'current' ? 'current' : selectedWeek}
                onChange={(e) => {
                    const value = e.target.value;
                    onChange(value === 'current' ? 'current' : Number(value));
                }}
                className="p-3 rounded-lg bg-gradient-to-r from-gray-900 to-black 
                          text-black font-medium text-lg shadow-lg
                          border-2 border-blue-400 hover:border-blue-300
                          focus:outline-none focus:ring-2 focus:ring-blue-400 
                          cursor-pointer min-w-[200px] transition-all duration-200
                          hover:shadow-blue-500/25 hover:shadow-xl
                          appearance-none [&>option]:bg-black [&>option]:text-white"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                }}
            >
                <option value="current" className="bg-black text-white">🏆 Current Week</option>
                {[...Array(4)].map((_, i) => (
                    <option key={`week-${i + 1}`} value={i + 1} className="bg-black text-white">
                        🏆 Week {i + 1}
                    </option>
                ))}
            </select>
        </div>
    );
}