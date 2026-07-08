/** @type {import('./$types').PageLoad} */
export async function load() {
	await new Promise((resolve) => setTimeout(resolve, 0));
	return {};
}
