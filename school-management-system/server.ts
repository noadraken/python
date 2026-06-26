import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Increase JSON payload limits to allow base64 file uploads (documents)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Dynamic child process runner for our python manager
export function runPythonAction(actionObj: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCmd, ["school_manager.py", JSON.stringify(actionObj)]);
    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (stderr) {
        console.warn("Python logger stderr:", stderr);
      }
      try {
        const trimmed = stdout.trim();
        // Since pip install might output strings before the JSON, let's find the last line or the JSON block
        const jsonStart = trimmed.indexOf('{"');
        if (jsonStart !== -1) {
          const jsonStr = trimmed.substring(jsonStart);
          const result = JSON.parse(jsonStr);
          resolve(result);
        } else {
          resolve({ 
            status: "error", 
            message: `No valid JSON found. Raw: ${trimmed}${stderr ? ` | Stderr: ${stderr}` : ''}` 
          });
        }
      } catch (err) {
        reject(new Error(`Failed to parse Python response: ${stdout}. Stderr: ${stderr}`));
      }
    });
  });
}

// Ensure the SQLite database is initialized and seeded on server bootup
async function initializeDatabase() {
  console.log("Bootstrapping Python SQLite database with SQLAlchemy...");
  try {
    const res = await runPythonAction({ action: "init" });
    console.log("Database bootup response:", res);
  } catch (error) {
    console.error("Database bootstrapping failed:", error);
  }
}

// REST API Endpoints

// OTP In-Memory Store
interface PendingOtp {
  otp: string;
  expiresAt: number;
  name?: string;
  password?: string;
  role: string;
  isGoogle: boolean;
}
const otpStore = new Map<string, PendingOtp>();

app.post("/api/auth/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await runPythonAction({ action: "check_user", email });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/send-otp", async (req, res) => {
  const { email, name, password, role, isGoogle } = req.body;
  try {
    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    
    otpStore.set(email, {
      otp,
      expiresAt,
      name,
      password,
      role,
      isGoogle: !!isGoogle
    });
    
    console.log(`[Simulated SMTP Server] OTP generated for ${email}: ${otp}`);
    
    res.json({
      status: "success",
      message: `OTP verification code dispatched to ${email}`,
      otp // Send back to client for simulated sandbox display
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const pending = otpStore.get(email);
    if (!pending) {
      return res.status(400).json({ status: "error", message: "No verification process found for this email." });
    }
    
    if (Date.now() > pending.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ status: "error", message: "Verification code has expired. Please request a new one." });
    }
    
    if (pending.otp !== otp) {
      return res.status(400).json({ status: "error", message: "Invalid verification code. Please check your inbox and try again." });
    }
    
    // OTP is valid, complete registration or Google OAuth login!
    otpStore.delete(email);
    
    if (pending.isGoogle) {
      const result = await runPythonAction({
        action: "gmail_login_or_signup",
        email,
        name: pending.name,
        role: pending.role
      });
      return res.json(result);
    } else {
      const result = await runPythonAction({
        action: "signup",
        email,
        password: pending.password,
        role: pending.role,
        name: pending.name
      });
      if (result.status === "success") {
        return res.json(result);
      } else {
        return res.status(400).json(result);
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await runPythonAction({ action: "login", email, password });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    const result = await runPythonAction({ action: "signup", email, password, role, name });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/gmail", async (req, res) => {
  const { email, name, role } = req.body;
  try {
    const result = await runPythonAction({ action: "gmail_login_or_signup", email, name, role });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-specific endpoints
app.post("/api/admin/teachers", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const result = await runPythonAction({ action: "add_teacher", email, password, name });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/teachers", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_teachers" });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/students", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_students" });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "delete_user", user_id: parseInt(req.params.id) });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/reports", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_admin_analytics" });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher-specific endpoints
app.get("/api/teacher/classes/:id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_teacher_classes", teacher_id: parseInt(req.params.id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/teacher/classes", async (req, res) => {
  const { name, code, description, teacher_id } = req.body;
  try {
    const result = await runPythonAction({
      action: "create_class",
      name,
      code: code.trim().toUpperCase(),
      description,
      teacher_id
    });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/teacher/enroll", async (req, res) => {
  const { class_id, email } = req.body;
  try {
    const result = await runPythonAction({ action: "add_student_to_class", class_id, email });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/teacher/class-students/:class_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_class_students", class_id: parseInt(req.params.class_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/teacher/grades", async (req, res) => {
  const { student_id, class_id, title, score, graded_by } = req.body;
  try {
    const result = await runPythonAction({ action: "add_grade", student_id, class_id, title, score, graded_by });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/teacher/grades/:class_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_class_grades", class_id: parseInt(req.params.class_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/teacher/analytics/:teacher_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_teacher_analytics", teacher_id: parseInt(req.params.teacher_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student-specific endpoints
app.post("/api/student/join", async (req, res) => {
  const { student_id, code } = req.body;
  try {
    const result = await runPythonAction({ action: "student_join_class", student_id, code });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/student/classes/:student_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_student_enrollments", student_id: parseInt(req.params.student_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/student/grades/:student_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_student_grades", student_id: parseInt(req.params.student_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/student/analytics/:student_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_student_analytics", student_id: parseInt(req.params.student_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Document Upload & Download endpoints
app.post("/api/documents/upload", async (req, res) => {
  const { title, filename, file_data_base64, class_id, uploaded_by } = req.body;
  try {
    const result = await runPythonAction({
      action: "upload_document",
      title,
      filename,
      file_data_base64,
      class_id,
      uploaded_by
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/documents/list/:class_id", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_documents", class_id: parseInt(req.params.class_id) });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/documents/download/:doc_id", async (req, res) => {
  const student_id = parseInt(req.query.student_id as string);
  try {
    const result = await runPythonAction({
      action: "download_document",
      document_id: parseInt(req.params.doc_id),
      student_id
    });
    if (result.status === "success") {
      res.json(result);
    } else {
      res.status(403).json(result);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Standard All Classes list for student reference or general dashboard
app.get("/api/classes/all", async (req, res) => {
  try {
    const result = await runPythonAction({ action: "get_classes" });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  await initializeDatabase();

  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for lightning-fast React rendering in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express School Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
