from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime
from database import Database
import os

def generate_pdf():
    report_path = os.path.join("reports", "safety_report.pdf")

    doc = SimpleDocTemplate(
        report_path,
        pagesize=A4
    )
    styles = getSampleStyleSheet()
    story = []
    title = Paragraph(
        "Construction Site Safety Monitor",
        styles["Title"]
    )

    story.append(title)

    story.append(Spacer(1, 12))

    story.append(
        Paragraph(
            "AI Powered PPE Compliance Monitoring",
            styles["Heading2"]
        )
    )

    story.append(Spacer(1, 30))



    story.append(
        Paragraph(
            "Safety Compliance Report",
            styles["Heading1"]
        )
    )

   
    story.append(
        Paragraph(
            f"<b>Generated On:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            "<b>Prepared By:</b> Construction Site Safety Monitor",
            styles["Normal"]
        )
    )

    db = Database()
    stats = db.get_statistics()

    story.append(Spacer(1, 25))

    story.append(
        Paragraph(
            "EXECUTIVE SUMMARY",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Detections:</b> {stats['total_detections']}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Non-Compliant Cases:</b> {stats['non_compliant_count']}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Alerts:</b> {stats['total_alerts']}",
            styles["Normal"]
        )
    )


    doc.build(story)

    return report_path