import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)


def build_intern_report(intern):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2.2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2.2 * cm,
        rightMargin=2.2 * cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"],
        fontSize=20, textColor=colors.HexColor("#0F6E64"), spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle", parent=styles["Normal"],
        fontSize=11, textColor=colors.HexColor("#57706B"), spaceAfter=16,
    )
    section_style = ParagraphStyle(
        "SectionStyle", parent=styles["Heading2"],
        fontSize=13, textColor=colors.HexColor("#0F6E64"),
        spaceBefore=18, spaceAfter=8,
    )
    body_style = styles["Normal"]
    footer_style = ParagraphStyle(
        "FooterStyle", parent=styles["Normal"],
        fontSize=8.5, textColor=colors.HexColor("#93A6A1"),
    )

    elements = []

    elements.append(Paragraph("OGDCL Internship Program", title_style))
    elements.append(Paragraph("Official Intern Report", subtitle_style))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#D8E2DF"), thickness=1))
    elements.append(Spacer(1, 14))

    ref_table = Table(
        [
            ["Report Reference:", f"{intern.get('Employee_ID', '')}-RPT"],
            ["Date Generated:", datetime.now().strftime("%d %B %Y")],
        ],
        colWidths=[4 * cm, 10 * cm],
    )
    ref_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#57706B")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(ref_table)
    elements.append(Spacer(1, 10))

    def info_table(rows):
        t = Table(rows, colWidths=[5 * cm, 9 * cm])
        t.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 10.5),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#57706B")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#EEF2F1")),
        ]))
        return t

    elements.append(Paragraph("Intern Information", section_style))
    elements.append(info_table([
        ["Full Name", intern.get("Full_Name", "")],
        ["Employee ID", intern.get("Employee_ID", "")],
        ["Gender", intern.get("Gender", "")],
        ["Department", intern.get("Department", "")],
        ["Supervisor", intern.get("Supervisor", "")],
        ["Floor", intern.get("Floor", "")],
        ["Status", intern.get("Status", "")],
    ]))

    elements.append(Paragraph("Internship Duration", section_style))
    elements.append(info_table([
        ["Start Date", intern.get("StartDate", "")],
        ["End Date", intern.get("EndDate", "")],
        ["Days Remaining", str(intern.get("Days_Remaining", 0))],
        ["Progress", f"{intern.get('Progress', 0)}%"],
        ["Attendance", f"{intern.get('Attendance_Percentage', 0)}%"],
    ]))

    elements.append(Paragraph("Contact Information", section_style))
    elements.append(info_table([
        ["Email", intern.get("Email", "")],
        ["Phone", str(intern.get("Phone", ""))],
        ["Address", intern.get("Address", "") or "-"],
    ]))

    elements.append(Paragraph("Tasks Assigned", section_style))
    tasks = intern.get("Tasks", [])
    if tasks:
        for task in tasks:
            elements.append(Paragraph(f"•  {task}", body_style))
            elements.append(Spacer(1, 4))
    else:
        elements.append(Paragraph("No tasks have been assigned yet.", body_style))

    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#D8E2DF"), thickness=1))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "This is a system-generated report from the OGDCL Internship Management Portal.",
        footer_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer