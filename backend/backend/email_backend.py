# backend/email_backend.py
import ssl
from django.core.mail.backends.smtp import EmailBackend


class UnverifiedTLSEmailBackend(EmailBackend):
    """
    Backend SMTP que usa TLS pero sin verificar el certificado.
    SOLO PARA DESARROLLO. No usar en producción.
    """

    def open(self):
        """
        Copia del open() original, pero pasando un ssl_context sin verificación.
        """
        if self.connection:
            return False

        # self.connection_class normalmente es smtplib.SMTP
        self.connection = self.connection_class(
            self.host, self.port, timeout=self.timeout
        )

        self.connection.ehlo()

        # Contexto que NO verifica certificados
        context = ssl._create_unverified_context()

        if self.use_tls:
            self.connection.starttls(context=context)
            self.connection.ehlo()

        if self.username and self.password:
            self.connection.login(self.username, self.password)

        return True
# Nota: Asegurarse de configurar EMAIL_BACKEND en settings.py para usar este backend