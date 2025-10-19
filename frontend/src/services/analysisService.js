import axios from "axios";

const API_URL = "/api/analysis";

// Upload blood report
export const uploadReport = async (file) => {
  try {
    const formData = new FormData();
    formData.append("report", file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload report" };
  }
};

// Get all reports
export const getUserReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch reports" };
  }
};

// Get single report
export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch report" };
  }
};

// Delete report
export const deleteReport = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete report" };
  }
};
