import { createRequire } from 'module';
import { mkdirSync } from 'fs';

const require = createRequire('C:/Users/kamik/Desktop/game-server-lab/package.json');
const sharp = require('sharp');

const OUT = 'C:/Users/kamik/Desktop/game-server-lab/src/assets/eyecatch';
mkdirSync(OUT, { recursive: true });

const FONT = "'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif";

// アイコン: 100x100 viewBox の stroke パス
const icons = {
	cube: (c) => `
		<path d="M50 18 L82 34 L82 66 L50 82 L18 66 L18 34 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<path d="M18 34 L50 50 L82 34" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>
		<line x1="50" y1="50" x2="50" y2="82" stroke="${c}" stroke-width="5"/>`,
	server: (c) => `
		<rect x="24" y="24" width="52" height="21" rx="5" fill="none" stroke="${c}" stroke-width="6"/>
		<rect x="24" y="55" width="52" height="21" rx="5" fill="none" stroke="${c}" stroke-width="6"/>
		<circle cx="35" cy="34.5" r="3.5" fill="${c}"/>
		<circle cx="35" cy="65.5" r="3.5" fill="${c}"/>
		<line x1="55" y1="34.5" x2="68" y2="34.5" stroke="${c}" stroke-width="5" stroke-linecap="round"/>
		<line x1="55" y1="65.5" x2="68" y2="65.5" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
	puzzle: (c) => `
		<path d="M30 34 h14 a8 8 0 1 1 12 0 h14 v14 a8 8 0 1 0 0 12 v14 h-14 a8 8 0 1 0 -12 0 h-14 v-14 a8 8 0 1 1 0 -12 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
	gamepad: (c) => `
		<path d="M32 34 h36 a18 18 0 0 1 18 18 c0 12 -7 22 -14 22 c-6 0 -9 -8 -14 -8 h-16 c-5 0 -8 8 -14 8 c-7 0 -14 -10 -14 -22 a18 18 0 0 1 18 -18 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<line x1="36" y1="46" x2="36" y2="60" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<line x1="29" y1="53" x2="43" y2="53" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
		<circle cx="66" cy="48" r="4" fill="${c}"/>
		<circle cx="74" cy="58" r="4" fill="${c}"/>`,
	shield: (c) => `
		<path d="M50 18 L78 28 L78 50 C78 68 66 78 50 84 C34 78 22 68 22 50 L22 28 Z" fill="none" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
		<polyline points="38,50 47,59 63,41" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
};

const posts = [
	{ slug: 'minecraft-server-guide', bg: '#173404', mid: '#97C459', light: '#EAF3DE', chipB: '#3B6D11', chipT: '#C0DD97', cat: '入門', icon: 'cube', title: 'マイクラ鯖の立て方' },
	{ slug: 'game-vps-comparison', bg: '#042C53', mid: '#85B7EB', light: '#E6F1FB', chipB: '#185FA5', chipT: '#B5D4F4', cat: '比較', icon: 'server', title: 'ゲーム鯖VPS比較' },
	{ slug: 'minecraft-mod-server', bg: '#26215C', mid: '#AFA9EC', light: '#EEEDFE', chipB: '#534AB7', chipT: '#CECBF6', cat: 'Mod', icon: 'puzzle', title: 'Mod鯖をFabricで' },
	{ slug: 'palworld-server-guide', bg: '#412402', mid: '#EF9F27', light: '#FAEEDA', chipB: '#854F0B', chipT: '#FAC775', cat: '構築', icon: 'gamepad', title: 'Palworld専用鯖' },
	{ slug: 'multiplayer-without-port-forwarding', bg: '#501313', mid: '#F09595', light: '#FCEBEB', chipB: '#A32D2D', chipT: '#F7C1C1', cat: '安全', icon: 'shield', title: 'ポート開放不要マルチ' },
];

function svgFor(p) {
	const chipW = 64 + p.cat.length * 42;
	return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
	<rect width="1200" height="630" fill="${p.bg}"/>
	<circle cx="1120" cy="560" r="260" fill="none" stroke="${p.mid}" stroke-width="2" opacity="0.25"/>
	<circle cx="1160" cy="600" r="380" fill="none" stroke="${p.mid}" stroke-width="2" opacity="0.15"/>
	<rect x="80" y="72" width="${chipW}" height="66" rx="33" fill="none" stroke="${p.chipB}" stroke-width="3"/>
	<text x="${80 + chipW / 2}" y="116" text-anchor="middle" font-family="${FONT}" font-size="34" fill="${p.chipT}">${p.cat}</text>
	<g transform="translate(920,60) scale(2.2)">${icons[p.icon](p.mid)}</g>
	<text x="80" y="472" font-family="${FONT}" font-size="76" font-weight="bold" fill="${p.light}">${p.title}</text>
	<line x1="84" y1="512" x2="244" y2="512" stroke="${p.mid}" stroke-width="6" stroke-linecap="round"/>
	<text x="80" y="566" font-family="${FONT}" font-size="32" fill="${p.mid}">ゲーム鯖ラボ</text>
</svg>`;
}

for (const p of posts) {
	const svg = svgFor(p);
	await sharp(Buffer.from(svg), { density: 96 }).png().toFile(`${OUT}/${p.slug}.png`);
	console.log('generated:', p.slug);
}
console.log('done');
