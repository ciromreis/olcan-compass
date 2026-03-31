"""
Email Service

Handles email notifications for orders, confirmations, and user communications.
"""

from typing import Optional, List, Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import os
from jinja2 import Template

from ..core.config import settings


class EmailService:
    """Service for sending emails"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@olcan.com')
        self.from_name = os.getenv('FROM_NAME', 'Olcan Compass')
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send email
        
        Args:
            to_email: Recipient email
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text fallback
            
        Returns:
            Success status
        """
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    async def send_order_confirmation(
        self,
        to_email: str,
        order_data: Dict[str, Any]
    ) -> bool:
        """Send order confirmation email"""
        
        subject = f"Order Confirmation - {order_data['order_number']}"
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
                .total { font-size: 1.2em; font-weight: bold; color: #667eea; margin-top: 20px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You for Your Order!</h1>
                    <p>Order #{{ order_number }}</p>
                </div>
                <div class="content">
                    <p>Hi {{ customer_name }},</p>
                    <p>We've received your order and are processing it now. You'll receive another email when your order ships.</p>
                    
                    <div class="order-details">
                        <h2>Order Details</h2>
                        {% for item in items %}
                        <div class="item">
                            <strong>{{ item.name }}</strong><br>
                            Quantity: {{ item.quantity }} × ${{ "%.2f"|format(item.price) }}
                        </div>
                        {% endfor %}
                        
                        <div class="total">
                            Total: ${{ "%.2f"|format(total) }}
                        </div>
                    </div>
                    
                    {% if shipping_address %}
                    <div class="order-details">
                        <h3>Shipping Address</h3>
                        <p>
                            {{ shipping_address.full_name }}<br>
                            {{ shipping_address.address_line1 }}<br>
                            {% if shipping_address.address_line2 %}{{ shipping_address.address_line2 }}<br>{% endif %}
                            {{ shipping_address.city }}, {{ shipping_address.state }} {{ shipping_address.postal_code }}
                        </p>
                    </div>
                    {% endif %}
                    
                    <a href="{{ order_url }}" class="button">View Order Details</a>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    <p>Best regards,<br>The Olcan Team</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(html_template)
        html_content = template.render(**order_data)
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_order_shipped(
        self,
        to_email: str,
        order_number: str,
        tracking_number: str,
        tracking_url: Optional[str] = None
    ) -> bool:
        """Send order shipped notification"""
        
        subject = f"Your Order Has Shipped - {order_number}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Your Order Has Shipped!</h1>
                <p>Great news! Your order #{order_number} is on its way.</p>
                <p><strong>Tracking Number:</strong> {tracking_number}</p>
                {f'<p><a href="{tracking_url}" style="color: #667eea;">Track Your Package</a></p>' if tracking_url else ''}
                <p>Thank you for shopping with Olcan!</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_digital_product_delivery(
        self,
        to_email: str,
        product_name: str,
        download_url: str,
        expires_at: Optional[str] = None
    ) -> bool:
        """Send digital product download link"""
        
        subject = f"Your Digital Product: {product_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Your Digital Product is Ready!</h1>
                <p>Thank you for your purchase of <strong>{product_name}</strong>.</p>
                <p>Click the button below to download your product:</p>
                <a href="{download_url}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Download Now</a>
                {f'<p style="color: #ef4444;"><small>This download link expires on {expires_at}</small></p>' if expires_at else ''}
                <p>If you have any issues, please contact our support team.</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_service_booking_confirmation(
        self,
        to_email: str,
        service_name: str,
        provider_name: str,
        scheduled_at: str,
        booking_details: Dict[str, Any]
    ) -> bool:
        """Send service booking confirmation"""
        
        subject = f"Service Booking Confirmed: {service_name}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Service Booking Confirmed</h1>
                <p>Your booking for <strong>{service_name}</strong> has been confirmed!</p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Provider:</strong> {provider_name}</p>
                    <p><strong>Scheduled:</strong> {scheduled_at}</p>
                    <p><strong>Duration:</strong> {booking_details.get('duration', 'TBD')}</p>
                </div>
                <p>The provider will contact you shortly with additional details.</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str
    ) -> bool:
        """Send welcome email to new users"""
        
        subject = "Welcome to Olcan Compass!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Welcome to Olcan Compass!</h1>
                <p>Hi {user_name},</p>
                <p>Thank you for joining Olcan Compass - your companion for international career success!</p>
                <p>Here's what you can do:</p>
                <ul>
                    <li>Create and polish professional documents</li>
                    <li>Practice interviews with AI feedback</li>
                    <li>Shop for career resources in our marketplace</li>
                    <li>Join guilds and connect with professionals</li>
                    <li>Grow your companion and earn achievements</li>
                </ul>
                <a href="https://app.olcan.com/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Started</a>
                <p>Best regards,<br>The Olcan Team</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_password_reset(
        self,
        to_email: str,
        reset_token: str,
        reset_url: str
    ) -> bool:
        """Send password reset email"""
        
        subject = "Reset Your Password - Olcan Compass"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Reset Your Password</h1>
                <p>We received a request to reset your password.</p>
                <p>Click the button below to create a new password:</p>
                <a href="{reset_url}?token={reset_token}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p style="color: #ef4444;"><small>This link expires in 1 hour.</small></p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content)
    
    async def send_bulk_email(
        self,
        recipients: List[str],
        subject: str,
        html_content: str
    ) -> Dict[str, Any]:
        """
        Send bulk email to multiple recipients
        
        Args:
            recipients: List of email addresses
            subject: Email subject
            html_content: HTML email body
            
        Returns:
            Results summary
        """
        
        results = {
            'sent': 0,
            'failed': 0,
            'total': len(recipients)
        }
        
        for email in recipients:
            success = await self.send_email(email, subject, html_content)
            if success:
                results['sent'] += 1
            else:
                results['failed'] += 1
        
        return results
