
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/adminStorage";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vorldx.com");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const ok = adminLogin(email, password);
    if (ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid email or password. Try admin@vorldx.com / admin123");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "white" }}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>V</div>
            <span style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: -1 }}>VorldX</span>
          </div>
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "12px 20px", marginBottom: 32, display: "inline-block" }}>
            <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Platform Admin Console</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: "white" }}>Platform Admin Login</h1>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Access the VorldX Admin Console</p>

          <div style={{ marginTop: 40, textAlign: "left" }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              {[{ icon: "🏢", label: "24 Organizations" }, { icon: "📄", label: "1,245 Documents" }, { icon: "✍️", label: "20 Subscriptions" }].map((item, i) => (
                <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ width: 460, background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white" }}>V</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>VorldX <span style={{ color: "#64748b", fontWeight: 400 }}>Admin</span></span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Sign in to continue</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 28 }}>Access the VorldX Admin Console</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" placeholder="admin@vorldx.com" required
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="form-input" placeholder="••••••••" required
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 14, height: 14, accentColor: "#6366f1" }} />
                <span style={{ fontSize: 13, color: "#374151" }}>Remember me</span>
              </label>
              <a href="#" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>Forgot password?</a>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14, marginBottom: 16 }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>

            <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>or</div>
            <button type="button" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 13, gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Demo Credentials</div>
            <div style={{ fontSize: 12, color: "#374151" }}>Email: <strong>admin@vorldx.com</strong></div>
            <div style={{ fontSize: 12, color: "#374151" }}>Password: <strong>admin123</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
