import { mails, type Mail } from "./data.js";

class MailStore {
	selected = $state<Mail["id"] | null>(mails[0].id);
}

export const mailStore = new MailStore();
