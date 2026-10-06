import networkx as nx
import pandas as pd
from typing import Dict, List, Any
from .cleaning import normalize_name, normalize_mobile, normalize_account, mask_account, mask_mobile
from .rules import evaluate_signals

def build_student_graph_from_records(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a bipartite/multipartite graph from student records and extracts
    anomaly clusters based on shared identifier nodes (Bank, Mobile, Aadhaar/Doc).
    """
    G = nx.Graph()

    for r in records:
        sid = str(r.get("Student_ID", r.get("student_id", "")))
        sname = r.get("Student_Name", r.get("name", "Student"))
        sclass = r.get("Class", r.get("course", "N/A"))
        acc = normalize_account(str(r.get("Account_No", r.get("account_no", ""))))
        mob = normalize_mobile(str(r.get("Contact_No", r.get("mobile", ""))))
        aadhaar = str(r.get("Aadhaar_No", r.get("aadhaar", ""))).strip()
        adm = str(r.get("Admission_No", ""))

        student_node = f"STUDENT_{sid}"
        G.add_node(student_node, type="student", label=sname, details=f"Class: {sclass} | Adm #{adm}", raw=r)

        if acc:
            bank_node = f"BANK_{acc}"
            G.add_node(bank_node, type="bank", label=f"Acc ••••{acc[-4:] if len(acc)>=4 else acc}", raw_id=acc)
            G.add_edge(student_node, bank_node, label="PAID_TO")

        if mob:
            mob_node = f"MOB_{mob}"
            G.add_node(mob_node, type="mobile", label=f"Mob {mask_mobile(mob)}", raw_id=mob)
            G.add_edge(student_node, mob_node, label="USES_MOBILE")

        if aadhaar and aadhaar.lower() != "nan" and len(aadhaar) >= 8:
            doc_node = f"DOC_{aadhaar}"
            G.add_node(doc_node, type="document", label=f"Aadhaar ••••{aadhaar[-4:]}", raw_id=aadhaar)
            G.add_edge(student_node, doc_node, label="HAS_DOCUMENT")

    # Find connected components over shared identifier links
    # A cluster must contain at least 2 students linked via shared nodes
    detected_clusters = []
    cluster_idx = 1

    for comp in nx.connected_components(G):
        sub = G.subgraph(comp)
        students_in_comp = [n for n in sub.nodes() if sub.nodes[n].get("type") == "student"]

        if len(students_in_comp) >= 2:
            # Shared identifiers check
            banks = [n for n in sub.nodes() if sub.nodes[n].get("type") == "bank"]
            mobiles = [n for n in sub.nodes() if sub.nodes[n].get("type") == "mobile"]
            docs = [n for n in sub.nodes() if sub.nodes[n].get("type") == "document"]

            score, band, reasons = evaluate_signals(
                num_students=len(students_in_comp),
                num_institutions=1,
                shared_bank_count=len(banks) if any(sub.degree(b) > 1 for b in banks) else 0,
                shared_mobile_count=len(mobiles) if any(sub.degree(m) > 1 for m in mobiles) else 0,
                mean_attendance=24.5,
                has_shared_doc=any(sub.degree(d) > 1 for d in docs)
            )

            # Build sub-graph nodes and edges for 3D visualization
            nodes_out = []
            for n in sub.nodes():
                nd = sub.nodes[n]
                ntype = nd.get("type", "student")
                is_shared = sub.degree(n) > 1 and ntype != "student"
                risk_lvl = "high" if is_shared else ("flagged" if ntype == "student" else "normal")
                nodes_out.append({
                    "id": n,
                    "label": nd.get("label", n),
                    "type": ntype,
                    "risk": risk_lvl,
                    "is_shared": is_shared,
                    "details": nd.get("details", "")
                })

            edges_out = []
            for u, v, data in sub.edges(data=True):
                is_flagged = sub.degree(u) > 1 or sub.degree(v) > 1
                edges_out.append({
                    "source": u,
                    "target": v,
                    "label": data.get("label", "LINK"),
                    "flagged": is_flagged
                })

            student_details = []
            for s in students_in_comp:
                raw_data = sub.nodes[s].get("raw", {})
                student_details.append({
                    "id": str(raw_data.get("Student_ID", s)),
                    "name": raw_data.get("Student_Name", "Student"),
                    "institution": f"J&K Government School (Adm #{raw_data.get('Admission_No', 'N/A')})",
                    "institution_id": "INST-LOCAL-01",
                    "course": f"Class {raw_data.get('Class', 'N/A')}",
                    "year": f"DOB: {raw_data.get('DOB', 'N/A')}",
                    "attendance": 25,
                    "bank_masked": mask_account(str(raw_data.get("Account_No", ""))),
                    "mobile_masked": mask_mobile(str(raw_data.get("Contact_No", ""))),
                    "address": f"Father: {raw_data.get('Father_Name', '')}",
                    "amount": 15000,
                    "scheme": f"Category: {raw_data.get('Category', 'Gen')}",
                    "doc_hash": f"Aadhaar {str(raw_data.get('Aadhaar_No', ''))[-4:]}",
                    "status": "Flagged"
                })

            detected_clusters.append({
                "id": f"CL-LIVE-{cluster_idx:02d}",
                "title": f"Convergence Cluster #{cluster_idx} ({len(students_in_comp)} Students)",
                "pattern": f"{len(students_in_comp)} students share identifier links across accounts or contacts",
                "score": score,
                "band": band,
                "status": "open",
                "is_hero": False,
                "created_at": "Just now (Live Scan)",
                "counts": {
                    "students": len(students_in_comp),
                    "institutions": 1,
                    "banks": len(banks),
                    "mobiles": len(mobiles),
                    "addresses": 1,
                    "documents": len(docs)
                },
                "reasons": reasons,
                "students": student_details,
                "timeline": [
                    {"time": "Just now", "officer": "Live NetworkX Engine", "action": "Cluster Extracted", "note": f"Graph partitioned {len(students_in_comp)} linked identities"}
                ],
                "graph": {
                    "nodes": nodes_out,
                    "edges": edges_out
                }
            })
            cluster_idx += 1

    return {
        "clusters": detected_clusters,
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges()
    }
