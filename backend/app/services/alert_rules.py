"""
告警触发规则 (硬编码版本)
后续可扩展为数据库配置
"""
from typing import List, Dict, Optional

# 告警规则: {label: {min_confidence, severity, alert_type}}
DEFAULT_RULES = {
    "person": {
        "min_confidence": 0.8,
        "alert_type": "intrusion",
        "severity": "high",
        "message_template": "检测到人员入侵，置信度: {confidence:.1%}",
    },
    "fire": {
        "min_confidence": 0.6,
        "alert_type": "fire",
        "severity": "critical",
        "message_template": "检测到火焰，置信度: {confidence:.1%}",
    },
    "knife": {
        "min_confidence": 0.7,
        "alert_type": "weapon",
        "severity": "critical",
        "message_template": "检测到危险物品(刀)，置信度: {confidence:.1%}",
    },
    "car": {
        "min_confidence": 0.85,
        "alert_type": "vehicle",
        "severity": "medium",
        "message_template": "检测到车辆，置信度: {confidence:.1%}",
    },
}


def check_alert_rules(boxes: List[Dict]) -> List[Dict]:
    """
    对检测结果应用规则，返回需要触发的告警列表
    每个告警: {alert_type, severity, message, confidence, label}
    """
    triggered = []
    seen_types = set()  # 同一帧同类型只触发一次

    for box in boxes:
        label = box.get("label", "")
        confidence = box.get("confidence", 0.0)
        rule = DEFAULT_RULES.get(label)

        if rule and confidence >= rule["min_confidence"]:
            key = rule["alert_type"]
            if key not in seen_types:
                seen_types.add(key)
                triggered.append({
                    "alert_type": rule["alert_type"],
                    "severity": rule["severity"],
                    "message": rule["message_template"].format(confidence=confidence),
                    "confidence": confidence,
                    "label": label,
                })

    return triggered
