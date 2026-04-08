import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsAPI, logsAPI, analyticsAPI } from '../services/api';

// HABITS
export const useHabits = () => {
    return useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const { data } = await habitsAPI.getAll();
            return data;
        },
    });
};

export const useCreateHabit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newHabit) => habitsAPI.create(newHabit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
};

export const useUpdateHabit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => habitsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
};

export const useDeleteHabit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => habitsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
};

// LOGS
export const useLogsByDate = (date) => {
    return useQuery({
        queryKey: ['logs', date],
        queryFn: async () => {
            const { data } = await logsAPI.getByDate(date);
            return data;
        },
        enabled: !!date,
    });
};

export const useToggleLog = (date) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ habitId, status }) => logsAPI.create({ habitId, status }),
        // Optimistic UI Update
        onMutate: async ({ habitId, status }) => {
            await queryClient.cancelQueries({ queryKey: ['logs', date] });

            const previousLogs = queryClient.getQueryData(['logs', date]);

            queryClient.setQueryData(['logs', date], (old) => {
                if (!old) return old;
                // If log exists, update it, else create a fake one
                const index = old.findIndex(l => l.habitId === habitId);
                if (index !== -1) {
                    const newLogs = [...old];
                    newLogs[index] = { ...newLogs[index], status };
                    return newLogs;
                }
                return [...old, { habitId, status, date }];
            });

            return { previousLogs };
        },
        onError: (err, variables, context) => {
            if (context?.previousLogs) {
                queryClient.setQueryData(['logs', date], context.previousLogs);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['logs', date] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
};

export const useUpdateLogNote = (date) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }) => logsAPI.update(id, { note }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logs', date] });
        },
    });
};

// ANALYTICS
export const useHeatmap = () => {
    return useQuery({
        queryKey: ['analytics', 'heatmap'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getHeatmap();
            return data;
        },
    });
};

export const useOverallStats = () => {
    return useQuery({
        queryKey: ['analytics', 'overall'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getOverall();
            return data;
        },
    });
};

export const useWeeklyStats = () => {
    return useQuery({
        queryKey: ['analytics', 'weekly'],
        queryFn: async () => {
            const { data } = await analyticsAPI.getWeekly();
            return data;
        },
    });
};
