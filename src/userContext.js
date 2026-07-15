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
    "I want to make a routine which i do everyday that consist of healthy habits.",
    "I do home workouts, the push pull leg split with no equipments just bodyweight stuff 6 times a week",
    "i am trying to read meditations by marcus aurellius. i want to built a habit to read everyday",
    "I am learning deployement from a 5.5 hours long video. a little bit everyday",
    "i want to start waking up early, like 6am or 6.30am. and also get to bed early. basically i want to build healthy sleeping schedule",
    "i work at dseu university as a front end develepor, my working hours are 9.30-5.30 and it takes 45 minutes for me to reach the office from home and vice versa.  workind days are monday to friday",
    "i am also in a relationship with a beatuful girlfriend and lately i have been upsetting her alot so i want to do stuff for her here and there. not everyday, just something once or twice a week to get back on track",
    "i also want to focus on myself, i want to journal everyday so that i dont feel overwhelmed with stuff that is inside.",
  ],

  /**
   * What you do with free time, and what you actually enjoy. This is the raw
   * material for your rewards — the AI builds them out of this, so the more you
   * put here, the better they get.
   */
  iLike: [
    "I like to watch youtube video, kingwoolsgames, football videos, gaming videos and other cool stuff",
    "I dont game regularly but i want to, cant find a time for it, i want to batman arkham games from start to end.",
    "i'd like to go outside for a 30 mins walk with bhanu or nikhil( my friends) or sometimes alone when they are not free",
    "watching a good movie once a week, mostly on saturdays and sundays, other days, i'd be working",
    "eat something good, maggi, egg omlette, snacks and stuff",
    "watching reels, not for long but a few minutes are fine",
  ],

  /**
   * Where you actually lose. The AI uses this to design tasks that route
   * around your failure modes, and to know what to call you out on.
   */
  iStruggleWith: [
    "Lost myself to a relationshup. trying to rebuild my routine as well as myself. she is still with me but i have to have a routine so i dont feel empty when she is not around.",
    "delaying sleep",
    "Going too hard for 3 days then quitting for 2 weeks",
  ],

  /** Roughly how your day is shaped. Keeps tasks realistic. */
  myDay:
    "Early mornings. 9.30-5.30pm work. saturdays and sundays off. a cute girlfriend. two friends to hangout with.",

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
