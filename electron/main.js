const {
  app,
  BrowserWindow,
} = require("electron");

const {
  spawn,
  execFile,
} = require("child_process");

const path = require("path");
const http = require("http");
const fs = require("fs");

let mainWindow = null;
let nextProcess = null;

const PORT = 3000;
const NEXT_URL = `http://localhost:${PORT}`;

const N8N_PORT = 5678;
const N8N_URL = `http://localhost:${N8N_PORT}`;

const N8N_CONTAINER = "n8n";

const DOCKER_DESKTOP_PATH =
  "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe";

// ======================================================
// GENERIC COMMAND
// ======================================================

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      }
    );
  });
}

// ======================================================
// CHECK DOCKER
// ======================================================

async function isDockerReady() {
  try {
    await runCommand("docker", [
      "info",
    ]);

    return true;
  } catch {
    return false;
  }
}

// ======================================================
// OPEN DOCKER DESKTOP
// ======================================================

function openDockerDesktop() {
  return new Promise((resolve, reject) => {
    console.log("");
    console.log(
      "Docker Desktop belum berjalan."
    );

    console.log(
      "Membuka Docker Desktop..."
    );

    const dockerProcess = spawn(
      DOCKER_DESKTOP_PATH,
      [],
      {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      }
    );

    dockerProcess.on(
      "error",
      (error) => {
        console.error(
          "Gagal membuka Docker Desktop:",
          error
        );

        reject(error);
      }
    );

    dockerProcess.unref();

    resolve();
  });
}

// ======================================================
// WAIT FOR DOCKER
// ======================================================

function waitForDocker() {
  return new Promise(
    (resolve, reject) => {
      let attempts = 0;

      const maxAttempts = 60;

      const checkDocker = async () => {
        attempts++;

        console.log(
          `Checking Docker... ${attempts}/${maxAttempts}`
        );

        const ready =
          await isDockerReady();

        if (ready) {
          console.log(
            "Docker Engine sudah siap."
          );

          resolve();
          return;
        }

        if (
          attempts >= maxAttempts
        ) {
          reject(
            new Error(
              "Docker Engine tidak berhasil dijalankan."
            )
          );

          return;
        }

        setTimeout(
          checkDocker,
          1000
        );
      };

      checkDocker();
    }
  );
}

// ======================================================
// ENSURE DOCKER
// ======================================================

async function ensureDocker() {
  console.log("");
  console.log(
    "================================="
  );
  console.log(
    "Checking Docker Desktop..."
  );
  console.log(
    "================================="
  );

  const dockerReady =
    await isDockerReady();

  if (dockerReady) {
    console.log(
      "Docker Engine sudah berjalan."
    );

    return;
  }

  await openDockerDesktop();

  await waitForDocker();
}

// ======================================================
// CHECK N8N CONTAINER
// ======================================================

async function isN8nRunning() {
  try {
    const result =
      await runCommand(
        "docker",
        [
          "inspect",
          "-f",
          "{{.State.Running}}",
          N8N_CONTAINER,
        ]
      );

    return (
      result.stdout === "true"
    );
  } catch {
    return false;
  }
}

// ======================================================
// CHECK N8N CONTAINER EXISTS
// ======================================================

async function n8nContainerExists() {
  try {
    await runCommand(
      "docker",
      [
        "inspect",
        N8N_CONTAINER,
      ]
    );

    return true;
  } catch {
    return false;
  }
}

// ======================================================
// START N8N
// ======================================================

async function startN8n() {
  console.log("");
  console.log(
    "================================="
  );
  console.log(
    "Checking n8n..."
  );
  console.log(
    "================================="
  );

  const running =
    await isN8nRunning();

  if (running) {
    console.log(
      "n8n sudah berjalan."
    );

    return;
  }

  const exists =
    await n8nContainerExists();

  if (!exists) {
    throw new Error(
      `Container "${N8N_CONTAINER}" tidak ditemukan.`
    );
  }

  console.log(
    "Container n8n ditemukan."
  );

  console.log(
    "Menjalankan container n8n..."
  );

  try {
    const result =
      await runCommand(
        "docker",
        [
          "start",
          N8N_CONTAINER,
        ]
      );

    console.log(
      `Docker: ${result.stdout}`
    );
  } catch (error) {
    console.error(
      "Gagal menjalankan n8n:",
      error
    );

    throw error;
  }
}

