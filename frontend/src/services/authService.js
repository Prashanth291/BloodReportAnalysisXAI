import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Update user profile information
 */
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.patch(
      `${API_URL}/auth/profile`,
      { profile: profileData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update local storage with new user data if returned
    if (response.data.data) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, profile: profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export default {
  updateUserProfile,
  getUserProfile,
};
