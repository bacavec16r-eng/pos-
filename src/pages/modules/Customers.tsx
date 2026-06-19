import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Customer, CustomerDebt } from "@types";

export default function CustomersModule() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const customer = await invoke("create_customer", { request: formData }) as Customer;
      setCustomers([...customers, customer]);
      setFormData({ name: "", phone: "", email: "", address: "" });
      setShowForm(false);
      alert("Customer created successfully!");
    } catch (error) {
      alert("Failed to create customer: " + error);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      const result = await invoke("get_customer_debts", { customer_id: customer.id });
      setDebts(result as CustomerDebt[]);
    } catch (error) {
      console.error("Failed to load debts:", error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Customers List */}
      <div className="col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Customers</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Add Customer
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateCustomer} className="bg-white p-4 rounded-lg shadow space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700">
              Create Customer
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3 text-right">Loyalty Points</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone || "N/A"}</td>
                  <td className="px-4 py-3 text-right">${customer.total_spent.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{customer.loyalty_points}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-pink-600 hover:text-pink-800 font-semibold">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details */}
      {selectedCustomer && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4 h-fit">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{selectedCustomer.name}</h3>
            <p className="text-gray-600 text-sm">{selectedCustomer.phone}</p>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-bold text-pink-600">${selectedCustomer.total_spent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loyalty Points:</span>
              <span className="font-bold text-blue-600">{selectedCustomer.loyalty_points}</span>
            </div>
          </div>

          {debts.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-2">Debts</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {debts.map((debt) => (
                  <div key={debt.id} className="bg-red-50 p-2 rounded text-sm">
                    <div className="flex justify-between">
                      <span>{debt.status.toUpperCase()}</span>
                      <span className="font-bold text-red-600">${debt.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 text-xs">Paid: ${debt.paid_amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
