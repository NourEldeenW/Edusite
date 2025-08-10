// "use client";

// import React, { useEffect, useMemo, useState } from "react";

// /**
//  * Next.js + TypeScript + Tailwind single-file page for "My Sessions"
//  * - Fetches data from the provided API: /student/my-sessions/
//  * - Expects an optional bearer token in localStorage under `authToken` or via env NEXT_PUBLIC_API_TOKEN
//  * - Includes client-side filtering, CSV export, and a details modal
//  *
//  * How to use:
//  * 1. Add this file to your Next.js project (for app router -> app/(main)/my-sessions/page.tsx OR pages/my-sessions.tsx)
//  * 2. Install and configure Tailwind CSS in your project.
//  * 3. Optionally set NEXT_PUBLIC_API_BASE to the base API url. Defaults to the base the user provided.
//  * 4. Put an auth token in localStorage under `authToken` (if required by backend) or set NEXT_PUBLIC_API_TOKEN.
//  */

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE ||
//   "https://apitest144.pythonanywhere.com/api/session/";

// // ---------- Types ----------

// type Homework = {
//   completed: boolean;
//   notes?: string | null;
// } | null;

// type TestScore = {
//   score: number;
//   max_score: number;
//   percentage: number;
//   notes?: string | null;
// } | null;

// type SessionItem = {
//   id: number;
//   date: string; // ISO
//   title: string;
//   notes?: string | null;
//   teacher_name?: string | null;
//   grade_name?: string | null;
//   center_name?: string | null;
//   has_homework: boolean;
//   has_test: boolean;
//   test_max_score?: number | null;
//   attendance_status?: "Present" | "Absent" | string;
//   homework: Homework;
//   test_score: TestScore;
// };

// type Stats = {
//   total_sessions_number: number;
//   total_sessions_attended: number;
//   total_absent: number;
//   average_attendance: number;
// };

// type APIResponse = {
//   stats: Stats;
//   sessions: SessionItem[];
// };

// // ---------- Helpers ----------

// const formatDate = (iso: string) => {
//   try {
//     const d = new Date(iso);
//     return d.toLocaleDateString(undefined, {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   } catch (e) {
//     return iso;
//   }
// };

// const downloadCSV = (
//   rows: Record<string, any>[],
//   filename = "sessions.csv"
// ) => {
//   if (!rows || rows.length === 0) return;
//   const headers = Object.keys(rows[0]);
//   const csv = [headers.join(",")]
//     .concat(
//       rows.map((r) =>
//         headers
//           .map((h) => {
//             const v = r[h] == null ? "" : String(r[h]).replace(/"/g, '""');
//             return `"${v}"`;
//           })
//           .join(",")
//       )
//     )
//     .join("\n");

//   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// // ---------- Component ----------

// export default function MySessionsPage() {
//   const [data, setData] = useState<APIResponse | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [filter, setFilter] = useState({ query: "", attendance: "all" });
//   const [selected, setSelected] = useState<SessionItem | null>(null);

//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       setError(null);
//       try {
//         const tokenFromEnv = process.env.NEXT_PUBLIC_API_TOKEN;
//         const tokenFromStorage =
//           typeof window !== "undefined"
//             ? localStorage.getItem("authToken")
//             : null;
//         const headers: Record<string, string> = {
//           "Content-Type": "application/json",
//         };
//         if (tokenFromStorage)
//           headers["Authorization"] = `Bearer ${tokenFromStorage}`;
//         else if (tokenFromEnv)
//           headers["Authorization"] = `Bearer ${tokenFromEnv}`;

//         const res = await fetch(`${API_BASE}student/my-sessions/`, {
//           method: "GET",
//           headers,
//           credentials: "include",
//         });

//         if (!res.ok) {
//           if (res.status === 401 || res.status === 403) {
//             setError(
//               "Unauthorized. Please login as a student or provide a valid token (localStorage: authToken)."
//             );
//           } else {
//             const text = await res.text();
//             setError(`Failed to fetch sessions. (${res.status}) ${text}`);
//           }
//           setData(null);
//         } else {
//           const json = (await res.json()) as APIResponse;
//           // Defensive conversions (API may return numbers as strings)
//           json.stats = {
//             total_sessions_number:
//               Number(json.stats.total_sessions_number) || 0,
//             total_sessions_attended:
//               Number(json.stats.total_sessions_attended) || 0,
//             total_absent: Number(json.stats.total_absent) || 0,
//             average_attendance: Number(json.stats.average_attendance) || 0,
//           };
//           setData(json);
//         }
//       } catch (err: any) {
//         setError(err?.message ?? String(err));
//         setData(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, []);

