"""
告警规则单元测试
测试模块：app/services/alert_rules.py
"""
import pytest
from app.services.alert_rules import check_alert_rules, DEFAULT_RULES


class TestAlertRulesPerson:
    """测试 person 告警规则"""

    def test_person_above_threshold(self):
        """ALERT-001: person 置信度高于阈值 (0.85 > 0.8)"""
        boxes = [
            {"label": "person", "confidence": 0.85, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1
        assert result[0]["alert_type"] == "intrusion"
        assert result[0]["severity"] == "high"
        assert "置信度" in result[0]["message"]

    def test_person_below_threshold(self):
        """ALERT-002: person 置信度低于阈值 (0.75 < 0.8)"""
        boxes = [
            {"label": "person", "confidence": 0.75, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 0

    def test_person_exact_threshold(self):
        """ALERT-003: person 置信度等于阈值 (0.8 == 0.8)"""
        boxes = [
            {"label": "person", "confidence": 0.8, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1

    def test_person_boundary_079(self):
        """ALERT-004: person 置信度 0.79 (略低于阈值)"""
        boxes = [
            {"label": "person", "confidence": 0.79, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 0

    def test_person_boundary_080(self):
        """ALERT-005: person 置信度 0.80 (等于阈值)"""
        boxes = [
            {"label": "person", "confidence": 0.80, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 1

    def test_person_boundary_081(self):
        """ALERT-006: person 置信度 0.81 (略高于阈值)"""
        boxes = [
            {"label": "person", "confidence": 0.81, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 1


class TestAlertRulesFire:
    """测试 fire 告警规则"""

    def test_fire_above_threshold(self):
        """ALERT-101: fire 置信度高于阈值 (0.7 > 0.6)"""
        boxes = [
            {"label": "fire", "confidence": 0.7, "bbox": [50, 50, 150, 150]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1
        assert result[0]["alert_type"] == "fire"
        assert result[0]["severity"] == "critical"

    def test_fire_below_threshold(self):
        """ALERT-102: fire 置信度低于阈值 (0.5 < 0.6)"""
        boxes = [
            {"label": "fire", "confidence": 0.5, "bbox": [50, 50, 150, 150]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 0

    def test_fire_exact_threshold(self):
        """ALERT-103: fire 置信度等于阈值 (0.6 == 0.6)"""
        boxes = [
            {"label": "fire", "confidence": 0.6, "bbox": [50, 50, 150, 150]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1


class TestAlertRulesKnife:
    """测试 knife 告警规则"""

    def test_knife_above_threshold(self):
        """ALERT-201: knife 置信度高于阈值 (0.8 > 0.7)"""
        boxes = [
            {"label": "knife", "confidence": 0.8, "bbox": [100, 100, 150, 200]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1
        assert result[0]["alert_type"] == "weapon"
        assert result[0]["severity"] == "critical"

    def test_knife_below_threshold(self):
        """ALERT-202: knife 置信度低于阈值 (0.6 < 0.7)"""
        boxes = [
            {"label": "knife", "confidence": 0.6, "bbox": [100, 100, 150, 200]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 0


class TestAlertRulesCar:
    """测试 car 告警规则"""

    def test_car_above_threshold(self):
        """ALERT-301: car 置信度高于阈值 (0.9 > 0.85)"""
        boxes = [
            {"label": "car", "confidence": 0.9, "bbox": [0, 100, 400, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 1
        assert result[0]["alert_type"] == "vehicle"
        assert result[0]["severity"] == "medium"

    def test_car_below_threshold(self):
        """ALERT-302: car 置信度低于阈值 (0.8 < 0.85)"""
        boxes = [
            {"label": "car", "confidence": 0.8, "bbox": [0, 100, 400, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 0


class TestAlertRulesMultiple:
    """测试多目标告警"""

    def test_multiple_same_type(self):
        """ALERT-401: 多个同类型目标，只触发一次告警"""
        boxes = [
            {"label": "person", "confidence": 0.9, "bbox": [100, 100, 200, 300]},
            {"label": "person", "confidence": 0.85, "bbox": [300, 100, 400, 300]},
            {"label": "person", "confidence": 0.82, "bbox": [500, 100, 600, 300]},
        ]
        result = check_alert_rules(boxes)
        
        # 同类型只触发一次
        assert len(result) == 1
        assert result[0]["alert_type"] == "intrusion"

    def test_multiple_different_types(self):
        """ALERT-402: 多个不同类型目标，分别触发告警"""
        boxes = [
            {"label": "person", "confidence": 0.9, "bbox": [100, 100, 200, 300]},
            {"label": "fire", "confidence": 0.7, "bbox": [50, 50, 150, 150]},
            {"label": "car", "confidence": 0.9, "bbox": [0, 100, 400, 300]},
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 3
        alert_types = [r["alert_type"] for r in result]
        assert "intrusion" in alert_types
        assert "fire" in alert_types
        assert "vehicle" in alert_types

    def test_mixed_above_below_threshold(self):
        """ALERT-403: 混合高于/低于阈值的目标"""
        boxes = [
            {"label": "person", "confidence": 0.9, "bbox": [100, 100, 200, 300]},  # 触发
            {"label": "person", "confidence": 0.5, "bbox": [300, 100, 400, 300]},  # 不触发
            {"label": "fire", "confidence": 0.5, "bbox": [50, 50, 150, 150]},      # 不触发
            {"label": "fire", "confidence": 0.7, "bbox": [200, 200, 300, 300]},    # 触发
        ]
        result = check_alert_rules(boxes)
        
        assert len(result) == 2
        alert_types = [r["alert_type"] for r in result]
        assert "intrusion" in alert_types
        assert "fire" in alert_types


class TestAlertRulesEdgeCases:
    """测试边界情况"""

    def test_empty_boxes(self):
        """ALERT-501: 空检测结果"""
        result = check_alert_rules([])
        assert len(result) == 0

    def test_unknown_label(self):
        """ALERT-502: 未知标签不触发告警"""
        boxes = [
            {"label": "dog", "confidence": 0.95, "bbox": [100, 100, 200, 200]},
            {"label": "cat", "confidence": 0.9, "bbox": [300, 100, 400, 200]},
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 0

    def test_missing_confidence(self):
        """ALERT-503: 缺失 confidence 字段"""
        boxes = [
            {"label": "person", "bbox": [100, 100, 200, 300]},
        ]
        result = check_alert_rules(boxes)
        # confidence 默认为 0.0，不触发告警
        assert len(result) == 0

    def test_missing_label(self):
        """ALERT-504: 缺失 label 字段"""
        boxes = [
            {"confidence": 0.9, "bbox": [100, 100, 200, 300]},
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 0

    def test_zero_confidence(self):
        """ALERT-505: 置信度为 0"""
        boxes = [
            {"label": "person", "confidence": 0.0, "bbox": [100, 100, 200, 300]},
        ]
        result = check_alert_rules(boxes)
        assert len(result) == 0


class TestAlertMessageFormat:
    """测试告警消息格式"""

    def test_person_message_format(self):
        """ALERT-601: person 告警消息格式"""
        boxes = [
            {"label": "person", "confidence": 0.85, "bbox": [100, 100, 200, 300]}
        ]
        result = check_alert_rules(boxes)
        
        assert "检测到人员入侵" in result[0]["message"]
        assert "85.0%" in result[0]["message"]

    def test_fire_message_format(self):
        """ALERT-602: fire 告警消息格式"""
        boxes = [
            {"label": "fire", "confidence": 0.75, "bbox": [50, 50, 150, 150]}
        ]
        result = check_alert_rules(boxes)
        
        assert "检测到火焰" in result[0]["message"]
        assert "75.0%" in result[0]["message"]

    def test_knife_message_format(self):
        """ALERT-603: knife 告警消息格式"""
        boxes = [
            {"label": "knife", "confidence": 0.8, "bbox": [100, 100, 150, 200]}
        ]
        result = check_alert_rules(boxes)
        
        # 消息格式：检测到危险物品 (刀)，置信度：80.0%
        assert "检测到危险物品" in result[0]["message"]
        assert "刀" in result[0]["message"]
        assert "80.0%" in result[0]["message"]
