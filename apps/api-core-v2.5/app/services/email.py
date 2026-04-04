import asyncio
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings


class EmailDeliveryError(RuntimeError):
    """Raised when transactional email cannot be delivered."""


def _send_email_sync(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> None:
    settings = get_settings()

    if not settings.smtp_host:
        message = (
            f"[email] SMTP not configured. Would send to={to_email} subject={subject}\n{text_body}"
        )
        if settings.env == "production":
            raise EmailDeliveryError("SMTP não configurado para envio em produção")
        print(message)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = to_email
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    if settings.smtp_use_ssl:
        server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)

    try:
        if settings.smtp_use_tls and not settings.smtp_use_ssl:
            server.starttls()
        if settings.smtp_username:
            server.login(settings.smtp_username, settings.smtp_password or "")
        server.send_message(msg)
    finally:
        server.quit()


async def send_email(to_email: str, subject: str, text_body: str, html_body: str | None = None) -> None:
    await asyncio.to_thread(_send_email_sync, to_email, subject, text_body, html_body)


def _verification_bodies(full_name: str | None, verification_url: str) -> tuple[str, str]:
    greeting = full_name or "Olá"
    text_body = (
        f"{greeting},\n\n"
        "Bem-vindo ao Olcan Compass.\n"
        "Clique no link abaixo para verificar seu e-mail e ativar sua conta:\n\n"
        f"{verification_url}\n\n"
        "Se você não criou esta conta, pode ignorar este e-mail."
    )
    html_body = f"""
    <html>
      <body>
        <p>{greeting},</p>
        <p>Bem-vindo ao <strong>Olcan Compass</strong>.</p>
        <p>Clique no link abaixo para verificar seu e-mail e ativar sua conta:</p>
        <p><a href="{verification_url}">{verification_url}</a></p>
        <p>Se você não criou esta conta, pode ignorar este e-mail.</p>
      </body>
    </html>
    """
    return text_body, html_body


def _password_reset_bodies(full_name: str | None, reset_url: str) -> tuple[str, str]:
    greeting = full_name or "Olá"
    text_body = (
        f"{greeting},\n\n"
        "Recebemos um pedido para redefinir sua senha no Olcan Compass.\n"
        "Use o link abaixo para criar uma nova senha:\n\n"
        f"{reset_url}\n\n"
        "Se você não solicitou esta alteração, ignore este e-mail."
    )
    html_body = f"""
    <html>
      <body>
        <p>{greeting},</p>
        <p>Recebemos um pedido para redefinir sua senha no <strong>Olcan Compass</strong>.</p>
        <p>Use o link abaixo para criar uma nova senha:</p>
        <p><a href="{reset_url}">{reset_url}</a></p>
        <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
      </body>
    </html>
    """
    return text_body, html_body


async def send_verification_email(to_email: str, full_name: str | None, verification_url: str) -> None:
    text_body, html_body = _verification_bodies(full_name, verification_url)
    await send_email(
        to_email=to_email,
        subject="Verifique seu e-mail no Olcan Compass",
        text_body=text_body,
        html_body=html_body,
    )


async def send_password_reset_email(to_email: str, full_name: str | None, reset_url: str) -> None:
    text_body, html_body = _password_reset_bodies(full_name, reset_url)
    await send_email(
        to_email=to_email,
        subject="Redefinição de senha no Olcan Compass",
        text_body=text_body,
        html_body=html_body,
    )


async def send_organization_access_request_email(
    requester_email: str,
    requester_name: str | None,
    organization_name: str,
    requested_role: str,
) -> None:
    settings = get_settings()
    requester = requester_name or "Solicitante sem nome"
    text_body = (
        "Novo pedido de onboarding institucional no Olcan Compass.\n\n"
        f"Nome: {requester}\n"
        f"Email: {requester_email}\n"
        f"Organização: {organization_name}\n"
        f"Cargo/Papel: {requested_role}\n"
    )
    html_body = f"""
    <html>
      <body>
        <p>Novo pedido de onboarding institucional no <strong>Olcan Compass</strong>.</p>
        <ul>
          <li><strong>Nome:</strong> {requester}</li>
          <li><strong>Email:</strong> {requester_email}</li>
          <li><strong>Organização:</strong> {organization_name}</li>
          <li><strong>Cargo/Papel:</strong> {requested_role}</li>
        </ul>
      </body>
    </html>
    """
    await send_email(
        to_email=settings.email_from,
        subject="Novo pedido de acesso institucional",
        text_body=text_body,
        html_body=html_body,
    )
