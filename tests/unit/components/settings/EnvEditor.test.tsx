import { useState, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EnvEditor from "@/components/settings/EnvEditor";
import { ENV_TEXT, VALIDATION_TEXT } from "@/contents/settings";
import type { EnvRowFace, TemplateOptionFace, ValidationIssueFace } from "@/types/settings";

const OPTIONS: TemplateOptionFace[] = [
  { value: "{port}", label: "{port} · 이 서버 포트" },
  { value: "{backend.url}", label: "{backend.url} · backend 주소" },
];

const Harness = ({ initial, issues = [] }: { initial: EnvRowFace[]; issues?: ValidationIssueFace[] }): ReactElement => {
  const [env, setEnv] = useState(initial);
  return (
    <>
      <EnvEditor env={env} issues={issues} templateOptions={OPTIONS} onChange={setEnv} />
      <output>{JSON.stringify(env)}</output>
    </>
  );
};

const current = (): EnvRowFace[] => JSON.parse(screen.getByRole("status").textContent ?? "[]") as EnvRowFace[];

describe("EnvEditor", () => {
  it("기본은 접혀 있고 개수를 보여 준다", () => {
    render(<Harness initial={[{ key: "A", value: "1" }]} />);
    expect(screen.getByText(ENV_TEXT.title).closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText(`· 1${ENV_TEXT.countSuffix}`)).toBeInTheDocument();
  });

  it("비어 있으면 안내를 보여 준다", () => {
    render(<Harness initial={[]} />);
    expect(screen.getByText(ENV_TEXT.empty)).toBeInTheDocument();
  });

  it("변수를 추가해 이름·값을 쓰고 템플릿을 넣고 지운다", async () => {
    render(<Harness initial={[{ key: "KEEP", value: "1" }]} />);
    await userEvent.click(screen.getByText(ENV_TEXT.title));

    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.add }));
    // 새 줄 이름 칸에 바로 입력된다
    expect(screen.getByLabelText(`${ENV_TEXT.keyLabel} 2`)).toHaveFocus();
    await userEvent.keyboard("API_URL");
    await userEvent.type(screen.getByLabelText(`${ENV_TEXT.valueLabel} 2`), "x=");
    await userEvent.selectOptions(screen.getByLabelText(`${ENV_TEXT.templateLabel} 2`), "{backend.url}");

    expect(current()).toEqual([
      { key: "KEEP", value: "1" },
      { key: "API_URL", value: "x={backend.url}" },
    ]);
    // 메뉴는 고른 뒤 다시 "템플릿" 으로 돌아온다
    expect(screen.getByLabelText(`${ENV_TEXT.templateLabel} 2`)).toHaveValue("");

    await userEvent.click(screen.getByRole("button", { name: `${ENV_TEXT.remove} 1` }));
    expect(current()).toEqual([{ key: "API_URL", value: "x={backend.url}" }]);
  });

  it("이름이 잠시 겹쳐도 다른 줄 값을 잃지 않는다", async () => {
    render(<Harness initial={[{ key: "API_URL", value: "a" }]} />);
    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.add }));
    await userEvent.keyboard("API_URL2");

    expect(current()).toEqual([
      { key: "API_URL", value: "a" },
      { key: "API_URL2", value: "" },
    ]);
  });

  it("빈 상태에서 .env 내용을 한꺼번에 붙여넣어 행으로 넣는다", async () => {
    render(<Harness initial={[]} />);
    await userEvent.click(screen.getByText(ENV_TEXT.title));
    const open = screen.getByRole("button", { name: ENV_TEXT.pasteOpen });
    await userEvent.click(open);

    const box = screen.getByLabelText(ENV_TEXT.pasteLabel);
    expect(box).toHaveFocus();
    const apply = screen.getByRole("button", { name: ENV_TEXT.pasteApply });
    expect(apply).toBeDisabled();
    // 공백·줄바꿈만 있어도 비활성
    await userEvent.paste("  \n ");
    expect(apply).toBeDisabled();
    await userEvent.clear(box);
    await userEvent.paste("API_URL=a\nexport DEBUG=1\n# c\nnope");
    await userEvent.click(apply);

    expect(current()).toEqual([
      { key: "API_URL", value: "a" },
      { key: "DEBUG", value: "1" },
    ]);
    // 결과는 스크린리더가 읽는 live 영역에 나온다
    expect(screen.getByText(`2${ENV_TEXT.pasteAdded} · 1${ENV_TEXT.pasteSkipped}`)).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.queryByLabelText(ENV_TEXT.pasteLabel)).not.toBeInTheDocument();
    expect(open).toHaveFocus();

    // 손으로 고치기 시작하면 결과 문구는 사라진다
    await userEvent.type(screen.getByLabelText(`${ENV_TEXT.valueLabel} 1`), "b");
    expect(screen.queryByText(`2${ENV_TEXT.pasteAdded} · 1${ENV_TEXT.pasteSkipped}`)).not.toBeInTheDocument();
  });

  it("열기 버튼을 다시 눌러도 적던 텍스트를 잃지 않는다", async () => {
    render(<Harness initial={[]} />);
    const open = screen.getByRole("button", { name: ENV_TEXT.pasteOpen });
    await userEvent.click(open);
    await userEvent.paste("A=1");
    await userEvent.click(open);

    expect(screen.getByLabelText(ENV_TEXT.pasteLabel)).toHaveValue("A=1");
  });

  it("있는 이름은 값을 바꾸고 ⌘Enter 로도 적용한다", async () => {
    render(<Harness initial={[{ key: "API_URL", value: "old" }]} />);
    await userEvent.click(screen.getByText(ENV_TEXT.title));
    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.pasteOpen }));
    await userEvent.paste("API_URL=new");
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");

    expect(current()).toEqual([{ key: "API_URL", value: "new" }]);
    expect(screen.getByText(`1${ENV_TEXT.pasteReplaced}`)).toBeInTheDocument();
  });

  it("KEY=VALUE 줄이 없으면 env 를 그대로 두고 패널에 오류를 보여 준다", async () => {
    render(<Harness initial={[{ key: "KEEP", value: "1" }]} />);
    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.pasteOpen }));
    await userEvent.paste("# 주석만\nnope");
    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.pasteApply }));

    expect(current()).toEqual([{ key: "KEEP", value: "1" }]);
    const box = screen.getByLabelText(ENV_TEXT.pasteLabel);
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAccessibleDescription(expect.stringContaining(ENV_TEXT.pasteNothing));
    // 포커스가 버튼에 있어도 오류가 읽히도록 alert 로 띄운다
    expect(screen.getByRole("alert")).toHaveTextContent(ENV_TEXT.pasteNothing);
  });

  it("취소 버튼과 Esc 는 env 를 바꾸지 않고 패널을 닫는다", async () => {
    render(<Harness initial={[{ key: "KEEP", value: "1" }]} />);
    const open = screen.getByRole("button", { name: ENV_TEXT.pasteOpen });

    await userEvent.click(open);
    await userEvent.paste("A=1");
    await userEvent.click(screen.getByRole("button", { name: ENV_TEXT.pasteCancel }));
    expect(screen.queryByLabelText(ENV_TEXT.pasteLabel)).not.toBeInTheDocument();
    expect(open).toHaveFocus();

    await userEvent.click(open);
    await userEvent.paste("B=2");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByLabelText(ENV_TEXT.pasteLabel)).not.toBeInTheDocument();
    expect(current()).toEqual([{ key: "KEEP", value: "1" }]);
  });

  it("오류가 있으면 펼친 채로 그 줄 아래에 보여 준다", () => {
    render(
      <Harness
        initial={[{ key: "1BAD", value: "x" }]}
        issues={[{ group: 0, service: 0, field: "env", message: VALIDATION_TEXT.envKeyInvalid, envIndex: 0 }]}
      />,
    );
    expect(screen.getByText(ENV_TEXT.title).closest("details")).toHaveAttribute("open");
    const key = screen.getByLabelText(`${ENV_TEXT.keyLabel} 1`);
    expect(key).toHaveAttribute("aria-invalid", "true");
    expect(key).toHaveAccessibleDescription(VALIDATION_TEXT.envKeyInvalid);
  });
});
