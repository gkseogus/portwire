# Portwire

**English** | [한국어](README.ko.md)

A small always-on-top macOS widget for your local dev servers. It starts and stops them per project and makes sure each frontend talks to the right backend port.

<img src="docs/images/widget.png" width="340" alt="The widget showing two project groups: acme with backend, frontend and admin running, and shop turned off">

## Download

Grab the `.dmg` from [Releases](https://github.com/gkseogus/portwire/releases/latest), open it, and drag `Portwire.app` into Applications.
It runs on macOS only, as a universal build for both Apple Silicon and Intel.

The app is ad-hoc signed and isn't notarized by Apple, so macOS blocks it the first time you open it. There are two ways past that:

- Try to open it once, then go to System Settings → Privacy & Security and click "Open Anyway".
- Or remove the quarantine attribute in Terminal:

  ```sh
  xattr -dr com.apple.quarantine "/Applications/Portwire.app"
  ```

The UI is Korean only for now.

## Why

Every project used a different local port (8000/8001/8002), and frontends kept ending up on the wrong backend.

Portwire puts each project's backend, frontend, and admin servers together as one group in a small window that stays on top. You start and stop them from there.
When it starts a server, it injects the port and the API address as env vars, so the frontend talks to the backend in its own group.
Your project's `.env` files are never touched.

## Features

- Turn each service on or off, or a whole group at once
- Service details: port, URL, PID, command, working folder, start time, whether the widget started it, injected env, and a button to open the log
- Servers you started from a terminal show up too. They're detected by port, and you can stop them
- A settings window that fills in the project type, command, and port when you pick a folder. Backends and frontends are connected by clicking, so you never have to write JSON
- A frameless 340×520 window that stays on top on every Space. Drag the header to move it, and it remembers where you left it. Double-clicking the header doesn't maximize it

## Quick start

Click the settings icon in the widget header to open the Local Server Settings window (`로컬서버 설정`). With no servers yet, there's an "Add server (서버 추가하기)" button that does the same.

1. Click **Add project (프로젝트 추가)** and pick the project folder. Portwire recognizes FastAPI (`.venv/bin/uvicorn`), Next.js, and Vite,
   and fills in the name, command, and port. For a folder like `acme_frontend`, it suggests project `acme` and server `frontend`.
   Anything you've already typed is left alone. To apply the detected command anyway, click "Use detected command (감지된 명령으로)".
2. Under **Connections (연결)**, link backends and frontends by clicking.
   - For a frontend (Next, Vite), pick a backend under "Backend this server sends API requests to (이 서버가 API 를 보낼 백엔드)".
     Its address template goes into the API address variables Portwire found in the project's `.env*` files, such as `NEXT_PUBLIC_API_BASE_URL` or `VITE_API_URL`.
     Variables are chips you can add and remove.
     If the API lives under a path like `/api`, put it in "Path after address (주소 뒤 경로)". The value becomes `{backend.url}/api`, and the path stays when you switch backends.
     Env values already written as `{name.url}/path` are read back and shown as connections.
   - For a backend (FastAPI), check the frontends under "Frontends allowed to connect (이 서버에 접속을 허용할 프론트 (CORS))".
     Their addresses go into the CORS variable found in `.env*`, comma-separated. If none is found, it's `CORS_ORIGINS`.
   - Portwire keeps only variable **names** from `.env*` files, never the values.
3. **Preview (실행되는 모습)** shows the command and env with templates swapped for real ports. Check them, then click **Save (저장)** or press ⌘S.
   Problems such as duplicate names or ports, empty commands, and references to missing servers are flagged before you can save, under the field and in the bottom bar ("n issues to fix (고칠 곳 n개)").
   Saving stays blocked until they're fixed. The file is only replaced once the whole config passes validation, and the write is atomic.
4. If you changed a server that's running, stop and start it from the widget to pick up the change. The window reminds you.

Deleting a project or server asks you to confirm first. For anything advanced, type values straight into "Environment variables (advanced) (환경변수 (고급))".
To add several at once, click "Paste all at once (한꺼번에 붙여넣기)" there and paste `KEY=VALUE` lines the way they'd appear in a `.env` file. If a name already exists, its value is replaced. Leave secrets out of it (see [Security notes](#security-notes)).
You can also open the file itself with "Edit JSON directly (JSON 직접 편집)" at the bottom of the sidebar.

## Configuration file

Location: `~/Library/Application Support/com.hdh.localserverwidget/services.json`

If the file doesn't exist on first launch, Portwire creates an example that works right away. It serves `example-site`, an empty folder of its own next to the config file,
with `python3 -m http.server` on `127.0.0.1` only. It avoids a shared folder like `/tmp` on purpose, since serving one could let other accounts download your files.
An existing file is never overwritten.

You'll usually edit it through the settings window, but editing the file by hand works too. The widget picks up changes on its next status poll, every 3 seconds.
If the file is broken and can't be read, the widget shows the error and an "Open config file (설정 파일 열기)" button.

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
| `name` | A group name can't contain `/` and can't be `.` or `..`, because it becomes a log subfolder. A service name may use only ASCII letters, digits, `-`, and `_`, since it's referenced as `{name.url}`. The service id is `<group>/<service>` |
| `cwd` | Working folder, as an absolute path or `~/...`. It must exist, and it can't be `/` or your home folder itself |
| `port` | This service's port. Must be unique across all groups |
| `command` | The command to run. Templates work here |
| `env` | Optional env vars added at launch. Values can use templates |

### Template rules (only two)

Templates are substituted only inside `command` and `env` values.

1. `{port}` is the service's own port. In the example, backend runs with `--port 8002`.
2. `{<service>.url}` is `http://localhost:<port>` of a service in the **same group**. In the example,
   frontend's `NEXT_PUBLIC_API_BASE_URL` becomes `http://localhost:8002`,
   and backend's `CORS_ORIGINS` becomes `http://localhost:3100,http://localhost:5173`.

Ports live in this one file, so when you change the backend port, the frontend env and CORS follow.
Pointing at a service that doesn't exist, or using an unknown `{name}`, is an error. Braces in any other shape, like `{}` or `{a b}`, are left alone.
Shell variables get caught by this too: `${HOME}` is read as a template and fails with "Unknown template {HOME} (알 수 없는 템플릿 {HOME})". Write `$HOME` without braces instead.

`cwd` doesn't take templates. Only a leading `~` is expanded to your home folder, so `$HOME` and `~user` don't work there.
Blocking `/` and the home folder matters because status is judged by the listener's working folder. Without that rule, the widget
could mistake some other program running in such a folder for your server and stop it.

### Configuration errors

The widget checks for JSON syntax errors (with line and column), unknown fields, duplicate ports, missing folders, invalid env names, and references to services that don't exist.
Each problem gets its own line. The widget keeps running, and once you fix the file the list comes back on the next poll, or right away if you press Refresh (새로고침).

### Does env injection beat `.env`?

For Next.js, Vite, and pydantic-settings, yes. Next.js gives `process.env` priority over `.env*`, Vite gives existing env top priority, and pydantic-settings goes env > `.env` > defaults.

The catch is that an injected value **replaces the whole value**. Say your `.env` adds extra origins to `CORS_ORIGINS`.
While the widget runs the server, those are gone, so append them to the value in the config if you need them.
The CORS origins use `localhost`, which means you should open the app at `localhost` in the browser too, not `127.0.0.1`.

The surest check is the result. Open the browser's network tab and see whether API requests go to `localhost:<backend port>`.
You can also look for the address in the JS bundle. If the frontend builds its CSP from the API address, it shows up in `connect-src` of the response's `Content-Security-Policy` as well.

Be careful with `ps eww`. The PID in the details is the child that holds the port (`next-server`, the uvicorn worker), and in some cases the env
didn't show up on that child. If that happens, run `ps eww` on the parent (`next dev`, the uvicorn reloader).

## How it works

### Status

Every 3 seconds the widget looks at the listener on each port (`lsof`) to work out status, and it checks again right after a start or stop.
It doesn't depend on child process handles. That's why servers started from a terminal show up the same way.

| Status | Meaning |
|---|---|
| Running (실행 중) | A process of this service is listening on the port |
| Stopped (꺼짐) | Nothing is listening on the port |
| Port conflict (포트 충돌) | A process from a different working folder holds the port. Starting is blocked, and the widget never terminates that process. If a process the widget started is still alive, Stop stops only that one |
| Starting (시작 중) | The widget started it and the port isn't open yet |
| Failed to start (시작 실패) | A process the widget started exited before opening the port. "Open log (로그 열기)" shows why |

A running service also shows who started it:
- **Started by widget (위젯에서 실행)**: a process group this widget started.
- **Started externally (외부에서 실행)**: a process the widget didn't start, but whose listener's working folder matches `cwd` in the config, like a server you started from a terminal.
  You can stop it from the widget. It never got the widget's env injection, though. To use the injected values, stop it and start it again from the widget.

### Start and stop

- Start runs `$SHELL -ilc 'exec <command>'` in `cwd` as a new session (process group), with `env` added.
  It's a login + interactive shell, so the app gets the PATH set up by nvm, pyenv and the like even when you open it from Finder.
- Stop sends SIGTERM to the whole process group of a server the widget started, then SIGKILL to whatever is left after 3 seconds.
  An external server gets the same sequence, sent to this service's processes listening on that port.

### Logs

`~/Library/Logs/com.hdh.localserverwidget/<group>/<service>.log`, for example `acme/backend.log`.
Each start appends a separator line and the command, followed by both stdout and stderr. Open it with "Open log" in the service details.
Only you can read the file (0600). If it's over 10MB at start, it's rotated to `<service>.log.1` and a new file begins.

## Security notes

- **Bind dev servers to loopback only.** uvicorn and Vite default to `127.0.0.1`/`localhost`, but `next dev` listens on
  all network interfaces by default. Leave it that way and anyone on the same Wi-Fi can reach your dev server and its source maps.
  Add `-H 127.0.0.1` as in the example above. Drop it only briefly when testing from another device such as a phone, and turn on the macOS firewall while you do.
- **Don't put secrets in `services.json`.** It's plain text, and `env` values appear as is in the always-on-top widget details and the settings window,
  so they're visible to anyone watching when you share your screen. Keep passwords, tokens, and API keys in each project's `.env`.
- Only add folders you trust. Picking a folder in the settings window makes the app read its `package.json` and `.env*` (variable names only, regular files of 1MB or less only).
  Starting a server runs executables inside that folder with your privileges: `.venv/bin/uvicorn`, `./node_modules/.bin/next` or `vite`.
- Settings can be saved only from the settings window. Rust checks which window each call comes from. Reading and saving settings, picking folders, and detection work only from the settings window,
  and start, stop, and open log only from the widget. If the file changed outside the app after you opened the settings window, saving is refused. Use "Reload from file (파일에서 다시 불러오기)" and make your edits again.
- Logs keep server output exactly as printed. That can include the `code` and `state` of an OAuth callback. Only you can read the files, but
  they do go into Time Machine backups.
- Anyone who can edit the config file can run its commands with your privileges. The config folder sits in `~/Library`, where only you can write.

## Known limitations

- The widget doesn't appear over full-screen apps.
- If another macOS account holds the same port, `lsof` can't see it, so it won't show as "Port conflict". The widget can't send signals to that process either.
- The record of which servers the widget started lives only in memory. After you restart the widget, those servers show as "Started externally", though you can still stop them.
- The window position is saved only on a normal quit: the header close button, Cmd+Q, or Quit from the Dock. Stopping `pnpm tauri dev` with Ctrl+C doesn't save it.
- Commands run in your login shell (`-ilc`), so your rc files are read. A slow rc means a slow start, and if your rc exports an env var with the same name, the rc's value wins.
- Prefixing `command` with env vars, as in `FOO=1 cmd`, fails with "command not found: FOO=1" because of `exec`. Use the `env` field for those.
- `command` runs as `$SHELL -ilc "exec <command>"` in a new session (setsid). If you chain commands like `a && b` or `a; b`, only `a` runs and `b` never does.
  For several steps, wrap them in `sh -c 'a && b'`.
- The login shell takes about a second to start, so seeing "Starting" briefly right after a start is normal.

## Build from source

Requirements: Node + pnpm, Xcode Command Line Tools, and Rust (stable, install with [rustup](https://rustup.rs)).

```sh
pnpm install
pnpm tauri dev      # run in development (the first build takes a few minutes)
pnpm tauri build    # release app → src-tauri/target/release/bundle/macos/
```

The app shows a Dock icon while it runs. Quit the widget with the close button in its header or from the Dock.
Servers the widget started keep running after you quit it.

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

Servers started with `smoke`'s `start` keep running after smoke exits, just like with the widget. On the next run they show as external.

## License

MIT. See [LICENSE](LICENSE).
