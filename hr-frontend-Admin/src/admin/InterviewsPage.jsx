import { useState, useEffect } from "react";
import adminApi from "../api/adminApi";

export default function InterviewsPage() {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [summary, setSummary] = useState(null);

    // Form State
    const [form, setForm] = useState({
        interviewDate: "",
        interviewTime: "",
        interviewMode: "Online",
        interviewLocation: "",
        jobId: ""
    });

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobsRes = await adminApi.get("/api/jobs");
                setJobs(jobsRes.data);

                // Correct endpoint: /api/applications/all
                const appsRes = await adminApi.get("/api/applications/all");
                const shortlisted = appsRes.data.filter(app => app.shortlisted);
                setCandidates(shortlisted);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(candidates.map(c => c.candidateId));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (candidateId) => {
        setSelectedIds(prev =>
            prev.includes(candidateId) ? prev.filter(i => i !== candidateId) : [...prev, candidateId]
        );
    };

    const handleSendInvitations = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) return alert("Select candidates first");
        if (!form.jobId) return alert("Select a job for context");

        setSending(true);
        try {
            const res = await adminApi.post("/admin/interviews/send", {
                candidateIds: selectedIds,
                ...form
            });
            setSummary(res.data);
            setShowModal(false);
            // Optional: refresh or clear selection
            setSelectedIds([]);
        } catch (err) {
            alert("Failed to send invitations");
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Interview Invitations</h1>
                        <p className="text-slate-600">Send bulk invitations to shortlisted candidates</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={selectedIds.length === 0}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedIds.length > 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                    >
                        Send Interview Invitations ({selectedIds.length})
                    </button>
                </div>

                {summary && (
                    <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex justify-between items-center">
                        <span>Invitations Sent: <strong>{summary.sent}</strong> | Failed: <strong>{summary.failed}</strong></span>
                        <button onClick={() => setSummary(null)} className="text-green-900 font-bold">×</button>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">
                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === candidates.length && candidates.length > 0} />
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Candidate Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Job Applied For</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {candidates.map(candidate => (
                                <tr key={candidate.candidateId} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(candidate.candidateId)}
                                            onChange={() => handleSelectOne(candidate.candidateId)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">{candidate.fullname}</td>
                                    <td className="px-6 py-4 text-slate-600">{candidate.email}</td>
                                    <td className="px-6 py-4 text-slate-600">{candidate.jobTitle}</td>
                                </tr>
                            ))}
                            {candidates.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No shortlisted candidates found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Interview Details</h2>
                        <form onSubmit={handleSendInvitations} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Select Job Linkage</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                    value={form.jobId}
                                    onChange={e => setForm({ ...form, jobId: e.target.value })}
                                >
                                    <option value="">-- Choose Job --</option>
                                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                        value={form.interviewDate}
                                        onChange={e => setForm({ ...form, interviewDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Time</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 10:00 AM"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        required
                                        value={form.interviewTime}
                                        onChange={e => setForm({ ...form, interviewTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Mode</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={form.interviewMode}
                                    onChange={e => setForm({ ...form, interviewMode: e.target.value })}
                                >
                                    <option value="Online">Online</option>
                                    <option value="Physical">Physical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Location or Meeting Link</label>
                                <input
                                    type="text"
                                    placeholder="https://meet.google.com/..."
                                    className="w-full px-4 py-2 border rounded-lg"
                                    required
                                    value={form.interviewLocation}
                                    onChange={e => setForm({ ...form, interviewLocation: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {sending ? "Sending..." : "Send Invitations"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
