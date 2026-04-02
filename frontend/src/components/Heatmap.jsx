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

const Heatmap = ({ data = [] }) => {
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

    if (!data.length) {
        return (
            <div className="text-center py-8 text-[var(--color-text-muted)] text-sm font-mono">
                No data yet. Start tracking to see your heatmap!
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Month labels */}
            <div className="flex mb-1 ml-8" style={{ gap: '0px' }}>
                {monthLabels.map((m, i) => (
                    <div
                        key={i}
                        className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase"
                        style={{
                            position: 'absolute',
                            left: `${32 + m.weekIndex * 14}px`,
                        }}
                    >
                        {m.label}
                    </div>
                ))}
            </div>

            <div className="flex gap-0 mt-5">
                {/* Day labels */}
                <div className="flex flex-col gap-[2px] mr-1 pt-0">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <div key={i} className="h-[12px] text-[9px] font-bold text-[var(--color-text-muted)] leading-[12px] uppercase">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex gap-[2px] overflow-x-auto">
                    {grid.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-[2px]">
                            {week.map((day, di) => (
                                <div
                                    key={`${wi}-${di}`}
                                    className="w-[12px] h-[12px] rounded-sm border border-[var(--color-border)] cursor-pointer transition-transform hover:scale-150 hover:z-10"
                                    style={{
                                        backgroundColor: day.isFuture ? 'transparent' : getColor(day.percentage),
                                        opacity: day.isFuture ? 0.2 : 1,
                                        borderColor: day.isFuture ? 'var(--color-bg-dark)' : 'var(--color-border)',
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
                    ))}
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
