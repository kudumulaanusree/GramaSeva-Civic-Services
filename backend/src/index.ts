import "dotenv/config";
import app from "./app.js";

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`🌾 GramaSeva Backend Server is running!`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Schemes API: http://localhost:${PORT}/api/schemes`);
  console.log(`🛡️ Admin API: http://localhost:${PORT}/api/admin/summary`);
  console.log(`===============================================`);
});
