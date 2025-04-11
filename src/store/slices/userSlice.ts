import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Rating } from "@/enums/rating.enum";

interface UserState {
  favorites: Record<string, boolean>;
  ratings: Record<string, Rating>;
  isAuthenticated: boolean;
  userId: string | null;
}

const initialState: UserState = {
  favorites: {},
  ratings: {},
  isAuthenticated: false,
  userId: null,
};

// Async thunk for toggling a favorite
export const toggleFavorite = createAsyncThunk(
  "user/toggleFavorite",
  async (resourceId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/resources/${resourceId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { resourceId, isFavorited: data.isFavorited };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

// Async thunk for setting a rating
export const setResourceRating = createAsyncThunk(
  "user/setResourceRating",
  async (
    { resourceId, rating }: { resourceId: string; rating: Rating },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`/api/v1/resources/${resourceId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        resourceId,
        rating,
        approvalPercentage: data.approvalPercentage,
        totalVotes: data.upvotes + data.downvotes,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

// Async thunk for fetching user's favorites and ratings
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      // Fetch user favorites
      const favoritesResponse = await fetch("/api/v1/user/favorites");
      if (!favoritesResponse.ok) {
        throw new Error(`HTTP error! status: ${favoritesResponse.status}`);
      }
      const favoritesData = await favoritesResponse.json();

      // Fetch user ratings
      const ratingsResponse = await fetch("/api/v1/user/ratings");
      if (!ratingsResponse.ok) {
        throw new Error(`HTTP error! status: ${ratingsResponse.status}`);
      }
      const ratingsData = await ratingsResponse.json();

      // Process favorites into a map
      const favorites: Record<string, boolean> = {};
      favoritesData.favorites.forEach((fav: any) => {
        favorites[fav.resourceId] = true;
      });

      // Process ratings into a map
      const ratings: Record<string, Rating> = {};
      ratingsData.ratings.forEach((rating: any) => {
        ratings[rating.resourceId] = rating.rating;
      });

      return { favorites, ratings };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
    clearUserData: (state) => {
      state.favorites = {};
      state.ratings = {};
      state.isAuthenticated = false;
      state.userId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle toggleFavorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { resourceId, isFavorited } = action.payload;
        state.favorites[resourceId] = isFavorited;
      })
      // Handle setResourceRating
      .addCase(setResourceRating.fulfilled, (state, action) => {
        const { resourceId, rating } = action.payload;
        state.ratings[resourceId] = rating;
      })
      // Handle fetchUserData
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.favorites = action.payload.favorites;
        state.ratings = action.payload.ratings;
      });
  },
});

export const { setAuthenticated, setUserId, clearUserData } = userSlice.actions;

export default userSlice.reducer;
