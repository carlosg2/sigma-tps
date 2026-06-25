import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { schema } from './schema';

export const load = async () => {
	return {
		form: await superValidate({}, zod(schema))
	};
};
