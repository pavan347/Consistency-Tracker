import React from 'react';
import Badge from './ui/Badge';
import Button from './ui/Button';

const HabitCard = ({ habit, log, isToday, onToggle }) => {
    const status = log?.status;
    const streak = habit.currentStreak || 0;

    return (
        <div className={`card-brutal p-4 flex items-center justify-between gap-3 animate-slide-up ${status === 'done' ? 'bg-emerald-50' : status === 'missed' ? 'bg-red-50' : 'bg-surface'
            }`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base truncate">{habit.name}</h3>
                    {streak > 0 && (
                        <Badge variant="streak">🔥 {streak}</Badge>
                    )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {habit.scheduledDays.map((day) => (
                        <span
                            key={day}
                            className="text-[10px] font-bold uppercase bg-bg-dark text-text-muted px-1.5 py-0.5 rounded border border-(--color-border)"
                        >
                            {day}
                        </span>
                    ))}
                </div>
            </div>

            {/* Status Toggle (only for today) */}
            {isToday ? (
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onToggle(habit._id, 'done')}
                        className={`w-10 h-10 flex items-center justify-center text-lg border-3 border-[var(--color-border)] rounded-[var(--radius-brutal)] transition-all ${status === 'done'
                            ? 'bg-[var(--color-success)] text-white shadow-[var(--shadow-brutal-sm)]'
                            : 'bg-[var(--color-surface)] hover:bg-emerald-100'
                            }`}
                    >
                        ✓
                    </button>
                    <button
                        onClick={() => onToggle(habit._id, 'missed')}
                        className={`w-10 h-10 flex items-center justify-center text-lg border-3 border-[var(--color-border)] rounded-[var(--radius-brutal)] transition-all ${status === 'missed'
                            ? 'bg-[var(--color-danger)] text-white shadow-[var(--shadow-brutal-sm)]'
                            : 'bg-[var(--color-surface)] hover:bg-red-100'
                            }`}
                    >
                        ✗
                    </button>
                </div>
            ) : (
                <div className="shrink-0">
                    {status === 'done' ? (
                        <Badge variant="success">✓ Done</Badge>
                    ) : status === 'missed' ? (
                        <Badge variant="danger">✗ Missed</Badge>
                    ) : (
                        <Badge variant="default">—</Badge>
                    )}
                </div>
            )}
        </div>
    );
};

export default HabitCard;
