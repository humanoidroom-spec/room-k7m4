"""Extract actual ROOM PDF figures and reproducible crops, without altering the PDF."""
from pathlib import Path
from io import BytesIO
import shutil
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'ICRA_27___HRI_manipulation_dataset.pdf'
OUT = ROOT / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
doc = fitz.open(PDF)


def embedded(page, index=0):
    xref = doc[page].get_images(full=True)[index][0]
    return Image.open(BytesIO(doc.extract_image(xref)['image'])).convert('RGB')


def save(image, name):
    image.save(OUT / (name + '.webp'), quality=92)


teaser = embedded(0)
for name, rect in {
    'hero-scene': (20, 381, 1427, 822),
    'gaze': (1039, 80, 1425, 370),
    'body': (21, 81, 404, 370),
    'handover': (24, 394, 537, 820),
    'tabletop': (947, 395, 1427, 821),
    'cart': (562, 396, 944, 820),
}.items():
    save(teaser.crop(rect), name)

collection = embedded(3)
for name, rect in {
    'setup': (3, 3, 925, 743),
    'head-view': (20, 592, 221, 727),
    'chest-view': (232, 592, 431, 727),
    'gesture': (947, 199, 1167, 344),
    'seating': (948, 56, 1168, 191),
    'correction': (945, 382, 1166, 529),
}.items():
    save(collection.crop(rect), name)

for name, image in [
    ('overview', teaser), ('collection', collection),
    ('architecture', embedded(3, 1)),
    ('benchmark-source', embedded(4)),
    ('representation-source', embedded(6)),
]:
    save(image, name)

shutil.copy2(PDF, ROOT / 'public' / 'room-paper.pdf')
print('Extracted 17 figures/crops and copied the unmodified manuscript.')
