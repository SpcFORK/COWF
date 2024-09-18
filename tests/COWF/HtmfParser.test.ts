import { HtmfParser } from "../../src/parser/HtmfParser";

const content1 = `
=> Doc html lang="en"
=> Head head
=> Body body
<+ Doc Head Body
=> Content p
<+ Body Content
This is the content.
`;

const content2 = `
=> Root div
=> Child1 p
=> Child2 span
<+ Root Child1 Child2
=> Grandchild a href="#"
<+ Child2 Grandchild
`;

const content3 = `
=> Doc html
! This is a comment
=> Body body
<+ Doc Body
`;

describe("HtmfParser", () => {
  let parser: HtmfParser;
  let env = <any>{}

  beforeEach(() => {
    env = {}
    parser = new HtmfParser(() => env);
  });

  test("should parse simple HTMF content", () => {
    const result = parser.parse(content1);
    expect(result.format).toBe("htmf");
    expect(result.content).toEqual({
      tag: "html",
      name: "Doc",
      attributes: { lang: "en" },
      children: [
        {
          tag: "head",
          name: "Head",
          attributes: {},
          children: [],
          content: "",
        },
        {
          tag: "body",
          name: "Body",
          attributes: {},
          children: [
            {
              tag: "p",
              name: "Content",
              attributes: {},
              children: [],
              content: "This is the content.\n",
            },
          ],
          content: "",
        },
      ],
      content: "",
    });
  });

  test("should handle nested elements", () => {
    const result = parser.parse(content2);
    expect(result.format).toBe("htmf");
    expect(result.content).toEqual({
      tag: "div",
      name: "Root",
      attributes: {},
      children: [
        { tag: "p", name: "Child1", attributes: {}, children: [], content: "" },
        {
          tag: "span",
          name: "Child2",
          attributes: {},
          children: [
            {
              tag: "a",
              name: "Grandchild",
              attributes: { href: "#" },
              children: [],
              content: "",
            },
          ],
          content: "",
        },
      ],
      content: "",
    });
  });

  test("should ignore comments", () => {
    const result = parser.parse(content3);
    expect(result.format).toBe("htmf");
    expect(result.content).toEqual({
      tag: "html",
      name: "Doc",
      attributes: {},
      children: [
        {
          tag: "body",
          name: "Body",
          attributes: {},
          children: [],
          content: "",
        },
      ],
      content: "",
    });
  });
});
