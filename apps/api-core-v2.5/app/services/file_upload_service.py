"""
File Upload Service

Handles file uploads to S3 or local storage for product images, digital products, etc.
"""

from typing import Optional, BinaryIO, Dict, Any
import os
import uuid
import mimetypes
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError

from ..core.config import settings


class FileUploadService:
    """Service for file upload and management"""
    
    def __init__(self):
        self.use_s3 = os.getenv('USE_S3', 'false').lower() == 'true'
        
        if self.use_s3:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION', 'us-east-1')
            )
            self.bucket_name = os.getenv('S3_BUCKET_NAME')
        else:
            self.upload_dir = os.getenv('UPLOAD_DIR', './uploads')
            os.makedirs(self.upload_dir, exist_ok=True)
    
    def _generate_filename(self, original_filename: str, prefix: str = '') -> str:
        """Generate unique filename"""
        ext = os.path.splitext(original_filename)[1]
        unique_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        
        if prefix:
            return f"{prefix}/{timestamp}/{unique_id}{ext}"
        return f"{timestamp}/{unique_id}{ext}"
    
    async def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        content_type: Optional[str] = None,
        prefix: str = '',
        public: bool = True
    ) -> Dict[str, Any]:
        """
        Upload file to storage
        
        Args:
            file: File object
            filename: Original filename
            content_type: MIME type
            prefix: Folder prefix (e.g., 'products', 'avatars')
            public: Whether file should be publicly accessible
            
        Returns:
            Upload result with URL
        """
        
        # Generate unique filename
        stored_filename = self._generate_filename(filename, prefix)
        
        # Detect content type if not provided
        if not content_type:
            content_type, _ = mimetypes.guess_type(filename)
            if not content_type:
                content_type = 'application/octet-stream'
        
        if self.use_s3:
            return await self._upload_to_s3(
                file, stored_filename, content_type, public
            )
        else:
            return await self._upload_to_local(
                file, stored_filename, content_type
            )
    
    async def _upload_to_s3(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str,
        public: bool
    ) -> Dict[str, Any]:
        """Upload file to S3"""
        
        try:
            extra_args = {
                'ContentType': content_type
            }
            
            if public:
                extra_args['ACL'] = 'public-read'
            
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                filename,
                ExtraArgs=extra_args
            )
            
            # Generate URL
            if public:
                url = f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"
            else:
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': filename},
                    ExpiresIn=3600
                )
            
            return {
                'success': True,
                'url': url,
                'filename': filename,
                'storage': 's3'
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'storage': 's3'
            }
    
    async def _upload_to_local(
        self,
        file: BinaryIO,
        filename: str,
        content_type: str
    ) -> Dict[str, Any]:
        """Upload file to local storage"""
        
        try:
            # Create directory structure
            file_path = os.path.join(self.upload_dir, filename)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Write file
            with open(file_path, 'wb') as f:
                f.write(file.read())
            
            # Generate URL (relative path)
            url = f"/uploads/{filename}"
            
            return {
                'success': True,
                'url': url,
                'filename': filename,
                'storage': 'local'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'storage': 'local'
            }
    
    async def delete_file(self, filename: str) -> bool:
        """
        Delete file from storage
        
        Args:
            filename: File path/key
            
        Returns:
            Success status
        """
        
        if self.use_s3:
            try:
                self.s3_client.delete_object(
                    Bucket=self.bucket_name,
                    Key=filename
                )
                return True
            except ClientError:
                return False
        else:
            try:
                file_path = os.path.join(self.upload_dir, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                return True
            except Exception:
                return False
    
    async def generate_presigned_url(
        self,
        filename: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate presigned URL for private file access
        
        Args:
            filename: File path/key
            expiration: URL expiration in seconds
            
        Returns:
            Presigned URL or None
        """
        
        if not self.use_s3:
            return f"/uploads/{filename}"
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': filename},
                ExpiresIn=expiration
            )
            return url
        except ClientError:
            return None
    
    async def upload_product_image(
        self,
        file: BinaryIO,
        filename: str,
        product_id: str
    ) -> Dict[str, Any]:
        """Upload product image"""
        return await self.upload_file(
            file,
            filename,
            prefix=f'products/{product_id}/images',
            public=True
        )
    
    async def upload_digital_product(
        self,
        file: BinaryIO,
        filename: str,
        product_id: str
    ) -> Dict[str, Any]:
        """Upload digital product file (private)"""
        return await self.upload_file(
            file,
            filename,
            prefix=f'products/{product_id}/files',
            public=False
        )
    
    async def upload_user_avatar(
        self,
        file: BinaryIO,
        filename: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Upload user avatar"""
        return await self.upload_file(
            file,
            filename,
            prefix=f'avatars/{user_id}',
            public=True
        )
    
    def validate_file(
        self,
        filename: str,
        max_size_mb: int = 10,
        allowed_extensions: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Validate file before upload
        
        Args:
            filename: Original filename
            max_size_mb: Maximum file size in MB
            allowed_extensions: List of allowed extensions
            
        Returns:
            Validation result
        """
        
        # Check extension
        ext = os.path.splitext(filename)[1].lower()
        
        if allowed_extensions and ext not in allowed_extensions:
            return {
                'valid': False,
                'error': f'File type {ext} not allowed'
            }
        
        return {
            'valid': True,
            'extension': ext
        }
    
    @staticmethod
    def get_image_extensions() -> list:
        """Get allowed image extensions"""
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    
    @staticmethod
    def get_document_extensions() -> list:
        """Get allowed document extensions"""
        return ['.pdf', '.doc', '.docx', '.txt', '.md']
    
    @staticmethod
    def get_video_extensions() -> list:
        """Get allowed video extensions"""
        return ['.mp4', '.mov', '.avi', '.webm']
    
    @staticmethod
    def get_audio_extensions() -> list:
        """Get allowed audio extensions"""
        return ['.mp3', '.wav', '.ogg', '.m4a']
