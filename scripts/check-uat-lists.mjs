// Run inside the frontend container with its environment. Never prints passwords or tokens.
const base = process.env.BACKEND_URL;
const password = process.env.UAT_ACCOUNT_PASSWORD;
if (!base || !password) throw new Error("BACKEND_URL atau UAT_ACCOUNT_PASSWORD belum terisi.");
const origin = new URL(base).origin;
for (const email of ["uat.pengaju-himpunan@demo.signit.example", "uat.ketupel@demo.signit.example"]) {
  console.log("Akun:", email);
  const login = await fetch(`${origin}/api/v1/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000),
  });
  console.log("Login HTTP:", login.status);
  if (!login.ok) continue;
  const tokens = await login.json();
  for (const path of ["/me", "/letters?page=1&pageSize=100", "/tasks?page=1&pageSize=100"]) {
    const response = await fetch(`${origin}/api/v1${path}`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }, signal: AbortSignal.timeout(15000),
    });
    console.log(path, "HTTP", response.status);
    if (!response.ok) { console.log("Request gagal; respons sensitif tidak ditampilkan."); continue; }
    const result = await response.json();
    if (path === "/me") console.log("Identitas:", result.id, result.email);
    else console.log(JSON.stringify({ total: result.total, rows: result.items?.map(item => ({ id: item.id, letterId: item.letterId, status: item.status })) }));
  }
  const logout = await fetch(`${origin}/api/v1/auth/logout`, {
    method: "POST", headers: { Authorization: `Bearer ${tokens.accessToken}` },
    signal: AbortSignal.timeout(15000),
  });
  console.log("Tutup sesi diagnostik HTTP:", logout.status);
}
