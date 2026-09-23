import { loc, type Localized, type Locale } from "./site-locale";
import {
  COLUMN_KEYS,
  chipsOf,
  columnOn,
  draftPending,
  visibleCustomers,
  type ColumnKey,
  type DeskState,
  type FacetKey,
  type Flash,
  type KindId,
  type Owner,
  type Status,
  type Tag,
} from "./machines";

export type LayerId = "find" | "see" | "act";

export type KindMeta = {
  id: KindId;
  index: string;
  layer: LayerId;
  zh: Localized;
  oneLiner: Localized;
  spec: Localized;
  rules: Localized[];
};

export const LAYERS: { id: LayerId; label: Localized }[] = [
  { id: "find", label: loc("找", "Find") },
  { id: "see", label: loc("看", "See") },
  { id: "act", label: loc("改", "Act") },
];

export const KINDS: KindMeta[] = [
  {
    id: "filter",
    index: "01",
    layer: "find",
    zh: loc("表头筛选", "Header filter"),
    oneLiner: loc("这一列自己的多选，草稿要点应用才进表", "This column's multi-select. Draft applies on purpose"),
    spec: loc(
      "标签、负责人、跟进状态从这一列的表头多选。同一列匹配任意一个，列和列要同时满足。勾选先留在草稿里，点应用才进表。名称搜索不是这一列的条件。",
      "Tags, owner, and status filter from that column's header. One column matches any checked value; columns must all match. Checks stay in a draft until Apply. The name search is not a column condition.",
    ),
    rules: [
      loc("从这一列的表头打开", "Opens from this column's header"),
      loc("列内或，列间与", "OR inside a column, AND across columns"),
      loc("应用之前表不变", "The table waits for Apply"),
    ],
  },
  {
    id: "sort",
    index: "02",
    layer: "see",
    zh: loc("列排序", "Column sort"),
    oneLiner: loc("金额在不排、从高到低、从低到高之间转", "Amount cycles: none, high to low, low to high"),
    spec: loc(
      "点金额在不排、从高到低、从低到高之间转，箭头标出方向。只改顺序，条数不变。",
      "Click the amount to cycle none, high-to-low, and low-to-high. The arrow shows the direction. Order changes. The count does not.",
    ),
    rules: [
      loc("先看到金额最高的", "Highest amount comes first"),
      loc("再点一次反过来", "The next click reverses it"),
      loc("第三次回到原来的顺序", "The third click restores the original order"),
    ],
  },
  {
    id: "sticky",
    index: "03",
    layer: "see",
    zh: loc("固定表头", "Sticky header"),
    oneLiner: loc("表头钉在这张表的滚动区里", "The header sticks inside this table's scrollport"),
    spec: loc(
      "往下翻时，表头留在表格自己的滚动区顶部，页面其余部分不跟着钉。横着滑时，名称列还在。",
      "While the rows scroll, the header stays at the top of the table's own scrollport. The rest of the page does not stick. Sideways, the name column stays.",
    ),
    rules: [
      loc("钉在表内，不钉整页", "Sticks in the table, not the page"),
      loc("名称列横向跟着留住", "The name column stays when you scroll sideways"),
      loc("列名和这一行还对得上", "The column name still matches the row"),
    ],
  },
  {
    id: "actions",
    index: "04",
    layer: "act",
    zh: loc("行操作", "Row actions"),
    oneLiner: loc("一行只露出查看，其余收在更多里", "The row shows View. The rest sit in More"),
    spec: loc(
      "一行只露出查看。编辑、复制、删除收在这一行的更多里，删除放在分隔线后面。",
      "The row shows View only. Edit, duplicate, and delete live in that row's More menu. Delete sits after a separator.",
    ),
    rules: [
      loc("查看留在行上", "View stays on the row"),
      loc("编辑和复制在更多里", "Edit and duplicate are in More"),
      loc("删除在分隔线后", "Delete sits after the separator"),
    ],
  },
  {
    id: "columns",
    index: "05",
    layer: "see",
    zh: loc("自定义列", "Columns"),
    oneLiner: loc("按这次任务开关字段，名称不能关", "Toggle fields for this task. The name stays"),
    spec: loc(
      "按这次任务开关字段。名称必选，不能关。选择框和操作不是字段，一直在。",
      "Turn fields on for this task. The name is required and stays on. The checkbox and the actions are not fields; they stay.",
    ),
    rules: [
      loc("名称必选", "Name is required"),
      loc("更新时间默认关着", "Updated time starts off"),
      loc("选择和操作不在字段里", "Selection and actions are not fields"),
    ],
  },
  {
    id: "bulk",
    index: "06",
    layer: "act",
    zh: loc("批量操作", "Bulk"),
    oneLiner: loc("有勾选，批量条才换掉搜索", "The bulk bar replaces search only after a selection"),
    spec: loc(
      "已选数量大于 0，批量条才出现，写上条数，这时搜索和列设置让开。全选只勾当前筛出来的行。",
      "The bulk bar appears when the selection count is above zero, states that count, and search plus column settings step aside. Select-all checks only the rows the filter is showing.",
    ),
    rules: [
      loc("没选中不占工具条", "An empty selection leaves the toolbar"),
      loc("写清已选条数", "The count is on the bar"),
      loc("全选不勾被筛掉的行", "Select-all skips rows the filter hid"),
    ],
  },
  {
    id: "chips",
    index: "07",
    layer: "find",
    zh: loc("已选条件", "Active filters"),
    oneLiner: loc("每个已应用的值一枚，可以单独摘掉", "Each applied value is its own chip"),
    spec: loc(
      "每个已经应用的值单独一枚，可以摘掉一枚。清空筛选不清除名称搜索。",
      "Each applied value is its own chip and can be removed alone. Clear filters leaves the name search in place.",
    ),
    rules: [
      loc("一枚对应一个值", "One chip, one value"),
      loc("摘掉一枚，其余还在", "Remove one; the others stay"),
      loc("清空不碰名称搜索", "Clear leaves the name search"),
    ],
  },
];

