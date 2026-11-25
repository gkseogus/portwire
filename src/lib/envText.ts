import { ENV_EXPORT_PREFIX, ENV_INLINE_COMMENT, ENV_TEXT } from "@/contents/settings";
import { setEnvVar } from "@/lib/connection";
import type { EnvRowFace, MergedEnvFace, ParsedEnvTextFace } from "@/types/settings";

/**
 * 한 줄을 읽는다. 값이 따옴표로 시작하고 같은 줄에서 닫히지 않으면 여러 줄 값이므로 그 따옴표를 돌려준다.
 * ponytail: 한 줄 값만 읽는다. 따옴표 안 이스케이프(\")·여러 줄 값·${VAR} 확장은 dotenv 와 달리 처리하지 않는다.
 */
const parseLine = (line: string): { row: EnvRowFace } | { open: string } | null => {
  const eq = line.indexOf("=");
  if (eq === -1) return null;
  const key = line.slice(0, eq).replace(ENV_EXPORT_PREFIX, "").trim();
  const rest = line.slice(eq + 1);
  const raw = rest.trim();
  const quote = raw[0];
  if (quote === '"' || quote === "'") {
    const end = raw.indexOf(quote, 1);
    if (end === -1) return { open: quote };
    return key ? { row: { key, value: raw.slice(1, end) } } : null;
  }
  // 주석을 먼저 지우고 trim 해야 `KEY= # 주석` 이 빈 값이 된다
  return key ? { row: { key, value: rest.replace(ENV_INLINE_COMMENT, "").trim() } } : null;
};

/**
 * `.env` 꼴 텍스트를 행으로 읽는다. 같은 이름이 또 나오면 뒤의 값이 이기고 자리는 처음 것을 따른다.
 * 여러 줄 값(PEM 키 등)은 닫는 따옴표가 나올 때까지 모든 줄을 건너뛴다. 이어지는 줄이 `KEY=` 처럼 보여도 행으로 넣지 않는다.
 */
export const parseEnvText = (text: string): ParsedEnvTextFace => {
  const values = new Map<string, string>();
  let skipped = 0;
  let open: string | null = null;
  for (const line of text.split(/\r?\n/).map((l) => l.trim())) {
    if (open !== null) {
      skipped += 1;
      if (line.includes(open)) open = null;
      continue;
    }
    if (!line || line.startsWith("#")) continue;
    const parsed = parseLine(line);
    if (parsed && "row" in parsed) {
      values.set(parsed.row.key, parsed.row.value);
      continue;
    }
    skipped += 1;
    if (parsed) open = parsed.open;
  }
  return { rows: [...values].map(([key, value]) => ({ key, value })), skipped };
};

/** 붙여넣은 행을 합친다. 같은 이름은 값을 덮어쓰고, 이름·값이 모두 빈 행(방금 추가한 빈 줄)은 지운다. */
export const mergeEnvRows = (env: EnvRowFace[], rows: EnvRowFace[]): MergedEnvFace => {
  const base = env.filter((row) => row.key !== "" || row.value !== "");
  const has = (row: EnvRowFace): boolean => base.some((b) => b.key === row.key);
  // setEnvVar 는 같은 이름의 행을 모두 바꾸므로, 그중 하나라도 값이 다르면 바뀐 것으로 센다
  const differs = (row: EnvRowFace): boolean => base.some((b) => b.key === row.key && b.value !== row.value);
  return {
    env: rows.reduce((acc, row) => setEnvVar(acc, row.key, row.value), base),
    added: rows.filter((row) => !has(row)).length,
    replaced: rows.filter(differs).length,
  };
};

/** "2개 추가 · 1개 바꿈 · 1줄 건너뜀" */
export const formatPasteResult = (added: number, replaced: number, skipped: number): string => {
  const parts = [
    added > 0 && `${added}${ENV_TEXT.pasteAdded}`,
    replaced > 0 && `${replaced}${ENV_TEXT.pasteReplaced}`,
    skipped > 0 && `${skipped}${ENV_TEXT.pasteSkipped}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : ENV_TEXT.pasteUnchanged;
};
