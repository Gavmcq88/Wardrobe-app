"""Inline CSS, JS and data into one HTML file (used for the claude.ai preview; the real app is the multi-file PWA)."""
import json, re, sys
root, out = sys.argv[1], sys.argv[2]
r = lambda p: open(f"{root}/{p}", encoding="utf-8").read()
html = r("index.html")
html = re.sub(r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n', "", html)
html = html.replace('<link rel="stylesheet" href="styles.css">', "<style>\n" + r("styles.css") + "</style>")
data = json.dumps(json.load(open(f"{root}/data/wardrobe-data.json", encoding="utf-8")), ensure_ascii=False).replace("</", "<\\/")
html = html.replace('<script src="illustrations.js"></script>', "<script>window.WARDROBE_DATA=" + data + ";\n" + r("illustrations.js") + "</script>")
html = html.replace('<script src="generator.js"></script>', "<script>\n" + r("generator.js") + "</script>")
html = html.replace('<script src="app.js"></script>', "<script>\n" + r("app.js") + "</script>")
# the claude.ai preview supplies its own document skeleton
html = re.sub(r"<!doctype html>\n<html[^>]*>\n<head>\n|<meta charset[^>]*>\n|<meta name=\"viewport\"[^>]*>\n|</head>\n<body>\n|</body>\n</html>\n?", "", html)
open(out, "w", encoding="utf-8").write(html)
print(len(html))
