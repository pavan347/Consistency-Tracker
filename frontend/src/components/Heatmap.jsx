import React, { useState, useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColor = (percentage) => {
    if (percentage === -1) return 'var(--color-bg-dark)'; // No habits scheduled
    if (percentage === 0) return 'var(--color-heat-0)';
    if (percentage <= 25) return 'var(--color-heat-1)';
    if (percentage <= 50) return 'var(--color-heat-2)';
    if (percentage <= 75) return 'var(--color-heat-3)';
    return 'var(--color-heat-4)';
};

const Heatmap = ({ data = [], onDateClick, selectedDate }) => {
    const [tooltip, setTooltip] = useState(null);

    // Build the grid: 53 columns × 7 rows
    const { grid, monthLabels } = useMemo(() => {
        if (!data.length) return { grid: [], monthLabels: [] };

        // Map data by date for quick lookup
        const dataMap = {};
        data.forEach((d) => {
            dataMap[d.date] = d;
        });

        // Start from 364 days ago, find the Sunday of that week
        const today = new Date();
        const startDate = new Date(today);
        startDate.setUTCDate(startDate.getUTCDate() - 364);

        // Align to start of week (Sunday)
        const dayOfWeek = startDate.getUTCDay();
        startDate.setUTCDate(startDate.getUTCDate() - dayOfWeek);

        const weeks = [];
        const months = [];
        let currentDate = new Date(startDate);
        let lastMonth = -1;

        while (currentDate <= today) {
            const week = [];
            for (let day = 0; day < 7; day++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const entry = dataMap[dateStr];

                week.push({
                    date: dateStr,
                    percentage: entry ? entry.percentage : -1,
                    scheduled: entry ? entry.scheduled : 0,
                    completed: entry ? entry.completed : 0,
                    isFuture: currentDate > today,
                    isBeforeData: !entry && currentDate < new Date(data[0]?.date + 'T00:00:00Z'),
                });

                // Track month labels
                const month = currentDate.getUTCMonth();
                if (month !== lastMonth) {
                    months.push({ label: MONTHS[month], weekIndex: weeks.length });
                    lastMonth = month;
                }

                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
            weeks.push(week);
        }

        return { grid: weeks, monthLabels: months };
    }, [data]);

    const scrollRef = React.useRef(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [grid]);

    if (!data.length) {
        return (
            <div className="text-center py-8 text-[var(--color-text-muted)] text-sm font-mono">
                No data yet. Start tracking to see your heatmap!
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex gap-0">
                {/* Day labels (fixed left column) */}
                <div className="flex flex-col gap-[2px] mr-1 shrink-0">
                    {/* Month row spacer */}
                    <div className="h-[14px]" />
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <div key={i} className="h-[12px] text-[9px] font-bold text-[var(--color-text-muted)] leading-[12px] uppercase">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Scrollable area containing both month labels AND grid */}
                <div
                    ref={scrollRef}
                    className="overflow-x-auto flex-1 scroll-smooth"
                >
                    <div className="flex gap-[2px]" style={{ width: 'fit-content' }}>
                        {grid.map((week, wi) => {
                            // Check if this week starts a new month
                            // Only show labels that aren't the very first one if it's at index 0 to avoid duplicates in 365-day view
                            const monthLabel = monthLabels.find((m) => m.weekIndex === wi && (wi > 0 || monthLabels.length < 12));

                            return (
                                <div key={wi} className="flex flex-col gap-[2px]">
                                    {/* Month label row */}
                                    <div className="h-[14px] flex items-end">
                                        {monthLabel && (
                                            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase whitespace-nowrap">
                                                {monthLabel.label}
                                            </span>
                                        )}
                                    </div>
                                    {/* Day cells */}
                                    {week.map((day, di) => (
                                        <div
                                            key={`${wi}-${di}`}
                                            onClick={() => onDateClick && onDateClick(day.date)}
                                            className={`w-[12px] h-[12px] rounded-sm border cursor-pointer transition-all hover:scale-150 hover:z-10 ${selectedDate === day.date
                                                    ? 'border-white border-2 scale-110 z-10 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                                    : 'border-[var(--color-border)]'
                                                }`}
                                            style={{
                                                backgroundColor: day.isFuture ? 'transparent' : getColor(day.percentage),
                                                opacity: day.isFuture ? 0.2 : 1,
                                            }}
                                            onMouseEnter={(e) => {
                                                const rect = e.target.getBoundingClientRect();
                                                setTooltip({
                                                    x: rect.left + rect.width / 2,
                                                    y: rect.top - 8,
                                                    date: day.date,
                                                    percentage: day.percentage,
                                                    scheduled: day.scheduled,
                                                    completed: day.completed,
                                                });
                                            }}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Color legend */}
            <div className="flex items-center gap-1 mt-3 justify-end">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] mr-1">Less</span>
                {[
                    'var(--color-heat-0)',
                    'var(--color-heat-1)',
                    'var(--color-heat-2)',
                    'var(--color-heat-3)',
                    'var(--color-heat-4)',
                ].map((color, i) => (
                    <div
                        key={i}
                        className="w-[12px] h-[12px] rounded-sm border border-[var(--color-border)]"
                        style={{ backgroundColor: color }}
                    />
                ))}
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] ml-1">More</span>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 bg-[var(--color-text)] text-white px-3 py-2 rounded-md text-xs font-mono pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="font-bold">{tooltip.date}</div>
                    {tooltip.percentage >= 0 ? (
                        <div>{tooltip.completed}/{tooltip.scheduled} done ({tooltip.percentage}%)</div>
                    ) : (
                        <div>No habits scheduled</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Heatmap;
