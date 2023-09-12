const botEmojis = {
  chinoSidadge: "1151088913507680306",
  monkU: "1151089524726829067",
  uuh: "1151090521603833876",
  AYAYAgasm: "1151091265870504017"
};

export const getEmoji = (name) => {
  return name in botEmojis ? `<:${name}:${botEmojis[name]}>` : "";
};

export const getEmojiURL = (name) => {
  return name in botEmojis ? `https://cdn.discordapp.com/emojis/${botEmojis[name]}.webp` : "";
};

const summonerspells = {
  flash: "<:SFlash:1112207800303620107>",
  heal: "<:SHeal:1112207882809770015>",
  barrier: "<:SBarrier:1112207835523198977>",
  cleanse: "<:SCleanse:1112207847237885982>",
  ignite: "<:SIgnite:1112207858302455929>",
  exhaust: "<:SExhaust:1112207868159078494>",
  ghost: "<:SGhost:1112207818796322967>",
  clarity: "<:SClarity:1112207893626896394>",
  smite: "<:SSmite:1112207904313978951>",
  teleport: "<:STeleport:1112207924215959593>",
  mark: "<:SMark:1112207914644541551>",
  flee: "<:SFlee:1142815344642244688>"
};

const leagueEmblems = {
  iron: "<:Hierro:1112623006087381012>",
  bronce: "<:Bronce:1112621315434754108>",
  silver: "<:Plata:1112621329464688743>",
  gold: "<:Oro:1112621322430857226>",
  platinum: "<:Platino:1143114676566233189>",
  emerald: "<:Esmeralda:1143115170097397801>",
  diamond: "<:Diamante:1112621319754874951>",
  master: "<:Maestro:1112621326289600522>",
  grandmaster: "<:GranMaestro:1112621323789807677>",
  challenger: "<:Retador:1112621316818862100>"
};

export const getLolSpell = (number) => {
  switch (number) {
  case 1:
    return summonerspells.cleanse;
  case 3:
    return summonerspells.exhaust;
  case 4:
    return summonerspells.flash;
  case 6:
    return summonerspells.ghost;
  case 7:
    return summonerspells.heal;
  case 11:
    return summonerspells.smite;
  case 12:
    return summonerspells.teleport;
  case 13:
    return summonerspells.clarity;
  case 14:
    return summonerspells.ignite;
  case 21:
    return summonerspells.barrier;
  case 32:
    return summonerspells.mark;
  case 2202:
    return summonerspells.flash;
  case 2201:
    return summonerspells.flee;
  default:
    return "";
  }
};

export const getLeagueEmblem = (league) => {
  switch (league) {
  case "HIERRO":
    return leagueEmblems.iron;
  case "BRONCE":
    return leagueEmblems.bronce;
  case "PLATA":
    return leagueEmblems.silver;
  case "ORO":
    return leagueEmblems.gold;
  case "PLATINO":
    return leagueEmblems.platinum;
  case "ESMERALDA":
    return leagueEmblems.emerald;
  case "DIAMANTE":
    return leagueEmblems.diamond;
  case "MAESTRO":
    return leagueEmblems.master;
  case "GRAN MAESTRO":
    return leagueEmblems.grandmaster;
  case "RETADOR":
    return leagueEmblems.challenger;
  default:
    return "";
  }
};

const socials = {
  instagram: "<:instagram:1121001080470372422>",
  tiktok: "<:tiktok:1121003232345473065>",
  /* twitter: "<:twitter:1120999580167852094>", */
  facebook: "<:facebook:1135326667158585434>",
  twitter: "<:xcom:1135473765443186708>",
  youtube: "<:youtube:1140938633369628703>"
};

export const getSocial = (name) => {
  const key = name.toLowerCase();
  return key in socials ? socials[key] : "";
};