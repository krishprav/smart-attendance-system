import Link from 'next/link';

export default function FacultyPortal() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Faculty Portal</h1>
        <p className="text-gray-700 mb-8 text-center max-w-xl">
          Welcome to the Faculty Portal. Manage your classes, monitor attendance and compliance, analyze student engagement, and generate insightful reports.
        </p>
        <div className="grid gap-4 w-full md:grid-cols-2">
          <Link href="/faculty/start-session">
            <button className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition">Start Session</button>
          </Link>
          <Link href="/faculty/classes">
            <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition">My Classes</button>
          </Link>
          <Link href="/faculty/monitor">
            <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow transition">Session Monitor</button>
          </Link>
          <Link href="/faculty/analytics">
            <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow transition">Analytics</button>
          </Link>
          <Link href="/faculty/reports">
            <button className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl shadow transition">Reports</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