//   const filteredSessions = useMemo(() => {
//     if (!data?.sessions) return [];
//     const q = filter.query.trim().toLowerCase();
//     return data.sessions.filter((s) => {
//       if (filter.attendance !== "all") {
//         if (
//           filter.attendance === "present" &&
//           s.attendance_status !== "Present"
//         )
//           return false;
//         if (filter.attendance === "absent" && s.attendance_status !== "Absent")
//           return false;
//       }
//       if (!q) return true;
//       return (
//         s.title.toLowerCase().includes(q) ||
//         (s.teacher_name || "").toLowerCase().includes(q) ||
//         (s.center_name || "").toLowerCase().includes(q)
//       );
//     });
//   }, [data, filter]);

//   const handleExport = () => {
//     if (!data) return;
//     const rows = data.sessions.map((s) => ({
//       id: s.id,
//       date: s.date,
//       title: s.title,
//       teacher: s.teacher_name || "",
//       center: s.center_name || "",
//       attendance: s.attendance_status || "",
//       homework: s.homework
//         ? s.homework.completed
//           ? "Completed"
//           : "Not Completed"
//         : "No homework",
//       test_score: s.test_score
//         ? `${s.test_score.score}/${s.test_score.max_score}`
//         : s.has_test
//         ? "No score yet"
//         : "No test",
//     }));
//     downloadCSV(rows, "my-sessions.csv");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Navbar */}
//       <nav className="bg-gradient-to-b from-indigo-600 to-indigo-700 text-white px-6 py-4 shadow-md sticky top-0 z-30">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="text-2xl font-handwriting">🎓</div>
//             <div className="font-bold text-xl">EduTrack</div>
//           </div>
//           <div className="hidden md:flex items-center gap-6">
//             <a className="hover:underline" href="#">
//               Dashboard
//             </a>
//             <a className="hover:underline" href="#">
//               Courses
//             </a>
//             <a className="underline font-medium" href="#">
//               Sessions
//             </a>
//             <a className="hover:underline" href="#">
//               Assignments
//             </a>
//             <a className="hover:underline" href="#">
//               Performance
//             </a>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
//               JS
//             </div>
//             <div className="hidden sm:block">John Student</div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
//         <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//           <div>
//             <h1 className="text-2xl font-semibold">My Learning Sessions</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               View your class attendance, homework status, and test scores
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <input
//               value={filter.query}
//               onChange={(e) =>
//                 setFilter((p) => ({ ...p, query: e.target.value }))
//               }
//               className="px-3 py-2 border rounded-md text-sm w-48"
//               placeholder="Search sessions, teacher, center..."
//             />

//             <select
//               value={filter.attendance}
//               onChange={(e) =>
//                 setFilter((p) => ({ ...p, attendance: e.target.value }))
//               }
//               className="px-3 py-2 border rounded-md text-sm">
//               <option value="all">All</option>
//               <option value="present">Present</option>
//               <option value="absent">Absent</option>
//             </select>

//             <button
//               onClick={handleExport}
//               className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
//               Export CSV
//             </button>
//           </div>
//         </header>

//         {/* Stats */}
//         <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="text-xs text-gray-500">TOTAL SESSIONS</div>
//                 <div className="text-2xl font-bold">
//                   {data ? data.stats.total_sessions_number : "--"}
//                 </div>
//               </div>
//               <div className="bg-indigo-50 text-indigo-600 p-2 rounded-md">
//                 📅
//               </div>
//             </div>
//             <div className="text-sm text-green-600 mt-2">
//               {data ? `${data.stats.average_attendance}% attendance` : ""}
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="text-xs text-gray-500">ATTENDED</div>
//                 <div className="text-2xl font-bold">
//                   {data ? data.stats.total_sessions_attended : "--"}
//                 </div>
//               </div>
//               <div className="bg-green-50 text-green-600 p-2 rounded-md">
//                 ✔️
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="text-xs text-gray-500">ABSENT</div>
//                 <div className="text-2xl font-bold">
//                   {data ? data.stats.total_absent : "--"}
//                 </div>
//               </div>
//               <div className="bg-red-50 text-red-600 p-2 rounded-md">❌</div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="text-xs text-gray-500">AVERAGE GRADE</div>
//                 <div className="text-2xl font-bold">
//                   {data
//                     ? `${Math.round(data.stats.average_attendance)}%`
//                     : "--"}
//                 </div>
//               </div>
//               <div className="bg-yellow-50 text-yellow-600 p-2 rounded-md">
//                 ⭐
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Table container */}
//         <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           <div className="flex items-center justify-between px-6 py-4 border-b">
//             <div className="font-semibold">Recent Sessions</div>
//             <div>
//               <button
//                 className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
//                 onClick={() =>
//                   alert("New Session flow would open in a full app")
//                 }>
//                 + New Session
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[800px] table-auto">
//               <thead className="bg-gray-50 text-left text-sm text-gray-600">
//                 <tr>
//                   <th className="px-6 py-3">Date</th>
//                   <th className="px-6 py-3">Session</th>
//                   <th className="px-6 py-3">Attendance</th>
//                   <th className="px-6 py-3">Homework</th>
//                   <th className="px-6 py-3">Test Score</th>
//                   <th className="px-6 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && (
//                   <tr>
//                     <td colSpan={6} className="p-8 text-center">
//                       <div className="inline-block animate-spin border-4 border-indigo-200 border-t-indigo-600 rounded-full w-10 h-10" />
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && error && (
//                   <tr>
//                     <td colSpan={6} className="p-8 text-center text-red-600">
//                       {error}
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && !error && filteredSessions.length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="p-10 text-center">
//                       <div className="mb-3 text-2xl">📭</div>
//                       <div className="font-semibold">No Sessions Found</div>
//                       <p className="text-sm text-gray-500 mt-2">
//                         You don't have any sessions recorded yet. Check back
//                         later or contact your teacher.
//                       </p>
//                       <div className="mt-4">
//                         <button
//                           onClick={() => window.location.reload()}
//                           className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">
//                           Refresh
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )}

