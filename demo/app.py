
import gradio as gr
from gradio_model3dgs import Model3DGS


with gr.Blocks() as demo:
    Model3DGS(examples=["https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.splat"])


demo.launch()
