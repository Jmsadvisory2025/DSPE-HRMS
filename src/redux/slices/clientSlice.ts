import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ClientState, Client, ClientDetail } from "@/types/client.types";

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.unshift(action.payload);
    },
    setSelectedClient(state, action: PayloadAction<ClientDetail | null>) {
      state.selectedClient = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDetailLoading(state, action: PayloadAction<boolean>) {
      state.detailLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setClients, addClient, setSelectedClient, setLoading, setDetailLoading, setError } = clientSlice.actions;
export default clientSlice.reducer;

// Trigger rebuild
