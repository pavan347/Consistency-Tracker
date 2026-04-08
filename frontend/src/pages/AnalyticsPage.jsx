import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useWeeklyStats, useOverallStats } from '../hooks/apiHooks';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AnalyticsPage = () => {
    const { data: weekly, isLoading: isLoadingWeekly, isError: isErrorWeekly } = useWeeklyStats();
    const { data: overall, isLoading: isLoadingOverall, isError: isErrorOverall } = useOverallStats();

    const loading = isLoadingWeekly || isLoadingOverall;

    useEffect(() => {
        if (isErrorWeekly || isErrorOverall) {
            toast.error('Failed to load analytics');
        }
    }, [isErrorWeekly, isErrorOverall]);

    if (loading) return <><Navbar /><Loader size="lg" /></>;

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">📊 Analytics</h1>

                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Card className="bg-[var(--color-secondary)]">
                        <div className="text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1">Weekly</div>
                        <div className="text-3xl font-bold">{weekly?.weeklyConsistency || 0}%</div>
                        <div className="text-xs font-mono">consistency</div>
                    </Card>
                    <Card className="bg-[var(--color-accent)]">
                        <div className="text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1">Overall</div>
                        <div className="text-3xl font-bold">{overall?.overallConsistency || 0}%</div>
                        <div className="text-xs font-mono">consistency</div>
                    </Card>
                    <Card className="bg-[var(--color-purple)] text-white">
                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Total Habits</div>
                        <div className="text-3xl font-bold">{overall?.totalHabits || 0}</div>
                        <div className="text-xs font-mono opacity-80">active</div>
                    </Card>
                    <Card className="bg-[var(--color-pink)] text-white">
                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Best Streak</div>
                        <div className="text-3xl font-bold">
                            🔥 {Math.max(0, ...(overall?.habitStats?.map((h) => h.currentStreak) || [0]))}
                        </div>
                        <div className="text-xs font-mono opacity-80">days</div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Breakdown */}
                    <Card>
                        <h2 className="text-lg font-bold mb-4">📅 This Week</h2>
                        <div className="space-y-2">
                            {weekly?.dailyStats?.map((day) => (
                                <div key={day.date} className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase w-8 shrink-0">{day.day}</span>
                                    <div className="flex-1 h-6 bg-[var(--color-bg-dark)] border-2 border-[var(--color-border)] rounded-md overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                                            style={{
                                                width: `${Math.max(day.percentage, 5)}%`,
                                                backgroundColor: day.percentage >= 75
                                                    ? 'var(--color-success)'
                                                    : day.percentage >= 50
                                                        ? 'var(--color-warning)'
                                                        : day.percentage > 0
                                                            ? 'var(--color-danger)'
                                                            : 'transparent',
                                            }}
                                        >
                                            {day.percentage > 15 && (
                                                <span className="text-[10px] font-bold text-white">{day.percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono shrink-0 w-12 text-right">
                                        {day.completed}/{day.scheduled}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Day of Week Patterns */}
                    <Card>
                        <h2 className="text-lg font-bold mb-4">📊 Day-of-Week Patterns</h2>
                        <div className="space-y-2">
                            {overall?.dayPatterns?.map((day) => (
                                <div key={day.day} className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase w-8 shrink-0">{day.day}</span>
                                    <div className="flex-1 h-8 bg-[var(--color-bg-dark)] border-2 border-[var(--color-border)] rounded-md overflow-hidden relative">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(day.percentage, 3)}%`,
                                                backgroundColor: 'var(--color-purple)',
                                            }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                                            {day.percentage}% ({day.done}/{day.total})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {overall?.dayPatterns && (
                            <div className="mt-3 p-2 bg-[var(--color-bg-dark)] rounded-md border-2 border-[var(--color-border)]">
                                <p className="text-xs font-mono text-[var(--color-text-muted)]">
                                    💡 Best day:{' '}
                                    <span className="font-bold text-[var(--color-text)]">
                                        {[...overall.dayPatterns].sort((a, b) => b.percentage - a.percentage)[0]?.day}
                                    </span>{' '}
                                    | Worst day:{' '}
                                    <span className="font-bold text-[var(--color-text)]">
                                        {[...overall.dayPatterns].filter((d) => d.total > 0).sort((a, b) => a.percentage - b.percentage)[0]?.day || '—'}
                                    </span>
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Habit Rankings */}
                    <Card className="lg:col-span-2">
                        <h2 className="text-lg font-bold mb-4">🏆 Habit Rankings</h2>
                        {overall?.habitStats?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {overall.habitStats
                                    .sort((a, b) => b.consistency - a.consistency)
                                    .map((stat, index) => (
                                        <div
                                            key={stat.habitId}
                                            className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-[var(--radius-brutal)]"
                                        >
                                            <span className="text-lg font-bold w-6 text-center shrink-0">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate">{stat.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant={stat.consistency >= 75 ? 'success' : stat.consistency >= 50 ? 'warning' : 'danger'}>
                                                        {stat.consistency}%
                                                    </Badge>
                                                    {stat.currentStreak > 0 && (
                                                        <span className="text-xs font-mono">🔥 {stat.currentStreak}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-[var(--color-text-muted)] shrink-0 text-right">
                                                {stat.totalDone}/{stat.totalLogs}
                                                <br />done
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-sm font-mono text-[var(--color-text-muted)] text-center py-4">
                                No data yet. Start tracking to see rankings!
                            </p>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsPage;
