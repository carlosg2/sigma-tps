import {
	Archive,
	CircleHelp,
	File,
	Inbox,
	Keyboard,
	type LucideIcon,
	Paperclip,
	Send,
	Star,
	Trash2,
} from "@lucide/svelte";

const arhamKhan = {
	name: "Arham Khan",
	email: "hello@arhamkhnz.com",
};

const weblabsStudio = {
	name: "Weblabs Studio",
	email: "contact@weblabs.studio",
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

export type Recipient = {
	name: string;
	email: string;
};

export type Attachment = {
	id: string;
	name: string;
	size: string;
	icon: LucideIcon;
};

export type Mail = {
	id: string;
	accountId: number;
	from: Recipient;
	to: Recipient[];
	cc?: Recipient[];
	subject: string;
	body: string;
	receivedAt: string;
	folder: "inbox" | "drafts" | "sent" | "archive" | "trash";
	isRead: boolean;
	isPinned: boolean;
	isPriority: boolean;
	labels: string[];
	attachments?: Attachment[];
	messageCount?: number;
};

export type MailNavItem = {
	id: string;
	title: string;
	label?: string;
	icon: LucideIcon;
	isActive: boolean;
};

type MailNavigation = {
	navMain: MailNavItem[];
	folders: MailNavItem[];
	navFooter: MailNavItem[];
};

export const mails: Mail[] = [
	{
		id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
		accountId: 1,
		from: { name: "William Smith", email: "williamsmith@example.com" },
		to: [arhamKhan],
		cc: [weblabsStudio],
		subject: "Meeting Tomorrow",
		body: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
		receivedAt: minutesAgo(24),
		folder: "inbox",
		isRead: true,
		isPinned: true,
		isPriority: true,
		labels: ["meeting", "work", "important"],
		attachments: [
			{ id: "studio-admin-fig", name: "studio-admin.fig", size: "21 MB", icon: Paperclip },
			{ id: "features-docx", name: "features.docx", size: "3.7 MB", icon: Paperclip },
			{ id: "preview-png", name: "preview.png", size: "2.3 MB", icon: Paperclip },
		],
	},
	{
		id: "110e8400-e29b-11d4-a716-446655440000",
		accountId: 2,
		from: { name: "Alice Smith", email: "alicesmith@example.com" },
		to: [weblabsStudio],
		subject: "Re: Project Update",
		body: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.\n\nI have a few minor suggestions that I'll include in the attached document.\n\nLet's discuss these during our next meeting. Keep up the excellent work!\n\nBest regards, Alice",
		receivedAt: hoursAgo(2),
		folder: "inbox",
		isRead: true,
		isPinned: true,
		isPriority: false,
		labels: ["work", "important"],
		attachments: [{ id: "project-notes-docx", name: "project-notes.docx", size: "1.8 MB", icon: Paperclip }],
		messageCount: 3,
	},
	{
		id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
		accountId: 1,
		from: { name: "Bob Johnson", email: "bobjohnson@example.com" },
		to: [arhamKhan],
		subject: "Weekend Plans",
		body: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun.\n\nIf you're interested, let me know, and we can plan the details. It'll be a great way to unwind and enjoy nature.\n\nLooking forward to your response!\n\nBest, Bob",
		receivedAt: daysAgo(1),
		folder: "inbox",
		isRead: true,
		isPinned: true,
		isPriority: false,
		labels: ["personal"],
	},
	{
		id: "61c35085-72d7-42b4-8d62-738f700d4b92",
		accountId: 1,
		from: { name: "Emily Davis", email: "emilydavis@example.com" },
		to: [arhamKhan],
		subject: "Re: Question about Budget",
		body: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation of resources.\n\nI've reviewed the budget report and identified a few areas where we might be able to optimize our spending without compromising the project's quality.\n\nI've attached a detailed analysis for your reference. Let's discuss this further in our next meeting.\n\nThanks, Emily",
		receivedAt: daysAgo(2),
		folder: "inbox",
		isRead: false,
		isPinned: true,
		isPriority: true,
		labels: ["work", "budget"],
		attachments: [{ id: "budget-analysis-docx", name: "budget-analysis.docx", size: "2.1 MB", icon: Paperclip }],
		messageCount: 2,
	},
	{
		id: "8f7b5db9-d935-4e42-8e05-1f1d0a3dfb97",
		accountId: 2,
		from: { name: "Michael Wilson", email: "michaelwilson@example.com" },
		to: [weblabsStudio],
		subject: "Important Announcement",
		body: "I have an important announcement to make during our team meeting. It pertains to a strategic shift in our approach to the upcoming product launch.\n\nThis change is crucial to our success, and I look forward to discussing it with the team.\n\nRegards, Michael",
		receivedAt: daysAgo(3),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: true,
		labels: ["meeting", "work", "important"],
	},
	{
		id: "1f0f2c02-e299-40de-9b1d-86ef9e42126b",
		accountId: 1,
		from: { name: "Sarah Brown", email: "sarahbrown@example.com" },
		to: [arhamKhan],
		subject: "Re: Feedback on Proposal",
		body: "Thank you for your feedback on the proposal. It looks great! The team worked diligently to address all the key points you raised.\n\nI've attached the revised proposal for your review.\n\nBest regards, Sarah",
		receivedAt: daysAgo(5),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["work"],
		attachments: [{ id: "proposal-layout-fig", name: "proposal-layout.fig", size: "14 MB", icon: Paperclip }],
	},
	{
		id: "17c0a96d-4415-42b1-8b4f-764efab57f66",
		accountId: 2,
		from: { name: "David Lee", email: "davidlee@example.com" },
		to: [weblabsStudio],
		cc: [arhamKhan],
		subject: "New Project Idea",
		body: "I have an exciting new project idea to discuss with you. I've prepared a detailed proposal outlining the potential benefits and the strategy for execution.\n\nLet's set up a meeting to dive into the details.\n\nBest regards, David",
		receivedAt: daysAgo(8),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["meeting", "work", "important"],
	},
	{
		id: "2f0130cb-39fc-44c4-bb3c-0a4337edaaab",
		accountId: 1,
		from: { name: "Olivia Wilson", email: "oliviawilson@example.com" },
		to: [arhamKhan],
		subject: "Vacation Plans",
		body: "Let's plan our vacation for next month. I've been thinking of visiting a tropical paradise, and I've put together some destination options.\n\nExcited to hear your thoughts! Olivia",
		receivedAt: daysAgo(12),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["personal"],
	},
	{
		id: "de305d54-75b4-431b-adb2-eb6b9e546014",
		accountId: 2,
		from: { name: "James Martin", email: "jamesmartin@example.com" },
		to: [weblabsStudio],
		subject: "Re: Conference Registration",
		body: "I've completed the registration for the conference next month. I've also attached the conference schedule for your reference.\n\nBest regards, James",
		receivedAt: daysAgo(18),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["work", "conference"],
		attachments: [{ id: "conference-schedule-png", name: "conference-schedule.png", size: "860 KB", icon: Paperclip }],
	},
	{
		id: "7dd90c63-00f6-40f3-bd87-5060a24e8ee7",
		accountId: 1,
		from: { name: "Sophia White", email: "sophiawhite@example.com" },
		to: [arhamKhan],
		subject: "Team Dinner",
		body: "Let's have a team dinner next week to celebrate our success. I've made reservations at a lovely restaurant.\n\nPlease confirm your availability and any dietary preferences.\n\nBest, Sophia",
		receivedAt: daysAgo(24),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["meeting", "work"],
	},
	{
		id: "99a88f78-3eb4-4d87-87b7-7b15a49a0a05",
		accountId: 2,
		from: { name: "Daniel Johnson", email: "danieljohnson@example.com" },
		to: [weblabsStudio],
		subject: "Feedback Request",
		body: "I'd like your feedback on the latest project deliverables. Your feedback is invaluable, and I appreciate your time and expertise.\n\nRegards, Daniel",
		receivedAt: daysAgo(31),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["work"],
	},
	{
		id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		accountId: 1,
		from: { name: "Ava Taylor", email: "avataylor@example.com" },
		to: [arhamKhan],
		subject: "Re: Meeting Agenda",
		body: "Here's the agenda for our meeting next week. If you have any additional items to discuss, please let me know.\n\nLooking forward to our meeting! Ava",
		receivedAt: daysAgo(45),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["meeting", "work"],
	},
	{
		id: "c1a0ecb4-2540-49c5-86f8-21e5ce79e4e6",
		accountId: 2,
		from: { name: "William Anderson", email: "williamanderson@example.com" },
		to: [weblabsStudio],
		subject: "Product Launch Update",
		body: "The product launch is on track. I'll provide an update during our call.\n\nBest regards, William",
		receivedAt: daysAgo(62),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["meeting", "work", "important"],
	},
	{
		id: "ba54eefd-4097-4949-99f2-2a9ae4d1a836",
		accountId: 1,
		from: { name: "Mia Harris", email: "miaharris@example.com" },
		to: [arhamKhan],
		subject: "Re: Travel Itinerary",
		body: "I've received the travel itinerary. It looks great! I'm looking forward to the trip.\n\nExcited for the trip! Mia",
		receivedAt: daysAgo(75),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["personal", "travel"],
	},
	{
		id: "df09b6ed-28bd-4e0c-85a9-9320ec5179aa",
		accountId: 2,
		from: { name: "Ethan Clark", email: "ethanclark@example.com" },
		to: [weblabsStudio],
		subject: "Team Building Event",
		body: "Let's plan a team-building event for our department. I've done some research and have a few ideas for fun and engaging activities.\n\nRegards, Ethan",
		receivedAt: daysAgo(92),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["meeting", "work"],
	},
	{
		id: "d67c1842-7f8b-4b4b-9be1-1b3b1ab4611d",
		accountId: 1,
		from: { name: "Chloe Hall", email: "chloehall@example.com" },
		to: [arhamKhan],
		subject: "Re: Budget Approval",
		body: "The budget has been approved. We can proceed with the project.\n\nIt's an exciting time for us! Chloe",
		receivedAt: daysAgo(118),
		folder: "inbox",
		isRead: true,
		isPinned: false,
		isPriority: false,
		labels: ["work", "budget"],
	},
	{
		id: "6c9a7f94-8329-4d70-95d3-51f68c186ae1",
		accountId: 2,
		from: { name: "Samuel Turner", email: "samuelturner@example.com" },
		to: [weblabsStudio],
		subject: "Weekend Hike",
		body: "Who's up for a weekend hike in the mountains? Let me know if you're interested and we can plan the details.\n\nSamuel",
		receivedAt: daysAgo(145),
		folder: "inbox",
		isRead: false,
		isPinned: false,
		isPriority: false,
		labels: ["personal"],
	},
];

export const mailNavigation: MailNavigation = {
	navMain: [
		{ id: "inbox", title: "Inbox", label: "18", icon: Inbox, isActive: true },
		{ id: "priority", title: "Priority", label: "3", icon: Star, isActive: false },
	],
	folders: [
		{ id: "drafts", title: "Drafts", label: "9", icon: File, isActive: false },
		{ id: "sent", title: "Sent", icon: Send, isActive: false },
		{ id: "archive", title: "Archive", icon: Archive, isActive: false },
		{ id: "trash", title: "Trash", icon: Trash2, isActive: false },
	],
	navFooter: [
		{ id: "help-feedback", title: "Help & feedback", icon: CircleHelp, isActive: false },
		{ id: "keyboard-shortcuts", title: "Keyboard shortcuts", icon: Keyboard, isActive: false },
	],
};

export const accounts = [
	{ id: 1, label: "Arham Khan", email: "hello@arhamkhnz.com" },
	{ id: 2, label: "Weblabs Studio", email: "contact@weblabs.studio" },
];
