export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Settings</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="company@example.com"
                />
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
