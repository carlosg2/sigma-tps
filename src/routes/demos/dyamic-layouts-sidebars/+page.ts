import { redirect } from "@sveltejs/kit";

export const load = () => {
	redirect(307, "/demos/dyamic-layouts-sidebars/list-detail");
};