// ======================================================
// CHECK HTTP SERVER
// ======================================================

function isServerReady(url) {
  return new Promise(
    (resolve) => {
      const request =
        http.get(
          url,
          (response) => {
            response.resume();

            resolve(true);
          }
        );

      request.on(
        "error",
        () => {
          resolve(false);
        }
      );

      request.setTimeout(
        1000,
        () => {
          request.destroy();

          resolve(false);
        }
      );
    }
  );
}

// ======================================================
// WAIT FOR N8N
// ======================================================

function waitForN8n() {
  return new Promise(
    (resolve, reject) => {
      let attempts = 0;

      const maxAttempts = 60;

      const checkN8n = async () => {
        attempts++;

        console.log(
          `Checking n8n... ${attempts}/${maxAttempts}`
        );

        const ready =
          await isServerReady(
            N8N_URL
          );

        if (ready) {
          console.log(
            "n8n sudah siap di localhost:5678."
          );

          resolve();
          return;
        }

        if (
          attempts >= maxAttempts
        ) {
          reject(
            new Error(
              "n8n tidak berhasil dijalankan setelah beberapa percobaan."
            )
          );

          return;
        }

        setTimeout(
          checkN8n,
          1000
        );
      };

      checkN8n();
    }
  );
}

// ======================================================
// ENSURE N8N
// ======================================================

async function ensureN8n() {
  await startN8n();

  await waitForN8n();
}

// ======================================================
// MIME TYPE
// ======================================================

function getMimeType(filePath) {
  const extension =
    path.extname(filePath)
      .toLowerCase();

  const mimeTypes = {
    ".html": "text/html",
    ".htm": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".txt": "text/plain",
  };

  return (
    mimeTypes[extension] ||
    "application/octet-stream"
  );
}

// ======================================================
// GET FRONTEND PATH
// ======================================================

function getFrontendPath() {
  // ==================================================
  // DEVELOPMENT
  // electron/main.js
  // ../out
  // ==================================================

  const developmentPath =
    path.join(
      __dirname,
      "..",
      "out"
    );

  // ==================================================
  // PACKAGED ELECTRON
  //
  // extraResources:
  // "out" -> "app/out"
  //
  // sehingga hasilnya:
  // resources/app/out
  // ==================================================

  const packagedPath =
    path.join(
      process.resourcesPath,
      "app",
      "out"
    );

  console.log(
    "Development frontend path:",
    developmentPath
  );

  console.log(
    "Packaged frontend path:",
    packagedPath
  );

  // ==================================================
  // DEVELOPMENT
  // ==================================================

  if (
    !app.isPackaged &&
    fs.existsSync(
      developmentPath
    )
  ) {
    return developmentPath;
  }

  // ==================================================
  // PACKAGED
  // ==================================================

  if (
    app.isPackaged &&
    fs.existsSync(
      packagedPath
    )
  ) {
    return packagedPath;
  }

  // ==================================================
  // FALLBACK
  // ==================================================

  if (
    fs.existsSync(
      developmentPath
    )
  ) {
    return developmentPath;
  }

  if (
    fs.existsSync(
      packagedPath
    )
  ) {
    return packagedPath;
  }

  return app.isPackaged
    ? packagedPath
    : developmentPath;
}

// ======================================================
// START NEXT.JS STATIC SERVER
// ======================================================

