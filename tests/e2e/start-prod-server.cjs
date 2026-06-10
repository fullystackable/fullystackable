const { spawn } = require("node:child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const host = "127.0.0.1";
const port = process.env.PORT ?? "3000";
const useShell = process.platform === "win32";
let shuttingDown = false;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = createChildProcess(command, args);

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function main() {
  await run(npmCommand, ["run", "build"]);

  const server = createChildProcess(npmCommand, [
    "run",
    "start",
    "--",
    "--hostname",
    host,
    "--port",
    port,
  ]);

  const stopServer = () => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (process.platform === "win32") {
      const killer = spawn(
        "taskkill",
        ["/pid", String(server.pid), "/T", "/F"],
        {
          cwd: process.cwd(),
          stdio: "inherit",
          shell: false,
        },
      );

      killer.once("exit", () => {
        process.exit(0);
      });

      killer.once("error", () => {
        process.exit(0);
      });

      return;
    }

    if (!server.killed) {
      server.kill("SIGTERM");
    }

    setTimeout(() => {
      process.exit(0);
    }, 1_000).unref();
  };

  process.once("SIGINT", stopServer);
  process.once("SIGTERM", stopServer);
  process.once("exit", stopServer);

  server.once("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  server.once("exit", (code) => {
    process.exit(code ?? 0);
  });
}

function createChildProcess(command, args) {
  if (useShell) {
    return spawn(`${command} ${args.join(" ")}`, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });
  }

  return spawn(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
