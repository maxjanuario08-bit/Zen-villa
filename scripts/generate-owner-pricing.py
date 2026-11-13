"""Generate the French owner pricing PDF from the site's pricing catalog."""
import json
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / "data/service-pricing.json").read_text())
groups = [group for group in catalog if group["audience"] == "owner"]
labels = {"bed": "lit", "hour": "h", "month": "mois", "purchases": "achats",
          "equipment": "matériel", "holder": "support"}

def price(row):
    if row["amount"] is None or row["mode"] == "quote":
        return "Sur devis"
    amount = f'{row["amount"]:g}'.replace(".", ",")
    prefix = {"from": "À partir de ", "supplement": "+"}.get(row["mode"], "")
    unit = f' / {labels[row["unit"]]}' if row["unit"] else ""
    extra = f' + {labels[row["extra"]]}' if row["extra"] else ""
    return f"{prefix}{amount} €{unit}{extra}"

pdf = canvas.Canvas(str(ROOT / "output/pdf/zenvilla-tarifs-proprietaires.pdf"), pagesize=A4)
pdf.setTitle("Zen Villa - Grille tarifaire propriétaires")
pdf.setAuthor("Zen Villa")
width, height = A4

def label(x, y, value, size=11, font="Helvetica", color="#153942"):
    pdf.setFillColor(HexColor(color))
    pdf.setFont(font, size)
    pdf.drawString(x, y, value)

for page, page_groups in enumerate((groups[:2], groups[2:]), start=1):
    pdf.setFillColor(HexColor("#F8F4EE"))
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(HexColor("#105567"))
    pdf.rect(0, height - 125, width, 125, fill=1, stroke=0)
    label(42, height - 48, "Zen Villa", 20, "Times-Roman", "#FFFFFF")
    label(42, height - 94, "Tarifs propriétaires à la carte", 31, "Times-Roman", "#FFFFFF")
    y = height - 157
    for group in page_groups:
        label(42, y, group["title"]["fr"], 19, "Times-Bold")
        y -= 25
        for index, row in enumerate(group["rows"]):
            if index % 2 == 0:
                pdf.setFillColor(HexColor("#FFFFFF"))
                pdf.roundRect(42, y - 6, width - 84, 19, 3, fill=1, stroke=0)
            label(50, y, row["label"]["fr"], 10)
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawRightString(width - 50, y, price(row))
            y -= 20
        y -= 23
    if page == 1:
        label(42, y, "Ménage exceptionnel, vitres difficiles d’accès et équipements spécifiques sur devis.", 10)
    else:
        label(42, y, "Intendance : vérifications visuelles et coordination des interventions.", 10)
        label(42, y - 15, "Les travaux techniques sont confiés aux professionnels concernés.", 10)
    assert y > 85
    label(42, 36, "zen-villa.fr  |  contact@zen-villa.fr  |  +33 6 86 40 13 16", 9)
    label(width - 64, 36, f"{page} / 2", 9)
    pdf.showPage()
pdf.save()
