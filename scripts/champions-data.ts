// ─── Shared Champions Data ─────────────────────────────────────────────────
// Extracted from seed.ts. Used by scraping scripts, sync script, and seed.ts.

// Static list of all champion Pokemon. formName uses DB values; null = base form.
export const CHAMPION_POKEMON: Array<{
	dexNumber: number;
	formName: string | null;
}> = [
	{ dexNumber: 3, formName: null }, // Venusaur
	{ dexNumber: 6, formName: null }, // Charizard
	{ dexNumber: 9, formName: null }, // Blastoise
	{ dexNumber: 15, formName: null }, // Beedrill
	{ dexNumber: 18, formName: null }, // Pidgeot
	{ dexNumber: 24, formName: null }, // Arbok
	{ dexNumber: 25, formName: null }, // Pikachu
	{ dexNumber: 26, formName: null }, // Raichu
	{ dexNumber: 26, formName: "alola" }, // Raichu (Alolan)
	{ dexNumber: 36, formName: null }, // Clefable
	{ dexNumber: 38, formName: null }, // Ninetales
	{ dexNumber: 38, formName: "alola" }, // Ninetales (Alolan)
	{ dexNumber: 59, formName: null }, // Arcanine
	{ dexNumber: 59, formName: "hisui" }, // Arcanine (Hisuian)
	{ dexNumber: 65, formName: null }, // Alakazam
	{ dexNumber: 68, formName: null }, // Machamp
	{ dexNumber: 71, formName: null }, // Victreebel
	{ dexNumber: 80, formName: null }, // Slowbro
	{ dexNumber: 80, formName: "galar" }, // Slowbro (Galarian)
	{ dexNumber: 94, formName: null }, // Gengar
	{ dexNumber: 115, formName: null }, // Kangaskhan
	{ dexNumber: 121, formName: null }, // Starmie
	{ dexNumber: 127, formName: null }, // Pinsir
	{ dexNumber: 128, formName: null }, // Tauros
	{ dexNumber: 128, formName: "paldea-aqua-breed" }, // Tauros (Paldea Aqua)
	{ dexNumber: 128, formName: "paldea-blaze-breed" }, // Tauros (Paldea Blaze)
	{ dexNumber: 128, formName: "paldea-combat-breed" }, // Tauros (Paldea Combat)
	{ dexNumber: 130, formName: null }, // Gyarados
	{ dexNumber: 132, formName: null }, // Ditto
	{ dexNumber: 134, formName: null }, // Vaporeon
	{ dexNumber: 135, formName: null }, // Jolteon
	{ dexNumber: 136, formName: null }, // Flareon
	{ dexNumber: 142, formName: null }, // Aerodactyl
	{ dexNumber: 143, formName: null }, // Snorlax
	{ dexNumber: 149, formName: null }, // Dragonite
	{ dexNumber: 154, formName: null }, // Meganium
	{ dexNumber: 157, formName: null }, // Typhlosion
	{ dexNumber: 157, formName: "hisui" }, // Typhlosion (Hisuian)
	{ dexNumber: 160, formName: null }, // Feraligatr
	{ dexNumber: 168, formName: null }, // Ariados
	{ dexNumber: 181, formName: null }, // Ampharos
	{ dexNumber: 184, formName: null }, // Azumarill
	{ dexNumber: 186, formName: null }, // Politoed
	{ dexNumber: 196, formName: null }, // Espeon
	{ dexNumber: 197, formName: null }, // Umbreon
	{ dexNumber: 199, formName: null }, // Slowking
	{ dexNumber: 199, formName: "galar" }, // Slowking (Galarian)
	{ dexNumber: 205, formName: null }, // Forretress
	{ dexNumber: 208, formName: null }, // Steelix
	{ dexNumber: 212, formName: null }, // Scizor
	{ dexNumber: 214, formName: null }, // Heracross
	{ dexNumber: 227, formName: null }, // Skarmory
	{ dexNumber: 229, formName: null }, // Houndoom
	{ dexNumber: 248, formName: null }, // Tyranitar
	{ dexNumber: 279, formName: null }, // Pelipper
	{ dexNumber: 282, formName: null }, // Gardevoir
	{ dexNumber: 302, formName: null }, // Sableye
	{ dexNumber: 306, formName: null }, // Aggron
	{ dexNumber: 308, formName: null }, // Medicham
	{ dexNumber: 310, formName: null }, // Manectric
	{ dexNumber: 319, formName: null }, // Sharpedo
	{ dexNumber: 323, formName: null }, // Camerupt
	{ dexNumber: 324, formName: null }, // Torkoal
	{ dexNumber: 334, formName: null }, // Altaria
	{ dexNumber: 350, formName: null }, // Milotic
	{ dexNumber: 351, formName: null }, // Castform
	{ dexNumber: 354, formName: null }, // Banette
	{ dexNumber: 358, formName: null }, // Chimecho
	{ dexNumber: 359, formName: null }, // Absol
	{ dexNumber: 362, formName: null }, // Glalie
	{ dexNumber: 389, formName: null }, // Torterra
	{ dexNumber: 392, formName: null }, // Infernape
	{ dexNumber: 395, formName: null }, // Empoleon
	{ dexNumber: 405, formName: null }, // Luxray
	{ dexNumber: 407, formName: null }, // Roserade
	{ dexNumber: 409, formName: null }, // Rampardos
	{ dexNumber: 411, formName: null }, // Bastiodon
	{ dexNumber: 428, formName: null }, // Lopunny
	{ dexNumber: 442, formName: null }, // Spiritomb
	{ dexNumber: 445, formName: null }, // Garchomp
	{ dexNumber: 448, formName: null }, // Lucario
	{ dexNumber: 450, formName: null }, // Hippowdon
	{ dexNumber: 454, formName: null }, // Toxicroak
	{ dexNumber: 460, formName: null }, // Abomasnow
	{ dexNumber: 461, formName: null }, // Weavile
	{ dexNumber: 464, formName: null }, // Rhyperior
	{ dexNumber: 470, formName: null }, // Leafeon
	{ dexNumber: 471, formName: null }, // Glaceon
	{ dexNumber: 472, formName: null }, // Gliscor
	{ dexNumber: 473, formName: null }, // Mamoswine
	{ dexNumber: 475, formName: null }, // Gallade
	{ dexNumber: 478, formName: null }, // Froslass
	{ dexNumber: 479, formName: null }, // Rotom
	{ dexNumber: 479, formName: "heat" }, // Rotom (Heat)
	{ dexNumber: 479, formName: "wash" }, // Rotom (Wash)
	{ dexNumber: 479, formName: "frost" }, // Rotom (Frost)
	{ dexNumber: 479, formName: "fan" }, // Rotom (Fan)
	{ dexNumber: 479, formName: "mow" }, // Rotom (Mow)
	{ dexNumber: 497, formName: null }, // Serperior
	{ dexNumber: 500, formName: null }, // Emboar
	{ dexNumber: 503, formName: null }, // Samurott
	{ dexNumber: 503, formName: "hisui" }, // Samurott (Hisuian)
	{ dexNumber: 505, formName: null }, // Watchog
	{ dexNumber: 510, formName: null }, // Liepard
	{ dexNumber: 512, formName: null }, // Simisage
	{ dexNumber: 514, formName: null }, // Simisear
	{ dexNumber: 516, formName: null }, // Simipour
	{ dexNumber: 530, formName: null }, // Excadrill
	{ dexNumber: 531, formName: null }, // Audino
	{ dexNumber: 534, formName: null }, // Conkeldurr
	{ dexNumber: 547, formName: null }, // Whimsicott
	{ dexNumber: 553, formName: null }, // Krookodile
	{ dexNumber: 563, formName: null }, // Cofagrigus
	{ dexNumber: 569, formName: null }, // Garbodor
	{ dexNumber: 571, formName: null }, // Zoroark
	{ dexNumber: 571, formName: "hisui" }, // Zoroark (Hisuian)
	{ dexNumber: 579, formName: null }, // Reuniclus
	{ dexNumber: 584, formName: null }, // Vanilluxe
	{ dexNumber: 587, formName: null }, // Emolga
	{ dexNumber: 609, formName: null }, // Chandelure
	{ dexNumber: 614, formName: null }, // Beartic
	{ dexNumber: 618, formName: null }, // Stunfisk
	{ dexNumber: 618, formName: "galar" }, // Stunfisk (Galarian)
	{ dexNumber: 623, formName: null }, // Golurk
	{ dexNumber: 635, formName: null }, // Hydreigon
	{ dexNumber: 637, formName: null }, // Volcarona
	{ dexNumber: 652, formName: null }, // Chesnaught
	{ dexNumber: 655, formName: null }, // Delphox
	{ dexNumber: 658, formName: null }, // Greninja
	{ dexNumber: 660, formName: null }, // Diggersby
	{ dexNumber: 663, formName: null }, // Talonflame
	{ dexNumber: 666, formName: null }, // Vivillon
	{ dexNumber: 670, formName: "eternal" }, // Floette (Eternal)
	{ dexNumber: 671, formName: null }, // Florges
	{ dexNumber: 675, formName: null }, // Pangoro
	{ dexNumber: 676, formName: null }, // Furfrou
	{ dexNumber: 678, formName: "male" }, // Meowstic (Male)
	{ dexNumber: 678, formName: "female" }, // Meowstic (Female)
	{ dexNumber: 681, formName: null }, // Aegislash
	{ dexNumber: 683, formName: null }, // Aromatisse
	{ dexNumber: 685, formName: null }, // Slurpuff
	{ dexNumber: 693, formName: null }, // Clawitzer
	{ dexNumber: 695, formName: null }, // Heliolisk
	{ dexNumber: 697, formName: null }, // Tyrantrum
	{ dexNumber: 699, formName: null }, // Aurorus
	{ dexNumber: 700, formName: null }, // Sylveon
	{ dexNumber: 701, formName: null }, // Hawlucha
	{ dexNumber: 702, formName: null }, // Dedenne
	{ dexNumber: 706, formName: null }, // Goodra
	{ dexNumber: 706, formName: "hisui" }, // Goodra (Hisuian)
	{ dexNumber: 707, formName: null }, // Klefki
	{ dexNumber: 709, formName: null }, // Trevenant
	{ dexNumber: 711, formName: null }, // Gourgeist
	{ dexNumber: 711, formName: "large" }, // Gourgeist (Large)
	{ dexNumber: 711, formName: "small" }, // Gourgeist (Small)
	{ dexNumber: 711, formName: "super" }, // Gourgeist (Super)
	{ dexNumber: 713, formName: null }, // Avalugg
	{ dexNumber: 713, formName: "hisui" }, // Avalugg (Hisuian)
	{ dexNumber: 715, formName: null }, // Noivern
	{ dexNumber: 724, formName: null }, // Decidueye
	{ dexNumber: 724, formName: "hisui" }, // Decidueye (Hisuian)
	{ dexNumber: 727, formName: null }, // Incineroar
	{ dexNumber: 730, formName: null }, // Primarina
	{ dexNumber: 733, formName: null }, // Toucannon
	{ dexNumber: 740, formName: null }, // Crabominable
	{ dexNumber: 745, formName: null }, // Lycanroc
	{ dexNumber: 745, formName: "dusk" }, // Lycanroc (Dusk)
	{ dexNumber: 745, formName: "midnight" }, // Lycanroc (Midnight)
	{ dexNumber: 748, formName: null }, // Toxapex
	{ dexNumber: 750, formName: null }, // Mudsdale
	{ dexNumber: 752, formName: null }, // Araquanid
	{ dexNumber: 758, formName: null }, // Salazzle
	{ dexNumber: 763, formName: null }, // Tsareena
	{ dexNumber: 765, formName: null }, // Oranguru
	{ dexNumber: 766, formName: null }, // Passimian
	{ dexNumber: 778, formName: null }, // Mimikyu
	{ dexNumber: 780, formName: null }, // Drampa
	{ dexNumber: 784, formName: null }, // Kommo-o
	{ dexNumber: 823, formName: null }, // Corviknight
	{ dexNumber: 841, formName: null }, // Flapple
	{ dexNumber: 842, formName: null }, // Appletun
	{ dexNumber: 844, formName: null }, // Sandaconda
	{ dexNumber: 855, formName: null }, // Polteageist
	{ dexNumber: 858, formName: null }, // Hatterene
	{ dexNumber: 866, formName: null }, // Mr. Rime
	{ dexNumber: 867, formName: null }, // Runerigus
	{ dexNumber: 869, formName: null }, // Alcremie
	{ dexNumber: 877, formName: null }, // Morpeko
	{ dexNumber: 887, formName: null }, // Dragapult
	{ dexNumber: 899, formName: null }, // Wyrdeer
	{ dexNumber: 900, formName: null }, // Kleavor
	{ dexNumber: 902, formName: "male" }, // Basculegion (Male)
	{ dexNumber: 902, formName: "female" }, // Basculegion (Female)
	{ dexNumber: 903, formName: null }, // Sneasler
	{ dexNumber: 908, formName: null }, // Meowscarada
	{ dexNumber: 911, formName: null }, // Skeledirge
	{ dexNumber: 914, formName: null }, // Quaquaval
	{ dexNumber: 925, formName: null }, // Maushold
	{ dexNumber: 925, formName: "four" }, // Maushold (Four)
	{ dexNumber: 934, formName: null }, // Garganacl
	{ dexNumber: 936, formName: null }, // Armarouge
	{ dexNumber: 937, formName: null }, // Ceruledge
	{ dexNumber: 939, formName: null }, // Bellibolt
	{ dexNumber: 952, formName: null }, // Scovillain
	{ dexNumber: 956, formName: null }, // Espathra
	{ dexNumber: 959, formName: null }, // Tinkaton
	{ dexNumber: 964, formName: null }, // Palafin
	{ dexNumber: 964, formName: "hero" }, // Palafin (Hero)
	{ dexNumber: 968, formName: null }, // Orthworm
	{ dexNumber: 970, formName: null }, // Glimmora
	{ dexNumber: 981, formName: null }, // Farigiraf
	{ dexNumber: 983, formName: null }, // Kingambit
	{ dexNumber: 1013, formName: null }, // Sinistcha
	{ dexNumber: 1018, formName: null }, // Archaludon
	{ dexNumber: 1019, formName: null }, // Hydrapple
];

