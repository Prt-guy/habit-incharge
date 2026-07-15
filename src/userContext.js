/**
 * ============================================================================
 *  THIS IS THE FILE YOU EDIT.
 * ============================================================================
 *
 * Everything here is fed to the AI every single day. It is how it knows who you
 * are, what you're chasing, what you'd enjoy as a reward, and how hard to push.
 *
 * Be specific. "Get fit" produces generic tasks. "Run 5k under 25min by March,
 * currently at 28min" produces a task worth doing. The more concrete you are,
 * the less generic the tasks and the more the rewards will actually land.
 *
 * Edit, save, reload. Tomorrow's tasks will reflect it.
 */

export const ME = {
  name: "Abhishek",

  /** One line. Who are you right now, honestly? */
  whoIAm:
    "I am a troubled individual who ha lost his identity to a relationship. the relationship is great but i want to be more than that. I want to build habits.",

  /**
   * What you're actually chasing. Be concrete — deadlines, numbers, names.
   * These drive what tasks you get.
   */
  goals: [
    "Ship a real side project I'm not embarrassed to show people",
    "Get consistent at the gym — 4x a week, not 4x a month",
    "Read more books, scroll less",
    "Get genuinely good at system design",
  ],

  /**
   * What you do with free time, and what you actually enjoy. This is the raw
   * material for your rewards — the AI builds them out of this, so the more you
   * put here, the better they get.
   */
  iLike: [
    "Anime (Vinland Saga, Frieren, Steins;Gate)",
    "Minecraft — especially medieval builds",
    "Football, Real Madrid",
    "Lo-fi and phonk while coding",
    "Sci-fi books and films",
    "Good coffee",
  ],

  /**
   * Where you actually lose. The AI uses this to design tasks that route
   * around your failure modes, and to know what to call you out on.
   */
  iStruggleWith: [
    "Starting. Once I'm 10 minutes in I'm fine.",
    "Doomscrolling in bed instead of sleeping",
    "Going too hard for 3 days then quitting for 2 weeks",
  ],

  /** Roughly how your day is shaped. Keeps tasks realistic. */
  myDay: "Free mornings, college/work most afternoons, evenings usually open.",

  /**
   * How hard should the AI be on you when you slip?
   *   "gentle"  — kind, never shames you
   *   "honest"  — direct, tells you the truth plainly
   *   "brutal"  — leans into guilt, doesn't let you off the hook
   */
  tone: "honest",
};

/** How many tasks the AI hands you each morning. */
export const TASKS_PER_DAY = 5;

/**
 * How many of the day's tasks you must finish for the day to count as DONE.
 * Anything less and the day is logged as MISSED — that's what the streak and
 * the guilt are built on. Set it somewhere you'd actually respect.
 */
export const DAY_SUCCESS_THRESHOLD = 3;
