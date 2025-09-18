import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  user: null as null | {
    _id: string;
    name?: string;
    email: string;
    role: "user" | "mentor";
    phone?: string;
    experience?: string;
    resume_url?: string;
    profile_image?: string;
    goals?: string;
    tech_stack?: string;
    profile_completion?: number;
    linkedin_profile?: string;
    education?: string;
    bio?: string;
    verified?: boolean;
  },
  isHydrated: false,
};

// Helper function to derive name from email if name is not provided
const deriveNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  // Capitalize first letter and replace dots/underscores with spaces
  return username
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      console.log("🔍 loginSuccess reducer received:", action.payload);
      const { access_token, user } = action.payload;
      console.log("🔍 Extracted access_token:", access_token);
      console.log("🔍 Extracted user:", user);
      
      // Ensure user has a name, derive from email if not provided
      const userData = {
        ...user,
        name: user.name || deriveNameFromEmail(user.email)
      };
      console.log("🔍 Final userData with name:", userData);
      
      state.token = access_token;
      state.user = userData;
      state.isHydrated = true;
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
      }
      console.log("Login successfully:", userData);
    },
    logout(state) {
      state.token = "";
      state.user = null;
      state.isHydrated = true;
      // Clear localStorage when logging out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    setHydrated(state) {
      state.isHydrated = true;
    },
    restoreAuth(state, action) {
      if (action.payload.token && action.payload.user) {
        // Ensure user has a name, derive from email if not provided
        const userData = {
          ...action.payload.user,
          name: action.payload.user.name || deriveNameFromEmail(action.payload.user.email)
        };
        
        state.token = action.payload.token;
        state.user = userData;
      }
      state.isHydrated = true;
    },
  },
});

export const { loginSuccess, logout, setHydrated, restoreAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