export const CHAMPION_ITEMS = new Set([
	"silk-scarf",
	"miracle-seed",
	"charcoal",
	"mystic-water",
	"magnet",
	"silver-powder",
	"sharp-beak",
	"hard-stone",
	"poison-barb",
	"never-melt-ice",
	"black-belt",
	"twisted-spoon",
	"spell-tag",
	"dragon-fang",
	"metal-coat",
	"soft-sand",
	"black-glasses",
	"fairy-feather",
	"mental-herb",
	"shell-bell",
	"cheri-berry",
	"chesto-berry",
	"pecha-berry",
	"rawst-berry",
	"aspear-berry",
	"persim-berry",
	"leppa-berry",
	"oran-berry",
	"chilan-berry",
	"rindo-berry",
	"occa-berry",
	"passho-berry",
	"wacan-berry",
	"tanga-berry",
	"coba-berry",
	"charti-berry",
	"kebia-berry",
	"shuca-berry",
	"yache-berry",
	"payapa-berry",
	"kasib-berry",
	"haban-berry",
	"colbur-berry",
	"babiri-berry",
	"roseli-berry",
	"chople-berry",
	"scope-lens",
	"light-ball",
	"white-herb",
	"choice-scarf",
	"focus-band",
	"focus-sash",
	"leftovers",
	"lum-berry",
	"sitrus-berry",
	"bright-powder",
	"quick-claw",
	"kings-rock",
]);

