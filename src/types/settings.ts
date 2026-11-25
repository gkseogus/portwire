// 설정 창에서만 쓰는 편집용 타입. 저장할 때 fromDraft 로 ConfigFace(services.json 구조)로 바꾼다.

/** 환경변수 한 줄. 이름을 입력하는 도중 다른 줄과 잠시 겹쳐도 값을 잃지 않도록 배열로 둔다. */
export interface EnvRowFace {
  key: string;
  value: string;
}

/** 붙여넣은 `.env` 텍스트를 읽은 결과. skipped 는 KEY=VALUE 로 읽지 못한 줄 수 (빈 줄·주석 제외) */
export interface ParsedEnvTextFace {
  rows: EnvRowFace[];
  skipped: number;
}

/** 붙여넣은 행을 기존 env 에 합친 결과. replaced 는 값이 실제로 바뀐 기존 변수 수 */
export interface MergedEnvFace {
  env: EnvRowFace[];
  added: number;
  replaced: number;
}

/** 편집 중인 서비스. 포트는 입력란을 비울 수 있어야 하므로 null 을 허용한다. */
export interface DraftServiceFace {
  name: string;
  cwd: string;
  port: number | null;
  command: string;
  env: EnvRowFace[];
}

export interface DraftGroupFace {
  name: string;
  services: DraftServiceFace[];
}

export interface DraftFace {
  groups: DraftGroupFace[];
}

export type DraftUpdaterType = (draft: DraftFace) => DraftFace;

/** 편집 영역에 보이는 항목. service 가 null 이면 그룹(프로젝트) 편집. */
export interface SelectionFace {
  group: number;
  service: number | null;
}

export type ValidationFieldType = "name" | "port" | "cwd" | "command" | "env";

export interface ValidationIssueFace {
  group: number;
  /** null 이면 그룹 자체의 문제 */
  service: number | null;
  field: ValidationFieldType;
  message: string;
  /** field 가 "env" 일 때 문제가 있는 줄 */
  envIndex?: number;
}

/** "이 서버가 API 를 보낼 백엔드" — env 에서 역으로 읽은 값 */
export interface ApiConnectionFace {
  backend: string | null;
  keys: string[];
  /** 백엔드 주소 뒤에 붙는 경로 (예: "/api"). 없으면 "" */
  path: string;
}

/** "이 서버에 접속을 허용할 프론트" — env 에서 역으로 읽은 값 */
export interface CorsConnectionFace {
  key: string | null;
  frontends: string[];
}

/** env 값 옆 "템플릿 넣기" 메뉴의 한 항목 */
export interface TemplateOptionFace {
  value: string;
  label: string;
}
