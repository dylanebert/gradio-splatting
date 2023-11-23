
import gradio as gr
from gradio_model3dgs import Model3DGS


def load_splat(splat_file_name):
    return splat_file_name


demo = gr.Interface(
    fn=load_splat,
    inputs=Model3DGS(),
    outputs=Model3DGS(),
    examples=[
        "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k-mini.splat",
        "https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/luigi/luigi.ply",
    ],
    cache_examples=True,
)


demo.launch()
