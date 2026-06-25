<script lang="ts">
	import Example from "../example.svelte";
	import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<Example title="Text Alignment">
	<Field.Field>
		<Label id="alignment-label">Text Alignment</Label>
		<ButtonGroup aria-labelledby="alignment-label">
			<Button variant="outline" size="sm">Left</Button>
			<Button variant="outline" size="sm">Center</Button>
			<Button variant="outline" size="sm">Right</Button>
			<Button variant="outline" size="sm">Justify</Button>
		</ButtonGroup>
	</Field.Field>
</Example>
