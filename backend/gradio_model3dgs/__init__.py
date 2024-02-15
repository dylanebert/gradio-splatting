from .model3dgs import Model3DGS
import warnings

warnings.warn(
    "The 'gradio_model3dgs' package is deprecated. Use the official Gradio Model3D component instead.",
    DeprecationWarning,
    stacklevel=2,
)

__all__ = ["Model3DGS"]
