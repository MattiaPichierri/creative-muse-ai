"""
Creative Muse AI - Email Configuration
Configurazione email con supporto per MailHog in sviluppo
"""

import os
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

class EmailConfig:
    """Configurazione email per Creative Muse AI"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'localhost')
        self.smtp_port = int(os.getenv('SMTP_PORT', '1025'))  # MailHog default
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.smtp_use_tls = os.getenv('SMTP_USE_TLS', 'false').lower() == 'true'
        self.smtp_use_ssl = os.getenv('SMTP_USE_SSL', 'false').lower() == 'true'
        
        # Email settings
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@creative-muse.ai')
        self.from_name = os.getenv('FROM_NAME', 'Creative Muse AI')
        
        # Environment detection
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.is_development = self.environment == 'development'
        
        logger.info(f"Email config initialized - Host: {self.smtp_host}:{self.smtp_port}, Environment: {self.environment}")

    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """
        Invia email utilizzando la configurazione SMTP
        
        Args:
            to_email: Indirizzo email destinatario
            subject: Oggetto dell'email
            body: Corpo dell'email in testo semplice
            html_body: Corpo dell'email in HTML (opzionale)
            
        Returns:
            bool: True se l'email è stata inviata con successo
        """
        try:
            # Crea il messaggio
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Aggiungi il corpo in testo semplice
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Aggiungi il corpo HTML se fornito
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Connetti al server SMTP
            if self.smtp_use_ssl:
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                if self.smtp_use_tls:
                    server.starttls()
            
            # Autenticazione se necessaria
            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)
            
            # Invia l'email
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email inviata con successo a {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Errore nell'invio email a {to_email}: {str(e)}")
            return False

    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str = "") -> bool:
        """
        Invia email di reset password
        
        Args:
            to_email: Email dell'utente
            reset_token: Token di reset
            user_name: Nome dell'utente (opzionale)
            
        Returns:
            bool: True se l'email è stata inviata con successo
        """
        # URL di reset (adatta in base al tuo frontend)
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{base_url}/reset-password?token={reset_token}"
        
        subject = "Reset della Password - Creative Muse AI"
        
        # Corpo in testo semplice
        text_body = f"""
Ciao{' ' + user_name if user_name else ''},

Hai richiesto il reset della password per il tuo account Creative Muse AI.

Clicca sul seguente link per resettare la tua password:
{reset_url}

Questo link scadrà tra 1 ora per motivi di sicurezza.

Se non hai richiesto questo reset, puoi ignorare questa email.

Cordiali saluti,
Il team di Creative Muse AI
        """.strip()
        
        # Corpo HTML
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Password - Creative Muse AI</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Creative Muse AI</h1>
            <h2>Reset della Password</h2>
        </div>
        <div class="content">
            <p>Ciao{' ' + user_name if user_name else ''},</p>
            
            <p>Hai richiesto il reset della password per il tuo account Creative Muse AI.</p>
            
            <p>Clicca sul pulsante qui sotto per resettare la tua password:</p>
            
            <p style="text-align: center;">
                <a href="{reset_url}" class="button">Reset Password</a>
            </p>
            
            <p>Oppure copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                {reset_url}
            </p>
            
            <p><strong>Importante:</strong> Questo link scadrà tra 1 ora per motivi di sicurezza.</p>
            
            <p>Se non hai richiesto questo reset, puoi ignorare questa email in sicurezza.</p>
            
            <p>Cordiali saluti,<br>Il team di Creative Muse AI</p>
        </div>
        <div class="footer">
            <p>Creative Muse AI - La tua piattaforma per l'innovazione creativa</p>
            <p>Questa è una email automatica, non rispondere a questo messaggio.</p>
        </div>
    </div>
</body>
</html>
        """.strip()
        
        return self.send_email(to_email, subject, text_body, html_body)

    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Invia email di benvenuto per nuovi utenti
        
        Args:
            to_email: Email dell'utente
            user_name: Nome dell'utente
            
        Returns:
            bool: True se l'email è stata inviata con successo
        """
        subject = "Benvenuto in Creative Muse AI! 🎨"
        
        text_body = f"""
Ciao {user_name},

Benvenuto in Creative Muse AI! 🎨

Il tuo account è stato creato con successo. Ora puoi iniziare a esplorare le infinite possibilità creative che la nostra piattaforma AI ha da offrire.

Cosa puoi fare con Creative Muse AI:
• Generare idee creative innovative
• Utilizzare modelli AI avanzati
• Collaborare con il tuo team
• Esportare i tuoi progetti in vari formati

Inizia subito: http://localhost:3000

Se hai domande o hai bisogno di aiuto, non esitare a contattarci.

Buona creatività!
Il team di Creative Muse AI
        """.strip()
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Benvenuto - Creative Muse AI</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
        .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Creative Muse AI</h1>
            <h2>Benvenuto, {user_name}!</h2>
        </div>
        <div class="content">
            <p>Ciao {user_name},</p>
            
            <p>Benvenuto in Creative Muse AI! Il tuo account è stato creato con successo.</p>
            
            <p>Ora puoi iniziare a esplorare le infinite possibilità creative che la nostra piattaforma AI ha da offrire:</p>
            
            <div class="feature">
                <strong>🚀 Generazione Idee</strong><br>
                Crea idee innovative utilizzando i nostri modelli AI avanzati
            </div>
            
            <div class="feature">
                <strong>🤖 Modelli AI</strong><br>
                Accedi a una varietà di modelli AI specializzati
            </div>
            
            <div class="feature">
                <strong>👥 Collaborazione</strong><br>
                Lavora insieme al tuo team sui progetti creativi
            </div>
            
            <div class="feature">
                <strong>📤 Export</strong><br>
                Esporta i tuoi progetti in vari formati
            </div>
            
            <p style="text-align: center;">
                <a href="http://localhost:3000" class="button">Inizia Subito</a>
            </p>
            
            <p>Se hai domande o hai bisogno di aiuto, non esitare a contattarci.</p>
            
            <p>Buona creatività!<br>Il team di Creative Muse AI</p>
        </div>
        <div class="footer">
            <p>Creative Muse AI - La tua piattaforma per l'innovazione creativa</p>
        </div>
    </div>
</body>
</html>
        """.strip()
        
        return self.send_email(to_email, subject, text_body, html_body)

# Istanza globale della configurazione email
email_config = EmailConfig()