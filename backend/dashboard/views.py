from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncMonth

from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import DashboardStatsSerializer

# MODELOS REALES QUE USÁS
from tareas.models import Tarea                    # Actividades
from reportes.models import Reporte                # Reportes
from campos.models import Servicio                 # Solicitudes de servicio

User = get_user_model()


class DashboardStatsView(APIView):
    """
    Retorna todos los números y listas necesarias para el dashboard admin.
    (SIN seguridad por ahora)
    """

    def get(self, request, *args, **kwargs):

        # ------------------------
        # 1) USUARIOS
        # ------------------------
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        total_users = active_users + inactive_users

        # ------------------------
        # 2) ACTIVIDADES (Tarea)
        # ------------------------
        total_activities = Tarea.objects.count()

        activities_by_month_qs = (
            Tarea.objects
            .annotate(month=TruncMonth("fecha"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        activities_by_month = [
            {
                "month": x["month"].strftime("%Y-%m"),
                "count": x["count"]
            }
            for x in activities_by_month_qs
        ]

        # ------------------------
        # 3) REPORTES (Reporte)
        # ------------------------
        total_reports = Reporte.objects.count()

        reports_by_month_qs = (
            Reporte.objects
            .annotate(month=TruncMonth("fecha_reporte"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        reports_by_month = [
            {
                "month": x["month"].strftime("%Y-%m"),
                "count": x["count"]
            }
            for x in reports_by_month_qs
        ]

        # ------------------------
        # 4) SOLICITUDES DE SERVICIO (Servicio)
        # ------------------------
        total_service_requests = Servicio.objects.count()

        service_requests_by_user_qs = (
            Servicio.objects
            .values(
                "usuario__id",
                "usuario__first_name",
                "usuario__last_name",
                "usuario__email"
            )
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        service_requests_by_user = [
            {
                "user_id": row["usuario__id"],
                "name": f"{row['usuario__first_name']} {row['usuario__last_name']}".strip(),
                "email": row["usuario__email"] or "",
                "total": row["total"],
            }
            for row in service_requests_by_user_qs
        ]

        # ------------------------
        # 5) NOTIFICACIONES DE MORA (desactivado por ahora)
        # ------------------------
        total_late_notifications = 0
        users_with_late_notifications = 0

        # ------------------------
        # RESPUESTA FINAL
        # ------------------------
        data = {
            "users": {
                "total": total_users,
                "active": active_users,
                "inactive": inactive_users,
            },
            "activities": {
                "total": total_activities,
                "by_month": activities_by_month,
            },
            "reports": {
                "total": total_reports,
                "by_month": reports_by_month,
            },
            "service_requests": {
                "total": total_service_requests,
                "by_user": service_requests_by_user,
            },
            "late_notifications": {
                "total": total_late_notifications,
                "users_with_late": users_with_late_notifications,
            },
        }

        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
