from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    email = models.EmailField(unique=True)

    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('productor', 'Productor'),
    ]
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='productor')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

