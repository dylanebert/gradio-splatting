<script lang="ts">
    import type { FileData } from "@gradio/client";
    import { BlockLabel, IconButton } from "@gradio/atoms";
    import { File, Download } from "@gradio/icons";
    import { onMount } from "svelte";
    import * as SPLAT from "gsplat";
    import type { I18nFormatter } from "@gradio/utils";

    export let value: FileData | null;
    export let label = "";
    export let show_label: boolean;
    export let i18n: I18nFormatter;
    export let zoom_speed = 1;
    export let pan_speed = 1;

    let canvas: HTMLCanvasElement;
    let scene: SPLAT.Scene;
    let camera: SPLAT.Camera;
    let renderer: SPLAT.WebGLRenderer | null = null;
    let controls: SPLAT.OrbitControls;
    let loading = false;
    let mounted = false;

    onMount(() => {
        scene = new SPLAT.Scene();
        camera = new SPLAT.Camera();
        renderer = new SPLAT.WebGLRenderer(canvas);
        controls = new SPLAT.OrbitControls(camera, canvas);
        controls.zoomSpeed = zoom_speed;
        controls.panSpeed = pan_speed;

        const load = async (url: string) => {
            if (loading) {
                console.error("Already loading");
                return;
            }
            loading = true;
            await SPLAT.Loader.LoadAsync(url, scene, (progress) => {
                // TODO: Progress bar
            });
            loading = false;
        };
        load(value.url);

        const frame = () => {
            if (loading) {
                requestAnimationFrame(frame);
                return;
            }

            controls.update();
            renderer.render(scene, camera);

            requestAnimationFrame(frame);
        };

        requestAnimationFrame(frame);

        window.addEventListener("resize", () => {
            renderer?.resize();
        });
        mounted = true;
    });

    function download() {
        if (!value) {
            return;
        }
        const blob = new Blob([scene.data.buffer], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.download = "model.splat";
        link.href = window.URL.createObjectURL(blob);
        link.click();
    }

    $: ({ path } = value || {
        path: undefined,
    });

    $: canvas && mounted && path && dispose();

    function dispose() {
        if (renderer !== null && !loading) {
            renderer.dispose();
        }
    }
</script>

<BlockLabel {show_label} Icon={File} label={label || i18n("3DGS_model.splat")} />
{#if value}
    <div class="model3DGS">
        <div class="buttons">
            <IconButton Icon={Download} label={i18n("common.download")} on:click={download} />
        </div>

        <canvas bind:this={canvas} />
    </div>
{/if}

<style>
    .model3DGS {
        display: flex;
        position: relative;
        width: var(--size-full);
        height: var(--size-full);
    }
    canvas {
        width: var(--size-full);
        height: var(--size-full);
        object-fit: contain;
        overflow: hidden;
    }
    .buttons {
        display: flex;
        position: absolute;
        top: var(--size-2);
        right: var(--size-2);
        justify-content: flex-end;
        gap: var(--spacing-sm);
        z-index: var(--layer-5);
    }
</style>