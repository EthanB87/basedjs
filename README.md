# basedjs 😤🔥

Write JavaScript using Gen-Z slang.
Compile it back to normal JS using Babel.

Because why not.

---

## ✨ Features

- Gen-Z syntax → real JavaScript
- Zero runtime overhead
- Babel plugin + ESLint rules
- Fully typed (TypeScript)
- Surprisingly usable

---

## 📦 Installation

```bash
npm install --save-dev basedjs
```

## 🔧 Babel Setup

```
// babel.config.js
module.exports = {
  plugins: ["basedjs"],
};
```

## Or with Vite / Webpack:

```
plugins: [["basedjs"]]
```

## 🧠 Supported Syntax

- Console

```
print("hello");     // console.log
yap("warning");    // console.warn
panic("oops");     // console.error
```

- Conditionals

```
deadass(x > 5, () => {
  print("big");
});

bet(x > 10, () => {
  print("huge");
});

orNah(() => {
  print("small");
});
```

⬇️ Compiles to:

```
if (x > 5) {
  console.log("big");
} else if (x > 10) {
  console.log("huge");
} else {
  console.log("small");
}
```

- Boolean Helpers

```
sus(isBad);             // !isBad
lowkey(a, b);           // a && b
highkey(a, b);          // a || b
```

- Loops

```
runItBack(x < 10, () => {
  x++;
});

spinAgain(3, i => {
  print(i);
});
```

⬇️

```
while (x < 10) {
  x++;
}

for (let i = 0; i < 3; i++) {
  console.log(i);
}
```

- IIFEs

```
weUp(() => {
  print("immediately");
});
```

⬇️

```
(() => {
  console.log("immediately");
})();
```

- Aysnc / Await

```
asyncAF(() => {
  chill(500);
  itsGiving("done");
});
```

⬇️

```
(async () => {
  await new Promise(r => setTimeout(r, 500));
  return "done";
})();
```

- Try / Catch / Finally

```
vibeCheck(
  () => {
    onGod(new Error("nah"));
  },
  err => {
    panic(err);
  }
);

sayLess(() => {
  print("cleanup");
});
```

⬇️

```
try {
  throw new Error("nah");
} catch (err) {
  console.error(err);
} finally {
  console.log("cleanup");
}
```

- Entry Point

```
mainCharacter(() => {
  print("app started");
});
```

⬇️

```
(() => {
  console.log("app started");
})();
```

## ⚠️ Disclaimer

This is a syntax experiment.

Do not deploy to production unless:

1. you understand Babel

2. your team is based

3. you accept the consequences

## 🧠 Inspired By

Babel macros

JavaScript codemods

Terminally online developers

Vibes

🪦 License

MIT
