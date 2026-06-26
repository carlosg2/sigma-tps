<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Card.Root>
	<Card.Content>
		<Empty.Root class="h-56 border">
			<Empty.Header>
				<Empty.Media>
					<Avatar.Group class="grayscale">
						<Avatar.Root size="lg">
							<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
							<Avatar.Fallback>CN</Avatar.Fallback>
						</Avatar.Root>
						<Avatar.Root size="lg">
							<Avatar.Image src="https://github.com/maxleiter.png" alt="@maxleiter" />
							<Avatar.Fallback>LR</Avatar.Fallback>
						</Avatar.Root>
						<Avatar.Root size="lg">
							<Avatar.Image
								src="https://github.com/evilrabbit.png"
								alt="@evilrabbit"
							/>
							<Avatar.Fallback>ER</Avatar.Fallback>
						</Avatar.Root>
					</Avatar.Group>
				</Empty.Media>
				<Empty.Title>Sin miembros del equipo</Empty.Title>
				<Empty.Description>
					Invita a tu equipo a colaborar en este proyecto.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button size="sm">Invitar miembros</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
