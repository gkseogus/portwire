import type { ProjectKindType } from "@/types/config";

/** 저장 성공 토스트가 떠 있는 시간 */
export const TOAST_DURATION_MS = 2000;

/** 감지된 CORS 변수가 없을 때 쓰는 이름 */
export const DEFAULT_CORS_KEY = "CORS_ORIGINS";

/** Rust config::is_env_key 와 같은 규칙: `[A-Za-z_][A-Za-z0-9_]*` */
export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** 붙여넣은 .env 줄 앞의 `export ` */
export const ENV_EXPORT_PREFIX = /^export\s+/;

/** 따옴표 없는 .env 값 뒤의 ` # 주석` (`#` 앞에 공백이 있어야 주석이다: `COLOR=#fff` 는 값) */
export const ENV_INLINE_COMMENT = /\s+#.*$/;

/** 서버 이름 = Rust 템플릿 식별자. `{이름.url}` 로 참조되므로 이 글자만 쓸 수 있다. */
export const SERVICE_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;

/** 값 전체가 `{이름.url}` 하나인지 (Rust 템플릿 식별자 = `[A-Za-z0-9_-]+`) */
export const URL_REF_PATTERN = /^\{([A-Za-z0-9_-]+)\.url\}$/;

/** API 주소 값: `{이름.url}` 뒤에 경로가 붙을 수 있다 (예: `{backend.url}/api`) */
export const API_REF_PATTERN = /^\{([A-Za-z0-9_-]+)\.url\}(\/[^\s,{}]*)?$/;

/** 연결 칸의 경로 입력: 비우거나 `/` 로 시작, 공백·쉼표·중괄호 불가 */
export const API_PATH_PATTERN = /^(\/[^\s,{}]*)?$/;

/** `{port}`, `{이름}`, `{이름.url}` 모양의 템플릿 토큰 */
export const TEMPLATE_TOKEN_PATTERN = /\{([A-Za-z0-9_-]+)(\.url)?\}/g;

/** 템플릿 `{port}` 의 식별자 */
export const PORT_TOKEN = "port";

/** 1~65535 */
export const MAX_PORT = 65535;

/** 실행 명령으로 종류를 짐작한다 (사이드바 배지용). 위에서부터 먼저 맞는 것. */
export const KIND_COMMAND_PATTERNS: readonly [ProjectKindType, RegExp][] = [
  ["fastapi", /\b(uvicorn|fastapi)\b/],
  ["next", /\bnext\b/],
  ["vite", /\bvite\b/],
];

export const KIND_LABELS: Record<ProjectKindType, string> = {
  fastapi: "FastAPI",
  next: "Next.js",
  vite: "Vite",
  unknown: "기타",
};

export const KIND_BADGE_CLASSES: Record<ProjectKindType, string> = {
  fastapi: "bg-teal-500/15 text-teal-300 ring-teal-400/30",
  next: "bg-zinc-100/10 text-zinc-200 ring-zinc-400/30",
  vite: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  unknown: "bg-zinc-800 text-zinc-400 ring-zinc-700",
};

export const LOAD_TEXT = {
  title: "설정을 불러오지 못했어요",
  hint: "설정 파일에 고칠 곳이 있어요. JSON 을 직접 열어 아래 줄을 고친 뒤 다시 시도하세요.",
  openJson: "JSON 직접 편집",
  retry: "다시 시도",
  openJsonError: "설정 파일을 열지 못했어요.",
} as const;

export const SIDEBAR_TEXT = {
  label: "프로젝트와 서버 목록",
  title: "프로젝트",
  addProject: "프로젝트 추가",
  addServer: "서버",
  /** "{그룹} 에 서버 추가" 접근성 이름의 꼬리 */
  addServerSuffix: "에 서버 추가",
  openJson: "JSON 직접 편집",
  hasIssue: "고칠 곳 있음",
  unnamed: "(이름 없음)",
} as const;

export const EMPTY_TEXT = {
  title: "아직 등록한 서버가 없어요",
  hint: "프로젝트 폴더를 고르면 종류·실행 명령·포트를 알아서 채워 드려요.",
  pick: "프로젝트 폴더 선택",
  picking: "폴더 확인 중…",
} as const;

export const ACTION_ERROR_TEXT = {
  pickFolder: "폴더를 고르지 못했어요.",
  openJson: "설정 파일을 열지 못했어요.",
} as const;

export const GROUP_TEXT = {
  heading: "프로젝트",
  nameLabel: "프로젝트 이름",
  nameHelper: "위젯에 묶음 제목으로 보여요. 로그 폴더 이름으로도 쓰여요.",
  servicesTitle: "서버",
  noServices: "아직 서버가 없어요. 프로젝트 폴더를 골라 추가하세요.",
  addServer: "서버 추가",
  delete: "프로젝트 삭제",
  deletePrompt: "프로젝트와 안의 서버를 모두 지울까요?",
} as const;

export const SERVICE_TEXT = {
  subtitleSuffix: "프로젝트의 서버",
  basicTitle: "기본",
  folderLabel: "폴더",
  folderHelper: "서버를 실행할 프로젝트 폴더예요.",
  pickFolder: "폴더 선택",
  detecting: "폴더 살펴보는 중…",
  detectError: "폴더를 살펴보지 못했어요. 폴더가 있는지 확인하세요.",
  nameLabel: "이름",
  nameHelper: "영문·숫자·-·_ 만 쓸 수 있어요. 다른 서버에서 {이름.url} 로 이 서버 주소를 가리킬 때 써요.",
  portLabel: "포트",
  portHelper: "모든 프로젝트를 통틀어 겹치면 안 돼요.",
  commandLabel: "실행 명령",
  commandHelper: "{port} 자리에 위 포트가 들어가요.",
  applyDetected: "감지된 명령으로",
  running: "지금 실행 중이에요. 바꾼 내용은 저장한 뒤 껐다 켜야 반영돼요.",
  delete: "서버 삭제",
  deletePrompt: "이 서버를 지울까요?",
} as const;

