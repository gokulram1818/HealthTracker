import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

def send_portal_registration_email(user):
    """
    Sends a welcome email to a user who has been registered on the Health Tracker portal.
    """
    if not user.email:
        logger.warning("Attempted to send registration email to a user with no email address.")
        return False

    subject = "Welcome to Health Tracker Portal!"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Health Tracker <noreply@healthtracker.com>')
    to_email = [user.email]

    user_name = user.name if user.name else user.email
    role_display = dict(user.ROLE_CHOICES).get(user.role, user.role).title()

    text_content = f"""Hello {user_name},

Welcome to Health Tracker! Your account has been successfully registered.

Account Details:
- Email: {user.email}
- Role: {role_display}

You can now log in to access your health records, check upcoming vaccinations, and register for health camps.

Thank you,
Health Tracker Team
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #0f766e, #0d9488); padding: 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
            .content {{ padding: 30px; line-height: 1.6; }}
            .info-box {{ background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }}
            .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px; text-align: center; font-size: 13px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Health Tracker</h1>
            </div>
            <div class="content">
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>Welcome to <strong>Health Tracker Portal</strong>! Your account registration is complete.</p>
                
                <div class="info-box">
                    <p style="margin: 4px 0;"><strong>Account Email:</strong> {user.email}</p>
                    <p style="margin: 4px 0;"><strong>Account Role:</strong> {role_display}</p>
                </div>
                
                <p>You can now log in to view your health records, monitor scheduled vaccinations, and participate in health camps.</p>
            </div>
            <div class="footer">
                &copy; Health Tracker System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Portal registration email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send portal registration email to {user.email}: {e}")
        return False


def send_camp_registration_email(user, camp, registered_by=None):
    """
    Sends an email confirmation when a user is registered for a health camp.
    """
    if not user.email:
        logger.warning("Attempted to send camp registration email to a user with no email address.")
        return False

    subject = f"Health Camp Registration Confirmation - {camp.vaccine_type}"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Health Tracker <noreply@healthtracker.com>')
    to_email = [user.email]

    user_name = user.name if user.name else user.email
    admin_note = ""
    if registered_by and registered_by != user:
        registrar_name = registered_by.name if registered_by.name else registered_by.email
        admin_note = f" (Registered on your behalf by {registrar_name})"

    text_content = f"""Hello {user_name},

You have been successfully registered for an upcoming Health Camp{admin_note}.

Camp Details:
- Vaccine Type: {camp.vaccine_type}
- Location: {camp.location}
- Date: {camp.date}
{f"- Description: {camp.description}" if camp.description else ""}

Please make sure to arrive at the venue on time with a valid ID.

Best regards,
Health Tracker Team
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 600; }}
            .content {{ padding: 30px; line-height: 1.6; }}
            .camp-card {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 20px; margin: 20px 0; }}
            .camp-card p {{ margin: 6px 0; }}
            .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px; text-align: center; font-size: 13px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Health Camp Registration Confirmation</h1>
            </div>
            <div class="content">
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>You have been successfully registered for an upcoming Health Camp{admin_note}.</p>
                
                <div class="camp-card">
                    <p><strong>Vaccine Type:</strong> {camp.vaccine_type}</p>
                    <p><strong>Location:</strong> {camp.location}</p>
                    <p><strong>Date:</strong> {camp.date}</p>
                    {f'<p><strong>Notes:</strong> {camp.description}</p>' if camp.description else ''}
                </div>
                
                <p>Please arrive at the camp location on the scheduled date.</p>
            </div>
            <div class="footer">
                &copy; Health Tracker System. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Camp registration email sent to {user.email} for camp {camp.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send camp registration email to {user.email}: {e}")
        return False
