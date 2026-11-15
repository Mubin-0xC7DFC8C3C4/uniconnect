import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  defaultProfile,
  seedComplaints,
  type Complaint,
  type ComplaintCategory,
  type DemoProfile,
} from "@/data/demo";
import { THEME_STORAGE_KEY, type ThemeChoice } from "@/lib/theme";

export type NotifPrefs = {
  academic: boolean;
  routine: boolean;
  announcements: boolean;
  events: boolean;
  results: boolean;
};

const defaultPrefs: NotifPrefs = {
  academic: true,
  routine: true,
  announcements: true,
  events: true,
  results: true,
};

type Content = {
  signedIn: boolean;
  theme: ThemeChoice;
  profile: DemoProfile;
  readNoticeIds: string[];
  readNotificationIds: string[];
  complaints: Complaint[];
  registrations: string[];
  prefs: NotifPrefs;
};

const defaultContent = (): Content => ({
  signedIn: false,
  theme: "system",
  profile: defaultProfile,
  readNoticeIds: [],
  readNotificationIds: [],
  complaints: seedComplaints,
  registrations: [],
  prefs: defaultPrefs,
});

type Store = Content & {
  hydrated: boolean;
  setHydrated: () => void;
  signIn: () => void;
  signOut: () => void;
  setTheme: (theme: ThemeChoice) => void;
  updateProfile: (patch: Partial<DemoProfile>) => void;
  markNoticeRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markNotificationsRead: (ids: string[]) => void;
  addComplaint: (input: { category: ComplaintCategory; subject: string; description: string }) => void;
  withdrawComplaint: (id: string) => void;
  toggleRegistration: (eventId: string) => void;
  updateComplaintStatus: (id: string, status: Complaint["status"]) => void;
  deleteComplaint: (id: string) => void;
  setPrefs: (patch: Partial<NotifPrefs>) => void;
  resetDemo: () => void;
};

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      ...defaultContent(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      signIn: () => set({ signedIn: true }),
      signOut: () => set({ signedIn: false }),
      setTheme: (theme) => set({ theme }),
      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      markNoticeRead: (id) =>
        set((state) => ({
          readNoticeIds: state.readNoticeIds.includes(id)
            ? state.readNoticeIds
            : [...state.readNoticeIds, id],
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          readNotificationIds: state.readNotificationIds.includes(id)
            ? state.readNotificationIds
            : [...state.readNotificationIds, id],
        })),
      markNotificationsRead: (ids) =>
        set((state) => ({
          readNotificationIds: Array.from(new Set([...state.readNotificationIds, ...ids])),
        })),
      addComplaint: (input) =>
        set((state) => ({
          complaints: [
            {
              id: `local-${Date.now()}`,
              category: input.category,
              subject: input.subject.trim(),
              description: input.description.trim(),
              createdAt: new Date().toISOString(),
              status: "pending",
              source: "you",
            },
            ...state.complaints,
          ],
        })),
      withdrawComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter(
            (item) => !(item.id === id && item.source === "you" && item.status === "pending"),
          ),
        })),
      toggleRegistration: (eventId) =>
        set((state) => ({
          registrations: state.registrations.includes(eventId)
            ? state.registrations.filter((id) => id !== eventId)
            : [...state.registrations, eventId],
        })),
      updateComplaintStatus: (id, status) =>
        set((state) => ({
          complaints: state.complaints.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        })),
      deleteComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter((item) => item.id !== id),
        })),
      setPrefs: (patch) => set((state) => ({ prefs: { ...state.prefs, ...patch } })),
      resetDemo: () =>
        set((state) => ({
          ...defaultContent(),
          theme: state.theme,
          signedIn: state.signedIn,
        })),
    }),
    {
      name: THEME_STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage,
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<Content>) ?? {};
        const isLegacyProfile =
          persisted.profile?.name === "Rahim Ahmed" ||
          persisted.profile?.studentId === "DEMO-2022-0148";

        return {
          ...currentState,
          ...persisted,
          profile: isLegacyProfile || !persisted.profile ? defaultProfile : persisted.profile,
        };
      },
      partialize: (state) => ({
        signedIn: state.signedIn,
        theme: state.theme,
        profile: state.profile,
        readNoticeIds: state.readNoticeIds,
        readNotificationIds: state.readNotificationIds,
        complaints: state.complaints,
        registrations: state.registrations,
        prefs: state.prefs,
      }),
    },
  ),
);