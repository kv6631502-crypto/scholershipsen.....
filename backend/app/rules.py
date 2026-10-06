from typing import List, Dict, Any, Tuple

SIGNAL_POINTS = {
    "shared_bank": 25,
    "shared_mobile": 20,
    "cross_institution": 15,
    "attendance": 15,
    "documents": 12,
    "application_surge": 15,
    "shared_address": 10
}

def evaluate_signals(
    num_students: int,
    num_institutions: int,
    shared_bank_count: int,
    shared_mobile_count: int,
    mean_attendance: float,
    has_shared_doc: bool,
    max_students_at_address: int = 1,
    is_institution_surge: bool = False
) -> Tuple[int, str, List[Dict[str, Any]]]:
    reasons = []
    total_score = 0

    if shared_bank_count > 0:
        pts = 25
        total_score += pts
        reasons.append({
            "signal": "shared_bank",
            "label": "Shared bank account",
            "points": pts,
            "text": f"{num_students} students route disbursements to common account destination"
        })

    if shared_mobile_count > 0:
        pts = 20
        total_score += pts
        reasons.append({
            "signal": "shared_mobile",
            "label": "Shared mobile contact",
            "points": pts,
            "text": f"{num_students} student filings share primary phone verification number"
        })

    if num_institutions >= 2:
        pts = 15
        total_score += pts
        reasons.append({
            "signal": "cross_institution",
            "label": "Cross-institution link",
            "points": pts,
            "text": f"Cluster spans {num_institutions} separate geographical educational institutions"
        })

    if mean_attendance < 30.0:
        pts = 15
        total_score += pts
        reasons.append({
            "signal": "attendance",
            "label": "Attendance anomaly",
            "points": pts,
            "text": f"Cluster mean verified attendance is {mean_attendance:.1f}% (below 30% threshold)"
        })

    if has_shared_doc:
        pts = 12
        total_score += pts
        reasons.append({
            "signal": "documents",
            "label": "Document similarity",
            "points": pts,
            "text": "Beneficiary certificates share identical verification template or hash"
        })

    if is_institution_surge:
        pts = 15
        total_score += pts
        reasons.append({
            "signal": "application_surge",
            "label": "Application surge",
            "points": pts,
            "text": "Applications exceed 3x active verified student count"
        })

    if max_students_at_address >= 5:
        pts = 10
        total_score += pts
        reasons.append({
            "signal": "shared_address",
            "label": "Shared address (non-family)",
            "points": pts,
            "text": f"{max_students_at_address} non-family applicants registered at single residential address"
        })

    final_score = min(total_score, 100)

    if final_score >= 70:
        band = "high"
    elif final_score >= 40:
        band = "review"
    else:
        band = "normal"

    return final_score, band, reasons
