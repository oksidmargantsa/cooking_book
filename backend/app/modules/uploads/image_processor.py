from io import BytesIO

from PIL import Image, ImageOps

from app.core.constants import (
    UPLOAD_IMAGE_FORMATS,
    UPLOAD_JPEG_QUALITY,
    UPLOAD_MAX_PIXELS,
    UPLOAD_MAX_SIDE,
    UPLOAD_THUMB_SIZE,
)

Image.MAX_IMAGE_PIXELS = UPLOAD_MAX_PIXELS


def make_jpegs(data: bytes) -> tuple[bytes, bytes]:
    with Image.open(BytesIO(data)) as source:
        if source.format not in UPLOAD_IMAGE_FORMATS:
            raise ValueError("Допустимы только JPG, PNG и WebP")
        width, height = source.size
        if max(width, height) > UPLOAD_MAX_SIDE or width * height > UPLOAD_MAX_PIXELS:
            raise ValueError("Слишком большое разрешение изображения")
        oriented = ImageOps.exif_transpose(source)
        rgba = oriented.convert("RGBA")
        image = Image.new("RGB", rgba.size, "white")
        image.paste(rgba, mask=rgba.getchannel("A"))
        original = encode_jpeg(image)
        image.thumbnail(UPLOAD_THUMB_SIZE, Image.Resampling.LANCZOS)
        return original, encode_jpeg(image)


def encode_jpeg(image: Image.Image) -> bytes:
    with BytesIO() as stream:
        image.save(stream, format="JPEG", quality=UPLOAD_JPEG_QUALITY, optimize=True)
        return stream.getvalue()