function startNextServer() {
  return new Promise(
    (resolve, reject) => {
      const outPath =
        getFrontendPath();

      console.log("");
      console.log(
        "================================="
      );
      console.log(
        "Starting Next.js Static Server"
      );
      console.log(
        "================================="
      );

      console.log(
        "Frontend path:"
      );

      console.log(
        outPath
      );

      // Pastikan folder out tersedia
      if (
        !fs.existsSync(
          outPath
        )
      ) {
        reject(
          new Error(
            `Folder Next.js "out" tidak ditemukan:\n${outPath}\n\nJalankan "npm run build" terlebih dahulu.`
          )
        );

        return;
      }

      // Pastikan index.html tersedia
      const indexPath =
        path.join(
          outPath,
          "index.html"
        );

      if (
        !fs.existsSync(
          indexPath
        )
      ) {
        reject(
          new Error(
            `index.html tidak ditemukan di:\n${indexPath}`
          )
        );

        return;
      }

      console.log(
        "Menjalankan static server..."
      );

      nextProcess =
        http.createServer(
          (req, res) => {
            try {
              let requestUrl =
                decodeURIComponent(
                  req.url.split("?")[0]
                );

              // Normalize path
              if (
                requestUrl ===
                "/"
              ) {
                requestUrl =
                  "/index.html";
              }

              // Hilangkan query/hash
              requestUrl =
                requestUrl.split(
                  "?"
                )[0];

              requestUrl =
                requestUrl.split(
                  "#"
                )[0];

              // Prevent path traversal
              const safePath = path.normalize(
                requestUrl.replace(/^[/\\]+/, "")
              );

              let filePath = path.join(
                outPath,
                safePath
              );

              // Pastikan file tetap berada
              // di dalam folder out
              if (
                !filePath.startsWith(
                  outPath
                )
              ) {
                res.writeHead(
                  403
                );

                res.end(
                  "Forbidden"
                );

                return;
              }

              // Jika route seperti /login
              // coba /login.html
              if (
                !path.extname(
                  filePath
                )
              ) {
                const htmlPath =
                  `${filePath}.html`;

                if (
                  fs.existsSync(
                    htmlPath
                  )
                ) {
                  filePath =
                    htmlPath;
                }
              }

              // Jika file tidak ditemukan,
              // gunakan Next.js fallback
              if (
                !fs.existsSync(
                  filePath
                ) ||
                !fs.statSync(
                  filePath
                ).isFile()
              ) {
                filePath =
                  indexPath;
              }

              const contentType =
                getMimeType(
                  filePath
                );

              res.writeHead(
                200,
                {
                  "Content-Type":
                    contentType,
                  "Cache-Control":
                    "no-cache",
                }
              );

              const stream =
                fs.createReadStream(
                  filePath
                );

              stream.pipe(res);

              stream.on(
                "error",
                (error) => {
                  console.error(
                    "File read error:",
                    error
                  );

                  if (
                    !res.headersSent
                  ) {
                    res.writeHead(
                      500
                    );
                  }

                  res.end(
                    "Internal Server Error"
                  );
                }
              );
            } catch (error) {
              console.error(
                "Static server request error:",
                error
              );

              if (
                !res.headersSent
              ) {
                res.writeHead(
                  500
                );
              }

              res.end(
                "Internal Server Error"
              );
            }
          }
        );

      nextProcess.on(
        "error",
        (error) => {
          console.error(
            "Static server error:",
            error
          );

          nextProcess = null;

          reject(error);
        }
      );

      nextProcess.listen(
        PORT,
        "127.0.0.1",
        () => {
          console.log(
            `Next.js static server berjalan di ${NEXT_URL}`
          );

          resolve();
        }
      );
    }
  );
}

// ======================================================
// WAIT FOR NEXT.JS
// ======================================================

