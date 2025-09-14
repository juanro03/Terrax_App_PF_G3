from django.db import migrations, models
import django.db.models.deletion

def copiar_reporte_a_lote(apps, schema_editor):
    Anotacion = apps.get_model('reportes', 'Anotacion')
    Reporte = apps.get_model('reportes', 'Reporte')

    # Si la tabla aún tiene la columna reporte_id:
    if 'reporte_id' in [f.attname for f in Anotacion._meta.fields]:
        for a in Anotacion.objects.all().iterator():
            if getattr(a, 'reporte_id', None):
                try:
                    rep = Reporte.objects.get(pk=a.reporte_id)
                    a.lote_id = rep.lote_id
                    a.save(update_fields=['lote'])
                except Reporte.DoesNotExist:
                    pass

class Migration(migrations.Migration):

    dependencies = [
        ('lotes', '0001_initial'),     # ajustá a tu nombre real
        ('reportes', '0002_anotacion'),     # ajustá al último número anterior
    ]

    operations = [
        migrations.AddField(
            model_name='anotacion',
            name='lote',
            field=models.ForeignKey(
                related_name='anotaciones',
                null=True, blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                to='lotes.lote'
            ),
        ),
        migrations.RunPython(copiar_reporte_a_lote, reverse_code=migrations.RunPython.noop),
    ]