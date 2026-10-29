import { hashPassword } from "@/lib/password"
import type { Battle, Comment, Discussion, Profile, Store } from "@/lib/types"

export const DEMO_PASSWORD = "local-beta-pass"

const mira = "u_mira"
const arjun = "u_arjun"
const leela = "u_leela"
const karthik = "u_karthik"

function profile(input: Omit<Profile, "passwordHash" | "notifyReplies" | "notifyChallenges" | "updatedAt"> & { password: string }): Profile {
  return {
    id: input.id,
    email: input.email,
    passwordHash: hashPassword(input.password),
    username: input.username,
    displayName: input.displayName,
    bio: input.bio,
    avatarColor: input.avatarColor,
    industries: input.industries,
    role: input.role,
    status: input.status,
    notifyReplies: true,
    notifyChallenges: false,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  }
}

export function buildSeed(): Store {
  const profiles = [
    profile({
      id: mira,
      email: "mira@crazyfans.local",
      password: DEMO_PASSWORD,
      username: "mira",
      displayName: "Mira Rao",
      bio: "Watches Telugu and Hindi first. Here for arguments that survive the interval.",
      avatarColor: "#e2b15a",
      industries: ["telugu", "hindi"],
      role: "admin",
      status: "active",
      createdAt: "2026-10-01T08:00:00.000Z",
    }),
    profile({
      id: arjun,
      email: "arjun@crazyfans.local",
      password: DEMO_PASSWORD,
      username: "arjun",
      displayName: "Arjun Dev",
      bio: "Tamil and Telugu. I will defend a mass scene if it earns the whistle.",
      avatarColor: "#c43228",
      industries: ["tamil", "telugu"],
      role: "member",
      status: "active",
      createdAt: "2026-10-01T09:30:00.000Z",
    }),
    profile({
      id: leela,
      email: "leela@crazyfans.local",
      password: DEMO_PASSWORD,
      username: "leela",
      displayName: "Leela Nair",
      bio: "Malayalam and Tamil. I like films that trust a quiet room.",
      avatarColor: "#2f9d8a",
      industries: ["malayalam", "tamil"],
      role: "member",
      status: "active",
      createdAt: "2026-10-05T11:00:00.000Z",
    }),
    profile({
      id: karthik,
      email: "karthik@crazyfans.local",
      password: DEMO_PASSWORD,
      username: "karthik",
      displayName: "Karthik Shetty",
      bio: "Kannada and Hindi. I stay for debuts, songs, and last scenes.",
      avatarColor: "#d4763a",
      industries: ["kannada", "hindi"],
      role: "member",
      status: "active",
      createdAt: "2026-10-24T14:00:00.000Z",
    }),
  ]

  const discussions: Discussion[] = [
    {
      id: "d_mass",
      authorId: arjun,
      slug: "mass-cheer-earned-or-announced",
      title: "Mass cheer: earned or announced?",
      body: "A theatre can be loud before the scene has done anything. I love that energy, and I also leave annoyed when a film demands a cheer it has not earned. A star walking into frame is a greeting, not automatically a moment.\n\nWhere is your line? Tell us about a scene that earned the noise, and one that borrowed it.",
      industry: "telugu",
      category: "performances",
      status: "visible",
      createdAt: "2026-10-26T10:00:00.000Z",
      updatedAt: "2026-10-26T10:00:00.000Z",
    },
    {
      id: "d_silence",
      authorId: leela,
      slug: "directors-who-trust-silence",
      title: "Directors who trust silence",
      body: "Some of the films I return to are the ones that let a room stay quiet. No score telling me what to feel. No punchline rescuing the pause.\n\nWhich Indian films taught you to sit inside a silence, and which silences just felt unfinished?",
      industry: "malayalam",
      category: "directors",
      status: "visible",
      createdAt: "2026-10-26T15:20:00.000Z",
      updatedAt: "2026-10-26T15:20:00.000Z",
    },
    {
      id: "d_remake",
      authorId: mira,
      slug: "remakes-what-must-change",
      title: "Remakes: what must change, and what must stay",
      body: "A remake that copies every beat is a cover version. A remake that throws the original away is a different film wearing a famous name.\n\nIf you had to keep one thing and change one thing, what are they? Be specific: the city, the ending, the moral, the joke.",
      industry: "all",
      category: "movies",
      status: "visible",
      createdAt: "2026-10-27T06:40:00.000Z",
      updatedAt: "2026-10-27T06:40:00.000Z",
    },
    {
      id: "d_comedy",
      authorId: leela,
      slug: "comedy-that-punches-up",
      title: "Comedy that does not need a weaker target",
      body: "The scenes I still quote let a proud person trip on their own pride. They do not need someone smaller as the joke.\n\nBring a scene that made a hall laugh without making you wince afterwards. If you cannot think of one, say what you are tired of.",
      industry: "tamil",
      category: "performances",
      status: "visible",
      createdAt: "2026-10-27T12:10:00.000Z",
      updatedAt: "2026-10-27T12:10:00.000Z",
    },
    {
      id: "d_interval",
      authorId: mira,
      slug: "the-interval-as-a-contract",
      title: "The interval as a contract",
      body: "I treat the interval card as a promise. The film has told me what kind of second half it owes me. When that promise breaks, I feel cheated even if the ending is neat.\n\nWhat is an interval that made you stay in your seat a second longer, and one that made you check the time?",
      industry: "all",
      category: "movies",
      status: "visible",
      createdAt: "2026-10-28T04:30:00.000Z",
      updatedAt: "2026-10-28T04:30:00.000Z",
    },
    {
      id: "d_songs",
      authorId: karthik,
      slug: "songs-that-tell-the-plot",
      title: "Songs that tell the plot",
      body: "I am not asking whether songs are good. I am asking whether the film still makes sense if you skip them. Some songs are the plot. Some are a pause.\n\nName one song you cannot remove without breaking the story, and one the film would be sharper without.",
      industry: "kannada",
      category: "music",
      status: "visible",
      createdAt: "2026-10-28T09:15:00.000Z",
      updatedAt: "2026-10-28T09:15:00.000Z",
    },
    {
      id: "d_villain",
      authorId: arjun,
      slug: "villains-who-think-they-are-the-hero",
      title: "Villains who think they are the hero",
      body: "The antagonist I remember is rarely the loudest. It is the one who could narrate the film from their side and still sound reasonable, right up until they are not.\n\nWho does that well in the industries you watch, and who is only stylish?",
      industry: "tamil",
      category: "villains",
      status: "visible",
      createdAt: "2026-10-29T02:00:00.000Z",
      updatedAt: "2026-10-29T02:00:00.000Z",
    },
    {
      id: "d_rewatch",
      authorId: karthik,
      slug: "opening-day-versus-the-rewatch",
      title: "Opening day versus the rewatch",
      body: "A film can win the weekend and lose the month. I care more about the film I put on again on a tired Sunday than the one I clapped for once.\n\nWhat is a film you defended on day one that you no longer do, and one you dismissed that you now keep?",
      industry: "hindi",
      category: "movies",
      status: "visible",
      createdAt: "2026-10-29T07:45:00.000Z",
      updatedAt: "2026-10-29T07:45:00.000Z",
    },
  ]

  const comments: Comment[] = [
    comment("c1", arjun, "d_mass", null, "The whistle I trust is the one that arrives late. If the hall is loud before the scene starts, that is affection for the star. It is not yet the scene.", "2026-10-26T11:00:00.000Z"),
    comment("c2", leela, "d_mass", null, "I want the cheer, but I want to feel the film ask for it. A walk-on is a greeting. A scene has to change something.", "2026-10-26T13:10:00.000Z"),
    comment("c3", karthik, "d_mass", null, "Some films earned the noise for me on a second watch, not the first. The first time I was just in the blast radius.", "2026-10-26T18:40:00.000Z"),
    comment("c4", mira, "d_silence", null, "There is a difference between silence and a scene that has not decided what it is. The good ones are full. The empty ones are just quiet.", "2026-10-26T16:30:00.000Z"),
    comment("c5", karthik, "d_silence", null, "A last scene with no score still rings if the film spent two hours loading it. Otherwise it is just the lights coming up.", "2026-10-27T01:15:00.000Z"),
    comment("c6", arjun, "d_interval", null, "A good interval makes me turn to the person next to me before I stand up. If I only stand up, the film has not hooked me.", "2026-10-28T06:00:00.000Z"),
    comment("c7", leela, "d_interval", null, "I stay when the interval changes what I thought the film was about. I check the time when it only raises the volume.", "2026-10-28T08:20:00.000Z"),
    comment("c8", mira, "d_songs", null, "If the song is where a character admits something they will not say in dialogue, skipping it is skipping the plot. A montage of longing can often go.", "2026-10-28T11:05:00.000Z"),
    comment("c9", leela, "d_comedy", null, "The laugh I trust is embarrassment, not humiliation. A proud person slipping is comedy. A softer person being the punchline is a habit we can retire.", "2026-10-27T14:45:00.000Z"),
    comment("c10", mira, "d_villain", null, "Give me the antagonist who could win a fair argument in the first half. If they are only a costume, the hero's win is cheap.", "2026-10-29T04:10:00.000Z"),
  ]

  const battles: Battle[] = [
    battle("b_erupt", mira, "what-makes-a-theatre-erupt", "What makes a theatre erupt?", "Forget the trailer. When you are in the hall, which moment is the one people talk about on the way out?", "all", "movies", true, "2026-10-27T05:00:00.000Z"),
    battle("b_villain", arjun, "the-better-kind-of-villain", "The better kind of villain", "Not the loudest. The one you are still arguing about after the film.", "all", "villains", false, "2026-10-27T09:00:00.000Z"),
    battle("b_song", karthik, "what-should-a-song-do", "What should a song do?", "Keep it to the job of the song, not whether you like the voice.", "all", "music", false, "2026-10-28T03:00:00.000Z"),
    battle("b_entry", arjun, "what-makes-a-hero-entry-land", "What makes a hero entry land?", "Telugu halls have a vocabulary for this. Which move still works on you?", "telugu", "performances", false, "2026-10-28T07:30:00.000Z"),
    battle("b_interval", leela, "the-interval-you-trust", "The interval you trust", "The card comes up. What do you want it to have done?", "tamil", "movies", false, "2026-10-28T12:00:00.000Z"),
    battle("b_credits", mira, "after-the-credits-what-stays", "After the credits, what stays?", "Hindi or otherwise. One thing is allowed to follow you home.", "hindi", "endings", false, "2026-10-29T03:20:00.000Z"),
    battle("b_family", leela, "what-a-family-drama-needs-more-of", "What should a family drama have more of?", "Not louder relatives. A specific kind of scene.", "malayalam", "movies", false, "2026-10-29T06:10:00.000Z"),
    battle("b_debut", karthik, "what-sells-you-on-a-debut", "What sells you on a debut?", "A first film has limited time to prove the person behind it.", "kannada", "directors", false, "2026-10-29T08:40:00.000Z"),
  ]

  const options = [
    option("o_erupt_1", "b_erupt", "A hero entry the crowd already expects", 0),
    option("o_erupt_2", "b_erupt", "An interval twist that rewrites the film", 1),
    option("o_erupt_3", "b_erupt", "A climax callback to an earlier scene", 2),
    option("o_erupt_4", "b_erupt", "A song the audience owns before the chorus", 3),
    option("o_villain_1", "b_villain", "They believe they are right", 0),
    option("o_villain_2", "b_villain", "They are one step ahead", 1),
    option("o_villain_3", "b_villain", "They enjoy the chaos", 2),
    option("o_villain_4", "b_villain", "They are tragic, and the film knows it", 3),
    option("o_song_1", "b_song", "Stop the plot and hold a feeling", 0),
    option("o_song_2", "b_song", "Carry a secret the dialogue will not say", 1),
    option("o_song_3", "b_song", "Introduce someone before they speak", 2),
    option("o_song_4", "b_song", "I came for the story, not the album", 3),
    option("o_entry_1", "b_entry", "Silence, then the beat", 0),
    option("o_entry_2", "b_entry", "A line the crowd finishes", 1),
    option("o_entry_3", "b_entry", "The rival's face before the hero's", 2),
    option("o_entry_4", "b_entry", "The camera finding them last", 3),
    option("o_interval_1", "b_interval", "A reveal", 0),
    option("o_interval_2", "b_interval", "A promise", 1),
    option("o_interval_3", "b_interval", "A loss", 2),
    option("o_interval_4", "b_interval", "A joke that turns serious", 3),
    option("o_credits_1", "b_credits", "A line", 0),
    option("o_credits_2", "b_credits", "A face", 1),
    option("o_credits_3", "b_credits", "A song", 2),
    option("o_credits_4", "b_credits", "A question the film refuses to answer", 3),
    option("o_family_1", "b_family", "Awkward honesty", 0),
    option("o_family_2", "b_family", "Quiet kindness", 1),
    option("o_family_3", "b_family", "A fight that clears the air", 2),
    option("o_family_4", "b_family", "A meal that does the talking", 3),
    option("o_debut_1", "b_debut", "A world you can smell", 0),
    option("o_debut_2", "b_debut", "A character you want to argue with", 1),
    option("o_debut_3", "b_debut", "A structure that surprises you", 2),
    option("o_debut_4", "b_debut", "A last scene you replay", 3),
  ]

  const store: Store = {
    version: 1,
    profiles,
    discussions,
    comments,
    battles,
    battleOptions: options,
    votes: [],
    reactions: [
      { id: "r1", userId: mira, targetType: "discussion", targetId: "d_mass", createdAt: "2026-10-26T19:00:00.000Z" },
      { id: "r2", userId: leela, targetType: "discussion", targetId: "d_mass", createdAt: "2026-10-26T19:10:00.000Z" },
      { id: "r3", userId: arjun, targetType: "discussion", targetId: "d_silence", createdAt: "2026-10-26T20:00:00.000Z" },
      { id: "r4", userId: karthik, targetType: "discussion", targetId: "d_songs", createdAt: "2026-10-28T12:00:00.000Z" },
      { id: "r5", userId: mira, targetType: "comment", targetId: "c6", createdAt: "2026-10-28T07:00:00.000Z" },
    ],
    reports: [],
    moderationActions: [],
    notifications: [
      {
        id: "n1",
        userId: mira,
        actorId: arjun,
        kind: "reply",
        targetType: "discussion",
        targetSlug: "the-interval-as-a-contract",
        excerpt: "A good interval makes me turn to the person next to me before I stand up.",
        read: false,
        createdAt: "2026-10-28T06:00:00.000Z",
      },
    ],
    blocks: [],
    events: [
      event("e1", "signup", mira, "2026-10-01T08:00:00.000Z"),
      event("e2", "signup", arjun, "2026-10-01T09:30:00.000Z"),
      event("e3", "signup", leela, "2026-10-05T11:00:00.000Z"),
      event("e4", "signup", karthik, "2026-10-24T14:00:00.000Z"),
      event("e5", "active", mira, "2026-10-08T08:00:00.000Z"),
      event("e6", "active", arjun, "2026-10-08T09:00:00.000Z"),
      event("e7", "active", leela, "2026-10-06T11:00:00.000Z"),
      event("e8", "active", mira, "2026-10-28T05:00:00.000Z"),
      event("e9", "active", arjun, "2026-10-27T09:00:00.000Z"),
      event("e10", "active", karthik, "2026-10-28T09:00:00.000Z"),
      event("e11", "discussion", arjun, "2026-10-26T10:00:00.000Z"),
      event("e12", "comment", leela, "2026-10-26T13:10:00.000Z"),
      event("e13", "vote", mira, "2026-10-27T05:10:00.000Z"),
    ],
    rateBuckets: [],
  }

  vote(store, "b_erupt", "o_erupt_4", mira, "2026-10-27T05:10:00.000Z")
  vote(store, "b_erupt", "o_erupt_1", arjun, "2026-10-27T06:00:00.000Z")
  vote(store, "b_erupt", "o_erupt_3", leela, "2026-10-27T08:00:00.000Z")
  vote(store, "b_erupt", "o_erupt_4", karthik, "2026-10-28T10:00:00.000Z")
  vote(store, "b_villain", "o_villain_1", mira, "2026-10-27T09:30:00.000Z")
  vote(store, "b_villain", "o_villain_4", leela, "2026-10-27T11:00:00.000Z")
  vote(store, "b_song", "o_song_2", karthik, "2026-10-28T04:00:00.000Z")
  vote(store, "b_song", "o_song_2", mira, "2026-10-28T05:30:00.000Z")
  vote(store, "b_entry", "o_entry_1", arjun, "2026-10-28T08:00:00.000Z")
  vote(store, "b_interval", "o_interval_2", leela, "2026-10-28T12:20:00.000Z")
  vote(store, "b_credits", "o_credits_4", mira, "2026-10-29T03:40:00.000Z")
  vote(store, "b_family", "o_family_1", leela, "2026-10-29T06:30:00.000Z")
  vote(store, "b_debut", "o_debut_4", karthik, "2026-10-29T09:00:00.000Z")

  return store
}

function comment(
  id: string,
  authorId: string,
  discussionId: string | null,
  battleId: string | null,
  body: string,
  createdAt: string,
): Comment {
  return { id, authorId, discussionId, battleId, body, status: "visible", createdAt, updatedAt: createdAt }
}

function battle(
  id: string,
  authorId: string,
  slug: string,
  title: string,
  prompt: string,
  industry: Battle["industry"],
  category: Battle["category"],
  featured: boolean,
  createdAt: string,
): Battle {
  return {
    id,
    authorId,
    slug,
    title,
    prompt,
    industry,
    category,
    featured,
    status: "visible",
    createdAt,
    closesAt: null,
  }
}

function option(id: string, battleId: string, label: string, position: number) {
  return { id, battleId, label, position }
}

function vote(store: Store, battleId: string, optionId: string, userId: string, at: string) {
  store.votes.push({ id: `v_${battleId}_${userId}`, battleId, optionId, userId, createdAt: at, updatedAt: at })
}

function event(id: string, type: Store["events"][number]["type"], userId: string, createdAt: string) {
  return { id, type, userId, createdAt }
}