const COLUMN_LABEL: Record<ColumnKey, Localized> = {
  name: loc("客户名称", "Name"),
  tags: loc("标签", "Tags"),
  amount: loc("金额 / 元", "Amount"),
  owner: loc("负责人", "Owner"),
  status: loc("跟进状态", "Status"),
  updatedAt: loc("更新时间", "Updated"),
};

const TAG_LABEL: Record<Tag, Localized> = {
  重点客户: loc("重点客户", "Key"),
  零售: loc("零售", "Retail"),
  餐饮: loc("餐饮", "Dining"),
  家居: loc("家居", "Home"),
  服务: loc("服务", "Service"),
  住宿: loc("住宿", "Stay"),
};

const STATUS_LABEL: Record<Status, Localized> = {
  待跟进: loc("待跟进", "To follow"),
  已联系: loc("已联系", "Contacted"),
  已完成: loc("已完成", "Done"),
};

const FACET_LABEL: Record<FacetKey, Localized> = {
  tags: loc("标签", "Tag"),
  owners: loc("负责人", "Owner"),
  statuses: loc("状态", "Status"),
};

export function columnLabel(key: ColumnKey, locale: Locale): string {
  return COLUMN_LABEL[key][locale];
}

export function tagLabel(tag: Tag, locale: Locale): string {
  return TAG_LABEL[tag][locale];
}

export function statusLabel(status: Status, locale: Locale): string {
  return STATUS_LABEL[status][locale];
}

export function ownerLabel(owner: Owner): string {
  return owner;
}

export function facetLabel(facet: FacetKey, locale: Locale): string {
  return FACET_LABEL[facet][locale];
}

export function facetValueLabel(facet: FacetKey, value: string, locale: Locale): string {
  if (facet === "tags" && value in TAG_LABEL) return TAG_LABEL[value as Tag][locale];
  if (facet === "statuses" && value in STATUS_LABEL) return STATUS_LABEL[value as Status][locale];
  return value;
}

export function chipLabel(facet: FacetKey, value: string, locale: Locale): string {
  return `${facetLabel(facet, locale)}：${facetValueLabel(facet, value, locale)}`;
}

export function kindMeta(id: KindId): KindMeta {
  return KINDS.find((kind) => kind.id === id) ?? KINDS[0]!;
}

export function layerLabel(layer: LayerId, locale: Locale): string {
  return LAYERS.find((item) => item.id === layer)?.label[locale] ?? layer;
}

