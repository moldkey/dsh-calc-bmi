/**
 * BMI 计算器
 *
 * 算身体质量指数，给出中国/WHO 两套标准的分级。附带标准体重区间。纯本地计算，不联网。
 */

export const name = "dsh-calc-bmi";

export const inject = ["tools"];

const TEXT_OUTPUT = {
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      text: { type: "string" },
    },
    required: ["text"],
  },
  render: (_args, value) => [
    { type: "text", text: (value && value.text) || "" },
  ],
};

// ══════════════════════════════════════════════════════════
//  通用工具函数
// ══════════════════════════════════════════════════════════

const TITLE = "__CALC_TITLE__";

function fmt(n, digits) {
  if (!Number.isFinite(n)) return String(n);
  const d = digits == null ? 2 : digits;
  if (Math.abs(n) >= 1e12) return n.toExponential(6);
  let s = n.toFixed(d);
  if (d > 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

function money(n) {
  if (!Number.isFinite(n)) return String(n);
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function num(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : (def == null ? 0 : def);
}

function line(label, value, unit) {
  const pad = "  ";
  return pad + label + "：" + value + (unit ? " " + unit : "");
}

function head(title) {
  return [title, "=".repeat(52)];
}

// ══════════════════════════════════════════════════════════
//  工具
// ══════════════════════════════════════════════════════════

export function apply(ctx, config) {
  void config;

  ctx.tools.register({
    name: "calc_bmi",
    description:
      "BMI 计算。输入身高（厘米）和体重（公斤），返回 BMI 值、分级、以及你的标准体重区间。",
    parameters: {
      height: { type: "number", required: true, description: "身高（厘米）" },
      weight: { type: "number", required: true, description: "体重（公斤）" },
    },
    output: TEXT_OUTPUT,
    async execute(args) {
      try {
        const a = args || {};
        const h = num(a.height) / 100, w = num(a.weight);
        if (h <= 0 || w <= 0) return { text: "身高体重要大于 0" };
        const bmi = w / (h * h);
        const L = head("BMI 计算");
        L.push(line("身高", fmt(num(a.height)) + " 厘米"));
        L.push(line("体重", fmt(w) + " 公斤"));
        L.push(line("BMI", fmt(bmi, 1)));
        L.push("");
        let grade = "";
        if (bmi < 18.5) grade = "偏瘦";
        else if (bmi < 24) grade = "正常";
        else if (bmi < 28) grade = "超重";
        else if (bmi < 32) grade = "肥胖";
        else grade = "重度肥胖";
        L.push("  中国标准：" + grade);
        L.push("    偏瘦 <18.5 | 正常 18.5-23.9 | 超重 24-27.9 | 肥胖 ≥28");
        L.push("");
        L.push("  WHO 标准：");
        L.push("    偏瘦 <18.5 | 正常 18.5-24.9 | 超重 25-29.9 | 肥胖 ≥30");
        L.push("");
        const lo = 18.5 * h * h, hi = 23.9 * h * h;
        L.push("  按中国标准，你的身高的正常体重区间：");
        L.push("    " + fmt(lo, 1) + " - " + fmt(hi, 1) + " 公斤");
        return { text: L.join("\n") };
      } catch (e) {
        return { text: "计算失败: " + String((e && e.message) || e) };
      }
    },
  });
}
