import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_authority_notification(alert_data):
    """
    Sends an automated email alert to the registered authority email.
    Uses SMTP configuration from environment or settings.
    """
    # These would normally come from your app config/settings
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USER = os.environ.get('SMTP_USER', 'alerts@divyadrishti.org')
    SMTP_PASS = os.environ.get('SMTP_PASS', 'secret_pass_123')
    RECEIVER_EMAIL = os.environ.get('RECEIVER_EMAIL', 'shloktechnical@gmail.com')

    subject = f"🚨 CRITICAL HAZARD ALERT: {alert_data['hazard_type'].upper()}"
    
    body = f"""
    DIVYADRISHTI NEURAL COMMAND CENTER - INCIDENT REPORT
    --------------------------------------------------
    Hazard Type: {alert_data['hazard_type']}
    Severity: {alert_data['severity_label']}
    Risk Score: {alert_data['severity_score']}/100
    Frame Reference: {alert_data.get('frame', 'N/A')}
    Timestamp: {alert_data.get('time', 'N/A')}
    
    Status: UNACKNOWLEDGED - IMMEDIATE INTERVENTION REQUIRED
    
    This is an automated notification from the DivyaDrishti AI Inference Engine.
    Please login to the Command Hub to view the visual evidence and acknowledge the incident.
    """

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = RECEIVER_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # In a hackathon environment, we log the email content unless real SMTP is configured
        logger.info(f"Dispatching SMTP Alert to {RECEIVER_EMAIL} for {alert_data['hazard_type']}...")
        
        # Uncomment below for real SMTP dispatch
        # with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        #     server.set_debuglevel(1)
        #     server.starttls()
        #     server.login(SMTP_USER, SMTP_PASS)
        #     server.send_message(msg)
        
        logger.info("SMTP DISPATCH SUCCESSFUL (Simulation Mode)")
        return True
    except Exception as e:
        logger.error(f"SMTP DISPATCH FAILED: {str(e)}")
        return False