// This project includes custom mega evolutions beyond the official games
// (e.g. Dragonite-Mega, Starmie-Mega, Greninja-Mega, etc.).
// All entries below exist in the project's PokeAPI instance.
export const MEGA_STONE_MAP: Record<string, string> = {
	venusaurite: "venusaur-mega",
	"charizardite-x": "charizard-mega-x",
	"charizardite-y": "charizard-mega-y",
	blastoisinite: "blastoise-mega",
	beedrillite: "beedrill-mega",
	pidgeotite: "pidgeot-mega",
	clefablite: "clefable-mega",
	alakazite: "alakazam-mega",
	victreebelite: "victreebel-mega",
	slowbronite: "slowbro-mega",
	gengarite: "gengar-mega",
	kangaskhanite: "kangaskhan-mega",
	starminite: "starmie-mega",
	pinsirite: "pinsir-mega",
	gyaradosite: "gyarados-mega",
	aerodactylite: "aerodactyl-mega",
	dragoninite: "dragonite-mega",
	meganiumite: "meganium-mega",
	feraligite: "feraligatr-mega",
	ampharosite: "ampharos-mega",
	steelixite: "steelix-mega",
	scizorite: "scizor-mega",
	heracronite: "heracross-mega",
	skarmorite: "skarmory-mega",
	houndoominite: "houndoom-mega",
	tyranitarite: "tyranitar-mega",
	gardevoirite: "gardevoir-mega",
	sablenite: "sableye-mega",
	aggronite: "aggron-mega",
	medichamite: "medicham-mega",
	manectite: "manectric-mega",
	sharpedonite: "sharpedo-mega",
	cameruptite: "camerupt-mega",
	altarianite: "altaria-mega",
	banettite: "banette-mega",
	chimechite: "chimecho-mega",
	absolite: "absol-mega",
	glalitite: "glalie-mega",
	lopunnite: "lopunny-mega",
	garchompite: "garchomp-mega",
	lucarionite: "lucario-mega",
	abomasite: "abomasnow-mega",
	galladite: "gallade-mega",
	froslassite: "froslass-mega",
	emboarite: "emboar-mega",
	excadrite: "excadrill-mega",
	audinite: "audino-mega",
	chandelurite: "chandelure-mega",
	golurkite: "golurk-mega",
	chesnaughtite: "chesnaught-mega",
	delphoxite: "delphox-mega",
	greninjite: "greninja-mega",
	floettite: "floette-mega",
	meowsticite: "meowstic-mega",
	hawluchanite: "hawlucha-mega",
	crabominite: "crabominable-mega",
	drampanite: "drampa-mega",
	scovillainite: "scovillain-mega",
	glimmoranite: "glimmora-mega",
};