//                 {!loading &&
//                   !error &&
//                   filteredSessions.map((s) => (
//                     <tr key={s.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 align-top">
//                         <div className="font-semibold">
//                           {formatDate(s.date)}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           10:00 AM
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 align-top">
//                         <div className="font-semibold">{s.title}</div>
//                         <div className="text-sm text-gray-500 mt-1 flex gap-3">
//                           <span className="flex items-center gap-2">
//                             👩‍🏫 {s.teacher_name}
//                           </span>
//                           <span className="flex items-center gap-2">
//                             🏫 {s.center_name}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 align-top">
//                         {s.attendance_status === "Present" ? (
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-green-700 bg-green-50 text-sm">
//                             ✔ Present
//                           </span>
//                         ) : s.attendance_status === "Absent" ? (
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-red-700 bg-red-50 text-sm">
//                             ✖ Absent
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-yellow-700 bg-yellow-50 text-sm">
//                             ? Pending
//                           </span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 align-top">
//                         {s.homework ? (
//                           s.homework.completed ? (
//                             <span className="text-green-600 font-medium">
//                               Completed
//                             </span>
//                           ) : (
//                             <span className="text-red-600 font-medium">
//                               Not Completed
//                             </span>
//                           )
//                         ) : (
//                           <span className="text-gray-500">No homework</span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 align-top">
//                         {s.test_score ? (
//                           <div className="font-medium">
//                             {s.test_score.score}/{s.test_score.max_score}
//                           </div>
//                         ) : s.has_test ? (
//                           <span className="text-gray-500">No score yet</span>
//                         ) : (
//                           <span className="text-gray-500">No test</span>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 align-top">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => setSelected(s)}
//                             className="px-2 py-1 border rounded text-sm"
//                             aria-label={`View session ${s.title}`}>
//                             View
//                           </button>
//                           <button
//                             onClick={() =>
//                               alert(
//                                 "Download materials (not implemented in demo)"
//                               )
//                             }
//                             className="px-2 py-1 border rounded text-sm"
//                             aria-label={`Download materials for ${s.title}`}>
//                             Materials
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       </main>

//       <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
//         © 2023 EduTrack Learning System. All rights reserved.
//       </footer>

//       {/* Modal */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full p-6">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-lg font-semibold">{selected.title}</h3>
//                 <div className="text-sm text-gray-500">
//                   {formatDate(selected.date)}
//                 </div>
//               </div>
//               <button
//                 className="text-gray-500"
//                 onClick={() => setSelected(null)}>
//                 ✖
//               </button>
//             </div>

//             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <h4 className="text-sm font-medium">Teacher</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.teacher_name}
//                 </div>

//                 <h4 className="mt-3 text-sm font-medium">Center</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.center_name}
//                 </div>

//                 <h4 className="mt-3 text-sm font-medium">Notes</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.notes || "—"}
//                 </div>
//               </div>

//               <div>
//                 <h4 className="text-sm font-medium">Attendance</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.attendance_status}
//                 </div>

//                 <h4 className="mt-3 text-sm font-medium">Homework</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.homework
//                     ? selected.homework.completed
//                       ? `Completed — ${selected.homework.notes || ""}`
//                       : `Not completed — ${selected.homework.notes || ""}`
//                     : "No homework"}
//                 </div>

//                 <h4 className="mt-3 text-sm font-medium">Test Score</h4>
//                 <div className="text-sm text-gray-700">
//                   {selected.test_score
//                     ? `${selected.test_score.score}/${selected.test_score.max_score} — ${selected.test_score.percentage}%`
//                     : selected.has_test
//                     ? "No score yet"
//                     : "No test"}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={() => setSelected(null)}
//                 className="px-4 py-2 bg-gray-100 rounded mr-2">
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
