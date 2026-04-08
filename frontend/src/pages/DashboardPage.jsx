import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useHabits, useLogsByDate, useHeatmap, useOverallStats, useToggleLog, useUpdateLogNote } from '../hooks/apiHooks';
import Navbar from '../components/Navbar';
import HabitCard from '../components/HabitCard';
import Heatmap from '../components/Heatmap';
import CalendarView from '../components/CalendarView';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const getTodayUTC = () => new Date().toISOString().split('T')[0];

const getDayAbbr = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr + 'T00:00:00Z').getUTCDay()];
};

const DashboardPage = () => {
    const today = getTodayUTC();
    const [selectedDate, setSelectedDate] = useState(today);
    const [viewType, setViewType] = useState('heatmap'); // 'heatmap' or 'calendar'
    
    // React Query Hooks
    const { data: habits = [], isLoading: isLoadingHabits } = useHabits();
    const { data: logs = [], isLoading: isLoadingLogs } = useLogsByDate(selectedDate);
    const { data: heatmapData = [], isLoading: isLoadingHeatmap } = useHeatmap();
    const { data: overallStats = null, isLoading: isLoadingOverall } = useOverallStats();

    const loading = isLoadingHabits || isLoadingLogs || isLoadingHeatmap || isLoadingOverall;

    const { mutate: toggleLog } = useToggleLog(selectedDate);
    const { mutate: updateNote } = useUpdateLogNote(selectedDate);

    const [note, setNote] = useState('');

    const isSelectedToday = selectedDate === today;
    const selectedDayAbbr = getDayAbbr(selectedDate);

    useEffect(() => {
        const noteLog = logs.find((l) => l.note);
        if (noteLog) {
            setNote(noteLog.note);
        } else {
            setNote('');
        }
    }, [logs]);

    const handleToggle = useCallback((habitId, status) => {
        if (!isSelectedToday) {
            toast.error('Past logs are immutable. You can only track today!');
            return;
        }

        toggleLog({ habitId, status }, {
            onSuccess: () => {
                toast.success(status === 'done' ? '✓ Marked as done!' : '✗ Marked as missed');
            },
            onError: () => {
                toast.error('Failed to update');
            }
        });
    }, [isSelectedToday, toggleLog]);

    const handleNoteSave = () => {
        if (!isSelectedToday) {
            toast.error('Notes can only be added for today.');
            return;
        }
        if (!note.trim()) return;

        const todayLog = logs[0];
        if (todayLog && todayLog._id) {
            updateNote({ id: todayLog._id, note }, {
                onSuccess: () => toast.success('Note saved!'),
                onError: () => toast.error('Failed to save note')
            });
        } else if (todayLog && !todayLog._id) {
             toast.error('Log is syncing, try saving note in a second');
        } else {
            toast.error('Mark at least one habit first to add a note');
        }
    };

    // Filter scheduled habits for the selected day
    const displayHabits = habits.filter((h) => h.scheduledDays.includes(selectedDayAbbr));
    const otherHabits = habits.filter((h) => !h.scheduledDays.includes(selectedDayAbbr));

    // Get stats for each habit
    const habitsWithStats = (list) =>
        list.map((h) => ({
            ...h,
            currentStreak: overallStats?.habitStats?.find((s) => s.habitId === h._id)?.currentStreak || 0,
        }));

    const completedOnDate = logs.filter((l) => l.status === 'done').length;
    const totalScheduledOnDate = displayHabits.length;
    const datePercentage = totalScheduledOnDate > 0 ? Math.round((completedOnDate / totalScheduledOnDate) * 100) : 0;

    if (loading) return <><Navbar /><Loader size="lg" /></>;

    return (
        <div className="min-h-screen bg-bg">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Card className="bg-accent">
                        <div className="text-xs font-bold uppercase text-text-muted mb-1">
                            {isSelectedToday ? 'Today' : 'Selected Day'}
                        </div>
                        <div className="text-3xl font-bold">{datePercentage}%</div>
                        <div className="text-xs font-mono">{completedOnDate}/{totalScheduledOnDate} done</div>
                    </Card>
                    <Card className="bg-secondary">
                        <div className="text-xs font-bold uppercase text-text-muted mb-1">Overall</div>
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
                        {/* Selected Day's Habits */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-xl font-bold">
                                    {isSelectedToday ? "Today's Habits" : `Habits for ${selectedDate}`}
                                </h2>
                                <Badge variant="primary">{selectedDayAbbr}</Badge>
                                <Badge variant={datePercentage === 100 ? 'success' : 'warning'}>
                                    {datePercentage}%
                                </Badge>
                            </div>

                            {displayHabits.length > 0 ? (
                                <div className="space-y-2">
                                    {habitsWithStats(displayHabits).map((habit) => (
                                        <HabitCard
                                            key={habit._id}
                                            habit={habit}
                                            log={logs.find((l) => l.habitId === habit._id)}
                                            isToday={isSelectedToday}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-bg-dark text-center">
                                    <p className="text-sm font-mono text-text-muted">
                                        No habits scheduled for today. Rest day! 🧘
                                    </p>
                                </Card>
                            )}
                        </div>

                        {/* Other habits (not scheduled today) */}
                        {otherHabits.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold mb-3 text-text-muted">Not Scheduled Today</h2>
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

                        {/* Heatmap / Calendar Card */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">📊 Consistency</h2>
                                <select 
                                    value={viewType}
                                    onChange={(e) => setViewType(e.target.value)}
                                    className="text-xs font-bold uppercase tracking-wider bg-bg-dark border-2 border-(--color-border) rounded-md px-2 py-1 outline-none cursor-pointer hover:bg-surface transition-colors"
                                >
                                    <option value="heatmap">Heatmap View</option>
                                    <option value="calendar">Calendar View</option>
                                </select>
                            </div>
                            
                            {viewType === 'heatmap' ? (
                                <Heatmap
                                    data={heatmapData}
                                    onDateClick={setSelectedDate}
                                    selectedDate={selectedDate}
                                />
                            ) : (
                                <CalendarView
                                    data={heatmapData}
                                    onDateClick={setSelectedDate}
                                    selectedDate={selectedDate}
                                />
                            )}
                        </Card>
                    </div>

                    {/* Right column: Streaks & Notes */}
                    <div className="space-y-4">
                        {/* Streaks */}
                        <Card className="bg-accent">
                            <h2 className="text-lg font-bold mb-3">🔥 Streaks</h2>
                            <div className="space-y-2">
                                {overallStats?.habitStats
                                    ?.sort((a, b) => b.currentStreak - a.currentStreak)
                                    .map((stat) => (
                                        <div
                                            key={stat.habitId}
                                            className="flex items-center justify-between bg-surface p-2.5 rounded-md border-2 border-(--color-border)"
                                        >
                                            <span className="text-sm font-bold truncate mr-2">{stat.name}</span>
                                            <span className="text-sm font-mono font-bold shrink-0">
                                                {stat.currentStreak > 0 ? `🔥 ${stat.currentStreak}` : '—'}
                                            </span>
                                        </div>
                                    )) || (
                                        <p className="text-sm font-mono text-text-muted">No streak data yet</p>
                                    )}
                            </div>
                        </Card>

                        {/* Daily Note */}
                        <Card>
                            <h2 className="text-lg font-bold mb-3">
                                {isSelectedToday ? "Today's Note" : `Note for ${selectedDate}`}
                            </h2>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                disabled={!isSelectedToday}
                                placeholder={isSelectedToday ? "How was your day? (max 500 chars)" : "No note for this day"}
                                maxLength={500}
                                className={`input-brutal w-full h-24 resize-none text-sm ${!isSelectedToday ? 'bg-bg-dark opacity-70 cursor-not-allowed' : ''}`}
                            />
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-mono text-text-muted">
                                    {note.length}/500
                                </span>
                                {isSelectedToday && (
                                    <button
                                        onClick={handleNoteSave}
                                        className="btn-brutal bg-secondary text-(--color-text) px-4 py-1.5 text-xs"
                                    >
                                        Save Note
                                    </button>
                                )}
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        {overallStats?.bestHabit && (
                            <Card className="bg-emerald-50">
                                <h2 className="text-lg font-bold mb-2">🏆 Best Habit</h2>
                                <p className="text-sm font-bold">{overallStats.bestHabit.name}</p>
                                <p className="text-xs font-mono text-text-muted">
                                    {overallStats.bestHabit.consistency}% consistency
                                </p>
                            </Card>
                        )}
                        {overallStats?.worstHabit && overallStats.habitStats.length > 1 && (
                            <Card className="bg-red-50">
                                <h2 className="text-lg font-bold mb-2">⚠️ Needs Work</h2>
                                <p className="text-sm font-bold">{overallStats.worstHabit.name}</p>
                                <p className="text-xs font-mono text-text-muted">
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
