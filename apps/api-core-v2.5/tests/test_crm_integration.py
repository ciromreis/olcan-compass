"""Tests for CRM integration.

These tests verify the CRM bridge functionality without requiring
actual Twenty/Mautic instances (using mocks).
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone
from uuid import uuid4

from app.services.crm_bridge import TwentyClient, MauticClient, verify_twenty_webhook
from app.services.crm_lifecycle_sync import (
    sync_user_registration,
    sync_email_verification,
    sync_subscription_change,
    sync_booking_completion,
)


class TestTwentyClient:
    """Test Twenty CRM client."""

    def test_is_configured_true(self):
        """Test client reports configured when credentials exist."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                twenty_base_url="https://crm.example.com",
                twenty_api_key="test_key"
            )
            client = TwentyClient()
            assert client.is_configured() is True

    def test_is_configured_false_no_url(self):
        """Test client reports not configured when URL missing."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                twenty_base_url=None,
                twenty_api_key="test_key"
            )
            client = TwentyClient()
            assert client.is_configured() is False

    def test_is_configured_false_no_key(self):
        """Test client reports not configured when API key missing."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                twenty_base_url="https://crm.example.com",
                twenty_api_key=None
            )
            client = TwentyClient()
            assert client.is_configured() is False

    @pytest.mark.asyncio
    async def test_create_person(self):
        """Test creating a person in Twenty."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                twenty_base_url="https://crm.example.com",
                twenty_api_key="test_key"
            )
            client = TwentyClient()
            
            # Mock httpx.AsyncClient
            mock_response = MagicMock()
            mock_response.json.return_value = {
                "data": {
                    "id": "person-123",
                    "email": "test@example.com",
                    "firstName": "John",
                    "lastName": "Doe"
                }
            }
            
            with patch('httpx.AsyncClient') as MockClient:
                mock_client = AsyncMock()
                mock_client.post.return_value = mock_response
                mock_client.__aenter__ = AsyncMock(return_value=mock_client)
                mock_client.__aexit__ = AsyncMock(return_value=False)
                MockClient.return_value = mock_client
                
                result = await client.create_person({
                    "email": "test@example.com",
                    "firstName": "John",
                    "lastName": "Doe"
                })
                
                assert result["data"]["id"] == "person-123"
                mock_client.post.assert_called_once_with(
                    "/rest/people",
                    json={
                        "email": "test@example.com",
                        "firstName": "John",
                        "lastName": "Doe"
                    }
                )


class TestMauticClient:
    """Test Mautic marketing automation client."""

    def test_is_configured_true(self):
        """Test client reports configured when credentials exist."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                mautic_base_url="https://mautic.example.com",
                mautic_api_key="test_key"
            )
            client = MauticClient()
            assert client.is_configured() is True

    def test_is_configured_false(self):
        """Test client reports not configured when credentials missing."""
        with patch('app.services.crm_bridge.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                mautic_base_url=None,
                mautic_api_key=None
            )
            client = MauticClient()
            assert client.is_configured() is False


class TestWebhookVerification:
    """Test webhook signature verification."""

    def test_verify_twenty_webhook_valid(self):
        """Test valid Twenty webhook signature."""
        import hmac
        import hashlib
        
        secret = "test_secret"
        timestamp = "1234567890"
        body = b'{"event": "person.created"}'
        
        # Generate valid signature
        message = timestamp.encode() + b":" + body
        signature = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
        
        assert verify_twenty_webhook(signature, timestamp, body, secret) is True

    def test_verify_twenty_webhook_invalid_signature(self):
        """Test invalid Twenty webhook signature."""
        secret = "test_secret"
        timestamp = "1234567890"
        body = b'{"event": "person.created"}'
        
        # Wrong signature
        assert verify_twenty_webhook("wrong_signature", timestamp, body, secret) is False

    def test_verify_twenty_webhook_missing_params(self):
        """Test missing signature or timestamp."""
        secret = "test_secret"
        body = b'{"event": "person.created"}'
        
        assert verify_twenty_webhook(None, "1234567890", body, secret) is False
        assert verify_twenty_webhook("signature", None, body, secret) is False


