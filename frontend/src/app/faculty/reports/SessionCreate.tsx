"use client";

import { useState } from "react";
import { sessions, Session } from "../../../data/sessionsData";
import { courses } from "../../../data/courseData";

export default function SessionCreate({ onSessionCreated }: { onSessionCreated?: () => void }) {
  const [form, setForm] = useState({
    courseCode: "",
    title: "",
    faculty: "",
    date: "",
    time: "",
    location: "",
    description: ""
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseCode || !form.title || !form.faculty || !form.date || !form.time || !form.location) {
      setError("All fields except description are required.");
      return;
    }
    // Simulate adding to sessions array (would be API call in real app)
    sessions.push({
      id: Date.now().toString(),
      ...form
    } as Session);
    setSuccess(true);
    setError("");
    setForm({ courseCode: "", title: "", faculty: "", date: "", time: "", location: "", description: "" });
    if (onSessionCreated) onSessionCreated();
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">Create New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select
            name="courseCode"
            value={form.courseCode}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
          <input
            type="text"
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="text"
              name="time"
              placeholder="10:00 AM - 11:00 AM"
              value={form.time}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            rows={2}
          />
        </div>
        {error && <div className="text-red-600 font-medium">{error}</div>}
        {success && <div className="text-green-600 font-medium">Session created successfully!</div>}
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow font-semibold">
          Create Session
        </button>
      </form>
    </div>
  );
}
