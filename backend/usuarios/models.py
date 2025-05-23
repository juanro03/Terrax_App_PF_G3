from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    email = models.EmailField(unique=True)

    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('productor', 'Productor'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='productor')

    imagen_perfil = models.ImageField(upload_to='perfiles/', default='imagenes/user.jpg')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'imagen_perfil']

