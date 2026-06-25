import { z } from 'zod';
import { MEGABYTE } from '$lib/components/extras/file-drop-zone';

export const schema = z.object({
	attachments: z.array(z.instanceof(File).refine(
		(file) => file.size <= MEGABYTE * 112,
		{ message: "El tamaño del archivo debe ser menor a 112MB" }
	))
});

export type Schema = z.infer<typeof schema>;