class TestLifecycleSync:
    """Test lifecycle event sync functions."""

    @pytest.mark.asyncio
    async def test_sync_user_registration_twenty_only(self):
        """Test user registration sync with Twenty only."""
        from app.db.models import User
        
        # Mock user
        user = MagicMock()
        user.id = uuid4()
        user.email = "test@example.com"
        user.full_name = "John Doe"
        
        # Mock database session
        mock_db = AsyncMock()
        
        # Mock Twenty client
        with patch('app.services.crm_lifecycle_sync.twenty') as mock_twenty:
            mock_twenty.is_configured.return_value = True
            mock_twenty.create_person.return_value = {
                "data": {"id": "person-123"}
            }
            
            # Mock Mautic as not configured
            with patch('app.services.crm_lifecycle_sync.mautic') as mock_mautic:
                mock_mautic.is_configured.return_value = False
                
                result = await sync_user_registration(mock_db, user)
                
                assert result["user_id"] == str(user.id)
                assert result["twenty"]["status"] == "created"
                assert result["twenty"]["person_id"] == "person-123"
                assert result["mautic"] is None
                
                # Verify Twenty was called
                mock_twenty.create_person.assert_called_once()
                
                # Verify identity link was added to DB
                mock_db.add.assert_called()

    @pytest.mark.asyncio
    async def test_sync_email_verification(self):
        """Test email verification sync."""
        from app.db.models import User, CrmIdentityLink
        
        # Mock user
        user = MagicMock()
        user.id = uuid4()
        user.email = "test@example.com"
        
        # Mock database session
        mock_db = AsyncMock()
        
        # Mock identity link
        mock_link = MagicMock()
        mock_link.external_id = "person-123"
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_link
        mock_db.execute.return_value = mock_result
        
        # Mock Twenty client
        with patch('app.services.crm_lifecycle_sync.twenty') as mock_twenty:
            mock_twenty.is_configured.return_value = True
            mock_twenty.add_note_to_person.return_value = {"id": "note-456"}
            
            result = await sync_email_verification(mock_db, user)
            
            assert result["twenty"]["status"] == "note_added"
            
            # Verify note was added
            mock_twenty.add_note_to_person.assert_called_once()


class TestFeatureFlags:
    """Test feature flag control."""

    @pytest.mark.asyncio
    async def test_sync_skipped_when_flag_disabled(self):
        """Test sync is skipped when feature flag is disabled."""
        from app.db.models import User
        from app.services.crm_sync_orchestrator import on_user_registered
        
        # Mock user
        user = MagicMock()
        user.id = uuid4()
        user.email = "test@example.com"
        
        # Mock database session
        mock_db = AsyncMock()
        
        # Mock settings with flag disabled
        with patch('app.services.crm_sync_orchestrator.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                feature_crm_sync_registration_enabled=False
            )
            
            result = await on_user_registered(mock_db, user)
            
            # Should return None when flag is disabled
            assert result is None
            
            # Should not call sync functions
            mock_db.add.assert_not_called()

    @pytest.mark.asyncio
    async def test_sync_executed_when_flag_enabled(self):
        """Test sync executes when feature flag is enabled."""
        from app.db.models import User
        from app.services.crm_sync_orchestrator import on_user_registered
        
        # Mock user
        user = MagicMock()
        user.id = uuid4()
        user.email = "test@example.com"
        user.full_name = "John Doe"
        
        # Mock database session
        mock_db = AsyncMock()
        
        # Mock settings with flag enabled
        with patch('app.services.crm_sync_orchestrator.get_settings') as mock_settings:
            mock_settings.return_value = MagicMock(
                feature_crm_sync_registration_enabled=True
            )
            
            # Mock sync function
            with patch('app.services.crm_sync_orchestrator.sync_user_registration') as mock_sync:
                mock_sync.return_value = {"status": "success"}
                
                result = await on_user_registered(mock_db, user)
                
                # Should return result when flag is enabled
                assert result is not None
                
                # Should call sync function
                mock_sync.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
