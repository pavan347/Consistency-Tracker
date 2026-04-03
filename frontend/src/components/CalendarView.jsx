import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './ui/Card';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getColor = (percentage) => {
    if (percentage === -1) return 'var(--color-bg-dark)'; // No habits scheduled
    if (percentage === 0) return 'var(--color-heat-0)';
    if (percentage <= 25) return 'var(--color-heat-1)';
    if (percentage <= 50) return 'var(--color-heat-2)';
    if (percentage <= 75) return 'var(--color-heat-3)';
    return 'var(--color-heat-4)';
};

const CalendarView = ({ data = [], onDateClick, selectedDate }) => {
    const today = new Date();
    // Initialize viewDate using UTC to avoid local timezone shifts during month transitions
    const [viewDate, setViewDate] = useState(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));

    const { calendarDays, currentMonthName, currentYear } = useMemo(() => {
        const year = viewDate.getUTCFullYear();
        const month = viewDate.getUTCMonth();

        // Map data by date for quick lookup
        const dataMap = {};
        data.forEach((d) => {
            dataMap[d.date] = d;
        });

        // Days in current month - using UTC to get current month's last day
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        // First day of month (0-6)
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();

        const cells = [];

        // Padding for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push({ isPadding: true });
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            // CRITICAL: Use Date.UTC to prevent local timezone offsets from shifting the date
            const dateObj = new Date(Date.UTC(year, month, day));
            const dateStr = dateObj.toISOString().split('T')[0];
            const entry = dataMap[dateStr];

            cells.push({
                day,
                date: dateStr,
                percentage: entry ? entry.percentage : -1,
                isToday: dateStr === today.toISOString().split('T')[0],
                isSelected: dateStr === selectedDate,
                isFuture: dateObj > today,
            });
        }

        return {
            calendarDays: cells,
            currentMonthName: MONTHS[month],
            currentYear: year,
        };
    }, [viewDate, data, selectedDate]);

    const changeMonth = (offset) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    return (
        <div className="animate-fade-in">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {currentMonthName} {currentYear}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 rounded-md border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-dark)] transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1 rounded-md border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-dark)] transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day Labels */}
                {DAYS.map((day) => (
                    <div key={day} className="text-[10px] font-bold text-center text-[var(--color-text-muted)] uppercase mb-1">
                        {day}
                    </div>
                ))}

                {/* Day Cells */}
                {calendarDays.map((cell, index) => (
                    <div
                        key={index}
                        className={`
                            aspect-square flex items-center justify-center text-xs font-mono rounded-sm border-2 transition-all
                            ${cell.isPadding ? 'border-transparent opacity-0 pointer-events-none' : 'cursor-pointer'}
                            ${cell.isSelected ? 'border-[--color-border] scale-105 z-10 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'border-white'}
                            ${cell.isToday ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1' : ''}
                        `}
                        style={{
                            backgroundColor: cell.isPadding ? 'transparent' : getColor(cell.percentage),
                            color: cell.isPadding ? 'transparent' : (cell.percentage >= 0 ? '#fff' : 'var(--color-text-muted)'),
                            opacity: cell.isFuture ? 0.3 : 1,
                        }}
                        onClick={() => {
                            !cell.isPadding && onDateClick(cell.date)
                            console.log(cell.date);
                        }}
                    >
                        {!cell.isPadding && cell.day}
                    </div>
                ))}
            </div>

            {/* Legend (Optional, if we want to show it here too) */}
            <div className="flex items-center gap-1 mt-4 justify-end">
                <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase mr-1">Consistency</span>
                {[0, 25, 50, 75, 100].map((p, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm border border-[var(--color-border)]"
                        style={{ backgroundColor: getColor(p) }}
                    />
                ))}
            </div>
        </div>
    );
};

export default CalendarView;
