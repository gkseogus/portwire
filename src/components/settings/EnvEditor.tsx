import { useId, useRef, useState, type ReactElement } from "react";
import EnvPastePanel from "@/components/settings/EnvPastePanel";
import TemplateMenu from "@/components/settings/TemplateMenu";
import { ERROR_TEXT_CLASS, GHOST_BUTTON_CLASS, HELPER_CLASS, INPUT_CLASS, INPUT_ERROR_CLASS, MONO_CLASS } from "@/contents/form";
import { ENV_TEXT } from "@/contents/settings";
import { ICON_SVG_PROPS } from "@/contents/widgetHeader";
import { cn } from "@/lib/cn";
import { formatPasteResult, mergeEnvRows, parseEnvText } from "@/lib/envText";
import type { EnvRowFace, TemplateOptionFace, ValidationIssueFace } from "@/types/settings";

interface EnvEditorFace {
  env: EnvRowFace[];
  /** 이 서비스의 env 오류 (envIndex 로 줄을 찾는다) */
  issues: ValidationIssueFace[];
  templateOptions: TemplateOptionFace[];
  onChange: (env: EnvRowFace[]) => void;
}

const EnvEditor = ({ env, issues, templateOptions, onChange }: EnvEditorFace): ReactElement => {
  const id = useId();
  // 기본은 접힘. 열 때 고칠 곳이 있으면 펼친 채로 시작한다
  const [open, setOpen] = useState(issues.length > 0);
  const [pasting, setPasting] = useState(false);
  const [pasteResult, setPasteResult] = useState("");
  const pasteButtonRef = useRef<HTMLButtonElement>(null);

  // 손으로 고치기 시작하면 지난 붙여넣기 결과 문구는 지운다
  const edit = (next: EnvRowFace[]): void => {
    setPasteResult("");
    onChange(next);
  };

  const updateRow = (index: number, patch: Partial<EnvRowFace>): void =>
    edit(env.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  // 패널이 사라지면 포커스를 연 버튼으로 돌려준다
  const closePaste = (): void => {
    setPasting(false);
    pasteButtonRef.current?.focus();
  };

  const applyPaste = (text: string): boolean => {
    const parsed = parseEnvText(text);
    if (parsed.rows.length === 0) return false;
    const merged = mergeEnvRows(env, parsed.rows);
    onChange(merged.env);
    setPasteResult(formatPasteResult(merged.added, merged.replaced, parsed.skipped));
    closePaste();
    return true;
  };

  const inputProps = {
    type: "text",
    spellCheck: false,
    autoComplete: "off",
    autoCorrect: "off",
    autoCapitalize: "off",
  } as const;

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group/env bg-zinc-900/50 border border-zinc-800 rounded-xl"
    >
      <summary className="flex items-center h-10 gap-2 px-4 rounded-xl text-xs font-medium text-zinc-300 cursor-pointer select-none list-none hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 [&::-webkit-details-marker]:hidden">
        <svg {...ICON_SVG_PROPS} width={12} height={12} className="text-zinc-500 transition-transform group-open/env:rotate-90">
          <path d="m9 18 6-6-6-6" />
        </svg>
        {ENV_TEXT.title}
        <span className="text-zinc-500">{`· ${env.length}${ENV_TEXT.countSuffix}`}</span>
        {issues.length > 0 && <span aria-hidden="true" className="size-1.5 rounded-full bg-rose-400" />}
      </summary>
      <div className="px-4 pb-4 space-y-2">
        <p className={cn(HELPER_CLASS, "mt-0 mb-3")}>{ENV_TEXT.helper}</p>
        {env.length === 0 && <p className="py-1 text-xs text-zinc-500">{ENV_TEXT.empty}</p>}
        {env.map((row, index) => {
          const error = issues.find((issue) => issue.envIndex === index)?.message;
          const errorId = `${id}-error-${index}`;
          const n = index + 1;
          return (
            <div key={index}>
              <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)_auto_auto] items-center gap-1.5">
                <input
                  {...inputProps}
                  aria-label={`${ENV_TEXT.keyLabel} ${n}`}
                  value={row.key}
                  onChange={(event) => updateRow(index, { key: event.target.value.trim() })}
                  // 방금 추가한 빈 줄에 바로 입력할 수 있게
                  autoFocus={row.key === "" && index === env.length - 1}
                  placeholder="NAME"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={cn(INPUT_CLASS, MONO_CLASS, "px-2 text-[11.5px]", error && INPUT_ERROR_CLASS)}
                />
                <input
                  {...inputProps}
                  aria-label={`${ENV_TEXT.valueLabel} ${n}`}
                  value={row.value}
                  onChange={(event) => updateRow(index, { value: event.target.value })}
                  className={cn(INPUT_CLASS, MONO_CLASS, "px-2 text-[11.5px]")}
                />
                <TemplateMenu
                  label={`${ENV_TEXT.templateLabel} ${n}`}
                  options={templateOptions}
                  onInsert={(template: string) => updateRow(index, { value: row.value + template })}
                />
                <button
                  type="button"
                  aria-label={`${ENV_TEXT.remove} ${n}`}
                  onClick={() => edit(env.filter((_, i) => i !== index))}
                  className={cn(GHOST_BUTTON_CLASS, "justify-center w-7 h-8 px-0 hover:text-rose-300")}
                >
                  <svg {...ICON_SVG_PROPS}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <p id={errorId} className={cn(ERROR_TEXT_CLASS, "mt-1")}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <div className="flex items-center gap-1 -ml-2">
          <button
            type="button"
            onClick={() => edit([...env, { key: "", value: "" }])}
            className={cn(GHOST_BUTTON_CLASS, "text-zinc-300")}
          >
            <svg {...ICON_SVG_PROPS}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {ENV_TEXT.add}
          </button>
          <button
            ref={pasteButtonRef}
            type="button"
            aria-expanded={pasting}
            // 닫기는 취소·Esc 로만 한다. 다시 눌러 닫히면 적용 전 텍스트를 잃는다
            onClick={() => {
              setPasting(true);
              setPasteResult("");
            }}
            className={cn(GHOST_BUTTON_CLASS, "text-zinc-300")}
          >
            <svg {...ICON_SVG_PROPS}>
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
            {ENV_TEXT.pasteOpen}
          </button>
          {/* 비어 있을 때도 렌더해 둬야 문구가 들어오는 순간 스크린리더가 읽는다 */}
          <p aria-live="polite" className="ml-1 text-[11px] text-zinc-500">
            {pasteResult}
          </p>
        </div>
        {pasting && <EnvPastePanel onApply={applyPaste} onClose={closePaste} />}
      </div>
    </details>
  );
};

export default EnvEditor;
