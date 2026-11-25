# Portwire

**English** | [한국어](README.ko.md)

An always-on-top macOS widget that starts and stops your local dev servers per project, and points each frontend at the right backend port.

<img src="docs/images/widget.png" width="340" alt="The widget showing two project groups: acme with backend, frontend and admin running, and shop turned off">

## Download

Download the `.dmg` from [Releases](https://github.com/gkseogus/portwire/releases/latest), open it, and move `Portwire.app` to the Applications folder.
macOS only. The app is a universal build for both Apple Silicon and Intel.

The app is ad-hoc signed and not notarized by Apple, so macOS blocks it the first time you open it. Open it in one of two ways:

- Try to open it once, then go to System Settings → Privacy & Security and click "Open Anyway".
- Remove the quarantine attribute in Terminal:

  ```sh
  xattr -dr com.apple.quarantine "/Applications/Portwire.app"
  ```

The UI is currently Korean only.

## Why

Every project used a different local port (8000/8001/8002), so a frontend often ended up talking to the wrong backend.
This widget shows the local servers of each project group (backend, frontend, admin) in a small always-on-top window
and starts and stops them. When it starts a server, it injects the port and the API address env vars so the frontend talks to the backend in the same group.
It never touches your project's `.env` files.

## Features

- Turn each service ON/OFF, or start/stop a whole group
- Details: port, URL, PID, command, working folder, start time, origin (widget or external), injected env, open log
- Servers started from a terminal are also detected by port, shown, and can be stopped
- Settings window: pick a folder and it fills in the project type, command, and port; connect backends and frontends by clicking (no JSON knowledge needed)
- Frameless window (340×520), always on top, shown on every Space, moved by dragging the header (double-click does not maximize it), remembers its last position
- macOS only

## Quick start

Click the settings icon in the widget header (or "Add server (서버 추가하기)" when there are no servers) to open the Local Server Settings window (`로컬서버 설정`).

1. **Add project (프로젝트 추가)** → pick the project folder. It recognizes FastAPI (`.venv/bin/uvicorn`), Next.js, and Vite,
   and fills in the name, command, and port. For a folder like `acme_frontend`, it suggests project `acme` and server `frontend`.
   It does not overwrite values you have already entered (to apply the detected command, use the "Use detected command (감지된 명령으로)" button).
2. In **Connections (연결)**, link backends and frontends by clicking.
   - Frontend (Next, Vite): choose "Backend this server sends API requests to (이 서버가 API 를 보낼 백엔드)", and that backend's address template goes into
     the API address variables found in the project's `.env*` files (e.g. `NEXT_PUBLIC_API_BASE_URL`, `VITE_API_URL`). Add and remove variables as chips.
     If the API lives under a path such as `/api`, enter it in "Path after address (주소 뒤 경로)". The value then becomes `{backend.url}/api`,
     and the path is kept when you switch backends. Env values already written in the form `{name.url}/path` are also read back and shown as connections.
   - Backend (FastAPI): check "Frontends allowed to connect (CORS) (이 서버에 접속을 허용할 프론트 (CORS))", and their addresses go into `CORS_ORIGINS` (the detected name), separated by commas.
   - From `.env*` files, only variable **names** are kept; values are not kept.
3. In **Preview (실행되는 모습)**, check the command and env with templates replaced by real ports, then **Save (저장)** (⌘S).
   Problems such as duplicate names or ports, empty commands, and references to missing servers are shown before saving, under the field and in the bottom bar ("n issues to fix (고칠 곳 n개)"), and saving is blocked.
   Saving replaces the file atomically, and only after the whole config passes validation.
4. If you edited a running server, stop and start it in the widget for the change to take effect (the window tells you so).

Deleting a project or server asks for confirmation once more. For advanced settings, you can enter values directly in the "Environment variables (advanced) (환경변수 (고급))" field,
and you can also open the file with "Edit JSON directly (JSON 직접 편집)" at the bottom of the sidebar.

## Configuration file

Location: `~/Library/Application Support/com.hdh.localserverwidget/services.json`

On first launch, if the file does not exist, it is created as an example that works right away. The example serves `example-site`, an empty app-only folder next to the config file,
with `python3 -m http.server` on `127.0.0.1` only (serving a shared folder such as `/tmp` could let other accounts download your files).
An existing file is never overwritten. You usually edit it through the settings window above, but you can also edit the file directly.
Changes show up in the widget on the next status poll (every 3 seconds). If the file is broken and cannot be read, the widget shows the error and an "Open config file (설정 파일 열기)" button.

```json
{
  "groups": [
    {
      "name": "acme",
      "services": [
        {
          "name": "backend",
          "cwd": "~/Desktop/acme_backend",
          "port": 8002,
          "command": ".venv/bin/uvicorn app.main:app --reload --port {port}",
          "env": { "CORS_ORIGINS": "{frontend.url},{admin.url}" }
        },
        {
          "name": "frontend",
          "cwd": "~/Desktop/acme_frontend",
          "port": 3100,
          "command": "./node_modules/.bin/next dev -H 127.0.0.1 -p {port}",
          "env": { "NEXT_PUBLIC_API_BASE_URL": "{backend.url}", "BACKEND_ORIGIN": "{backend.url}" }
        },
        {
          "name": "admin",
          "cwd": "~/Desktop/acme_admin",
          "port": 5173,
          "command": "./node_modules/.bin/vite --port {port} --strictPort",
          "env": { "VITE_API_URL": "{backend.url}" }
        }
      ]
    }
  ]
}
```

| Field | Description |
|---|---|
| `name` | A group name cannot contain `/` and cannot be `.` or `..` (it becomes the name of a log subfolder). A service name may use only ASCII letters, digits, `-`, and `_` (because it is referenced as `{name.url}`). The service id is `<group>/<service>` |
| `cwd` | Working folder. An absolute path or `~/...` (only a leading `~` is expanded). The folder must exist, and `/` or the home folder itself cannot be used |
| `port` | This service's port. Must be unique across all groups |
| `command` | The command to run. Can use the templates below |
| `env` | (Optional) Environment variables added at launch. Values can use the templates below |

### Template rules (only two)

Templates are substituted only inside `command` and `env` values.

1. `{port}` → the service's own port. In the example above, backend runs with `--port 8002`.
2. `{<service>.url}` → `http://localhost:<port>` of a service in the **same group**. In the example above,
   frontend's `NEXT_PUBLIC_API_BASE_URL` becomes `http://localhost:8002`,
   and backend's `CORS_ORIGINS` becomes `http://localhost:3100,http://localhost:5173`.

Since this file is the single source of ports, changing the backend port makes the frontend env and CORS follow along.
Pointing at a service that does not exist or using an unknown `{name}` is an error. Braces in any other shape (`{}`, `{a b}`) are left as is.
That is why the shell variable `${HOME}` is also read as a template and fails with an "Unknown template {HOME} (알 수 없는 템플릿 {HOME})" error. Write shell variables without braces, like `$HOME`.
`cwd` does not substitute templates; only a leading `~` is expanded to the home folder (`$HOME` and `~user` do not work).
`/` and the home folder itself cannot be used as `cwd`. Status is determined by the listener's working folder, so this rule keeps the widget from
mistaking another program running in such a folder for your server and stopping it.

### Configuration errors

The widget checks for JSON syntax errors (with line and column), unknown fields, duplicate ports, missing folders, invalid env names, and references to services that do not exist,
and shows each one on its own line. The widget does not quit; once you fix the file, the list comes back on the next poll (or when you press the Refresh (새로고침) button).

### Does env injection beat `.env`?

In Next.js (`process.env` comes before `.env*`), Vite (existing env takes top priority), and pydantic-settings (env > `.env` > defaults),
the process env always wins. However, an injected value **replaces the whole value**. For example, if your `.env` adds more origins to `CORS_ORIGINS`,
they are dropped while the widget runs the server, so append them to the value in the config yourself if you need them.
Because the CORS origins use `localhost`, open the app in the browser at `localhost` too, not `127.0.0.1`.

The reliable way to confirm injection is to look at the result. In the browser's network tab, check that API requests go to `localhost:<backend port>`.
You can also check that the address is in the JS bundle, and if the frontend builds its CSP from the API address, it also shows up in `connect-src` of the response's `Content-Security-Policy`.
Be careful when checking with `ps eww`. The PID in the details is the child that holds the port (`next-server`, the uvicorn worker), and there have been cases where the env
was not visible on that child. In that case, run `ps eww` on the parent (`next dev`, the uvicorn reloader).

## How it works

### Status

Every 3 seconds the widget checks the listener on each port (`lsof`) to determine status. Right after a start or stop it checks again immediately. The widget does not rely on child process handles, so servers started from a terminal show up the same way.

| Status | Meaning |
|---|---|
| Running (실행 중) | A process of this service is listening on the port |
| Stopped (꺼짐) | No listener on the port |
| Port conflict (포트 충돌) | A process with a different working folder is using the port. Starting is blocked, and the process using the port is never terminated. If a process the widget started is still alive, Stop stops only that process |
| Starting (시작 중) | The widget started it and the port is not open yet |
| Failed to start (시작 실패) | A process the widget started exited before opening the port. Check the cause with "Open log (로그 열기)" |

Origin of "Running (실행 중)"
- **Started by widget (위젯에서 실행)**: a process group this widget started.
- **Started externally (외부에서 실행)**: a process the widget did not start, but whose listener's working folder matches `cwd` in the config (such as a server started from a terminal).
  You can stop it from the widget. An external server did not receive the widget's env injection, so to use the injected values, stop it and start it again from the widget.

### Start and stop

- Start: runs `$SHELL -ilc 'exec <command>'` in `cwd` as a new session (process group), adding `env`.
  Because it is a login + interactive shell, the app gets the PATH from nvm, pyenv, and so on even when it is opened from Finder.
- Stop: for a server the widget started, sends SIGTERM to the whole process group, then SIGKILL if anything is still left after 3 seconds.
  For a server started externally, sends the same sequence to this service's processes listening on that port.

### Logs

`~/Library/Logs/com.hdh.localserverwidget/<group>/<service>.log` (e.g. `acme/backend.log`).
Each start appends a separator line and the command, and both stdout and stderr are collected. Open it with "Open log (로그 열기)" in the service details.
The file is created readable only by you (0600), and when it is over 10MB it is rotated to `<service>.log.1` on start and a new file is written.

## Security notes

- **Bind dev servers to loopback only.** uvicorn and Vite default to `127.0.0.1`/`localhost`, but `next dev` defaults to
  all network interfaces, so if you leave it that way, anyone on the same Wi-Fi can reach your dev server and its source maps.
  Add `-H 127.0.0.1` as in the example above. Remove it only briefly when you test from another device such as a phone, and turn on the macOS firewall while you do.
- **Do not put secrets in `services.json`.** The file is plain text, and `env` values are shown as is in the always-on-top widget details and the settings window
  (exposed during screen sharing). Keep passwords, tokens, and API keys in each project's `.env`.
- **Only add folders you trust.** When you pick a folder in the settings window, the app reads that folder's `package.json` and `.env*` (variable names only, regular files of 1MB or less only),
  and when you start a server it runs executables inside that folder (`.venv/bin/uvicorn`, `./node_modules/.bin/next`/`vite`) with your privileges.
- **Settings can be saved only from the settings window.** Rust checks which window made each call, so reading and saving settings, picking folders, and detection can be called only from the settings window,
  and start, stop, and open log only from the widget window. If the file changed outside the app after you opened the settings window, saving is refused; use "Reload from file (파일에서 다시 불러오기)" and make your edits again.
- **Logs keep server output as is.** Values such as the `code` and `state` of an OAuth callback can end up there. The files are readable only by you, but
  they are included in Time Machine backups.
- Anyone who can edit the config file can run its commands with your privileges. The config folder is in a location only you can write to (`~/Library`).

## Known limitations

- The widget does not appear over full-screen apps.
- If another macOS account holds the same port, `lsof` cannot see it, so it is not shown as "Port conflict (포트 충돌)" (and the widget cannot send signals to that process either).
- The record of which servers the widget started lives only in memory. After you restart the widget, those servers show as "Started externally (외부에서 실행)" (stopping them still works).
- The window position is saved only on a normal quit (the header close button, Cmd+Q, or Quit from the Dock). It is not saved when you stop `pnpm tauri dev` with Ctrl+C.
- Commands run in your login shell (`-ilc`), so your rc files are read. If your rc is slow, starting is slow too, and if your rc exports an env var with the same name, that value wins.
- Prefixing `command` with environment variables, like `FOO=1 cmd`, fails with "command not found: FOO=1" because of `exec`. Pass environment variables through the `env` field.
- Every `{name}` inside `command` and `env` is read as a template. The shell variable `${HOME}` causes an "Unknown template (알 수 없는 템플릿)" error, so write it without braces, like `$HOME`.
- `command` runs as `$SHELL -ilc "exec <command>"` (new session, setsid). So if you chain commands like `a && b` or `a; b`, only `a` runs and `b` does not.
  If you need several steps, wrap them like `sh -c 'a && b'`.
- The login shell takes about a second to start. Seeing "Starting (시작 중)" briefly right after a start is normal.

## Build from source

Requirements: Node + pnpm, Xcode Command Line Tools, Rust (stable, install with [rustup](https://rustup.rs)).

```sh
pnpm install
pnpm tauri dev      # run in development (the first build takes a few minutes)
pnpm tauri build    # release app → src-tauri/target/release/bundle/macos/
```

While the app runs, its icon shows in the Dock. Quit the widget with the close button in its header or from the Dock.
Servers the widget started keep running after you quit the widget.

### Development

```sh
pnpm test           # Vitest (tests/unit)
pnpm lint           # ESLint
pnpm typecheck      # tsc (app + test configs)

cd src-tauri
cargo test          # Rust unit and integration tests
cargo clippy --all-targets -- -D warnings   # Rust lint (rustup component add clippy)
rustfmt --edition 2024 --check src/*.rs examples/*.rs

# CLI to check behavior with a real config, without the widget
cargo run --example smoke -- <config.json> <log_dir> status
cargo run --example smoke -- <config.json> <log_dir> start|stop|cycle <group/service>
```

Servers started with `smoke`'s `start` keep running after smoke exits (same as the widget). On the next run they show as external.

## License

MIT. See [LICENSE](LICENSE).
