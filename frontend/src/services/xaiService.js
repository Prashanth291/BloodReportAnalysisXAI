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
  otherParameters = {},
  patientProfile = {},
  shap = true,
  token = null,
}) => {
  try {
    const response = await axios.post(
      `${XAI_API_URL}/interpret`,
      {
        parameter_name: parameterName,
        parameter: parameterName,
        value,
        status,
        reference_range: referenceRange,
        otherParameters: otherParameters,
        patientAge: patientProfile.patientAge || 50,
        patientGender: patientProfile.patientGender || 'Male',
        diabetic: patientProfile.diabetic || false,
        pregnant: patientProfile.pregnant || false,
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
