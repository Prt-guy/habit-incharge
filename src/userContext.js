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
    "I am a troubled 21 year old individual who ha lost his identity to a relationship. the relationship is great but i want to be more than that. I want to build habits.",

  /**
   * What you're actually chasing. Be concrete — deadlines, numbers, names.
   * These drive what tasks you get.
   */
  goals: [
    "I want to make a routine which i do everyday that consist of healthy habits.",
    "I do home workouts, the push pull leg split with no equipments just bodyweight stuff 6 times a week. monday - push, tuesday - pull, wednesday - leg and repeat. and sunday is the rest day.",
    "i am trying to read meditations by marcus aurellius. i want to built a habit to read everyday",
    "I am learning deployement from a 5.5 hours long video. a little bit everyday, i also dont wanna be limited to that, i want also learn something new with it. like i dont know backend very well i wanna learn it.",
    "i want to start waking up early, like 6am or 6.30am. and also get to bed early. basically i want to build healthy sleeping schedule",
    "i work at dseu university as a front end develepor, my working hours are 9.30-5.30 and it takes 45 minutes for me to reach the office from home and vice versa.  working days are monday to friday",
    "i am also in a relationship with a beatiful girlfriend and lately i have been upsetting her alot so i want to do stuff for her here and there. not everyday, just something once or twice a week to get back on track. i dont live with her btw, we are still with our parents.",
    "i also want to focus on myself, i want to journal everyday so that i dont feel overwhelmed with stuff that is inside.",
    "i also wanna make a instagram page where i would post something i learnt regularly, like a quote or a new thing about life etc. Wont show my face but will learn it.",
  ],

  /**
   * What you do with free time, and what you actually enjoy. This is the raw
   * material for your rewards — the AI builds them out of this, so the more you
   * put here, the better they get.
   */
  iLike: [
    "I like to watch youtube video, self help videos, space facts, gaming streams, football videos, gaming videos and other cool stuff",
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

/**
 * The AI decides how many tasks to hand you each morning — a light day to
 * rebuild momentum after a slip, a fuller one when you've got room. TARGET is
 * just the number it aims for; MIN/MAX are the hard limits it can't cross.
 */
export const TARGET_TASKS = 5;
export const MIN_TASKS = 3;
export const MAX_TASKS = 7;

/**
 * A day counts as DONE when you finish this FRACTION of that day's tasks.
 * A ratio (not a fixed count) keeps the bar fair no matter how many tasks the
 * AI assigned — 60% of 3 is 2, 60% of 6 is 4. This is what the streak and the
 * guilt are built on.
 */
export const DAY_SUCCESS_RATIO = 0.6;

/** How many tasks must be finished for a day of `total` tasks to count. */
export function dayThreshold(total) {
  return Math.max(1, Math.ceil((total || 0) * DAY_SUCCESS_RATIO));
}
