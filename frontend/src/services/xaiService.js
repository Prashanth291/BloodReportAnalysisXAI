import axios from "axios";

const XAI_API_URL =
  process.env.REACT_APP_XAI_API_URL || "http://localhost:8000/api/v1";

/**
 * Get XAI interpretation for a parameter from Flask API
 */
export const getXAIInterpretation = async ({
  parameterName,
  value,
  status,
  referenceRange,
  userProfile = {},
  shap = true,
  token = null,
}) => {
  try {
    const response = await axios.post(
      `${XAI_API_URL}/interpret`,
      {
        parameter_name: parameterName,
        value,
        status,
        reference_range: referenceRange,
        user_profile: userProfile,
        shap,
      },
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch XAI interpretation" }
    );
  }
};

export default {
  getXAIInterpretation,
};
