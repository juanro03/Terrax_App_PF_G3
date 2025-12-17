from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage

from lotes.models import Lote, AlertaClimatica
from lotes.services import obtener_alertas_para_lote


class Command(BaseCommand):
    help = "Consulta alertas climáticas para todos los lotes y envía mails a los productores."

    def handle(self, *args, **options):
        lotes = Lote.objects.select_related("campo__propietario")

        if not lotes.exists():
            self.stdout.write(self.style.WARNING("⚠️ No hay lotes en la base de datos"))
            return

        for lote in lotes:
            self.stdout.write(f"\n🔄 Procesando lote: {lote.nombre}")

            # 1️⃣ Validar coordenadas
            if not lote.coordenadas:
                self.stdout.write(self.style.ERROR("❌ Lote sin coordenadas"))
                continue

            # 2️⃣ Consultar servicio climático
            try:
                eventos, lat, lon = obtener_alertas_para_lote(lote.coordenadas)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"🔥 Error consultando clima: {e}"))
                continue

            self.stdout.write(f"🌦 Eventos obtenidos: {eventos}")

            if not eventos:
                self.stdout.write(self.style.WARNING("⚠️ No hay eventos climáticos"))
                continue

            nuevas = []

            # 3️⃣ Crear alertas nuevas
            for e in eventos:
                tipo = e.get("tipo")
                nivel = e.get("nivel")
                mensaje = e.get("mensaje")
                valor = e.get("valor")

                existe = AlertaClimatica.objects.filter(
                    lote=lote,
                    tipo=tipo,
                    nivel=nivel,
                    mensaje=mensaje,
                ).exists()

                if existe:
                    self.stdout.write(
                        self.style.WARNING(f"↩️ Alerta ya existente: {mensaje}")
                    )
                    continue

                AlertaClimatica.objects.create(
                    lote=lote,
                    tipo=tipo,
                    mensaje=mensaje,
                    valor_detectado=valor,
                    nivel=nivel,
                    fuente="openweather",
                )

                nuevas.append(e)
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Alerta creada: {tipo} ({nivel})")
                )

            if not nuevas:
                self.stdout.write(self.style.SUCCESS("ℹ️ No hay alertas nuevas"))
                continue

            # 4️⃣ Enviar mail (opcional)
            propietario = getattr(lote.campo, "propietario", None)
            email_destino = getattr(propietario, "email", None) if propietario else None

            if not email_destino:
                self.stdout.write(
                    self.style.WARNING("📭 No se envía mail: propietario sin email")
                )
                continue

            nombre_destinatario = (
                propietario.first_name or propietario.username or "Productor"
            )

            lineas = [
                f"- {a.get('mensaje')} ({a.get('nivel').upper()})"
                for a in nuevas
            ]

            text_content = (
                f"Hola {nombre_destinatario},\n\n"
                f"Se detectaron {len(nuevas)} nuevas alertas climáticas "
                f"para el lote '{lote.nombre}'.\n\n"
                "Resumen:\n"
                + "\n".join(lineas)
                + "\n\nIngresá a Terrax para más información."
            )

            subject = f"[Terrax] Alertas climáticas - Lote {lote.nombre}"
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=[email_destino],
            )

            try:
                logo_path = settings.BASE_DIR / "backend" / "static" / "img" / "terrax_logo.png"
                with open(logo_path, "rb") as f:
                    logo = MIMEImage(f.read())
                logo.add_header("Content-ID", "<terrax_logo>")
                logo.add_header("Content-Disposition", "inline", filename="terrax_logo.png")
                msg.attach(logo)
            except FileNotFoundError:
                pass

            msg.send(fail_silently=True)

            self.stdout.write(
                self.style.SUCCESS(
                    f"📧 Mail enviado a {email_destino} ({len(nuevas)} alertas)"
                )
            )

        self.stdout.write(self.style.SUCCESS("\n🏁 Proceso finalizado"))
