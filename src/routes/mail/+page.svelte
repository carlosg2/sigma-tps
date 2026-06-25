<script lang="ts">
	import { browser } from "$app/environment";

	import { DEFAULT_MAIL_LAYOUT, MAIL_LAYOUT_COOKIE } from "./_components/mail-layout-config.js";
	import MailComponent from "./_components/MailComponent.svelte";

	function getLayoutFromCookie(): number[] {
		if (!browser) return [...DEFAULT_MAIL_LAYOUT];
		const match = document.cookie.match(new RegExp(`(?:^|; )${MAIL_LAYOUT_COOKIE}=([^;]*)`));
		if (match) {
			try {
				return JSON.parse(decodeURIComponent(match[1]));
			} catch {
				return [...DEFAULT_MAIL_LAYOUT];
			}
		}
		return [...DEFAULT_MAIL_LAYOUT];
	}
</script>

<div class="h-dvh min-h-0 overflow-hidden">
	<MailComponent defaultLayout={getLayoutFromCookie()} />
</div>
