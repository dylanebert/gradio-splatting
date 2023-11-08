
import gradio as gr
from gradio_model3dgs import Model3DGS


with gr.Blocks() as demo:
    Model3DGS()


demo.launch()