export const CONNECTION_TEXT = {
  title: "연결",
  noSiblings: "같은 프로젝트에 다른 서버가 없어요. 서버를 추가하면 여기서 서로 연결할 수 있어요.",
  apiLabel: "이 서버가 API 를 보낼 백엔드",
  apiNone: "연결 안 함",
  apiHelper: "고르면 아래 변수에 그 서버 주소가 들어가요. 백엔드 포트를 바꿔도 따라가요.",
  apiNeedKey: "주소를 넣을 변수 이름을 먼저 추가하세요.",
  apiKeysLabel: "주소를 넣을 변수",
  pathLabel: "주소 뒤 경로",
  pathPlaceholder: "예: /api",
  pathHelper: "API 가 /api 같은 경로 아래에 있으면 적어요. 없으면 비워 두세요.",
  pathInvalid: "경로는 / 로 시작해야 하고 공백·쉼표·중괄호는 쓸 수 없어요.",
  apiKeyInput: "API 주소 변수 추가",
  apiKeyPlaceholder: "예: VITE_API_URL",
  addKey: "추가",
  /** "{KEY} 빼기" 접근성 이름의 꼬리 */
  removeKeySuffix: "빼기",
  corsLabel: "이 서버에 접속을 허용할 프론트 (CORS)",
  corsHelper: "체크한 서버 주소를 쉼표로 이어 아래 변수에 넣어요.",
  corsKeyLabel: "CORS 변수 이름",
} as const;

export const ENV_TEXT = {
  title: "환경변수 (고급)",
  countSuffix: "개",
  helper: "실행할 때 더 넣을 값이에요. 비밀번호·토큰은 위젯 화면에 보이니 넣지 마세요.",
  empty: "추가한 환경변수가 없어요.",
  keyLabel: "변수 이름",
  valueLabel: "값",
  templateLabel: "템플릿 넣기",
  templatePlaceholder: "템플릿",
  portOption: "이 서버 포트",
  urlOptionSuffix: "주소",
  add: "변수 추가",
  remove: "변수 삭제",
  pasteOpen: "한꺼번에 붙여넣기",
  pasteLabel: ".env 내용 붙여넣기",
  pastePlaceholder: "API_URL=http://localhost:8000\nDEBUG=1",
  pasteWarning:
    "프로젝트 .env 에 있는 값은 실행할 때 그대로 읽히니, 위젯에서 바꿀 값만 넣으세요. 비밀번호·토큰은 설정 파일과 위젯 화면에 그대로 보여요.",
  pasteNothing: "KEY=VALUE 줄을 찾지 못했어요.",
  pasteApply: "추가",
  pasteCancel: "취소",
  pasteAdded: "개 추가",
  pasteReplaced: "개 바꿈",
  pasteSkipped: "줄 건너뜀",
  pasteUnchanged: "바뀐 값이 없어요.",
} as const;

export const PREVIEW_TEXT = {
  title: "실행되는 모습",
  folder: "폴더",
  command: "명령",
  env: "env",
  empty: "—",
} as const;

export const SAVE_TEXT = {
  saved: "저장됨",
  dirtyPrefix: "저장하지 않은 변경",
  dirtySuffix: "건",
  revert: "되돌리기",
  save: "저장",
  saving: "저장 중…",
  shortcut: "⌘S",
  issuesPrefix: "고칠 곳",
  issuesSuffix: "개",
  errorTitle: "저장하지 못했어요. 아래 내용을 고쳐 주세요.",
  errorFallback: "알 수 없는 이유로 저장하지 못했어요.",
  reload: "파일에서 다시 불러오기",
  reloadPrompt: "편집 중인 변경은 사라져요. 다시 불러올까요?",
  reloadConfirm: "불러오기",
  toast: "저장했어요",
} as const;

export const VALIDATION_TEXT = {
  nameEmpty: "이름을 입력하세요.",
  nameInvalid: "이름에 / 를 넣거나 . 또는 .. 로만 지을 수 없어요.",
  serviceNameInvalid: "서버 이름은 영문·숫자·-·_ 만 쓸 수 있어요 (다른 서버가 {이름.url} 로 가리키기 때문).",
  groupDuplicate: "같은 이름의 프로젝트가 이미 있어요 (대소문자 구분 없음).",
  serviceDuplicate: "이 프로젝트에 같은 이름의 서버가 이미 있어요 (대소문자 구분 없음).",
  portEmpty: "포트를 입력하세요.",
  portRange: "포트는 1~65535 사이 숫자예요.",
  /** "{서버} 서버와 포트가 겹쳐요" */
  portDuplicateSuffix: "서버와 포트가 겹쳐요.",
  cwdEmpty: "폴더를 선택하세요.",
  commandEmpty: "실행 명령을 입력하세요.",
  envKeyEmpty: "변수 이름을 입력하세요.",
  envKeyInvalid: "변수 이름은 영문·숫자·_ 만 쓸 수 있고 숫자로 시작할 수 없어요.",
  envKeyDuplicate: "같은 변수 이름이 이미 있어요.",
  /** "{backend.url}: …" — 이름을 바꾼 서버를 다른 서버가 아직 가리킬 때 */
  templateNoService: "같은 프로젝트에 이 이름의 서버가 없어요.",
  /** "{HOME}: …" */
  templateUnknown: "템플릿은 {port} 와 {이름.url} 만 쓸 수 있어요. 셸 변수는 $HOME 처럼 중괄호 없이 쓰세요.",
} as const;