// Custom megas that exist in the project's PokeAPI but not in the public one.
// The apiId values come from the project's PokeAPI instance.
// These must be fetched once from the project's PokeAPI and hardcoded here.
export const CUSTOM_MEGA_API_IDS: Record<string, number> = {
	"clefable-mega": 100036,
	"victreebel-mega": 100071,
	"starmie-mega": 100121,
	"dragonite-mega": 100149,
	"meganium-mega": 100154,
	"feraligatr-mega": 100160,
	"skarmory-mega": 100227,
	"chimecho-mega": 100358,
	"froslass-mega": 100478,
	"emboar-mega": 100500,
	"excadrill-mega": 100530,
	"chandelure-mega": 100609,
	"golurk-mega": 100623,
	"chesnaught-mega": 100652,
	"delphox-mega": 100655,
	"greninja-mega": 100658,
	"floette-mega": 100670,
	"meowstic-mega": 100678,
	"hawlucha-mega": 100701,
	"crabominable-mega": 100740,
	"drampa-mega": 100780,
	"scovillain-mega": 100952,
	"glimmora-mega": 100970,
	// TODO: Populate actual values by querying the project's PokeAPI instance.
	// The numbers above are placeholders using the convention 100000 + dexNumber.
};

// Manual Spanish-to-English overrides for abilities that PokeAPI
// does not have Spanish translations for, or that are Champions-exclusive.
export const MANUAL_ABILITY_TRANSLATIONS: Record<string, string> = {
	"fuerza mental": "inner-focus",
	calco: "trace",
	megasolar: "mega-sol",
	"piel dragontina": "dragonize",
	turbotaladro: "piercing-drill",
	salpicante: "spicy-spray",
};

