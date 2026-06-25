import type { FileCellData } from '$lib/components/data-grid/types.js';

export interface DemoPerson {
	id: string;
	name?: string;
	age?: number;
	email?: string;
	website?: string;
	notes?: string;
	salary?: number;
	department?: string;
	status?: string;
	skills?: string[];
	isActive?: boolean;
	startDate?: string;
	attachments?: FileCellData[];
}

export const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'] as const;
export const statuses = ['Active', 'On Leave', 'Remote', 'In Office'] as const;
export const skills = [
	'JavaScript',
	'TypeScript',
	'React',
	'Node.js',
	'Python',
	'SQL',
	'AWS',
	'Docker',
	'Git',
	'Agile'
] as const;

const firstNames = [
	'Ada',
	'Grace',
	'Linus',
	'Margaret',
	'Alan',
	'Katherine',
	'Dennis',
	'Barbara',
	'Tim',
	'Radia',
	'Donald',
	'Hedy',
	'Edsger',
	'Joan',
	'Ken',
	'Frances',
	'Brian',
	'Anita',
	'Guido',
	'Sophie'
];

const lastNames = [
	'Lovelace',
	'Hopper',
	'Torvalds',
	'Hamilton',
	'Turing',
	'Johnson',
	'Ritchie',
	'Liskov',
	'Berners-Lee',
	'Perlman',
	'Knuth',
	'Lamarr',
	'Dijkstra',
	'Clarke',
	'Thompson',
	'Allen',
	'Kernighan',
	'Borg',
	'van Rossum',
	'Wilson'
];

const notes = [
	'Excellent team player with strong communication skills. Consistently meets deadlines and delivers high-quality work.',
	'Currently working on the Q4 project initiative. Requires additional training in advanced analytics tools.',
	'Relocated from the Seattle office last month. Adjusting well to the new team dynamics and company culture.',
	'Submitted request for professional development courses. Shows great initiative in learning new technologies.',
	'Outstanding performance in the last quarter. Recommended for leadership training program next year.',
	'Recently completed certification in project management. Looking to take on more responsibility in upcoming projects.',
	'Needs improvement in time management. Working with mentor to develop better organizational skills.',
	'Transferred from the marketing department. Bringing valuable cross-functional experience to the team.',
	'On track for promotion consideration. Has exceeded expectations in client relationship management.',
	'Participating in the company mentorship program. Showing strong potential for career advancement.',
	'Recently returned from parental leave. Successfully reintegrated into current project workflows.',
	'Fluent in three languages. Often assists with international client communications and translations.',
	'Leading the diversity and inclusion initiative. Organizing monthly team building events and workshops.',
	'Requested flexible work arrangement for family care. Maintaining productivity while working remotely.',
	"Completed advanced training in data visualization. Now serving as the team's go-to expert for dashboards."
];

const sampleFiles = [
	{ name: 'Resume.pdf', type: 'application/pdf', sizeRange: [50, 500] },
	{ name: 'Contract.pdf', type: 'application/pdf', sizeRange: [100, 300] },
	{ name: 'ID_Document.pdf', type: 'application/pdf', sizeRange: [200, 400] },
	{ name: 'Profile_Photo.jpg', type: 'image/jpeg', sizeRange: [500, 2000] },
	{ name: 'Certificate.pdf', type: 'application/pdf', sizeRange: [200, 500] },
	{ name: 'Training_Video.mp4', type: 'video/mp4', sizeRange: [5000, 15000] }
] as const;

/** Deterministic PRNG (mulberry32) so the demo data is stable between renders. */
function createRandom(seed: number) {
	let state = seed >>> 0;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function pick<T>(rng: () => number, items: readonly T[]): T {
	return items[Math.floor(rng() * items.length)] as T;
}

function pickMany<T>(rng: () => number, items: readonly T[], min: number, max: number): T[] {
	const count = min + Math.floor(rng() * (max - min + 1));
	const pool = [...items];
	const result: T[] = [];
	for (let i = 0; i < count && pool.length > 0; i++) {
		const index = Math.floor(rng() * pool.length);
		result.push(pool.splice(index, 1)[0] as T);
	}
	return result;
}

function intBetween(rng: () => number, min: number, max: number): number {
	return min + Math.floor(rng() * (max - min + 1));
}

function makeId(rng: () => number): string {
	let id = '';
	for (let i = 0; i < 8; i++) {
		id += ID_ALPHABET[Math.floor(rng() * ID_ALPHABET.length)];
	}
	return id;
}

function dateBetween(rng: () => number, fromYear: number, toYear: number): string {
	const from = new Date(`${fromYear}-01-01`).getTime();
	const to = new Date(`${toYear}-01-01`).getTime();
	const time = from + rng() * (to - from);
	return new Date(time).toISOString().split('T')[0] ?? '';
}

export function generateDemoPerson(id: number, options?: { lite?: boolean }): DemoPerson {
	const rng = createRandom(id * 2654435761);
	const firstName = pick(rng, firstNames);
	const lastName = pick(rng, lastNames);
	const slug = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, '');

	if (options?.lite) {
		return {
			id: makeId(rng),
			name: `${firstName} ${lastName}`,
			email: `${slug}@example.com`,
			salary: intBetween(rng, 40000, 150000),
			department: pick(rng, departments),
			status: pick(rng, statuses),
			skills: pickMany(rng, skills, 1, 3),
			isActive: rng() > 0.5,
			startDate: dateBetween(rng, 2018, 2024)
		};
	}

	const fileCount = intBetween(rng, 0, 3);
	const selectedFiles = pickMany(rng, sampleFiles, fileCount, fileCount);
	const attachments: FileCellData[] = selectedFiles.map((file, index) => {
		const sizeKB = intBetween(rng, file.sizeRange[0], file.sizeRange[1]);
		return {
			id: `${id}-file-${index}`,
			name: file.name,
			size: sizeKB * 1024,
			type: file.type,
			url: `https://example.com/files/${id}/${file.name}`
		};
	});

	return {
		id: makeId(rng),
		name: `${firstName} ${lastName}`,
		age: intBetween(rng, 22, 65),
		email: `${slug}@example.com`,
		website: `https://${slug.replace(/\./g, '')}.dev`,
		notes: pick(rng, notes),
		salary: intBetween(rng, 40000, 150000),
		department: pick(rng, departments),
		status: pick(rng, statuses),
		isActive: rng() > 0.5,
		startDate: dateBetween(rng, 2018, 2024),
		skills: pickMany(rng, skills, 1, 5),
		attachments
	};
}

export function generateDemoPeople(count: number, options?: { lite?: boolean }): DemoPerson[] {
	return Array.from({ length: count }, (_, index) => generateDemoPerson(index + 1, options));
}

export function scheduleDemoPeopleLoad(
	count: number,
	onLoaded: (people: DemoPerson[]) => void,
	options?: { lite?: boolean }
): () => void {
	if (typeof window === 'undefined' || import.meta.env.VITEST) {
		onLoaded(generateDemoPeople(count, options));
		return () => {};
	}

	let cancelled = false;
	const run = () => {
		if (cancelled) return;
		onLoaded(generateDemoPeople(count, options));
	};

	const idleId =
		typeof requestIdleCallback === 'function'
			? requestIdleCallback(run, { timeout: 1500 })
			: undefined;
	const timeoutId = idleId === undefined ? window.setTimeout(run, 0) : undefined;

	return () => {
		cancelled = true;
		if (idleId !== undefined) {
			cancelIdleCallback(idleId);
		}
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
	};
}
