import type { LabDocument } from "./types.ts";

export const DEMO_DOCS: LabDocument[] = [
  {
    id: "d1",
    title: "财务分析方法论",
    note: "向量容易误召回",
    noteEn: "Vectors easily false-positive",
    body: "财务分析方法论：如何用贴现现金流与可比公司估值评估企业价值。本文讨论财务分析框架与通用估值模型，并不涉及任何具体季度数字。分析师应先理解方法论，再看报表。",
  },
  {
    id: "d2",
    title: "二零二四年第三季度业绩",
    note: "精确命中",
    noteEn: "Exact match",
    body: "本公司二零二四年第三季度营收为 42.8 亿元，同比增长 12%。管理层在业绩说明会上强调营收结构持续优化，海外市场贡献提升。",
  },
  {
    id: "d3",
    title: "2024 年第二季度简报",
    note: "同年不同季",
    noteEn: "Same year, diff quarter",
    body: "2024年第二季度营收略有下滑，毛利率保持稳定。对下一季的展望谨慎乐观，但本文并未给出该季的最终数字。",
  },
  {
    id: "d4",
    title: "苹果手机评测：续航与影像",
    note: "三词都命中",
    noteEn: "All 3 terms matched",
    body: "苹果手机评测：今年新款在续航与影像上进步明显，系统流畅度仍是优势。对日常拍摄和长时间使用都更从容。",
  },
  {
    id: "d5",
    title: "苹果发布会回顾",
    note: "少了「手机」",
    noteEn: "Missing '手机' (phone)",
    body: "苹果发布会回顾：新款手表与耳机成为焦点。评测文章更多写了配件生态与价格策略，几乎没有谈到那款旗舰。",
  },
  {
    id: "d6",
    title: "收入提升来自海外",
    note: "语义能对上，词对不上",
    noteEn: "Semantic match, term mismatch",
    body: "收入提升主要来自海外市场扩张。公司并未披露具体数字，只强调海外贡献在提升。",
  },
  {
    id: "d7",
    title: "自然语言处理与分词",
    note: "整词 / 子词",
    noteEn: "Phrase vs subwords",
    body: "自然语言处理可以分为分词、句法与语义三层。搜索引擎模式还会多切出子词，整词能搜到，单独搜语言也能命中。",
  },
  {
    id: "d8",
    title: "Learning algorithms",
    note: "英文词干",
    noteEn: "English stemming",
    body: "Machine learning algorithms help models keep learning from data. The learning rate controls how fast the algorithm updates.",
  },
  {
    id: "d9",
    title: "短文：苹果手机评测",
    note: "短而精",
    noteEn: "Short & dense",
    body: "苹果手机评测。",
  },
  {
    id: "d10",
    title: "一篇很长的苹果周边观察",
    note: "长文稀释",
    noteEn: "Long doc dilution",
    body: "这是一篇很长的观察笔记。作者反复提到苹果的品牌叙事、零售体验、配件生态、服务订阅、开发者会议、芯片路线、隐私主张、维修政策、二手市场与回收计划。文中偶尔写到评测媒体喜欢比较续航曲线，也顺带提了一句手机影像。整篇大约堆了很多与查询只有弱相关的词，用来观察文档长度归一化会怎样压低长文分数。苹果苹果苹果，评测评测，还有一段关于供应链与渠道库存的闲笔，最后才回到手机。",
  },
  {
    id: "d11",
    title: "revenue.ts · getQ3Revenue",
    note: "搜代码",
    noteEn: "Code identifier",
    body: "export function getQ3Revenue(year = 2024) { const key = `${year}-Q3`; return books.revenueByQuarter[key]; }",
  },
];

export interface PresetQuery {
  q: string;
  labelZh: string;
  labelEn: string;
  hintZh: string;
  hintEn: string;
}

export const PRESET_QUERIES: PresetQuery[] = [
  {
    q: "二零二四年第三季度营收",
    labelZh: "精确匹配",
    labelEn: "Exact Match",
    hintZh: "向量常捞回方法论；BM25 要三词同时在。",
    hintEn: "Vectors often pull unrelated methodology; BM25 requires all three exact terms.",
  },
  {
    q: "营收增长",
    labelZh: "语义鸿沟",
    labelEn: "Vocabulary Mismatch",
    hintZh: "文档写「收入提升」时，BM25 对不上，向量能近邻。",
    hintEn: "When document says '收入提升' (revenue increase), BM25 misses but vector captures the semantic neighbor.",
  },
  {
    q: "苹果手机评测",
    labelZh: "多词 + 长短文",
    labelEn: "Multi-term & Length",
    hintZh: "三词都中的短文应排最前；少一词会掉一块 IDF。",
    hintEn: "A short doc hitting all 3 terms ranks top; missing a term drops a chunk of IDF.",
  },
  {
    q: "自然语言处理",
    labelZh: "中文分词",
    labelEn: "CJK Subwords",
    hintZh: "整词 vs 切成「语言」——打开子词模式再搜一次。",
    hintEn: "Full phrase vs subword '语言'—toggle subword mode and compare.",
  },
  {
    q: "learning algorithms",
    labelZh: "英文词干",
    labelEn: "Stemming",
    hintZh: "learning 还原成 learn，才能和 learned / learning 对上。",
    hintEn: "Stems 'learning' to 'learn' to match across inflections.",
  },
  {
    q: "getQ3Revenue",
    labelZh: "搜代码",
    labelEn: "Code Identifier",
    hintZh: "标识符、数字、日期：把 BM25 调高。向量几乎帮不上。",
    hintEn: "Identifiers, numbers, dates: boost BM25. Vectors rarely help.",
  },
];
