import { useState, useEffect } from "react";
import POSModule from "./modules/POS";
import ProductsModule from "./modules/Products";
import ReportsModule from "./modules/Reports";
import SettingsModule from "./modules/Settings";
import CustomersModule from "./modules/Customers";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pos");

  const tabs = [
    { id: "pos", label: "POS", icon: "💳", component: POSModule },
    { id: "products", label: "Products", icon: "📦", component: ProductsModule },
    { id: "customers", label: "Customers", icon: "👥", component: CustomersModule },
    { id: "reports", label: "Reports", icon: "📈", component: ReportsModule },
    { id: "settings", label: "Settings", icon: "⚙️", component: SettingsModule },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || POSModule;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-pink-600">Belle Beauté</h1>
          <p className="text-sm text-gray-600 mt-1">POS System</p>
        </div>

        <nav className="flex-1 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
                activeTab === tab.id
                  ? "bg-pink-50 text-pink-600 border-l-4 border-pink-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition-colors">Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