function waitForNextServer() {
  return new Promise(
    (resolve, reject) => {
      let attempts = 0;

      const maxAttempts = 60;

      const checkServer = () => {
        attempts++;

        console.log(
          `Checking Next.js... ${attempts}/${maxAttempts}`
        );

        const request =
          http.get(
            NEXT_URL,
            (response) => {
              response.resume();

              console.log(
                `Next.js sudah siap dengan status ${response.statusCode}`
              );

              resolve();
            }
          );

        request.on(
          "error",
          () => {
            if (
              attempts >=
              maxAttempts
            ) {
              reject(
                new Error(
                  "Next.js tidak berhasil dijalankan setelah beberapa percobaan."
                )
              );

              return;
            }

            setTimeout(
              checkServer,
              500
            );
          }
        );

        request.setTimeout(
          1000,
          () => {
            request.destroy();

            if (
              attempts >=
              maxAttempts
            ) {
              reject(
                new Error(
                  "Timeout menunggu Next.js."
                )
              );

              return;
            }

            setTimeout(
              checkServer,
              500
            );
          }
        );
      };

      checkServer();
    }
  );
}

// ======================================================
// CREATE WINDOW
// ======================================================

async function createWindow() {
  try {
    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "Starting SmartHub..."
    );
    console.log(
      "================================="
    );

    // --------------------------------------------------
    // 1. START DOCKER
    // --------------------------------------------------

    await ensureDocker();

    // --------------------------------------------------
    // 2. START N8N
    // --------------------------------------------------

    await ensureN8n();

    // --------------------------------------------------
    // 3. START NEXT.JS STATIC SERVER
    // --------------------------------------------------

    await startNextServer();

    // --------------------------------------------------
    // 4. WAIT NEXT.JS
    // --------------------------------------------------

    await waitForNextServer();

    // --------------------------------------------------
    // 5. CREATE ELECTRON WINDOW
    // --------------------------------------------------

    console.log(
      "Membuka SmartHub..."
    );

    mainWindow =
      new BrowserWindow({
        width: 1440,
        height: 900,

        minWidth: 1100,
        minHeight: 700,

        title: "SmartHub",

        backgroundColor:
          "#f9fafb",

        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

    // --------------------------------------------------
    // LOAD FRONTEND
    // --------------------------------------------------

    await mainWindow.loadURL(
      NEXT_URL
    );

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "SmartHub berhasil dibuka."
    );
    console.log(
      "Docker       : READY"
    );
    console.log(
      "n8n          : READY"
    );
    console.log(
      "Next.js      : READY"
    );
    console.log(
      "================================="
    );

    // Debugging:
    // mainWindow.webContents.openDevTools();

    mainWindow.on("close", (event) => {
      if (!isCleaningUp) {
        event.preventDefault();
        cleanupAndExit();
      }
    });

    mainWindow.on(
      "closed",
      () => {
        mainWindow = null;
      }
    );
  } catch (error) {
    console.error("");
    console.error(
      "================================="
    );
    console.error(
      "GAGAL MENJALANKAN SMARTHUB"
    );
    console.error(
      "================================="
    );

    console.error(
      error
    );

    console.error("");

    // Jangan langsung quit supaya
    // console masih bisa dibaca.
  }
}

// ======================================================
// STOP NEXT.JS STATIC SERVER
// ======================================================

function stopNextServer() {
  return new Promise((resolve) => {
    if (!nextProcess) {
      resolve();
      return;
    }

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "Menghentikan Next.js server (localhost:3000)..."
    );
    console.log(
      "================================="
    );

    try {
      if (typeof nextProcess.closeAllConnections === "function") {
        nextProcess.closeAllConnections();
      }

      nextProcess.close((error) => {
        if (error) {
          console.error(
            "Gagal menghentikan Next.js static server:",
            error
          );
        } else {
          console.log(
            "Next.js static server berhasil dihentikan."
          );
        }
        nextProcess = null;
        resolve();
      });
    } catch (error) {
      console.error(
        "Error saat menghentikan Next.js static server:",
        error
      );
      nextProcess = null;
      resolve();
    }
  });
}

// ======================================================
// STOP N8N CONTAINER
// ======================================================

