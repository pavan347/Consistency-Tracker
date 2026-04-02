import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { habitsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HabitsPage = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [formData, setFormData] = useState({ name: '', scheduledDays: [] });

    const fetchHabits = async () => {
        try {
            const { data } = await habitsAPI.getAll();
            setHabits(data);
        } catch (error) {
            toast.error('Failed to load habits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const toggleDay = (day) => {
        setFormData((prev) => ({
            ...prev,
            scheduledDays: prev.scheduledDays.includes(day)
                ? prev.scheduledDays.filter((d) => d !== day)
                : [...prev.scheduledDays, day],
        }));
    };

    const resetForm = () => {
        setFormData({ name: '', scheduledDays: [] });
        setEditingHabit(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Habit name is required');
            return;
        }

        if (formData.scheduledDays.length === 0) {
            toast.error('Select at least one day');
            return;
        }

        try {
            if (editingHabit) {
                await habitsAPI.update(editingHabit._id, formData);
                toast.success('Habit updated (changes apply from today forward)');
            } else {
                await habitsAPI.create(formData);
                toast.success('Habit created!');
            }
            resetForm();
            fetchHabits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save habit');
        }
    };

    const handleEdit = (habit) => {
        setEditingHabit(habit);
        setFormData({ name: habit.name, scheduledDays: [...habit.scheduledDays] });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will soft-delete the habit.')) return;

        try {
            await habitsAPI.delete(id);
            toast.success('Habit deleted');
            fetchHabits();
        } catch (error) {
            toast.error('Failed to delete habit');
        }
    };

    if (loading) return <><Navbar /><Loader size="lg" /></>;

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Manage Habits</h1>
                        <p className="text-sm text-[var(--color-text-muted)] font-mono">
                            {habits.length} active habit{habits.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        variant={showForm ? 'danger' : 'primary'}
                        onClick={() => {
                            if (showForm) resetForm();
                            else setShowForm(true);
                        }}
                    >
                        {showForm ? '✗ Cancel' : '+ New Habit'}
                    </Button>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <Card className="mb-6 bg-[var(--color-accent)] animate-slide-up">
                        <h2 className="text-lg font-bold mb-4">
                            {editingHabit ? '✏️ Edit Habit' : '➕ New Habit'}
                        </h2>
                        {editingHabit && (
                            <div className="mb-3 p-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-md">
                                <p className="text-xs font-bold text-[var(--color-danger)]">
                                    ⚠️ Changes will only apply from today forward. Past data is immutable.
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Habit Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Morning Run, Read 30 mins"
                                maxLength={100}
                            />
                            <div>
                                <label className="text-sm font-bold uppercase tracking-wide block mb-2">
                                    Scheduled Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_DAYS.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`px-3 py-2 text-sm font-bold border-3 border-[var(--color-border)] rounded-[var(--radius-brutal)] transition-all ${formData.scheduledDays.includes(day)
                                                    ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-brutal-sm)]'
                                                    : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-dark)]'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" variant="secondary" size="lg">
                                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Habits List */}
                {habits.length > 0 ? (
                    <div className="space-y-3">
                        {habits.map((habit) => (
                            <Card key={habit._id} className="flex items-center justify-between gap-4 animate-slide-up">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base mb-1">{habit.name}</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {habit.scheduledDays.map((day) => (
                                            <Badge key={day} variant="default">{day}</Badge>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-1">
                                        Created: {new Date(habit.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="accent" onClick={() => handleEdit(habit)}>
                                        ✏️ Edit
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(habit._id)}>
                                        🗑️
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 bg-[var(--color-bg-dark)]">
                        <div className="text-5xl mb-4">🎯</div>
                        <h3 className="text-xl font-bold mb-2">No habits yet</h3>
                        <p className="text-sm text-[var(--color-text-muted)] font-mono mb-4">
                            Create your first habit to start tracking consistency
                        </p>
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                            + Create First Habit
                        </Button>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default HabitsPage;
