const { spawn } = require("child_process")

function run(cmd, args, cwd) {
  const p = spawn(cmd, args, { cwd, stdio: "inherit", shell: true })
  p.on("exit", (code) => console.log(`[${cwd}] exited with code ${code}`))
}

run("powershell", ["-Command", ".venv\\Scripts\\Activate.ps1; uvicorn main:app --reload --port 8000"], "./backend")
run("npm", ["run", "dev"], "./frontend")
