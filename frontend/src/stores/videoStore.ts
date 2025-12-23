import { create } from 'zustand';
import { VideoFormat } from '@card0r/shared';
import type { HolidayTheme, VideoGenerationJob } from '@card0r/shared';

interface VideoState {
  selectedTheme: HolidayTheme | null;
  selectedFormat: VideoFormat;
  selectedMusicUrl: string | null;
  currentJobId: string | null;
  jobs: VideoGenerationJob[];
  setSelectedTheme: (theme: HolidayTheme) => void;
  setSelectedFormat: (format: VideoFormat) => void;
  setSelectedMusicUrl: (url: string | null) => void;
  setCurrentJobId: (jobId: string | null) => void;
  setJobs: (jobs: VideoGenerationJob[]) => void;
  updateJobProgress: (jobId: string, progress: number) => void;
  removeJob: (jobId: string) => void;
  clearVideoState: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  selectedTheme: null,
  selectedFormat: VideoFormat.HD_1080P,
  selectedMusicUrl: null,
  currentJobId: null,
  jobs: [],
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  setSelectedFormat: (format) => set({ selectedFormat: format }),
  setSelectedMusicUrl: (url) => set({ selectedMusicUrl: url }),
  setCurrentJobId: (jobId) => set({ currentJobId: jobId }),
  setJobs: (jobs) => set({ jobs }),
  updateJobProgress: (jobId, progress) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, progress } : job
      ),
    })),
  removeJob: (jobId) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
    })),
  clearVideoState: () =>
    set({
      selectedTheme: null,
      selectedFormat: VideoFormat.HD_1080P,
      selectedMusicUrl: null,
      currentJobId: null,
      jobs: [],
    }),
}));
