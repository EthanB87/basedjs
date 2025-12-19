import { transformSync } from "@babel/core";
import plugin from "../src/plugin";

function transform(code: string) {
  return transformSync(code, {
    plugins: [plugin],
    filename: "test.ts"
  })!.code;
}
import { describe, it, expect } from "vitest";

describe("nocap slang", () => {
  it("transforms print", () => {
    expect(transform(`print("hi")`))
      .toContain(`console.log("hi")`);
  });

  it("transforms deadass", () => {
    expect(
      transform(`
        deadass(x > 1, () => {
          print("ok")
        })
      `)
    ).toContain(`if (x > 1)`);
  });

  it("transforms weUp", () => {
    expect(
      transform(`
        weUp(() => {
          print("run")
        })
      `)
    ).toContain(`(() => {`);
  });

  it("transforms itsGiving", () => {
    expect(
      transform(`
        function test() {
          itsGiving(5)
        }
      `)
    ).toContain(`return 5`);
  });

  it("transforms loops", () => {
    expect(
      transform(`
        spinBack(3, (i) => {
          print(i)
        })
      `)
    ).toContain(`for (let i = 0; i < 3; i++)`);
  });

  it("transforms vibeCheck → try/catch", () => {
  const output = transform(`
    vibeCheck(
      () => {
        risky()
      },
      (err) => {
        panic(err)
      }
    )
  `);

  expect(output).toContain("try {");
  expect(output).toContain("catch (err)");
});

it("transforms asyncAF → async IIFE", () => {
  const output = transform(`
    asyncAF(async () => {
      print("ok")
    })
  `);

  expect(output).toContain("(async () => {");
});

it("transforms chill → await Promise", () => {
  const output = transform(`
    asyncAF(async () => {
      chill(100)
    })
  `);

  expect(output).toContain("await new Promise");
});

it("transforms onGod → throw", () => {
  const output = transform(`
    function test() {
      onGod("fail")
    }
  `);

  expect(output).toContain(`throw "fail"`);
});

it("transforms sayLess → finally", () => {
  const output = transform(`
    vibeCheck(() => {}, () => {})
    sayLess(() => {
      print("done")
    })
  `);

  expect(output).toContain("finally");
});

it("transforms mainCharacter → entry", () => {
  const output = transform(`
    mainCharacter(() => {
      print("start")
    })
  `);

  expect(output).toContain("(() => {");
});

});
