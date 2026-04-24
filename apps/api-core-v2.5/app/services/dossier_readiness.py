"""
Unified Dossier Readiness Algorithm (v1.0.0)

Single source of truth for readiness scoring on the backend.
Mirrors apps/app-compass-v2.5/src/lib/dossier-readiness.ts — any change
to weights or dimension logic MUST be applied in both files.

Weights: documents 40% · tasks 30% · profile 20% · deadline 10%
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

READINESS_WEIGHTS: Dict[str, float] = {
    "documents": 0.40,
    "tasks": 0.30,
    "profile": 0.20,
    "deadline": 0.10,
}

ALGORITHM_VERSION = "1.0.0"


def _score_documents(docs: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not docs:
        return {
            "score": 0,
            "explanation": "No documents yet. Add the required documents to start scoring.",
        }

    weighted_sum = 0.0
    final_count = 0

    for doc in docs:
        status = (doc.get("status") or "not_started")
        try:
            completion = float(doc.get("completion_percentage", 0) or 0)
        except (TypeError, ValueError):
            completion = 0.0
        metrics = doc.get("metrics") or {}
        if not isinstance(metrics, dict):
            metrics = {}

        if status in ("final", "polished", "submitted"):
            completeness = 100.0
            final_count += 1
        elif status == "review":
            completeness = max(completion, 75.0)
        else:
            completeness = completion

        quality_signals = []
        for key in ("ats_score", "competitiveness_score", "alignment_score"):
            value = metrics.get(key)
            if isinstance(value, (int, float)):
                quality_signals.append(float(value))
        quality = (
            sum(quality_signals) / len(quality_signals)
            if quality_signals
            else 100.0
        )

        weighted_sum += completeness * (quality / 100.0)

    avg = weighted_sum / len(docs)
    return {
        "score": round(avg),
        "explanation": f"{final_count}/{len(docs)} documents final; avg score {round(avg)}/100",
    }


def _score_tasks(tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not tasks:
        return {
            "score": 50,
            "explanation": "No tasks defined yet. Generate a checklist to track preparation.",
        }

    active = [t for t in tasks if t.get("status") != "cancelled"]
    if not active:
        return {
            "score": 50,
            "explanation": "All tasks cancelled. Re-plan the dossier.",
        }

    done = sum(1 for t in active if t.get("status") == "done")
    in_progress = sum(1 for t in active if t.get("status") == "in_progress")
    blocked = sum(1 for t in active if t.get("status") == "blocked")

    raw = (done + in_progress * 0.5 - blocked * 0.25) / len(active)
    score = max(0, min(100, round(raw * 100)))

    return {
        "score": score,
        "explanation": f"{done}/{len(active)} tasks done, {in_progress} in progress, {blocked} blocked",
    }


def _score_profile(profile: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not profile or not isinstance(profile, dict):
        return {
            "score": 0,
            "explanation": "Profile snapshot not captured yet. Complete the OIOS diagnostic.",
        }

    keys = ("logistic", "narrative", "performance", "psychological")
    values = [
        float(profile[k])
        for k in keys
        if isinstance(profile.get(k), (int, float))
    ]

    if not values:
        return {
            "score": 0,
            "explanation": "Profile present but no readiness scores. Complete the OIOS diagnostic.",
        }

    avg = sum(values) / len(values)
    return {
        "score": round(avg),
        "explanation": f"OIOS average across {len(values)} dimensions: {round(avg)}/100",
    }


def _score_deadline(
    deadline: Optional[datetime],
    dossier_status: Optional[str],
    now: datetime,
) -> Dict[str, Any]:
    if dossier_status in ("submitted", "completed"):
        return {
            "score": 100,
            "explanation": "Dossier submitted. Deadline no longer gates readiness.",
        }
    if not deadline:
        return {
            "score": 50,
            "explanation": "No deadline set. Cannot assess time pressure.",
        }

    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    days_remaining = (deadline - now).days

    if days_remaining < 0:
        is_final = dossier_status in ("final", "review", "finalizing")
        return {
            "score": 40 if is_final else 0,
            "explanation": (
                f"Deadline passed {-days_remaining} days ago. "
                + (
                    "Dossier marked final — submit now."
                    if is_final
                    else "At risk of missing."
                )
            ),
        }

    if days_remaining >= 90:
        score = 100
    elif days_remaining >= 60:
        score = 90
    elif days_remaining >= 30:
        score = 75
    elif days_remaining >= 14:
        score = 55
    elif days_remaining >= 7:
        score = 35
    elif days_remaining >= 3:
        score = 20
    else:
        score = 10

    return {"score": score, "explanation": f"{days_remaining} days until deadline."}


def compute_readiness(
    documents: Optional[List[Dict[str, Any]]] = None,
    tasks: Optional[List[Dict[str, Any]]] = None,
    profile_scores: Optional[Dict[str, Any]] = None,
    deadline: Optional[datetime] = None,
    dossier_status: Optional[str] = None,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Compute dossier readiness using the unified 40/30/20/10 algorithm.

    Mirrors the TypeScript implementation in
    apps/app-compass-v2.5/src/lib/dossier-readiness.ts.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    documents_r = _score_documents(documents or [])
    tasks_r = _score_tasks(tasks or [])
    profile_r = _score_profile(profile_scores)
    deadline_r = _score_deadline(deadline, dossier_status, now)

    components = {
        "documents": {
            "score": documents_r["score"],
            "weight": READINESS_WEIGHTS["documents"],
            "contribution": documents_r["score"] * READINESS_WEIGHTS["documents"],
            "explanation": documents_r["explanation"],
        },
        "tasks": {
            "score": tasks_r["score"],
            "weight": READINESS_WEIGHTS["tasks"],
            "contribution": tasks_r["score"] * READINESS_WEIGHTS["tasks"],
            "explanation": tasks_r["explanation"],
        },
        "profile": {
            "score": profile_r["score"],
            "weight": READINESS_WEIGHTS["profile"],
            "contribution": profile_r["score"] * READINESS_WEIGHTS["profile"],
            "explanation": profile_r["explanation"],
        },
        "deadline": {
            "score": deadline_r["score"],
            "weight": READINESS_WEIGHTS["deadline"],
            "contribution": deadline_r["score"] * READINESS_WEIGHTS["deadline"],
            "explanation": deadline_r["explanation"],
        },
    }

    overall = round(sum(c["contribution"] for c in components.values()))
    overall = max(0, min(100, overall))

    return {
        "overall": overall,
        "components": components,
        "computed_at": now.isoformat(),
        "version": ALGORITHM_VERSION,
    }
