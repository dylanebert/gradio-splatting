<script context="module" lang="ts">
    export { default as BaseModel3DGS } from "./shared/Model3DGS.svelte";
    export { default as BaseModel3DGSUpload } from "./shared/Model3DGSUpload.svelte";
    export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
    import { normalise_file, type FileData } from "@gradio/client";
    import Model3DGS from "./shared/Model3DGS.svelte";
    import Model3DGSUpload from "./shared/Model3DGSUpload.svelte";
    import { BlockLabel, Block, Empty, UploadText } from "@gradio/atoms";
    import { File } from "@gradio/icons";

    import { StatusTracker } from "@gradio/statustracker";
    import type { LoadingStatus } from "@gradio/statustracker";
    import type { Gradio } from "@gradio/utils";

    export let elem_id = "";
    export let elem_classes: string[] = [];
    export let visible = true;
    export let value: null | FileData = null;
    export let root: string;
    export let proxy_url: null | string;
    export let loading_status: LoadingStatus;
    export let label: string;
    export let show_label: boolean;
    export let container = true;
    export let scale: number | null = null;
    export let min_width: number | undefined = undefined;
    export let gradio: Gradio;
    export let height: number | undefined = undefined;
    export let zoom_speed = 1;
	export let pan_speed = 1;

    export let interactive: boolean;

    let _value: null | FileData;
    $: _value = normalise_file(value, root, proxy_url);

    let dragging = false;
</script>

{#if !interactive}
    <Block
        {visible}
        variant={value === null ? "dashed" : "solid"}
        border_mode={dragging ? "focus" : "base"}
        padding={false}
        {elem_id}
        {elem_classes}
        {container}
        {scale}
        {min_width}
        {height}
    >
        <StatusTracker autoscroll={gradio.autoscroll} i18n={gradio.i18n} {...loading_status} />

        {#if value}
			<BlockLabel {show_label} Icon={File} label={label || "Splat"} />
            <Model3DGS
                value={_value}
                i18n={gradio.i18n}
                {label}
                {show_label}
                {zoom_speed}
				{pan_speed}
            />
        {:else}
            <!-- Not ideal but some bugs to work out before we can 
				 make this consistent with other components -->

            <BlockLabel {show_label} Icon={File} label={label || "Splat"} />

            <Empty unpadded_box={true} size="large"><File /></Empty>
        {/if}
    </Block>
{:else}
    <Block
        {visible}
        variant={value === null ? "dashed" : "solid"}
        border_mode={dragging ? "focus" : "base"}
        padding={false}
        {elem_id}
        {elem_classes}
        {container}
        {scale}
        {min_width}
        {height}
    >
        <StatusTracker autoscroll={gradio.autoscroll} i18n={gradio.i18n} {...loading_status} />

        <Model3DGSUpload
            {label}
            {show_label}
            {root}
            value={_value}
            zoom_speed={zoom_speed}
            pan_speed={pan_speed}
            on:change={({ detail }) => (value = detail)}
            on:drag={({ detail }) => (dragging = detail)}
            on:change={({ detail }) => gradio.dispatch("change", detail)}
            on:clear={() => gradio.dispatch("clear")}
            i18n={gradio.i18n}
        >
            <UploadText i18n={gradio.i18n} type="file" />
        </Model3DGSUpload>
    </Block>
{/if}
