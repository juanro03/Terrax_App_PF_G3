# backend/dashboard/serializers.py
from rest_framework import serializers


class MonthCountSerializer(serializers.Serializer):
    month = serializers.CharField()
    count = serializers.IntegerField()


class UserServiceRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(allow_null=True)
    name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField(allow_blank=True)
    total = serializers.IntegerField()


class DashboardStatsSerializer(serializers.Serializer):
    users = serializers.DictField()
    activities = serializers.DictField()
    reports = serializers.DictField()
    service_requests = serializers.DictField()
    late_notifications = serializers.DictField()