// PokeAPI variety name overrides for forms where our simplified formName
// doesn't match the PokeAPI variety naming convention.
// Key: "{species}" for base forms or "{species}-{formName}" for named forms.
// Value: PokeAPI variety name.
export const POKEAPI_VARIETY_OVERRIDES: Record<string, string> = {
	maushold: "maushold-family-of-three",
	"maushold-four": "maushold-family-of-four",
};

// Map from species name (slug) to dex number, derived from CHAMPION_POKEMON.
// Used to look up dex numbers when deriving mega forms from MEGA_STONE_MAP.
export const SPECIES_NAME_TO_DEX: Record<string, number> = {
	venusaur: 3,
	charizard: 6,
	blastoise: 9,
	beedrill: 15,
	pidgeot: 18,
	arbok: 24,
	pikachu: 25,
	raichu: 26,
	clefable: 36,
	ninetales: 38,
	arcanine: 59,
	alakazam: 65,
	machamp: 68,
	victreebel: 71,
	slowbro: 80,
	gengar: 94,
	kangaskhan: 115,
	starmie: 121,
	pinsir: 127,
	tauros: 128,
	gyarados: 130,
	ditto: 132,
	vaporeon: 134,
	jolteon: 135,
	flareon: 136,
	aerodactyl: 142,
	snorlax: 143,
	dragonite: 149,
	meganium: 154,
	typhlosion: 157,
	feraligatr: 160,
	ariados: 168,
	ampharos: 181,
	azumarill: 184,
	politoed: 186,
	espeon: 196,
	umbreon: 197,
	slowking: 199,
	forretress: 205,
	steelix: 208,
	scizor: 212,
	heracross: 214,
	skarmory: 227,
	houndoom: 229,
	tyranitar: 248,
	pelipper: 279,
	gardevoir: 282,
	sableye: 302,
	aggron: 306,
	medicham: 308,
	manectric: 310,
	sharpedo: 319,
	camerupt: 323,
	torkoal: 324,
	altaria: 334,
	milotic: 350,
	castform: 351,
	banette: 354,
	chimecho: 358,
	absol: 359,
	glalie: 362,
	torterra: 389,
	infernape: 392,
	empoleon: 395,
	luxray: 405,
	roserade: 407,
	rampardos: 409,
	bastiodon: 411,
	lopunny: 428,
	spiritomb: 442,
	garchomp: 445,
	lucario: 448,
	hippowdon: 450,
	toxicroak: 454,
	abomasnow: 460,
	weavile: 461,
	rhyperior: 464,
	leafeon: 470,
	glaceon: 471,
	gliscor: 472,
	mamoswine: 473,
	gallade: 475,
	froslass: 478,
	rotom: 479,
	serperior: 497,
	emboar: 500,
	samurott: 503,
	watchog: 505,
	liepard: 510,
	simisage: 512,
	simisear: 514,
	simipour: 516,
	excadrill: 530,
	audino: 531,
	conkeldurr: 534,
	whimsicott: 547,
	krookodile: 553,
	cofagrigus: 563,
	garbodor: 569,
	zoroark: 571,
	reuniclus: 579,
	vanilluxe: 584,
	emolga: 587,
	chandelure: 609,
	beartic: 614,
	stunfisk: 618,
	golurk: 623,
	hydreigon: 635,
	volcarona: 637,
	chesnaught: 652,
	delphox: 655,
	greninja: 658,
	diggersby: 660,
	talonflame: 663,
	vivillon: 666,
	floette: 670,
	florges: 671,
	pangoro: 675,
	furfrou: 676,
	meowstic: 678,
	aegislash: 681,
	aromatisse: 683,
	slurpuff: 685,
	clawitzer: 693,
	heliolisk: 695,
	tyrantrum: 697,
	aurorus: 699,
	sylveon: 700,
	hawlucha: 701,
	dedenne: 702,
	goodra: 706,
	klefki: 707,
	trevenant: 709,
	gourgeist: 711,
	avalugg: 713,
	noivern: 715,
	decidueye: 724,
	incineroar: 727,
	primarina: 730,
	toucannon: 733,
	crabominable: 740,
	lycanroc: 745,
	toxapex: 748,
	mudsdale: 750,
	araquanid: 752,
	salazzle: 758,
	tsareena: 763,
	oranguru: 765,
	passimian: 766,
	mimikyu: 778,
	drampa: 780,
	"kommo-o": 784,
	corviknight: 823,
	flapple: 841,
	appletun: 842,
	sandaconda: 844,
	polteageist: 855,
	hatterene: 858,
	"mr-rime": 866,
	runerigus: 867,
	alcremie: 869,
	morpeko: 877,
	dragapult: 887,
	wyrdeer: 899,
	kleavor: 900,
	basculegion: 902,
	sneasler: 903,
	meowscarada: 908,
	skeledirge: 911,
	quaquaval: 914,
	maushold: 925,
	garganacl: 934,
	armarouge: 936,
	ceruledge: 937,
	bellibolt: 939,
	scovillain: 952,
	espathra: 956,
	tinkaton: 959,
	palafin: 964,
	orthworm: 968,
	glimmora: 970,
	farigiraf: 981,
	kingambit: 983,
	sinistcha: 1013,
	archaludon: 1018,
	hydrapple: 1019,
};

