import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { getUserReports } from "../services/analysisService";
import LoadingScreen from "../components/LoadingScreen";

const ParameterTrends = () => {
  const { parameterName } = useParams();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState(
    parameterName || ""
  );
  const [availableParameters, setAvailableParameters] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [parameterInfo, setParameterInfo] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedParameter && reports.length > 0) {
      prepareChartData();
    }
  }, [selectedParameter, reports]);

  const fetchReports = async () => {
    try {
      const response = await getUserReports();
      
      // Handle different response structures
      let reportsData = [];
      if (response?.data?.data) {
        reportsData = response.data.data;
      } else if (response?.data) {
        reportsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        reportsData = response;
      }

      // Sort reports by date (oldest first for trends)
      const sortedReports = [...reportsData].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setReports(sortedReports);

      // Extract all unique parameter names
      const paramsSet = new Set();
      sortedReports.forEach((report) => {
        if (report.parameters) {
          report.parameters.forEach((p) => paramsSet.add(p.name));
        }
      });

      const paramsList = Array.from(paramsSet).sort();
      setAvailableParameters(paramsList);

      // Set first parameter as default if none selected
      if (!selectedParameter && paramsList.length > 0) {
        setSelectedParameter(paramsList[0]);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const data = [];
    let refRange = null;
    let unit = "";
    let category = "";

    reports.forEach((report) => {
      if (report.parameters) {
        const param = report.parameters.find(
          (p) => p.name === selectedParameter
        );

        if (param) {
          const value = parseFloat(param.value);

          if (!isNaN(value)) {
            data.push({
              date: format(new Date(report.createdAt), "MMM dd, yyyy"),
              value: value,
              status: param.status,
              unit: param.unit || "",
              reportId: report._id,
            });

            if (!refRange && param.referenceRange) {
              refRange = param.referenceRange;
            }
            if (!unit) unit = param.unit || "";
            if (!category) category = param.category || "";
          }
        }
      }
    });

    setChartData(data);
    setParameterInfo({
      name: selectedParameter,
      unit: unit,
      category: category,
      referenceRange: refRange,
      dataPoints: data.length,
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className="text-lg text-primary-600 font-bold">
            {data.value} {data.unit}
          </p>
          <p className="text-sm text-gray-600 capitalize">
            Status:{" "}
            <span
              className={`font-medium ${
                data.status === "normal"
                  ? "text-green-600"
                  : data.status === "high"
                  ? "text-red-600"
                  : data.status === "low"
                  ? "text-yellow-600"
                  : "text-gray-600"
              }`}
            >
              {data.status}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <LoadingScreen message="Loading parameter trends..." />;
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Reports Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Upload at least 2 reports to see parameter trends
          </p>
          <Link
            to="/analysis"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Upload Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/health"
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Health Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Parameter Trends
          </h1>
          <p className="text-gray-600">
            Track how your blood parameters change over time
          </p>
        </div>

        {/* Parameter Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Parameter to Track:
          </label>
          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 font-medium"
          >
            {availableParameters.map((param) => (
              <option key={param} value={param}>
                {param}
              </option>
            ))}
          </select>
        </div>

        {/* Parameter Info */}
        {parameterInfo && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Parameter</p>
                <p className="text-lg font-bold text-gray-900">
                  {parameterInfo.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="text-lg font-semibold text-gray-700">
                  {parameterInfo.category || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reference Range</p>
                <p className="text-lg font-semibold text-gray-700">
                  {parameterInfo.referenceRange?.range || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Data Points</p>
                <p className="text-lg font-bold text-primary-600">
                  {parameterInfo.dataPoints}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {selectedParameter} Trend Over Time
            </h2>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    label={{
                      value: parameterInfo?.unit || "",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#6b7280" },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Reference range lines */}
                  {parameterInfo?.referenceRange?.min && (
                    <ReferenceLine
                      y={parameterInfo.referenceRange.min}
                      stroke="#22c55e"
                      strokeDasharray="3 3"
                      label={{
                        value: "Min",
                        position: "right",
                        fill: "#22c55e",
                        fontSize: 12,
                      }}
                    />
                  )}
                  {parameterInfo?.referenceRange?.max && (
                    <ReferenceLine
                      y={parameterInfo.referenceRange.max}
                      stroke="#22c55e"
                      strokeDasharray="3 3"
                      label={{
                        value: "Max",
                        position: "right",
                        fill: "#22c55e",
                        fontSize: 12,
                      }}
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: "#2563eb", r: 6 }}
                    activeDot={{ r: 8 }}
                    name={`${selectedParameter} (${parameterInfo?.unit || ""})`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500">
              No data available for this parameter across your reports.
            </p>
          </div>
        )}

        {/* Historical Data Table */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Historical Values
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.map((item, idx) => {
                    const prevValue = idx > 0 ? chartData[idx - 1].value : null;
                    const change = prevValue ? item.value - prevValue : null;

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.value} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "normal"
                                ? "bg-green-100 text-green-800"
                                : item.status === "high"
                                ? "bg-red-100 text-red-800"
                                : item.status === "low"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {change !== null && (
                            <span
                              className={
                                change > 0
                                  ? "text-red-600"
                                  : change < 0
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }
                            >
                              {change > 0 ? "↑" : change < 0 ? "↓" : "→"}{" "}
                              {Math.abs(change).toFixed(2)}
                            </span>
                          )}
                          {change === null && (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/reports/${item.reportId}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterTrends;