export function describeKind(kind: KindId, state: DeskState, locale: Locale): string {
  const visible = visibleCustomers(state.rows, state.facets, state.query, state.sort).length;
  const chips = chipsOf(state.facets).length;
  if (kind === "filter") {
    if (draftPending(state)) {
      return locale === "en"
        ? `${state.draft.length} in the draft. The table changes on Apply. One column matches any; columns must all match.`
        : `草稿里 ${state.draft.length} 项，点应用才进表。列内匹配任意一个，列之间要同时满足。`;
    }
    return locale === "en"
      ? chips > 0
        ? `${chips} applied. ${visible} rows. The name search is separate.`
        : "Filter from this column's header. The draft waits for Apply."
      : chips > 0
        ? `已应用 ${chips} 个条件，当前 ${visible} 条。名称搜索另算。`
        : "从这一列的表头筛选。草稿要点应用才进表。";
  }
  if (kind === "sort") {
    const dir =
      state.sort === "desc"
        ? locale === "en"
          ? "high to low"
          : "从高到低"
        : state.sort === "asc"
          ? locale === "en"
            ? "low to high"
            : "从低到高"
          : locale === "en"
            ? "original order"
            : "原来的顺序";
    return locale === "en"
      ? `Amount is ${dir}. ${visible} rows. Sorting does not change the count.`
      : `金额${dir}。当前 ${visible} 条，排序不改变条数。`;
  }
  if (kind === "sticky") {
    return locale === "en"
      ? "The header stays at the top of this table. Sideways, the name column stays too."
      : "表头留在这张表的滚动区顶部。横着滑时，名称列还在。";
  }
  if (kind === "actions") {
    return locale === "en"
      ? "The row shows View. Edit, duplicate, and delete are in More. Delete sits after the separator."
      : "这一行露出查看。编辑、复制、删除在更多里，删除在分隔线后。";
  }
  if (kind === "columns") {
    const hidden = COLUMN_KEYS.filter((key) => !columnOn(state.visibility, key)).map((key) => columnLabel(key, locale));
    return locale === "en"
      ? hidden.length > 0
        ? `Hidden: ${hidden.join(", ")}. The name stays on.`
        : "Every field is on. The name cannot be turned off."
      : hidden.length > 0
        ? `藏起了${hidden.join("、")}。名称不能关。`
        : "字段都开着。名称不能关。";
  }
  if (kind === "bulk") {
    return state.selected.length > 0
      ? locale === "en"
        ? `${state.selected.length} selected. Search steps aside. Select-all checks only the rows in view.`
        : `已选 ${state.selected.length} 条。搜索先让开。全选只勾当前筛出来的行。`
      : locale === "en"
        ? "Nothing selected. The bulk bar waits until the count is above zero."
        : "还没勾选。批量条要等已选数量大于 0。";
  }
  const query = state.query.trim();
  return locale === "en"
    ? chips > 0
      ? `${chips} chips. Each one can go. Clear leaves the name search${query ? ` “${query}”` : ""}.`
      : "No applied filters yet. The name search is not a chip."
    : chips > 0
      ? `${chips} 枚条件可以单独摘掉。清空不碰名称搜索${query ? `「${query}」` : ""}。`
      : "还没有已应用的条件。名称搜索不是一枚条件。";
}

export function flashText(flash: Flash, locale: Locale): string | null {
  if (!flash) return null;
  if (flash.code === "copied") {
    return locale === "en" ? `Duplicated “${flash.name}”. The copy is at the top, status To follow.` : `已复制「${flash.name}」。副本在最上面，状态是待跟进。`;
  }
  if (flash.code === "saved") return locale === "en" ? `Saved “${flash.name}”.` : `已保存「${flash.name}」。`;
  if (flash.code === "created") return locale === "en" ? `Added “${flash.name}”.` : `已新建「${flash.name}」。`;
  if (flash.code === "deleted") return locale === "en" ? `Deleted “${flash.name}”.` : `已删除「${flash.name}」。`;
  if (flash.code === "bulk-status") {
    const status = statusLabel(flash.status, locale);
    return locale === "en" ? `${flash.count} set to ${status}.` : `已将 ${flash.count} 条改为「${status}」。`;
  }
  if (flash.code === "bulk-owner") {
    return locale === "en"
      ? `${flash.count} assigned to ${flash.owner}.`
      : `已将 ${flash.count} 条分给 ${flash.owner}。`;
  }
  return locale === "en" ? "Example records restored." : "已恢复示例数据。";
}