// Set of mega variety names that exist in the public PokeAPI.
// All others are custom megas only available in the project's PokeAPI.
const OFFICIAL_MEGAS = new Set([
	"venusaur-mega",
	"charizard-mega-x",
	"charizard-mega-y",
	"blastoise-mega",
	"beedrill-mega",
	"pidgeot-mega",
	"alakazam-mega",
	"slowbro-mega",
	"gengar-mega",
	"kangaskhan-mega",
	"pinsir-mega",
	"gyarados-mega",
	"aerodactyl-mega",
	"ampharos-mega",
	"steelix-mega",
	"scizor-mega",
	"heracross-mega",
	"houndoom-mega",
	"tyranitar-mega",
	"gardevoir-mega",
	"sableye-mega",
	"aggron-mega",
	"medicham-mega",
	"manectric-mega",
	"sharpedo-mega",
	"camerupt-mega",
	"altaria-mega",
	"banette-mega",
	"absol-mega",
	"glalie-mega",
	"lopunny-mega",
	"garchomp-mega",
	"lucario-mega",
	"abomasnow-mega",
	"gallade-mega",
	"audino-mega",
]);

export function isOfficialMega(varietyName: string): boolean {
	return OFFICIAL_MEGAS.has(varietyName);
}

export function isCustomMega(varietyName: string): boolean {
	return (
		varietyName.includes("-mega") &&
		!OFFICIAL_MEGAS.has(varietyName) &&
		varietyName in CUSTOM_MEGA_API_IDS
	);
}

/**
 * Returns all Champion Pokemon including mega forms derived from MEGA_STONE_MAP.
 */
export function getAllChampionPokemon(): Array<{
	dexNumber: number;
	formName: string | null;
}> {
	// Start with the base CHAMPION_POKEMON list
	const all = [...CHAMPION_POKEMON];

	// Add mega forms derived from MEGA_STONE_MAP values
	for (const megaVarietyName of Object.values(MEGA_STONE_MAP)) {
		const megaIndex = megaVarietyName.indexOf("-mega");
		const baseName = megaVarietyName.slice(0, megaIndex);
		const formName = megaVarietyName.slice(megaIndex + 1); // "mega", "mega-x", "mega-y"

		const dexNumber = SPECIES_NAME_TO_DEX[baseName];
		if (dexNumber === undefined) {
			throw new Error(
				`Cannot find dex number for base species "${baseName}" (mega variety: "${megaVarietyName}")`,
			);
		}

		all.push({ dexNumber, formName });
	}

	return all;
}
