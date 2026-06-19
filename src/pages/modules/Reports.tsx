import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DailyReport {
  date: string;
  total_sales: number;
  total_items: number;
  total_discount: number;
  total_tax: number;
  transactions_count: number;
}

interface CategoryReport {
  category: string;
  total_sold: number;
  revenue: number;
  profit: number;
}

export default function ReportsModule() {
  const [reportType, setReportType] = useState<"daily" | "monthly" | "category">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === "daily") {
      loadDailyReport();
    } else if (reportType === "category") {
      loadCategoryReport();
    }
  }, [reportType, selectedDate]);

  const loadDailyReport = async () => {
    setLoading(true);
    try {
      const result = await invoke("get_daily_report", { date: selectedDate });
      setDailyReport(result as DailyReport);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryReport = async () => {
    setLoading(true);
    try {
      const result = await invoke("get_category_report");
      setCategoryReports(result as CategoryReport[]);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    let csv = "";
    if (reportType === "daily" && dailyReport) {
      csv = `Date,Total Sales,Items,Discount,Tax,Transactions\n${dailyReport.date},${dailyReport.total_sales},${dailyReport.total_items},${dailyReport.total_discount},${dailyReport.total_tax},${dailyReport.transactions_count}`;
    } else if (reportType === "category") {
      csv = "Category,Total Sold,Revenue,Profit\n";
      categoryReports.forEach((report) => {
        csv += `${report.category},${report.total_sold},${report.revenue},${report.profit}\n`;
      });
    }

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute("download", `report_${reportType}_${new Date().toISOString()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Export to CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="daily"
              checked={reportType === "daily"}
              onChange={(e) => setReportType(e.target.value as "daily")}
              className="mr-2"
            />
            Daily Report
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="category"
              checked={reportType === "category"}
              onChange={(e) => setReportType(e.target.value as "category")}
              className="mr-2"
            />
            Category Report
          </label>
        </div>

        {reportType === "daily" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        )}
      </div>

      {loading && <div className="text-center text-gray-600">Loading...</div>}

      {reportType === "daily" && dailyReport && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Sales</p>
            <p className="text-3xl font-bold text-pink-600">${dailyReport.total_sales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Transactions</p>
            <p className="text-3xl font-bold text-blue-600">{dailyReport.transactions_count}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Profit</p>
            <p className="text-3xl font-bold text-green-600">${(dailyReport.total_sales - dailyReport.total_discount).toFixed(2)}</p>
          </div>
        </div>
      )}

      {reportType === "category" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Total Sold</th>
                <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                <th className="px-4 py-3 text-right font-semibold">Profit</th>
              </tr>
            </thead>
            <tbody>
              {categoryReports.map((report) => (
                <tr key={report.category} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{report.category}</td>
                  <td className="px-4 py-3 text-right">{report.total_sold}</td>
                  <td className="px-4 py-3 text-right font-semibold text-pink-600">${report.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">${report.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
