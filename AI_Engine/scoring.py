import math
from config import TYPE_WEIGHTS, DECAY_LAMBDA

class ScoringEngine:
    def priority_index(self, hazard_type: str, severity_score: float, confidence: float, seconds_since_detection: float) -> float:
        w_type = TYPE_WEIGHTS.get(hazard_type, 0.0)
        T_decay = math.exp(-DECAY_LAMBDA * seconds_since_detection)
        PI = w_type * (severity_score / 100.0) * confidence * T_decay * 100
        return round(PI, 2)

    def resolution_rate(self, resolved: int, total: int) -> float:
        if total == 0:
            return 0.0
        return round((resolved / total) * 100, 2)

    def hotspot_score(self, incidents: list) -> float:
        return sum(i.get('severity_score', 0) * TYPE_WEIGHTS.get(i.get('type', 'pothole'), 0.0) for i in incidents)

    def severity_distribution(self, incidents: list) -> dict:
        dist = {
            'pothole': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0},
            'animal': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0},
            'accident': {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
        }
        for i in incidents:
            hazard = i.get('type')
            label = i.get('severity_label')
            if hazard in dist and label in dist[hazard]:
                dist[hazard][label] += 1
        return dist

    def mean_confidence(self, incidents: list) -> float:
        if not incidents:
            return 0.0
        confs = [i.get('confidence', 0.0) for i in incidents]
        return round(sum(confs) / len(confs), 2)
