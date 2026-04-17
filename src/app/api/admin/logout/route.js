export async function POST() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Logout successful"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `adminToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
      }
    }
  );
}
