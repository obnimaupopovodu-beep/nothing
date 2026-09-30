import base64
import io
import re
from pathlib import Path
from PIL import Image

source = Path(r'C:\Users\obnim\OneDrive\Документы\nothing\nothing\uwb.svg').read_text(encoding='utf-8')
encoded = re.search(r'base64,([^"\']+)', source).group(1)
image = Image.open(io.BytesIO(base64.b64decode(encoded))).convert('RGBA')
width = 800
height = round(image.height * width / image.width)
alpha = image.getchannel('A').resize((width, height), Image.Resampling.LANCZOS)
mask = alpha.point(lambda value: 255 if value >= 96 else 0)
pixels = mask.load()

edges = []
for y in range(height):
    for x in range(width):
        if not pixels[x, y]:
            continue
        if y == 0 or not pixels[x, y - 1]: edges.append(((x, y), (x + 1, y)))
        if x == width - 1 or not pixels[x + 1, y]: edges.append(((x + 1, y), (x + 1, y + 1)))
        if y == height - 1 or not pixels[x, y + 1]: edges.append(((x + 1, y + 1), (x, y + 1)))
        if x == 0 or not pixels[x - 1, y]: edges.append(((x, y + 1), (x, y)))

outgoing = {}
for start, end in edges:
    outgoing.setdefault(start, []).append(end)

def simplify(points, tolerance=1.2):
    def recurse(segment):
        if len(segment) <= 2: return segment
        ax, ay = segment[0]
        bx, by = segment[-1]
        dx, dy = bx - ax, by - ay
        length = dx * dx + dy * dy
        distances = [abs(dx * (ay - py) - (ax - px) * dy) / (length ** 0.5) if length else ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5 for px, py in segment[1:-1]]
        peak = max(range(len(distances)), key=distances.__getitem__)
        if distances[peak] <= tolerance: return [segment[0], segment[-1]]
        index = peak + 1
        return recurse(segment[:index + 1])[:-1] + recurse(segment[index:])
    return recurse(points)

paths = []
while outgoing:
    start = next(iter(outgoing))
    points = [start]
    current = start
    while True:
        options = outgoing[current]
        following = options.pop()
        if not options: del outgoing[current]
        current = following
        if current == start: break
        points.append(current)
    if len(points) < 8: continue
    area = abs(sum(points[i][0] * points[(i + 1) % len(points)][1] - points[(i + 1) % len(points)][0] * points[i][1] for i in range(len(points)))) / 2
    if area < 16: continue
    points = simplify(points + [points[0]])[:-1]
    scale_x = 2184 / width
    scale_y = 2741 / height
    commands = [f'M{408 + points[0][0] * scale_x:.1f} {130 + points[0][1] * scale_y:.1f}']
    commands += [f'L{408 + x * scale_x:.1f} {130 + y * scale_y:.1f}' for x, y in points[1:]]
    paths.append(' '.join(commands) + 'Z')

Path('public/uwb-original-outline.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 3000"><path fill="#000" fill-rule="evenodd" d="' + ' '.join(paths) + '"/></svg>\n', encoding='utf-8')