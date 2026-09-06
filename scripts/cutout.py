"""
Regenerate the hero portrait cut-outs: the normal one from `public/portrait2.jpeg`, and the
robotic variant from `public/portrait-robotic.jpg` using the *same* matte.

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

def grade(rgb01):
    """
    Settle the photograph onto the page's near-black background.

    The problem is not overall brightness — the subject's mean luminance is only 66 — it is the
    top end: p99 was 236 and 5% of the subject sat above 200 against a page at luminance 9, so
    the shirt and lit skin blew out and the cut-out read as pasted on rather than lit by the
    scene. Pulling everything down would have muddied the face, so this compresses the
    highlights instead and leaves the midtones nearly alone.

    Reinhard-style rolloff above a knee, a small exposure trim, a touch of desaturation, and a
    slight cool bias toward the page's blue-violet. Measured after: p99 236 -> 154, nothing above
    200 at all, mean 66 -> 54, with the face still fully legible (a harder knee of 0.35 was
    tried and started flattening it).
    """
    knee, exposure, cool, desat = 0.45, 0.88, 0.04, 0.92
    y = np.where(rgb01 <= knee, rgb01, knee + (rgb01 - knee) / (1.0 + (rgb01 - knee) / (1.0 - knee)))
    y = y * exposure
    lum = (y * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(-1, keepdims=True)
    y = lum + (y - lum) * desat
    y = y * np.array([1.0 - cool, 1.0 - cool * 0.55, 1.0], np.float32)
    return np.clip(y, 0.0, 1.0)


# The hero framing crop, in source pixels: (left, top, right, bottom) of the 832x1248 frame.
#
# The uncropped key is a near-full-length portrait, which the hero rendered small -- the head
# ended up a minor element in a tall column. This crops to head-and-chest so the face carries
# the composition, per Abdul's reference framing (2026-08-27).
#
# **Both emitted files must share this exact box.** The robotic layer is revealed through a mask
# that assumes pixel-identical geometry with the photo; cropping them differently would slide
# the robot's features against the photograph's. It is applied inside `emit()` for that reason,
# rather than at either call site where the two could drift apart.
#
# The bottom edge is not feathered here: `.hero-portrait` in `tailwind.config.ts` already masks
# the element's bottom 24% to transparent, so the crop dissolves into the section rather than
# ending on a line. Keep that in mind when choosing the bottom -- the last quarter of whatever
# this box includes will be faded out on the page.
# The right bound is the subject's own silhouette edge, not the frame's: the key left ~4
# transparent columns there, and the hero anchors this image flush to the section's right
# edge, where those columns would read as a gap. Measured, not guessed — the photo's alpha
# runs to column 827 and the robotic variant's to 823, so 828 trims the margin without
# touching either silhouette.
HERO_CROP = (0, 40, 828, 925)


def emit(path_in, path_out, erode_px=0, do_grade=False, mask_out=None):
    """
    Apply the matte to an image, crop to the hero framing, and write an RGBA PNG.

    `mask_out` additionally writes an **alpha-only stencil** of the same matte.

    That file exists for one reason: `.portrait-reveal` in `tailwind.config.ts` clips the hero
    reveal with `mask-image: url(...)`, and a CSS mask reads only the **alpha** channel — the
    colour data is never sampled. Pointing it at the full-colour cut-out meant the browser
    downloaded a ~1 MB PNG *raw*, outside `next/image`, purely to use as a shape; Lighthouse
    measured it as 980 KiB of wasted image payload and it was the page's biggest single
    download. All-black RGB with the matte in alpha, at half resolution (a stencil is scaled by
    `mask-size: contain` anyway), compresses to a tiny fraction of that.
    """
    rgb_src = Image.open(path_in).convert("RGB")
    if rgb_src.size != (W, H):
        raise SystemExit(f"{path_in} is {rgb_src.size}, expected {(W, H)} - the matte would not line up")
    a = alpha
    if erode_px:
        # Pull the matte in a little. Used for the robotic variant: its body is narrower than
        # the photographed one in places, so the shared matte let a thin band of its grey
        # backdrop through along the arms. Eroding tucks its edge just inside the silhouette,
        # where the normal photo underneath covers the seam.
        a = ndimage.grey_erosion(a, size=(erode_px * 2 + 1, erode_px * 2 + 1))
        a = ndimage.gaussian_filter(a, 0.8)
    pixels = np.asarray(rgb_src, np.float32) / 255.0
    if do_grade:
        pixels = grade(pixels)
    alpha8 = (a * 255).astype(np.uint8)
    data = np.dstack([(pixels * 255).astype(np.uint8), alpha8])
    out = Image.fromarray(data, "RGBA").crop(HERO_CROP)
    out.save(path_out, optimize=True)

    if mask_out:
        black = np.zeros_like(alpha8)
        stencil = Image.fromarray(np.dstack([black, black, black, alpha8]), "RGBA").crop(HERO_CROP)
        stencil = stencil.resize((stencil.width // 2, stencil.height // 2), Image.LANCZOS)
        stencil.save(mask_out, optimize=True)

    return np.asarray(out)


out = emit("public/portrait2.jpeg", "public/portrait2-cutout.png", do_grade=True)
img = Image.fromarray(out, "RGBA")

# The robotic variant is keyed with the **same matte**, not its own.
#
# It has an opaque grey backdrop, and the hero layers it over the normal photo to reveal it
# under the cursor. Keying it independently would give it a slightly different silhouette --
# its shoulders are broader -- so the reveal would show robot pixels sitting outside the human
# outline, which is exactly the "spilling outside the profile image" the effect must not do.
# Sharing one matte makes the two silhouettes pixel-identical and the containment structural.
# Deliberately ungraded: the AI variant is meant to read as lit from within, and it is only
# ever seen inside the reveal, where dimming it would defeat the effect.
emit(
    "public/portrait-robotic.jpg",
    "public/robotic-portrait-cutout.png",
    erode_px=4,
    mask_out="public/portrait-reveal-mask.png",
)

# Preview on the real page background so the silhouette can be judged in context.
bg = Image.new("RGBA", img.size, (8, 9, 13, 255))
import sys
if len(sys.argv) > 1:
    Image.alpha_composite(bg, img).convert("RGB").save(f"{sys.argv[1]}/cut-preview.png")
print("subject coverage: %.1f%%" % (subject.mean() * 100))
print("opaque px: %d   soft-edge px: %d" % ((alpha > 0.95).sum(), ((alpha > 0.05) & (alpha < 0.95)).sum()))
