<script lang="ts">
    import { createEventDispatcher, tick, onMount } from "svelte";
    import { Upload, ModifyUpload } from "@gradio/upload";
    import type { FileData } from "@gradio/client";
    import { BlockLabel } from "@gradio/atoms";
    import { File } from "@gradio/icons";
    import * as SPLAT from "gsplat";

    export let value: null | FileData;
    export let label = "";
    export let show_label: boolean;
    export let root: string;
    export let i18n: I18nFormatter;
    export let zoom_speed = 1;
    export let pan_speed = 1;

    let mounted = false;
    let canvas: HTMLCanvasElement;
    let scene: SPLAT.Scene;
    let camera: SPLAT.Camera;
    let renderer: SPLAT.WebGLRenderer | null = null;
    let controls: SPLAT.OrbitControls;
    let frameId: number | null = null;

    function reset_scene(): void {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }

        if (renderer !== null) {
            renderer.dispose();
            renderer = null;
        }

        scene = new SPLAT.Scene();
        camera = new SPLAT.Camera();
        renderer = new SPLAT.WebGLRenderer(canvas);
        controls = new SPLAT.OrbitControls(camera, canvas);
        controls.zoomSpeed = zoom_speed;
        controls.panSpeed = pan_speed;

        if (!value) {
            return;
        }

        let loading = false;
        const load = async () => {
            if (loading) {
                console.error("Already loading");
                return;
            }
            loading = true;
            if (value.url.endsWith(".ply")) {
                await SPLAT.PLYLoader.LoadAsync(value.url, scene, (progress) => {
                    // TODO: progress bar
                });
            } else if (value.url.endsWith(".splat")) {
                await SPLAT.Loader.LoadAsync(value.url, scene, (progress) => {
                    // TODO: progress bar
                });
            } else {
                throw new Error("Unsupported file type");
            }
            loading = false;
        };

        const frame = () => {
            if (!renderer) {
                return;
            }

            if (loading) {
                frameId = requestAnimationFrame(frame);
                return;
            }

            controls.update();
            renderer.render(scene, camera);

            frameId = requestAnimationFrame(frame);
        };

        load();
        frameId = requestAnimationFrame(frame);
    }

    onMount(() => {
        if (value != null) {
            reset_scene();
        }
        mounted = true;
    });

    $: ({ path } = value || {
        path: undefined,
    });

    $: canvas && mounted && path != null && reset_scene();

    async function handle_upload({ detail }: CustomEvent<FileData>): Promise<void> {
        value = detail;
        await tick();
        reset_scene();
        dispatch("change", value);
        dispatch("load", value);
    }

    async function handle_clear(): Promise<void> {
        value = null;
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        await tick();
        dispatch("clear");
        dispatch("change");
    }

    const dispatch = createEventDispatcher<{
        change: FileData | null;
        clear: undefined;
        drag: boolean;
        load: FileData;
    }>();

    let dragging = false;

    import type { I18nFormatter } from "@gradio/utils";

    $: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={File} label={label || "Splat"} />

{#if value === null}
    <Upload on:load={handle_upload} {root} filetype=".ply, .splat" bind:dragging>
        <slot />
    </Upload>
{:else}
    <div class="input-model">
        <ModifyUpload on:clear={handle_clear} {i18n} absolute />
        <canvas bind:this={canvas} />
    </div>
{/if}

<style>
    .input-model {
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        width: var(--size-full);
        height: var(--size-full);
    }

    canvas {
        width: var(--size-full);
        height: var(--size-full);
        object-fit: contain;
        overflow: hidden;
    }
</style>
