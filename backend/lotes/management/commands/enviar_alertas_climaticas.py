# lotes/management/commands/enviar_alertas_climaticas.py

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

        for lote in lotes:
            # Si no tiene coordenadas, no tiene sentido consultar clima
            if not lote.coordenadas:
                continue

            eventos, lat, lon = obtener_alertas_para_lote(lote.coordenadas)

            if not eventos:
                continue

            # Filtrar solo alertas nuevas (no repetidas)
            nuevas = []
            for e in eventos:
                tipo = e.get("tipo")
                nivel = e.get("nivel")
                mensaje = e.get("mensaje")
                valor = e.get("valor")

                # Consideramos "igual" una alerta misma combinación lote+tipo+nivel+mensaje
                existe = AlertaClimatica.objects.filter(
                    lote=lote,
                    tipo=tipo,
                    nivel=nivel,
                    mensaje=mensaje,
                ).exists()

                if not existe:
                    AlertaClimatica.objects.create(
                        lote=lote,
                        tipo=tipo,
                        mensaje=mensaje,
                        valor_detectado=valor,
                        nivel=nivel,
                        fuente="openweather",
                    )
                    nuevas.append(e)

            # Si no hay alertas nuevas, no mandamos mail
            if not nuevas:
                continue

            # Obtener mail del propietario del campo
            propietario = getattr(lote.campo, "propietario", None)
            email_destino = getattr(propietario, "email", None) if propietario else None

            if not email_destino:
                continue

            # Armar cuerpo del mail
            lineas = []
            for a in nuevas:
                lineas.append(
                    f"- {a.get('fecha')} | "
                    f"{a.get('tipo', '').upper()} "
                    f"({a.get('nivel', '').upper()}): "
                    f"{a.get('mensaje')}"
                )

            nombre_destinatario = propietario.first_name or propietario.username

            # Texto plano (fallback)
            text_content = (
                f"Hola {nombre_destinatario},\n\n"
                f"Se detectaron {len(nuevas)} nuevas alertas climáticas para el lote "
                f"'{lote.nombre}' del campo '{lote.campo.nombre}'.\n\n"
                "Resumen:\n"
                + "\n".join(lineas)
                + "\n\nIngresá a Terrax para ver el detalle completo en el módulo de Alertas Climáticas."
            )

            # HTML con logo + resumen
            html_items = "".join(
                f"<li><strong>{a.get('fecha')}</strong> – "
                f"{a.get('tipo', '').upper()} ({a.get('nivel', '').upper()}): "
                f"{a.get('mensaje')}</li>"
                for a in nuevas
            )

            html_content = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 640px; margin: 0 auto; padding: 16px; border-radius: 12px; border: 1px solid #e0e0e0; background: #f9faf9;">
      <!-- LOGO TERRAX -->
      <div style="text-align: center; margin-bottom: 16px;">
        <img
  src="cid:terrax_logo"
  alt="Terrax"
  style="
    display: block;
    margin: 0 auto 8px auto;
    max-width: 320px;
    width: 100%;
    height: auto;
  "
/>
      </div>

      <h2 style="color: #155a36; margin-bottom: 8px; text-align: center;">
        Nuevas alertas climáticas
      </h2>

      <p>Hola {nombre_destinatario},</p>

      <p>
        Se detectaron <strong>{len(nuevas)} nuevas alertas climáticas</strong> para el lote
        <strong>{lote.nombre}</strong> del campo <strong>{lote.campo.nombre}</strong>.
      </p>

      <h3 style="margin-top: 18px;">Resumen:</h3>
      <ul>
        {html_items}
      </ul>

      <p style="margin-top: 18px;">
        Ingresá a <strong>Terrax</strong> para ver el detalle completo en el módulo de
        <em>Alertas Climáticas</em>.
      </p>

      <hr style="margin: 20px 0;" />

      <p style="font-size: 12px; color: #777; text-align: center;">
        Este es un mensaje automático generado por Terrax. Por favor, no respondas a este correo.
      </p>
    </div>
  </body>
</html>
"""

            subject = f"[Terrax] Nuevas alertas climáticas - Lote {lote.nombre}"
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,      # versión texto
                from_email=from_email,
                to=[email_destino],
            )

            # Adjuntamos la versión HTML
            msg.attach_alternative(html_content, "text/html")

            # Adjuntamos el logo como imagen embebida (cid:terrax_logo)
            try:
                logo_path = settings.BASE_DIR / "backend" / "static" / "img" / "terrax_logo.png"
                with open(logo_path, "rb") as f:
                    logo = MIMEImage(f.read())
                logo.add_header("Content-ID", "<terrax_logo>")
                logo.add_header("Content-Disposition", "inline", filename="terrax_logo.png")
                msg.attach(logo)
            except FileNotFoundError:
                # Si no encuentra el logo, simplemente manda el mail sin imagen
                pass
            # Enviar mail
            msg.send(fail_silently=True)

            self.stdout.write(self.style.SUCCESS(
                f"Se enviaron {len(nuevas)} alertas nuevas por mail para el lote {lote.nombre}"
            ))
