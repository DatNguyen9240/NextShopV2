export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Total Products</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">150</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Total Orders</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">320</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Total Categories</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">25</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Revenue</h3>
        <p className="text-3xl font-bold text-red-600 mt-2">$12,500</p>
      </div>
    </div>
  );
}