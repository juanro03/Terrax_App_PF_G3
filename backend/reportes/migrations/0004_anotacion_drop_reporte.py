from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('reportes', '0003_anotacion_migrar_lote'),  
    ]

    operations = [
        migrations.RemoveField(
            model_name='anotacion',
            name='reporte',
        ),
        migrations.AlterField(
            model_name='anotacion',
            name='lote',
            field=models.ForeignKey(
                related_name='anotaciones',
                null=False, blank=False,
                on_delete=django.db.models.deletion.CASCADE,
                to='lotes.lote'
            ),
        ),
    ]