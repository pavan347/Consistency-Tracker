import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { habitsAPI, logsAPI, analyticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import HabitCard from '../components/HabitCard';
import Heatmap from '../components/Heatmap';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const getTodayUTC = () => new Date().toISOString().split('T')[0];

const getDayAbbr = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getUTCDay()];
};

const DashboardPage = () => {
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [overallStats, setOverallStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [existingNoteLogId, setExistingNoteLogId] = useState(null);

    const today = getTodayUTC();
    const todayDay = getDayAbbr();

    const fetchData = useCallback(async () => {
        try {
            const [habitsRes, logsRes, heatmapRes, overallRes] = await Promise.all([
                habitsAPI.getAll(),
                logsAPI.getByDate(today),
                analyticsAPI.getHeatmap(),
                analyticsAPI.getOverall(),
            ]);

            setHabits(habitsRes.data);
            setLogs(logsRes.data);
            setHeatmapData(heatmapRes.data);
            setOverallStats(overallRes.data);

            // Check for existing note in today's logs
            const noteLog = logsRes.data.find((l) => l.note);
            if (noteLog) {
                setNote(noteLog.note);
                setExistingNoteLogId(noteLog._id);
            }
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [today]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggle = async (habitId, status) => {
        try {
            await logsAPI.create({ habitId, status });
            toast.success(status === 'done' ? '✓ Marked as done!' : '✗ Marked as missed');
            fetchData();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const handleNoteSave = async () => {
        if (!note.trim()) return;

        try {
            // Find a log for today to attach the note to — use the first one
            const todayLog = logs[0];
            if (todayLog) {
                await logsAPI.update(todayLog._id, { note });
                toast.success('Note saved!');
            } else {
                toast.error('Mark at least one habit first to add a note');
            }
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    // Filter today's scheduled habits
    const todayHabits = habits.filter((h) => h.scheduledDays.includes(todayDay));
    const otherHabits = habits.filter((h) => !h.scheduledDays.includes(todayDay));

    // Get stats for each habit
    const habitsWithStats = (list) =>
        list.map((h) => ({
            ...h,
            currentStreak: overallStats?.habitStats?.find((s) => s.habitId === h._id)?.currentStreak || 0,
        }));

    const completedToday = logs.filter((l) => l.status === 'done').length;
    const totalScheduledToday = todayHabits.length;
    const todayPercentage = totalScheduledToday > 0 ? Math.round((completedToday / totalScheduledToday) * 100) : 0;

    if (loading) return <><Navbar /><Loader size="lg" /></>;

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Card className="bg-accent">
                        <div className="text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1">Today</div>
                        <div className="text-3xl font-bold">{todayPercentage}%</div>
                        <div className="text-xs font-mono">{completedToday}/{totalScheduledToday} done</div>
                    </Card>
                    <Card className="bg-secondary">
                        <div className="text-xs font-bold uppercase text-[var(--color-text-muted)] mb-1">Overall</div>
                        <div className="text-3xl font-bold">{overallStats?.overallConsistency || 0}%</div>
                        <div className="text-xs font-mono">consistency</div>
                    </Card>
                    <Card className="bg-purple text-white">
                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Best Streak</div>
                        <div className="text-3xl font-bold">
                            🔥 {Math.max(...(overallStats?.habitStats?.map((h) => h.currentStreak) || [0]))}
                        </div>
                        <div className="text-xs font-mono opacity-80">days</div>
                    </Card>
                    <Card className="bg-pink text-white">
                        <div className="text-xs font-bold uppercase opacity-80 mb-1">Active Habits</div>
                        <div className="text-3xl font-bold">{habits.length}</div>
                        <div className="text-xs font-mono opacity-80">tracking</div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: Today's habits */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Today's Habits */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-xl font-bold">Today's Habits</h2>
                                <Badge variant="primary">{todayDay}</Badge>
                                <Badge variant={todayPercentage === 100 ? 'success' : 'warning'}>
                                    {todayPercentage}%
                                </Badge>
                            </div>

                            {todayHabits.length > 0 ? (
                                <div className="space-y-2">
                                    {habitsWithStats(todayHabits).map((habit) => (
                                        <HabitCard
                                            key={habit._id}
                                            habit={habit}
                                            log={logs.find((l) => l.habitId === habit._id)}
                                            isToday={true}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-[var(--color-bg-dark)] text-center">
                                    <p className="text-sm font-mono text-[var(--color-text-muted)]">
                                        No habits scheduled for today. Rest day! 🧘
                                    </p>
                                </Card>
                            )}
                        </div>

                        {/* Other habits (not scheduled today) */}
                        {otherHabits.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold mb-3 text-[var(--color-text-muted)]">Not Scheduled Today</h2>
                                <div className="space-y-2 opacity-60">
                                    {habitsWithStats(otherHabits).map((habit) => (
                                        <HabitCard
                                            key={habit._id}
                                            habit={habit}
                                            log={null}
                                            isToday={false}
                                            onToggle={() => { }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Heatmap */}
                        <Card>
                            <h2 className="text-lg font-bold mb-4">📊 Consistency Heatmap</h2>
                            <Heatmap data={heatmapData} />
                        </Card>
                    </div>

                    {/* Right column: Streaks & Notes */}
                    <div className="space-y-4">
                        {/* Streaks */}
                        <Card className="bg-[var(--color-accent)]">
                            <h2 className="text-lg font-bold mb-3">🔥 Streaks</h2>
                            <div className="space-y-2">
                                {overallStats?.habitStats
                                    ?.sort((a, b) => b.currentStreak - a.currentStreak)
                                    .map((stat) => (
                                        <div
                                            key={stat.habitId}
                                            className="flex items-center justify-between bg-[var(--color-surface)] p-2.5 rounded-md border-2 border-[var(--color-border)]"
                                        >
                                            <span className="text-sm font-bold truncate mr-2">{stat.name}</span>
                                            <span className="text-sm font-mono font-bold shrink-0">
                                                {stat.currentStreak > 0 ? `🔥 ${stat.currentStreak}` : '—'}
                                            </span>
                                        </div>
                                    )) || (
                                        <p className="text-sm font-mono text-[var(--color-text-muted)]">No streak data yet</p>
                                    )}
                            </div>
                        </Card>

                        {/* Daily Note */}
                        <Card>
                            <h2 className="text-lg font-bold mb-3">📝 Today's Note</h2>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="How was your day? (max 500 chars)"
                                maxLength={500}
                                className="input-brutal w-full h-24 resize-none text-sm"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-mono text-[var(--color-text-muted)]">
                                    {note.length}/500
                                </span>
                                <button
                                    onClick={handleNoteSave}
                                    className="btn-brutal bg-[var(--color-secondary)] text-[var(--color-text)] px-4 py-1.5 text-xs"
                                >
                                    Save Note
                                </button>
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        {overallStats?.bestHabit && (
                            <Card className="bg-emerald-50">
                                <h2 className="text-lg font-bold mb-2">🏆 Best Habit</h2>
                                <p className="text-sm font-bold">{overallStats.bestHabit.name}</p>
                                <p className="text-xs font-mono text-[var(--color-text-muted)]">
                                    {overallStats.bestHabit.consistency}% consistency
                                </p>
                            </Card>
                        )}
                        {overallStats?.worstHabit && overallStats.habitStats.length > 1 && (
                            <Card className="bg-red-50">
                                <h2 className="text-lg font-bold mb-2">⚠️ Needs Work</h2>
                                <p className="text-sm font-bold">{overallStats.worstHabit.name}</p>
                                <p className="text-xs font-mono text-[var(--color-text-muted)]">
                                    {overallStats.worstHabit.consistency}% consistency
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
