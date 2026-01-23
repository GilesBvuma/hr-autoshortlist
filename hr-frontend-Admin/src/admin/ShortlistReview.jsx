import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../api/adminApi";

export default function ShortlistReview() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Email state
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Job Details
                const jobRes = await adminApi.get(`/api/jobs/${jobId}`);
                setJob(jobRes.data);

                // Fetch Shortlisted Candidates using the shortlist endpoint
                // NOTE: backend endpoint returns map with 'shortlisted' flag.
                // We want ONLY shortlisted ones.
                const appsRes = await adminApi.get(`/api/jobs/${jobId}/shortlist`);
                const shortlisted = appsRes.data.filter(app => app.shortlisted);
                setCandidates(shortlisted);

                // Pre-fill email subject
                setEmailSubject(`Update regarding your application for ${jobRes.data.title}`);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    const filteredCandidates = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenEmailClient = () => {
        if (!emailSubject) {
            alert("Please provide a subject line.");
            return;
        }

        // 1. Get all candidate emails
        const emails = candidates.map(c => c.email).filter(e => e).join(",");

        if (!emails) {
            alert("No candidate emails found!");
            return;
        }

        // 2. Construct the mailto link
        // We use BCC (Blind Carbon Copy) so candidates don't see each other's addresses.
        // encodeURIComponent ensures special characters don't break the link.
        const subject = encodeURIComponent(emailSubject);
        const body = encodeURIComponent(emailBody);

        const mailtoLink = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;

        // 3. Open the default email client
        window.location.href = mailtoLink;
        setShowEmailModal(false);
    };

    const handleOpenGmail = () => {
        if (!emailSubject) {
            alert("Please provide a subject line.");
            return;
        }

        const emails = candidates.map(c => c.email).filter(e => e).join(",");
        const subject = encodeURIComponent(emailSubject);
        const body = encodeURIComponent(emailBody);

        // Gmail specific URL
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${emails}&su=${subject}&body=${body}`;

        window.open(gmailLink, '_blank');
        setShowEmailModal(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button
                            onClick={() => navigate("/admin/jobs/choose")}
                            className="text-slate-500 hover:text-slate-800 text-sm mb-2 flex items-center gap-1"
                        >
                            ← Back to Shortlists
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Final Review: {job?.title}
                        </h1>
                        <p className="text-slate-600">
                            {filteredCandidates.length} Candidates Shortlisted
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Compose Email
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredCandidates.map(candidate => (
                        <div key={candidate.applicationId} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center transition-all hover:bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                                <p className="text-slate-600">{candidate.email}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Shortlisted</span>

                                <button
                                    onClick={async () => {
                                        if (!window.confirm(`Remove ${candidate.name} from shortlist?`)) return;
                                        try {
                                            await adminApi.patch(`/api/applications/${candidate.applicationId}/toggle-shortlist`);
                                            setCandidates(prev => prev.filter(c => c.applicationId !== candidate.applicationId));
                                        } catch (err) {
                                            alert("Failed to update status");
                                            console.error(err);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium border border-transparent hover:border-red-200 px-3 py-1 rounded transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            {candidates.length === 0
                                ? "No candidates shortlisted yet."
                                : "No candidates found matching your search."}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 mb-4">Need to add more candidates?</p>
                        <button
                            onClick={() => navigate(`/admin/jobs/${jobId}/applicants`)}
                            className="text-indigo-600 font-semibold border border-indigo-200 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                            View All Applicants & Manage Shortlist
                        </button>
                    </div>
                </div>

            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Send Updates to {candidates.length} Candidates</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                <input
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message Body</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    rows="8"
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Dear Candidate..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleOpenEmailClient}
                                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Open Default Mail App
                            </button>

                            <button
                                onClick={handleOpenGmail}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                                </svg>
                                Open in Gmail
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
