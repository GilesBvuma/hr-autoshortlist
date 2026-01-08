import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CandidateSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsOpen(false);
        };

        window.addEventListener("resize", handleResize);

        // Get user data from localStorage
        const storedUser = localStorage.getItem("userData");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        {
            name: "Find Jobs",
            path: "/jobs",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
        // Add more candidate-specific links here if needed
    ];

    const handleLogout = () => {
        localStorage.removeItem("candidateToken");
        localStorage.removeItem("userData");
        navigate("/auth/CandidateLogin");
    };

    const isActive = (path) => location.pathname === path;

    const NavContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white w-64">
            {/* Brand/Logo */}
            <div className="p-6 border-b border-slate-800">
                <Link to="/jobs" className="flex flex-col items-center group">
                    <img
                        src="/LOGO.png"
                        alt="Tano Logo"
                        className="w-32 h-auto mb-4 transition-transform group-hover:scale-105"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        Candidate Portal
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                    >
                        {item.icon}
                        <span className="ml-3 font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-800">
                {user ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
                                {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{user.fullName || "Candidate"}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-2 px-4 bg-slate-800 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/auth/CandidateLogin"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors block text-sm font-medium"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            {isMobile && (
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-50 px-4 flex items-center justify-between">
                    <Link to="/jobs" className="flex items-center gap-2">
                        <img src="/LOGO.png" alt="Logo" className="h-8 w-auto" />
                        <span className="font-bold text-white text-sm">Tano Recruitment</span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-slate-300 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="hidden lg:block fixed inset-y-0 left-0 z-40">
                    <NavContent />
                </div>
            )}

            {/* Mobile Drawer Overlay */}
            {isMobile && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
                            }`}
                    >
                        <NavContent />
                    </div>
                </>
            )}
        </>
    );
}
