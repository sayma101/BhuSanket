from ..data.sources import source_record
import csv
import io
import json
from xml.sax.saxutils import escape


def csv_bytes(result):
    stream = io.StringIO(newline="")
    writer = csv.writer(stream)
    writer.writerow(["year", "value", "unit", "daily_coverage_fraction", "analysis_id", "data_mode"])
    for row in result["series"]:
        writer.writerow([row["year"], row["value"] if row["value"] is not None else "", result["variable"]["unit"], row["coverage"], result["analysis_id"], result["provenance"]["mode"]])
    return stream.getvalue().encode("utf-8-sig")


def pdf_bytes(result):
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.graphics.shapes import Drawing, Line, String, Circle
    stream = io.BytesIO()
    doc = SimpleDocTemplate(stream, pagesize=(595, 842), rightMargin=42, leftMargin=42, topMargin=38, bottomMargin=38)
    styles = getSampleStyleSheet()
    story = [Paragraph("BHUSANKET / Reproducible evidence report", styles["Title"]), Spacer(1, 12)]
    lines = [result["analysis_id"], f"{result['location']['label']} | {result['variable']['id']} | {result['period']['start_year']}-{result['period']['end_year']}",
             f"{result['dataset']['short_name']} {result['dataset']['version']} | {result['provenance']['mode']}", result["verdict"], result["interpretation"]["en"]]
    for line in lines:
        story.extend([Paragraph(escape(line), styles["BodyText"]), Spacer(1, 7)])
    if result["provenance"]["mode"] != "FIXTURE":
        source = source_record("power")
        story.extend([Paragraph("Data source attribution", styles["Heading2"]), Paragraph(escape(source["citation"]), styles["BodyText"])])
        for label, url in [("Official documentation", source["documentation_url"]), ("Data access viewer", source["data_access_url"]), ("Exact original NASA request", result["provenance"]["source_url"])]:
            story.extend([Paragraph(f'<a href="{escape(url)}">{escape(label)}</a>', styles["BodyText"]), Spacer(1, 5)])
    t = result["trend"]
    def fmt(value):
        return "Not available" if value is None else f"{value:.6g}"
    rows = [["Statistic", "Computed value"], ["Slope per decade", fmt(t["slope_per_decade"]) + " " + result["variable"]["unit"]],
            ["95% CI per decade", str(t["ci_95"])], ["Mann-Kendall p-value", fmt(t["p_value"])],
            ["Valid aggregate periods", f"{result['quality']['valid_observations']} / {result['quality']['total_observations']}"]]
    table = Table(rows, colWidths=[180, 320])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#132238")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")), ("BOTTOMPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 9)]))
    story.extend([Spacer(1, 10), table, Spacer(1, 16)])
    valid = [row for row in result["series"] if row["value"] is not None]
    if len(valid) >= 2:
        drawing = Drawing(500, 190)
        years = [row["year"] for row in result["series"]]
        values = [row["value"] for row in valid]
        low, high = min(values), max(values)
        pad = max((high - low) * 0.15, 0.1)
        low, high = low - pad, high + pad
        def px(year):
            return 50 + (year - min(years)) / max(max(years) - min(years), 1) * 430
        def py(value):
            return 30 + (value - low) / (high - low) * 140
        drawing.add(Line(50, 30, 480, 30, strokeColor=colors.HexColor("#132238")))
        for level in range(4):
            value = low + (high - low) * level / 3
            drawing.add(Line(50, py(value), 480, py(value), strokeColor=colors.HexColor("#dddddd"), strokeWidth=0.5))
            drawing.add(String(0, py(value) - 2, f"{value:.2f}", fontSize=8))
        previous = None
        for row in result["series"]:
            if row["value"] is None:
                drawing.add(String(px(row["year"]) - 2, 24, "x", fontSize=8, fillColor=colors.HexColor("#B9574E")))
                previous = None
                continue
            point = (px(row["year"]), py(row["value"]))
            if previous:
                drawing.add(Line(*previous, *point, strokeColor=colors.HexColor("#168C88"), strokeWidth=1.5))
            drawing.add(Circle(*point, 1.8, fillColor=colors.HexColor("#168C88"), strokeColor=None))
            previous = point
        if t["slope_per_year"] is not None:
            start = result["period"]["start_year"]
            first = t["intercept"]
            last = first + t["slope_per_year"] * (max(years) - start)
            drawing.add(Line(px(start), py(first), px(max(years)), py(last), strokeColor=colors.HexColor("#D59A39"), strokeWidth=1.5))
        drawing.add(String(50, 12, str(min(years)), fontSize=8))
        drawing.add(String(458, 12, str(max(years)), fontSize=8))
        story.extend([Paragraph("Observed series / Theil-Sen trend", styles["Heading2"]), drawing,
                      Paragraph("Teal: observed aggregate. Amber: fitted trend. x: missing aggregate period. Units: " + escape(result["variable"]["unit"]), styles["BodyText"])])
    for group, values in result["passport"].items():
        if not isinstance(values, dict):
            continue
        story.extend([Paragraph(escape(group.replace("_", " ").title()), styles["Heading2"])])
        for key, value in values.items():
            text = json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)
            story.extend([Paragraph(escape(key.replace("_", " ") + ": " + text), styles["BodyText"]), Spacer(1, 5)])
    def footer(canvas, document):
        canvas.setFont("Helvetica", 8)
        canvas.drawString(42, 22, "BhuSanket - deterministic evidence; not a forecast or causal attribution")
        canvas.drawRightString(553, 22, str(document.page))
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    return stream.getvalue()
