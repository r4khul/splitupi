/**
 * A tiny, safe arithmetic evaluator (no eval) supporting + - * / and parentheses.
 * Lets users type things like "1200/4", "500+250+100", or "(900-60)/3"
 * straight into the amount field and have it auto-calculate.
 */

export interface CalcResult {
  value: number;
  valid: boolean;
  /** true when the input contains an operator (i.e. it's a calculation). */
  isExpression: boolean;
}

type Token =
  | { t: "num"; v: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "lp" }
  | { t: "rp" };

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let num = "";
      while (i < s.length && ((s[i] >= "0" && s[i] <= "9") || s[i] === ".")) {
        num += s[i];
        i++;
      }
      const v = parseFloat(num);
      if (isNaN(v)) throw new Error("bad number");
      tokens.push({ t: "num", v });
      continue;
    }
    if (c === "(") {
      tokens.push({ t: "lp" });
      i++;
      continue;
    }
    if (c === ")") {
      tokens.push({ t: "rp" });
      i++;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/") {
      const prev = tokens[tokens.length - 1];
      // Unary +/-: treat as (0 ± n) so "-5" and "(-5)" work.
      const unary =
        (c === "-" || c === "+") &&
        (!prev || prev.t === "op" || prev.t === "lp");
      if (unary) tokens.push({ t: "num", v: 0 });
      tokens.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error("bad char");
  }
  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const out: Token[] = [];
  const ops: Token[] = [];
  for (const tk of tokens) {
    if (tk.t === "num") {
      out.push(tk);
    } else if (tk.t === "op") {
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top.t === "op" && PREC[top.v] >= PREC[tk.v]) out.push(ops.pop()!);
        else break;
      }
      ops.push(tk);
    } else if (tk.t === "lp") {
      ops.push(tk);
    } else {
      while (ops.length && ops[ops.length - 1].t !== "lp")
        out.push(ops.pop()!);
      if (!ops.length) throw new Error("mismatched parens");
      ops.pop();
    }
  }
  while (ops.length) {
    const o = ops.pop()!;
    if (o.t === "lp") throw new Error("mismatched parens");
    out.push(o);
  }
  return out;
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];
  for (const tk of rpn) {
    if (tk.t === "num") {
      stack.push(tk.v);
    } else if (tk.t === "op") {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error("bad expr");
      switch (tk.v) {
        case "+":
          stack.push(a + b);
          break;
        case "-":
          stack.push(a - b);
          break;
        case "*":
          stack.push(a * b);
          break;
        case "/":
          stack.push(b === 0 ? NaN : a / b);
          break;
      }
    }
  }
  if (stack.length !== 1) throw new Error("bad expr");
  return stack[0];
}

export function evaluateExpression(input: string): CalcResult {
  const expr = input.trim();
  // An expression has an operator beyond a possible leading sign.
  const isExpression = /[+*/]/.test(expr) || /\d\s*-/.test(expr);
  if (!expr) return { value: 0, valid: true, isExpression: false };
  if (!/^[0-9+\-*/().\s]+$/.test(expr))
    return { value: NaN, valid: false, isExpression };
  // Don't error mid-typing when it ends on an operator - just treat as pending.
  if (/[+\-*/.]\s*$/.test(expr)) {
    try {
      const trimmed = expr.replace(/[+\-*/.]\s*$/, "");
      if (!trimmed) return { value: 0, valid: true, isExpression };
      const v = evalRPN(toRPN(tokenize(trimmed)));
      return { value: v, valid: true, isExpression };
    } catch {
      return { value: NaN, valid: false, isExpression };
    }
  }
  try {
    const value = evalRPN(toRPN(tokenize(expr)));
    if (!isFinite(value) || value < 0)
      return { value: NaN, valid: false, isExpression };
    return { value, valid: true, isExpression };
  } catch {
    return { value: NaN, valid: false, isExpression };
  }
}
