# Portwire

[English](README.md) | **한국어**

로컬 개발 서버를 프로젝트 단위로 켜고 끄는 macOS 위젯이다. 늘 다른 창 위에 떠 있고, 프론트가 같은 프로젝트의 백엔드 포트를 보도록 맞춰 준다.

<img src="docs/images/widget.png" width="340" alt="acme 그룹의 backend·frontend·admin 이 실행 중이고 shop 그룹은 꺼져 있는 위젯 화면">

## 다운로드

[Releases](https://github.com/gkseogus/portwire/releases/latest) 에서 `.dmg` 를 받아 열고 `Portwire.app` 을 Applications 폴더로 옮긴다.
macOS 전용이고, Apple Silicon 과 Intel 을 모두 지원하는 유니버설 앱이다.

Apple 공증을 받지 않은 ad-hoc 서명 앱이라 처음 열 때 macOS 가 막는다. 여는 방법은 두 가지다.

- 한 번 열어 본 다음, 시스템 설정 → 개인정보 보호 및 보안 에서 "그래도 열기" 를 누른다.
- 아니면 터미널에서 격리 속성을 지운다.

  ```sh
  xattr -dr com.apple.quarantine "/Applications/Portwire.app"
  ```

## 왜 만들었나

프로젝트마다 로컬 포트가 제각각(8000/8001/8002)이라 프론트가 엉뚱한 백엔드에 붙는 일이 잦았다.

Portwire 는 프로젝트의 백엔드·프론트·어드민 서버를 한 그룹으로 묶어, 늘 위에 떠 있는 작은 창에 띄운다. 켜고 끄는 것도 거기서 한다.
서버를 켤 때 포트와 API 주소를 env 로 넣어 주기 때문에, 프론트는 늘 같은 그룹의 백엔드를 본다.
프로젝트의 `.env` 파일은 건드리지 않는다.

## 기능

- 서비스를 하나씩 켜고 끄거나, 그룹 전체를 한 번에 켜고 끈다
- 상세 정보: 포트, URL, PID, 실행 명령, 작업 폴더, 시작 시각, 위젯이 띄웠는지 여부, 주입한 env, 로그 열기
- 터미널에서 띄운 서버도 포트로 찾아내 보여 주고, 위젯에서 끌 수 있다
- 설정 창에서 폴더만 고르면 프로젝트 종류·실행 명령·포트가 채워진다. 백엔드와 프론트는 클릭으로 이으니 JSON 을 몰라도 된다
- 프레임 없는 340×520 창이다. 늘 위에 있고 모든 Space 에 보이며, 헤더를 끌어 옮기면 그 자리를 기억하고, 헤더를 더블클릭해도 커지지 않는다

## 빠른 시작

위젯 헤더의 설정 아이콘을 누르면 `로컬서버 설정` 창이 열린다. 서버가 하나도 없을 때는 "서버 추가하기" 를 눌러도 된다.

1. **프로젝트 추가** 를 누르고 프로젝트 폴더를 고른다. FastAPI(`.venv/bin/uvicorn`), Next.js, Vite 를 알아보고
   이름·실행 명령·포트를 채운다. 폴더 이름이 `acme_frontend` 면 프로젝트 `acme`, 서버 `frontend` 로 제안한다.
   이미 적어 둔 값은 덮어쓰지 않는다. 감지된 명령을 쓰고 싶으면 "감지된 명령으로" 버튼을 누른다.
2. **연결** 에서 백엔드와 프론트를 클릭으로 잇는다.
   - 프론트(Next·Vite)는 "이 서버가 API 를 보낼 백엔드" 에서 백엔드를 고른다. 그러면 프로젝트 `.env*` 에서 찾은 API 주소 변수에
     그 백엔드의 주소 템플릿이 들어간다. `NEXT_PUBLIC_API_BASE_URL`, `VITE_API_URL` 같은 변수다. 변수는 칩으로 더하고 뺀다.
     API 가 `/api` 같은 경로 아래에 있으면 "주소 뒤 경로" 에 적는다. 값은 `{backend.url}/api` 가 되고, 백엔드를 바꿔도 경로는 남는다.
     `{이름.url}/경로` 꼴로 이미 적혀 있는 env 도 연결로 읽어 보여 준다.
   - 백엔드(FastAPI)는 "이 서버에 접속을 허용할 프론트 (CORS)" 에서 프론트를 체크한다. 체크한 주소들은 `.env*` 에서 찾은 CORS 변수에
     쉼표로 이어 들어간다. 찾은 변수가 없으면 `CORS_ORIGINS` 를 쓴다.
   - `.env*` 에서는 변수 **이름만** 가져오고, 값은 남겨 두지 않는다.
3. **실행되는 모습** 에서 템플릿이 실제 포트로 바뀐 명령과 env 를 확인한 뒤 **저장**(⌘S)한다.
   이름·포트 중복, 빈 명령, 없는 서버 참조 같은 문제는 저장 전에 칸 아래와 하단 바("고칠 곳 n개")에 표시되고, 고치기 전까지 저장이 막힌다.
   파일은 전체 검증을 통과해야만 바뀌고, 바뀔 때는 원자적으로 교체된다.
4. 실행 중인 서버를 고쳤다면 위젯에서 껐다 켜야 반영된다. 창에서도 알려 준다.

프로젝트나 서버를 지울 때는 한 번 더 묻는다. 고급 설정은 "환경변수 (고급)" 칸에 직접 넣는다.
여러 개를 넣을 때는 그 칸의 "한꺼번에 붙여넣기" 를 눌러 `.env` 처럼 `KEY=VALUE` 줄을 붙여넣으면 된다. 이미 있는 이름은 값이 바뀐다. 비밀값은 넣지 않는다([보안 주의](#보안-주의) 참고).
사이드바 아래 "JSON 직접 편집" 으로 파일을 바로 열 수도 있다.

## 설정 파일

위치: `~/Library/Application Support/com.hdh.localserverwidget/services.json`

처음 실행했을 때 파일이 없으면 바로 돌려 볼 수 있는 예시를 만든다. 예시는 설정 파일 옆에 앱이 따로 만든 빈 폴더 `example-site` 를
`python3 -m http.server` 로 `127.0.0.1` 에만 연다. `/tmp` 같은 공용 폴더를 쓰지 않는 건, 그런 폴더를 열면 다른 계정이 내 파일을 받아 갈 수 있어서다.
파일이 이미 있으면 절대 덮어쓰지 않는다.

보통은 앞의 설정 창으로 고치지만, 파일을 직접 고쳐도 된다. 고친 내용은 다음 상태 조회 때 위젯에 반영된다. 조회는 3초마다 한다.
파일이 깨져서 읽지 못하면 위젯에 오류와 "설정 파일 열기" 버튼이 뜬다.

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

| 필드 | 설명 |
|---|---|
| `name` | 그룹 이름에는 `/` 를 쓸 수 없고 `.`, `..` 도 안 된다. 로그 하위 폴더 이름이 되기 때문이다. 서비스 이름은 `{이름.url}` 로 참조하므로 영문·숫자·`-`·`_` 만 쓴다. 서비스 id 는 `<그룹>/<서비스>` |
| `cwd` | 작업 폴더. 절대 경로나 `~/...` 로 쓴다. 실제로 있는 폴더여야 하고, `/` 나 홈 폴더 자체는 안 된다 |
| `port` | 이 서비스의 포트. 모든 그룹을 통틀어 겹치면 안 된다 |
| `command` | 실행 명령. 템플릿을 쓸 수 있다 |
| `env` | (선택) 실행할 때 더할 환경변수. 값에 템플릿을 쓸 수 있다 |

### 템플릿 규칙 (두 가지뿐)

템플릿은 `command` 와 `env` 값 안에서만 치환된다.

1. `{port}` 는 그 서비스 자신의 포트다. 위 예시의 backend 는 `--port 8002` 로 뜬다.
2. `{<서비스명>.url}` 은 **같은 그룹** 서비스의 `http://localhost:<포트>` 다. 위 예시에서
   frontend 의 `NEXT_PUBLIC_API_BASE_URL` 은 `http://localhost:8002`,
   backend 의 `CORS_ORIGINS` 는 `http://localhost:3100,http://localhost:5173` 이 된다.

포트는 이 파일 한 곳에만 적으므로, backend 포트를 바꾸면 프론트 env 와 CORS 도 따라 바뀐다.
없는 서비스를 가리키거나 모르는 `{이름}` 을 쓰면 오류다. `{}`, `{a b}` 처럼 모양이 다른 중괄호는 그대로 둔다.
셸 변수도 여기에 걸린다. `${HOME}` 은 템플릿으로 읽혀 "알 수 없는 템플릿 {HOME}" 오류가 나니, `$HOME` 처럼 중괄호 없이 쓴다.

`cwd` 는 템플릿을 치환하지 않는다. 맨 앞의 `~` 만 홈 폴더로 펼치고, `$HOME` 이나 `~user` 는 안 된다.
`/` 와 홈 폴더 자체를 막아 둔 데는 이유가 있다. 상태를 리스너의 작업 폴더로 판정하기 때문에, 막지 않으면 그런 폴더에서 도는
다른 프로그램을 내 서버로 착각해 끌 수 있다.

### 설정 오류

JSON 문법 오류(행·열 표시), 모르는 필드, 중복 포트, 없는 폴더, 잘못된 env 이름, 없는 서비스 참조를 검사해 위젯에 한 줄씩 보여 준다.
위젯은 꺼지지 않는다. 파일을 고치면 다음 조회 때 목록이 다시 나오고, 새로고침 버튼을 누르면 바로 나온다.

### env 주입이 `.env` 를 이기는가

Next.js, Vite, pydantic-settings 에서는 이긴다. Next.js 는 `process.env` 를 `.env*` 보다 우선하고, Vite 는 이미 있는 env 를 가장 우선하며,
pydantic-settings 는 env > `.env` > 기본값 순서다.

다만 주입값은 **값 전체를 교체**한다. `.env` 의 `CORS_ORIGINS` 에 오리진을 더 적어 두었다면 위젯으로 띄운 동안에는 그 오리진이 빠진다.
필요하면 설정 쪽 값에 직접 덧붙인다.
CORS 오리진이 `localhost` 라서 브라우저에서도 `127.0.0.1` 말고 `localhost` 로 접속해야 한다.

주입됐는지는 결과로 보는 게 가장 확실하다. 브라우저 네트워크 탭에서 API 요청이 `localhost:<백엔드 포트>` 로 가는지 본다.
JS 번들에서 그 주소를 찾아봐도 된다. 프론트가 API 주소로 CSP 를 만든다면 응답 `Content-Security-Policy` 의 `connect-src` 에도 나온다.

`ps eww` 로 볼 때는 조심해야 한다. 상세의 PID 는 포트를 잡은 자식(`next-server`, uvicorn worker)인데, 이 자식에서 env 가
안 보인 경우가 있었다. 그럴 때는 부모(`next dev`, uvicorn 리로더)를 `ps eww` 로 본다.

## 동작 방식

### 상태

3초마다 각 포트의 리스너(`lsof`)를 보고 상태를 판정한다. 켜거나 끈 직후에는 바로 한 번 더 본다.
자식 프로세스 핸들에 기대지 않기 때문에 터미널에서 띄운 서버도 똑같이 보인다.

| 상태 | 의미 |
|---|---|
| 실행 중 | 이 서비스의 프로세스가 포트에서 리슨하고 있다 |
| 꺼짐 | 포트에 리스너가 없다 |
| 포트 충돌 | 작업 폴더가 다른 프로세스가 포트를 쓰고 있다. 켜기는 막히고, 그 프로세스는 절대 종료하지 않는다. 위젯이 띄운 프로세스가 아직 살아 있으면 끄기로 그것만 끈다 |
| 시작 중 | 위젯이 띄웠는데 아직 포트가 열리지 않았다 |
| 시작 실패 | 위젯이 띄운 프로세스가 포트를 열기 전에 끝났다. 원인은 "로그 열기"로 확인한다 |

"실행 중" 인 서비스는 누가 띄웠는지도 보여 준다.
- **위젯에서 실행**: 이 위젯이 띄운 프로세스 그룹.
- **외부에서 실행**: 위젯이 띄우지 않았지만 리스너의 작업 폴더가 설정의 `cwd` 와 같은 프로세스. 터미널에서 띄운 서버가 여기에 해당한다.
  위젯에서 끌 수 있다. 다만 위젯의 env 주입은 받지 않았으니, 주입값을 쓰려면 위젯에서 껐다 다시 켠다.

### 켜기·끄기 동작

- 켜기: `cwd` 에서 `$SHELL -ilc 'exec <command>'` 를 새 세션(프로세스 그룹)으로 띄우고 `env` 를 더한다.
  로그인+인터랙티브 셸이라 Finder 에서 연 앱도 nvm·pyenv 등이 잡아 둔 PATH 를 받는다.
- 끄기: 위젯이 띄운 서버는 프로세스 그룹 전체에 SIGTERM 을 보내고, 3초 뒤에도 남아 있으면 SIGKILL 을 보낸다.
  외부에서 띄운 서버는 그 포트를 리슨하는 이 서비스의 프로세스들에 같은 순서로 보낸다.

### 로그

`~/Library/Logs/com.hdh.localserverwidget/<그룹>/<서비스>.log` (예: `acme/backend.log`).
켤 때마다 구분선과 명령을 적고, 그 뒤로 stdout·stderr 를 모두 쌓는다. 서비스 상세의 "로그 열기"로 연다.
파일은 본인만 읽을 수 있게(0600) 만든다. 켤 때 10MB 를 넘었으면 `<서비스>.log.1` 로 넘기고 새 파일에 쓴다.

## 보안 주의

- **개발 서버는 loopback 에만 연다.** uvicorn 과 Vite 는 기본이 `127.0.0.1`/`localhost` 지만, `next dev` 는 기본으로
  모든 네트워크 인터페이스에 열린다. 그대로 두면 같은 와이파이에 있는 누구나 개발 서버와 소스맵에 접근할 수 있다.
  위 예시처럼 `-H 127.0.0.1` 을 붙인다. 휴대폰 같은 다른 기기로 테스트할 때만 잠깐 빼고, 그동안은 macOS 방화벽을 켠다.
- **`services.json` 에 비밀값을 넣지 않는다.** 평문 파일이고, `env` 값은 늘 위에 떠 있는 위젯 상세와 설정 창에 그대로 보인다.
  화면을 공유하면 다른 사람에게도 보인다. 비밀번호·토큰·API 키는 각 프로젝트의 `.env` 에 둔다.
- 믿을 수 있는 폴더만 추가한다. 설정 창에서 폴더를 고르면 앱이 그 폴더의 `package.json` 과 `.env*` 를 읽는다(변수 이름만, 1MB 이하 일반 파일만).
  서버를 켜면 그 폴더 안의 실행 파일(`.venv/bin/uvicorn`, `./node_modules/.bin/next`·`vite`)을 내 권한으로 실행한다.
- 설정은 설정 창에서만 저장된다. Rust 가 호출한 창을 확인해서 설정 읽기·저장·폴더 선택·감지는 설정 창에서만, 켜기·끄기·로그 열기는 위젯 창에서만 받는다.
  설정 창을 연 뒤 파일이 밖에서 바뀌었으면 저장을 거부한다. 그때는 "파일에서 다시 불러오기" 를 누르고 다시 고친다.
- 로그에는 서버 출력이 그대로 남는다. OAuth 콜백의 `code`·`state` 같은 값도 남을 수 있다. 파일은 본인만 읽을 수 있지만
  Time Machine 백업에는 들어간다.
- 설정 파일을 고칠 수 있는 사람은 그 안의 명령을 내 권한으로 실행할 수 있다. 설정 폴더는 본인만 쓸 수 있는 `~/Library` 에 있다.

## 알려진 한계

- 전체화면 앱 위에는 뜨지 않는다.
- 다른 macOS 계정이 같은 포트를 잡고 있으면 `lsof` 에 보이지 않아 "포트 충돌" 로 표시되지 않는다. 그 프로세스에 신호를 보낼 수도 없다.
- 위젯이 어떤 서버를 띄웠는지는 메모리에만 남는다. 위젯을 다시 켜면 그 서버들은 "외부에서 실행" 으로 보인다. 끄는 건 된다.
- 창 위치는 정상 종료할 때만 저장된다. 헤더 닫기 버튼, Cmd+Q, Dock 의 종료 메뉴로 끄는 것이 정상 종료다. `pnpm tauri dev` 를 Ctrl+C 로 끄면 저장되지 않는다.
- 명령은 로그인 셸(`-ilc`)로 실행되므로 rc 파일을 읽는다. rc 가 느리면 시작도 느리고, rc 가 같은 이름의 env 를 export 하면 rc 쪽 값이 이긴다.
- `command` 앞에 `FOO=1 cmd` 처럼 환경변수를 붙이면 `exec` 때문에 "command not found: FOO=1" 로 실패한다. 환경변수는 `env` 필드로 넘긴다.
- `command` 는 `$SHELL -ilc "exec <command>"`(새 세션, setsid)로 실행된다. 그래서 `a && b`, `a; b` 처럼 이어 쓰면 `a` 만 실행되고 `b` 는 실행되지 않는다.
  여러 단계가 필요하면 `sh -c 'a && b'` 로 감싼다.
- 로그인 셸이 뜨는 데 1초쯤 걸린다. 켠 직후 "시작 중" 이 잠깐 보이는 건 정상이다.

## 소스에서 빌드

준비물: Node + pnpm, Xcode Command Line Tools, Rust(stable, [rustup](https://rustup.rs) 으로 설치).

```sh
pnpm install
pnpm tauri dev      # 개발 실행 (첫 빌드는 몇 분 걸림)
pnpm tauri build    # 배포용 앱 → src-tauri/target/release/bundle/macos/
```

실행하는 동안 Dock 에 아이콘이 보인다. 위젯은 헤더의 닫기 버튼이나 Dock 에서 종료한다.
위젯을 종료해도 위젯이 띄운 서버는 계속 돈다.

### 개발

```sh
pnpm test           # Vitest (tests/unit)
pnpm lint           # ESLint
pnpm typecheck      # tsc (앱 + 테스트 설정)

cd src-tauri
cargo test          # Rust 단위·통합 테스트
cargo clippy --all-targets -- -D warnings   # Rust 린트 (rustup component add clippy)
rustfmt --edition 2024 --check src/*.rs examples/*.rs

# 위젯 없이 실제 설정으로 동작 확인하는 CLI
cargo run --example smoke -- <config.json> <log_dir> status
cargo run --example smoke -- <config.json> <log_dir> start|stop|cycle <그룹/서비스>
```

`smoke` 의 `start` 로 띄운 서버는 smoke 가 끝나도 계속 돈다. 위젯으로 띄운 것과 같다. 다음 실행에서는 "외부" 로 보인다.

## 라이선스

MIT 라이선스다. 전문은 [LICENSE](LICENSE) 에 있다.
