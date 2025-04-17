'use client';

import { useEffect, useState } from 'react';
import { sessions, Session } from '../../../data/sessionsData';

export default function StudentSessions() {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Simulate real-time updates by polling (for demo; replace with WebSocket in prod)
  useEffect(() => {
    setLoading(true);
    const fetchSessions = () => {
      // In a real app, fetch from API
      setSessionList([...sessions]);
      setLoading(false);
    };
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Sessions</h1>
      {loading ? (
        <div className="text-center text-gray-600">Loading sessions...</div>
      ) : sessionList.length === 0 ? (
        <div className="text-center text-gray-500">No sessions available yet.</div>
      ) : (
        <div className="space-y-4">
          {sessionList.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-indigo-50 transition"
              onClick={() => setSelectedSession(session)}
            >
              <div>
                <div className="text-lg font-semibold text-indigo-700 mb-1">{session.title}</div>
                <div className="text-gray-700 text-sm">{session.courseCode} &bull; {session.faculty}</div>
                <div className="text-gray-500 text-xs">{session.date} &bull; {session.time} &bull; {session.location}</div>
              </div>
              <div className="mt-2 md:mt-0">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-800"
              onClick={() => setSelectedSession(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-indigo-700 mb-2">{selectedSession.title}</h2>
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Course:</span> {selectedSession.courseCode}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Faculty:</span> {selectedSession.faculty}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Date:</span> {selectedSession.date}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Time:</span> {selectedSession.time}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-medium">Location:</span> {selectedSession.location}
            </div>
            {selectedSession.description && (
              <div className="mb-2 text-gray-700">
                <span className="font-medium">Description:</span> {selectedSession.description}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setSelectedSession(null)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
