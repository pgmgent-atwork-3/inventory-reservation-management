import create from "zustand";
import "dotenv/config";

type Store = {
  setSearchTags: (value: string[] | null) => void;
  searchTags: string[] | null;
  setSearchQuery: (value: string) => void;
  searchQuery: string;
  setSelection: (value: string) => void;
  selection: string;
  fullTags: { id: string; name: string }[] | null;
  setFullTags: (value: { id: string; name: string }[] | null) => void;
  reset: boolean;
  setReset: (value: boolean) => void;
  setSelectionResrev: (value: string) => void;
  selectionReserv: string;
};

const useStore = create<Store>((set) => ({
  searchTags: null,
  searchQuery: "",
  selection: "all",
  fullTags: null,
  reset: false,
  selectionReserv: `${process.env.REACT_APP_RESERVED_STATE}`,

  setReset(value: boolean) {
    set((state) => ({
      ...state,
      reset: value,
    }));
  },
  setSearchTags(value: string[] | null) {
    set((state) => ({
      ...state,
      searchTags: value,
    }));
  },

  setFullTags(value: { id: string; name: string }[] | null) {
    set((state) => ({
      ...state,
      fullTags: value,
    }));
  },

  setSearchQuery(value: string) {
    set((state) => ({
      ...state,
      searchQuery: value,
    }));
  },

  setSelection(value: string) {
    set((state) => ({
      ...state,
      selection: value,
    }));
  },
  setSelectionResrev(value: string) {
    set((state) => ({
      ...state,
      selectionReserv: value,
    }));
  },
}));
export default useStore;
