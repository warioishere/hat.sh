const words = [
  "alpha", "amber", "angel", "arrow", "atlas", "azure",
  "badge", "beach", "blade", "blaze", "bloom", "board", "brave", "brick", "brook",
  "candy", "cedar", "chase", "chess", "cliff", "cloud", "cobra", "coral", "crane", "crown", "crush", "cyber",
  "dance", "delta", "diary", "dodge", "dream", "drift", "droid",
  "eagle", "earth", "ember", "epoch", "equal",
  "fable", "fairy", "fence", "flame", "flash", "fleet", "flint", "float", "forge", "frost", "frost",
  "gamma", "ghost", "giant", "glass", "globe", "grace", "grain", "grape", "grove", "guard",
  "haven", "heart", "helix", "heron", "honey", "horse", "hyper",
  "ivory",
  "jewel", "joker", "juice", "jumbo",
  "karma", "kayak", "kiwi", "knack", "knight",
  "lance", "laser", "lemon", "light", "lilac", "lotus", "lunar", "lyric",
  "magic", "manor", "maple", "marsh", "medal", "melon", "metal", "micro", "might", "mimic", "mocha", "money", "moose", "mount", "mystic",
  "noble", "north", "novel", "nurse",
  "oasis", "ocean", "olive", "omega", "onion", "opera", "orbit", "otter",
  "panda", "patch", "pearl", "penny", "phase", "piano", "pilot", "pixel", "plaza", "plumb", "polar", "power", "prism", "proud", "pulse", "pupil",
  "quake", "queen", "quest", "quick", "quota",
  "radar", "raven", "rebel", "ridge", "river", "robin", "robot", "rocky", "royal", "ruby",
  "saint", "scale", "scout", "shade", "shark", "shell", "shine", "sigma", "silk", "solar", "sonic", "spark", "spear", "spike", "spine", "spirit", "squad", "stage", "stamp", "stark", "steam", "steel", "stone", "storm", "sugar", "surge", "swift", "sword",
  "table", "tiger", "titan", "toast", "topaz", "torch", "tower", "trail", "train", "trout", "tulip", "thorn",
  "ultra", "umbra", "unity", "urban",
  "valor", "vault", "venus", "vigor", "viola", "viper", "vivid", "voice", "vortex",
  "watch", "whale", "wheat", "wheel", "wings", "witch", "wizard", "world",
  "xenon",
  "yacht", "youth",
  "zebra", "zippy", "zodiac"
];

function generateRoomCode() {
  const picked = [];
  for (let i = 0; i < 3; i++) {
    picked.push(words[Math.floor(Math.random() * words.length)]);
  }
  return picked.join("-");
}

module.exports = { generateRoomCode };