async function stopN8n() {
  console.log("");
  console.log(
    "================================="
  );
  console.log(
    "Menghentikan container n8n..."
  );
  console.log(
    "================================="
  );

  try {
    const running = await isN8nRunning();

    if (!running) {
      console.log(
        "Container n8n sudah tidak berjalan."
      );
      return;
    }

    console.log(
      `Menjalankan: docker stop -t 5 ${N8N_CONTAINER}...`
    );

    await runCommand("docker", [
      "stop",
      "-t",
      "5",
      N8N_CONTAINER,
    ]);

    console.log(
      "Container n8n berhasil dihentikan."
    );
  } catch (error) {
    console.error(
      "Gagal menghentikan container n8n:",
      error?.message || error
    );
  }
}

// ======================================================
// STOP DOCKER DESKTOP
// ======================================================

async function stopDockerDesktop() {
  console.log("");
  console.log(
    "================================="
  );
  console.log(
    "Menghentikan Docker Desktop..."
  );
  console.log(
    "================================="
  );

  try {
    console.log(
      "Menjalankan: docker desktop stop..."
    );
    await runCommand("docker", [
      "desktop",
      "stop",
      "--timeout",
      "10",
    ]);
    console.log(
      "Docker Desktop berhasil dihentikan via CLI."
    );
  } catch (cliError) {
    console.warn(
      "Gagal atau timeout via 'docker desktop stop', mencoba penutupan paksa...",
      cliError?.message || cliError
    );
  }

  // Pastikan proses Docker Desktop benar-benar tertutup
  const dockerProcesses = [
    "Docker Desktop.exe",
    "com.docker.backend.exe",
    "com.docker.proxy.exe",
  ];

  for (const procName of dockerProcesses) {
    try {
      await runCommand("taskkill", [
        "/F",
        "/IM",
        procName,
        "/T",
      ]);
    } catch {
      // Abaikan jika proses sudah tertutup atau tidak ditemukan
    }
  }

  console.log(
    "Docker Desktop selesai dihentikan."
  );
}

// ======================================================
// CLEANUP & EXIT
// ======================================================

let isCleaningUp = false;

async function cleanupAndExit() {
  if (isCleaningUp) {
    return;
  }
  isCleaningUp = true;

  console.log("");
  console.log(
    "================================="
  );
  console.log(
    "SmartHub sedang ditutup..."
  );
  console.log(
    "Membersihkan background services..."
  );
  console.log(
    "================================="
  );

  // Sembunyikan window segera agar user melihat aplikasi langsung tertutup
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.hide();
    } catch {
      // Abaikan jika window sudah tertutup
    }
  }

  // Pasang batas waktu (safety timeout 15 detik) agar proses tidak hang jika Docker macet
  const safetyTimeout = setTimeout(() => {
    console.warn(
      "Batas waktu cleanup tercapai (15 detik). Memaksa keluar..."
    );
    app.exit(0);
  }, 15000);

  try {
    // 1. Matikan Next.js static server (localhost:3000)
    await stopNextServer();

    // 2. Matikan container n8n
    await stopN8n();

    // 3. Matikan Docker Desktop
    await stopDockerDesktop();
  } catch (error) {
    console.error(
      "Error selama proses cleanup:",
      error
    );
  } finally {
    clearTimeout(safetyTimeout);
    console.log(
      "Semua services berhasil dimatikan. Aplikasi keluar."
    );
    app.exit(0);
  }
}

// ======================================================
// APP READY
// ======================================================

app.whenReady().then(() => {
  createWindow();

  app.on(
    "activate",
    () => {
      if (
        BrowserWindow.getAllWindows()
          .length === 0
      ) {
        createWindow();
      }
    }
  );
});

// ======================================================
// LIFECYCLE EVENTS
// ======================================================

app.on(
  "window-all-closed",
  () => {
    if (!isCleaningUp) {
      cleanupAndExit();
    }
  }
);

app.on(
  "before-quit",
  (event) => {
    if (!isCleaningUp) {
      event.preventDefault();
      cleanupAndExit();
    }
  }
);

process.on("SIGINT", () => {
  if (!isCleaningUp) {
    cleanupAndExit();
  }
});

process.on("SIGTERM", () => {
  if (!isCleaningUp) {
    cleanupAndExit();
  }
});