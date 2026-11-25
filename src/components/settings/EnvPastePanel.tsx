import { useId, useState, type KeyboardEvent, type ReactElement } from "react";
import {
  BUTTON_CLASS,
  ERROR_TEXT_CLASS,
  HELPER_CLASS,
  INPUT_CLASS,
  INPUT_ERROR_CLASS,
  LABEL_CLASS,
  MONO_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/contents/form";
import { ENV_TEXT } from "@/contents/settings";
import { cn } from "@/lib/cn";

interface EnvPastePanelFace {
  /** 붙여넣은 텍스트를 적용한다. KEY=VALUE 행이 하나도 없으면 false 를 돌려주고 패널은 열린 채로 둔다. */
  onApply: (text: string) => boolean;
  onClose: () => void;
}

const EnvPastePanel = ({ onApply, onClose }: EnvPastePanelFace): ReactElement => {
  const id = useId();
  const [text, setText] = useState("");
  const [nothing, setNothing] = useState(false);
  const blank = text.trim() === "";

  const apply = (): void => {
    if (!blank) setNothing(!onApply(text));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // 한글 조합 중 Esc·Enter 는 조합을 끝내는 키다
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      apply();
    }
  };

  return (
    <div className="p-3 space-y-2 bg-zinc-950/40 border border-zinc-800 rounded-lg">
      <label htmlFor={`${id}-text`} className={cn(LABEL_CLASS, "mb-0")}>
        {ENV_TEXT.pasteLabel}
      </label>
      <textarea
        id={`${id}-text`}
        autoFocus
        rows={5}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setNothing(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder={ENV_TEXT.pastePlaceholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-invalid={nothing}
        aria-describedby={nothing ? `${id}-error ${id}-help` : `${id}-help`}
        className={cn(INPUT_CLASS, MONO_CLASS, "h-auto py-2 text-[11.5px] leading-5 resize-y", nothing && INPUT_ERROR_CLASS)}
      />
      {nothing && (
        <p id={`${id}-error`} role="alert" className={cn(ERROR_TEXT_CLASS, "mt-0")}>
          {ENV_TEXT.pasteNothing}
        </p>
      )}
      <p id={`${id}-help`} className={cn(HELPER_CLASS, "mt-0")}>
        {ENV_TEXT.pasteWarning}
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={BUTTON_CLASS}>
          {ENV_TEXT.pasteCancel}
        </button>
        <button type="button" onClick={apply} disabled={blank} className={PRIMARY_BUTTON_CLASS}>
          {ENV_TEXT.pasteApply}
        </button>
      </div>
    </div>
  );
};

export default EnvPastePanel;
