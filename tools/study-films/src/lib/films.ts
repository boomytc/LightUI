import narration from "../../scripts/narration.json";

export type FilmId = "intent-cascade" | "dropdown-taxonomy";
export type Locale = "zh" | "en";
export type SceneKind = "title" | "still" | "close";
export type CompId = `${FilmId}-${Locale}`;

export type SceneDef = {
  id: string;
  kind: SceneKind;
  still?: string;
  kicker?: string;
  headline?: string;
  lede?: string;
  tags?: string[];
  fit?: "cover" | "contain";
};

export type TimedScene = SceneDef & {
  from: number;
  durationInFrames: number;
  line: string;
};

export type FilmDef = {
  filmId: FilmId;
  locale: Locale;
  title: string;
  output: string;
  stillDir: string;
  voiceDir: string;
  scenes: SceneDef[];
};

const INTENT_STILLS: Omit<SceneDef, "kicker" | "headline" | "lede" | "tags">[] = [
  { id: "title", kind: "title" },
  { id: "problem", kind: "still", still: "desktop-full.png" },
  { id: "diagonal", kind: "still", still: "diagonal-to-cancel.png", fit: "contain" },
  { id: "vertical", kind: "still", still: "vertical-to-project.png", fit: "contain" },
  { id: "third", kind: "still", still: "third-level.png", fit: "contain" },
  { id: "close", kind: "close" },
];

const DROPDOWN_STILLS: Omit<SceneDef, "kicker" | "headline" | "lede" | "tags">[] = [
  { id: "title", kind: "title" },
  { id: "select", kind: "still", still: "select-open.png", fit: "contain" },
  { id: "multi", kind: "still", still: "comp-02.png", fit: "contain" },
  { id: "grouped", kind: "still", still: "comp-03.png", fit: "contain" },
  { id: "cascader", kind: "still", still: "comp-04.png", fit: "contain" },
  { id: "split", kind: "still", still: "comp-05.png", fit: "contain" },
  { id: "mega", kind: "still", still: "comp-06.png", fit: "contain" },
  { id: "date", kind: "still", still: "date-cal.png", fit: "contain" },
  { id: "close", kind: "close" },
];

type Copy = {
  title: string;
  output: string;
  titleCard: Pick<SceneDef, "kicker" | "headline" | "lede" | "tags">;
  closeCard: Pick<SceneDef, "headline" | "lede">;
};

const COPY: Record<FilmId, Record<Locale, Copy>> = {
  "intent-cascade": {
    zh: {
      title: "菜单意图预测",
      output: "cursor-movement.mp4",
      titleCard: {
        kicker: "LightUI  ·  Study",
        headline: "菜单意图预测",
        lede: "根据指针轨迹，判断你是不是要进子菜单。",
        tags: ["安全三角", "斜向保护", "纵向即时"],
      },
      closeCard: {
        headline: "说清楚",
        lede: "上一帧指针与子菜单左缘构成走廊。走廊内不切换；纵向即时；越过左缘不再保护，也不画反向三角。判定顶点是上一帧，不是当前指针。",
      },
    },
    en: {
      title: "Menu intent",
      output: "cursor-movement.en.mp4",
      titleCard: {
        kicker: "LightUI  ·  Study",
        headline: "Menu intent",
        lede: "Guess from the pointer path whether you are heading into the submenu.",
        tags: ["Safe triangle", "Diagonal protect", "Instant vertical"],
      },
      closeCard: {
        headline: "Say it this way",
        lede: "The previous pointer and the submenu’s leading edge form a corridor. Stay inside, do not switch. Vertical moves switch now. Past the leading edge, the corridor ends — no reverse triangle. The test vertex is the previous sample, not the live pointer.",
      },
    },
  },
  "dropdown-taxonomy": {
    zh: {
      title: "给下拉起对名字",
      output: "source-tutorial.mp4",
      titleCard: {
        kicker: "LightUI  ·  Study",
        headline: "给下拉起对名字",
        lede: "往下展开只是外观。先定提交模型。",
        tags: ["名称", "场景", "规则"],
      },
      closeCard: {
        headline: "说清楚",
        lede: "分组选择是分类，级联选择才是上下级。先说名称、场景、面板何时关闭，再谈外观。",
      },
    },
    en: {
      title: "Name the dropdown",
      output: "source-tutorial.en.mp4",
      titleCard: {
        kicker: "LightUI  ·  Study",
        headline: "Name the dropdown",
        lede: "Opening downward is only the skin. First decide the commit model.",
        tags: ["Name", "Scene", "Rules"],
      },
      closeCard: {
        headline: "Say it this way",
        lede: "Grouped is filing. Cascader is parent-child. Name the model, the scene, and when the panel closes — then talk about looks.",
      },
    },
  },
};

function stillDir(filmId: FilmId, locale: Locale): string {
  return locale === "en" ? `stills/en/${filmId}` : `stills/${filmId}`;
}

function voiceDir(filmId: FilmId, locale: Locale): string {
  return `voice/${locale}/${filmId}`;
}

function withCopy(base: SceneDef[], copy: Copy): SceneDef[] {
  return base.map((scene) => {
    if (scene.kind === "title") return { ...scene, ...copy.titleCard };
    if (scene.kind === "close") return { ...scene, ...copy.closeCard };
    return scene;
  });
}

function makeFilm(filmId: FilmId, locale: Locale, base: SceneDef[]): FilmDef {
  const copy = COPY[filmId][locale];
  return {
    filmId,
    locale,
    title: copy.title,
    output: copy.output,
    stillDir: stillDir(filmId, locale),
    voiceDir: voiceDir(filmId, locale),
    scenes: withCopy(base, copy),
  };
}

export const FILMS: Record<CompId, FilmDef> = {
  "intent-cascade-zh": makeFilm("intent-cascade", "zh", INTENT_STILLS),
  "intent-cascade-en": makeFilm("intent-cascade", "en", INTENT_STILLS),
  "dropdown-taxonomy-zh": makeFilm("dropdown-taxonomy", "zh", DROPDOWN_STILLS),
  "dropdown-taxonomy-en": makeFilm("dropdown-taxonomy", "en", DROPDOWN_STILLS),
};

export const COMP_IDS = Object.keys(FILMS) as CompId[];

export function lineOf(filmId: FilmId, locale: Locale, sceneId: string): string {
  const lines = narration.films[filmId][locale];
  return lines.find((line) => line.id === sceneId)?.text ?? "";
}
