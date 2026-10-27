"""One-off: add the bits the old page hard-coded (colour keys on shop items, caution list, rules, sizes) to the data file."""
import json, sys
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src))
colours = ["heather","sage","white","navy","charcoal","cocoa","navy","charcoal"]
i = 0
for g in d["shopping"]:
    for it in g["items"]:
        it["colour"] = colours[i]; i += 1
d["shopping"][0]["intro"] = "Your Boss grey, Boss burgundy, Uniqlo green and Paul Smith knits already cover most of this. Only the gaps remain."
d["shopping"][1]["intro"] = "One jacket and two pairs of trousers give you a week of office outfits with your Charles Tyrwhitt shirts."
d["shopping"][2]["intro"] = ""
d["budgetCHF"] = 2000
d["trip"] = {"title": "One Zurich trip covers most of it",
  "text": "Suitsupply, Nüschelerstrasse 26: blazer, trousers, merino crews, loafers. Book a fitting so they can pin the blazer and hem the trousers. Arket on the same trip: tees, wine crew, roll-neck, scarf. There's no Uniqlo in Switzerland and it doesn't ship here directly, so save Uniqlo top-ups for trips to Milan or Germany."}
d["sizes"] = [["Shirts","41 / 86 slim"],["Knits & tees","M (L in boxy tees)"],["Trousers","W32 L31–32"],["Jacket","Try 48 and 50"],["Coat","Hugo Boss UK 48"],["Shoes","EU 44–45"]]
d["extraColours"] = {"black":{"name":"Black","hex":"#16171A"},"camel":{"name":"Camel","hex":"#B8956A"}}
d["caution"] = [
  {"hex":"#16171A","name":"Black","level":"Caution","why":"Heavy near your face; deepens under-eye shadows.","fix":"Keep for trousers, shoes, outerwear. Show a white tee at the neckline or add a grey scarf."},
  {"hex":"#B8956A","name":"Camel","level":"Caution","why":"Warms your skin towards ruddy.","fix":"Always with navy, charcoal or grey at the neck."},
  {"hex":"#2D4FB5","name":"Cobalt / royal blue","level":"Caution","why":"Makes your eyes pop but sharpens cheek redness.","fix":"Fine in small patterns or on casual days. Replace solids with cornflower."},
  {"hex":"#D2452F","name":"Tomato red","level":"Avoid","why":"Your least flattering drape. Redness takes over your face.","fix":"Wear wine or muted raspberry instead."},
  {"hex":"#E8806A","name":"Coral & salmon","level":"Avoid","why":"Echoes your natural flush.","fix":"Try dusty mauve-pink."},
  {"hex":"#E35B2C","name":"Orange","level":"Avoid","why":"Like the Helly Hansen fleece: very visible redness.","fix":"Choose navy, spruce or slate for outdoor layers."},
  {"hex":"#E0607E","name":"Rose & watermelon pink","level":"Avoid near face","why":"Merges with your flush and reads blotchy.","fix":"Shell pink, or keep the warm pinks under a navy layer."},
  {"hex":"#7A7442","name":"Olive & khaki","level":"Avoid near face","why":"Looks muddy against ash hair.","fix":"Stone for trousers, sage or spruce for tops."},
  {"hex":"#C9A033","name":"Mustard & rust","level":"Avoid","why":"Turns your skin sallow.","fix":"For a rich autumn colour, choose wine or dusty teal instead."}]
d["rules"] = [
  ["Calm the redness","Cool greens and blues near your face make your skin look even. Warm reds, corals and oranges make the flush on your nose and cheeks stronger."],
  ["Keep contrast moderate","Charcoal with sky blue beats black with white. Pair a dark with a mid or light tone, not with its exact opposite."],
  ["One accent per outfit","Tonal greys or navies, then one note of sage, teal, lilac or wine. That's your monochrome-with-a-pop look."],
  ["Buffer the tricky colours","Camel, black and saturated blues work best with a grey, navy or white layer between them and your face."],
  ["Texture over shine","Merino, flannel, oxford cloth and heathered cotton suit soft colouring better than glossy or high-sheen fabrics."],
  ["Metals","Silver, steel, white gold and gunmetal. Straps in steel, grey, navy or dark brown-grey leather."]]
names = {w["name"]: w["id"] for w in d["wardrobe"]}
watchIds = {w["name"]: w["id"] for w in d["wardrobe"] if w["category"] == "Watches"}
for o in d["outfits"]:
    o["itemIds"] = [names[n] for n in o["items"]]
    o["watchId"] = next((i for n, i in watchIds.items() if n.split(",")[0] in o["watch"] or o["watch"].split(",")[0] in n), None)
missing = [o["no"] for o in d["outfits"] if not o["watchId"]]
assert not missing, missing
json.dump(d, open(dst, "w"), ensure_ascii=False, indent=1)
print("ok", sum(len(g["items"]) for g in d["shopping"]))
