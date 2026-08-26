"""
Regenerate `public/portrait2-cutout.png` from `public/portrait2.jpeg`.

**Committed this time, deliberately.** The previous cut-out was produced by an uncommitted
one-off script, and PROGRESS.md had to carry a note saying it must be re-derived by hand if the
source photo ever changed. Keeping it here means a new photo is one command away.

    python scripts/cutout.py [preview_dir]

How it works, and why not a simple colour key: the source is a *dark* studio portrait — the
backdrop runs L~70-140 with a vignette down to ~23 at the bottom corners, while the suit is
L~20-60. The background therefore sits *between* the suit and the skin in luminance, and at the
bottom it is as dark as the subject, so no luminance or chroma threshold separates them. What
does separate them is the silhouette edge, which is strong everywhere it matters. So: build a
barrier from the colour gradient, flood the non-barrier region inward from the frame border,
and whatever the flood cannot reach is the subject. Verified stable — the subject covers 59.2%
of the frame and that figure barely moves across edge thresholds from 14 to 36, which is what
tells you the barrier is holding rather than leaking or collapsing.

Needs Pillow, numpy and scipy. No OpenCV or ML background remover is required.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src = Image.open("public/portrait2.jpeg").convert("RGB")
W, H = src.size
rgb = np.asarray(src.filter(ImageFilter.GaussianBlur(1.2)), np.float32)

grad = np.zeros((H, W), np.float32)
for c in range(3):
    grad = np.maximum(grad, np.hypot(ndimage.sobel(rgb[..., c], 1), ndimage.sobel(rgb[..., c], 0)))

free = grad < 22
lab, _ = ndimage.label(free)
seeds = set(lab[0, :].tolist()) | set(lab[: int(H * 0.55), 0].tolist()) | set(lab[: int(H * 0.55), -1].tolist())
seeds.discard(0)
subject = ndimage.binary_fill_holes(~np.isin(lab, list(seeds)))

# Drop specks, then keep only the largest blob: the person.
subject = ndimage.binary_opening(subject, np.ones((3, 3)), iterations=2)
lab2, n2 = ndimage.label(subject)
if n2 > 1:
    sizes = ndimage.sum(subject, lab2, range(1, n2 + 1))
    subject = lab2 == (int(np.argmax(sizes)) + 1)
subject = ndimage.binary_fill_holes(subject)
subject = ndimage.binary_closing(subject, np.ones((5, 5)), iterations=2)

alpha = ndimage.gaussian_filter(subject.astype(np.float32), 1.1)
# Pull the matte in very slightly so no halo of background survives at the silhouette.
alpha = np.clip((alpha - 0.18) / 0.62, 0, 1)

# Fade the very bottom out: the torso runs off-frame and the vignette makes the key least
# reliable there, so it dissolves instead of ending on a hard cut.
fade = np.ones(H, np.float32)
band = int(H * 0.10)
fade[H - band:] = np.linspace(1, 0, band)
alpha *= fade[:, None]

out = np.dstack([np.asarray(src, np.uint8), (alpha * 255).astype(np.uint8)])
img = Image.fromarray(out, "RGBA")
img.save("public/portrait2-cutout.png", optimize=True)

# Preview on the real page background so the silhouette can be judged in context.
bg = Image.new("RGBA", (W, H), (8, 9, 13, 255))
import sys
if len(sys.argv) > 1:
    Image.alpha_composite(bg, img).convert("RGB").save(f"{sys.argv[1]}/cut-preview.png")
print("subject coverage: %.1f%%" % (subject.mean() * 100))
print("opaque px: %d   soft-edge px: %d" % ((alpha > 0.95).sum(), ((alpha > 0.05) & (alpha < 0.95)).sum()))
