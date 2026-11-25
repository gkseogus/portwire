import { describe, expect, it } from "vitest";
import { ENV_TEXT } from "@/contents/settings";
import { formatPasteResult, mergeEnvRows, parseEnvText } from "@/lib/envText";

describe("parseEnvText", () => {
  it.each([
    ["KEY=VALUE", { key: "KEY", value: "VALUE" }],
    ["  KEY = VALUE  ", { key: "KEY", value: "VALUE" }],
    ["export KEY=VALUE", { key: "KEY", value: "VALUE" }],
    ['KEY="a b"', { key: "KEY", value: "a b" }],
    ["KEY='a b'", { key: "KEY", value: "a b" }],
    ['KEY="a # b" # note', { key: "KEY", value: "a # b" }],
    ["KEY=val # note", { key: "KEY", value: "val" }],
    // .env.example 에 흔한 꼴: 주석이 값으로 들어가면 안 된다
    ["KEY= # set me", { key: "KEY", value: "" }],
    ["COLOR=#fff", { key: "COLOR", value: "#fff" }],
    ["URL=http://x/#frag", { key: "URL", value: "http://x/#frag" }],
    ["KEY=a=b", { key: "KEY", value: "a=b" }],
    ["KEY=", { key: "KEY", value: "" }],
    ["KEY={backend.url}/api", { key: "KEY", value: "{backend.url}/api" }],
    // 이름 규칙 검사는 기존 검증에 맡긴다
    ["1BAD=x", { key: "1BAD", value: "x" }],
  ])("%s 를 한 행으로 읽는다", (line, row) => {
    expect(parseEnvText(line)).toEqual({ rows: [row], skipped: 0 });
  });

  it.each([["nope"], ["=x"], ['KEY="-----BEGIN']])("%s 는 건너뛰고 센다", (line) => {
    expect(parseEnvText(line)).toEqual({ rows: [], skipped: 1 });
  });

  it("여러 줄 값은 닫는 따옴표까지 모두 건너뛰고, 중간 줄이 KEY= 꼴이어도 행으로 넣지 않는다", () => {
    expect(parseEnvText('CERT="-----BEGIN\nZm9v=\n-----END-----"\nNEXT=1')).toEqual({
      rows: [{ key: "NEXT", value: "1" }],
      skipped: 3,
    });
    expect(parseEnvText("JSON='{\n\"a\": \"b=c\"\n}'\nNEXT=1").rows).toEqual([{ key: "NEXT", value: "1" }]);
  });

  it("빈 줄·주석은 건너뛰지만 세지 않고, CRLF 도 받는다", () => {
    expect(parseEnvText("# c\r\n\r\nA=1\r\n  # d\r\nB=2")).toEqual({
      rows: [
        { key: "A", value: "1" },
        { key: "B", value: "2" },
      ],
      skipped: 0,
    });
  });

  it("같은 이름이 또 나오면 뒤의 값이 이기고 자리는 처음 것을 따른다", () => {
    expect(parseEnvText("A=1\nB=2\nA=3").rows).toEqual([
      { key: "A", value: "3" },
      { key: "B", value: "2" },
    ]);
  });
});

describe("mergeEnvRows", () => {
  it("새 이름은 끝에 붙이고, 있는 이름은 그 자리에서 값을 바꾸고, 빈 행은 지운다", () => {
    const env = [
      { key: "KEEP", value: "1" },
      { key: "API_URL", value: "old" },
      { key: "SAME", value: "x" },
      { key: "", value: "" },
    ];
    const rows = [
      { key: "API_URL", value: "new" },
      { key: "SAME", value: "x" },
      { key: "DEBUG", value: "1" },
    ];
    expect(mergeEnvRows(env, rows)).toEqual({
      env: [
        { key: "KEEP", value: "1" },
        { key: "API_URL", value: "new" },
        { key: "SAME", value: "x" },
        { key: "DEBUG", value: "1" },
      ],
      added: 1,
      replaced: 1,
    });
  });

  it("이름이 겹친 행 중 하나라도 값이 다르면 바뀐 것으로 센다", () => {
    const env = [
      { key: "A", value: "1" },
      { key: "A", value: "2" },
    ];
    expect(mergeEnvRows(env, [{ key: "A", value: "1" }])).toMatchObject({ added: 0, replaced: 1 });
  });

  it("이름만 비었거나 값만 비었으면 사용자가 쓰던 행이라 남긴다", () => {
    const env = [
      { key: "", value: "typed" },
      { key: "NAME", value: "" },
    ];
    expect(mergeEnvRows(env, [{ key: "A", value: "1" }]).env).toEqual([...env, { key: "A", value: "1" }]);
  });
});

describe("formatPasteResult", () => {
  it("0 인 항목은 빼고 잇는다", () => {
    expect(formatPasteResult(2, 0, 1)).toBe(`2${ENV_TEXT.pasteAdded} · 1${ENV_TEXT.pasteSkipped}`);
    expect(formatPasteResult(0, 1, 0)).toBe(`1${ENV_TEXT.pasteReplaced}`);
  });

  it("아무것도 바뀌지 않으면 그렇다고 말한다", () => {
    expect(formatPasteResult(0, 0, 0)).toBe(ENV_TEXT.pasteUnchanged);
  });
});
