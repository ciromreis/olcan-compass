"""
Marketplace Service

Business logic for marketplace resources, purchases, and reviews.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime
import uuid

from ..models.resource import (
    Resource,
    Purchase,
    ResourceReview,
    Collection,
    ResourceType,
    ResourceCategory,
    ResourceStatus
)
from ..models.user import User


class MarketplaceService:
    """Service for managing marketplace resources"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_resource(
        self,
        creator_id: str,
        title: str,
        description: str,
        resource_type: ResourceType,
        category: ResourceCategory,
        price: float,
        **kwargs
    ) -> Resource:
        """Create a new marketplace resource"""
        
        # Generate slug from title
        slug = self._generate_slug(title)
        
        resource = Resource(
            id=str(uuid.uuid4()),
            creator_id=creator_id,
            title=title,
            description=description,
            resource_type=resource_type,
            category=category,
            price=price,
            slug=slug,
            status=ResourceStatus.DRAFT,
            **{k: v for k, v in kwargs.items() if hasattr(Resource, k)}
        )
        
        self.db.add(resource)
        self.db.commit()
        self.db.refresh(resource)
        
        return resource
    
    def update_resource(
        self,
        resource_id: str,
        creator_id: str,
        updates: Dict[str, Any]
    ) -> Resource:
        """Update a resource"""
        
        resource = self.db.query(Resource).filter(
            Resource.id == resource_id,
            Resource.creator_id == creator_id
        ).first()
        
        if not resource:
            raise ValueError("Resource not found or unauthorized")
        
        # Update allowed fields
        allowed_fields = [
            'title', 'description', 'price', 'category', 'tags',
            'difficulty_level', 'estimated_time_minutes', 'content_url',
            'preview_url', 'thumbnail_url', 'meta_description'
        ]
        
        for field in allowed_fields:
            if field in updates:
                setattr(resource, field, updates[field])
        
        resource.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(resource)
        
        return resource
    
    def publish_resource(self, resource_id: str, creator_id: str) -> Resource:
        """Publish a resource to marketplace"""
        
        resource = self.db.query(Resource).filter(
            Resource.id == resource_id,
            Resource.creator_id == creator_id
        ).first()
        
        if not resource:
            raise ValueError("Resource not found or unauthorized")
        
        if resource.status == ResourceStatus.PUBLISHED:
            raise ValueError("Resource already published")
        
        resource.status = ResourceStatus.PUBLISHED
        resource.published_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(resource)
        
        return resource
    
    def get_resources(
        self,
        resource_type: Optional[ResourceType] = None,
        category: Optional[ResourceCategory] = None,
        status: Optional[ResourceStatus] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search_query: Optional[str] = None,
        sort_by: str = "created_at",
        limit: int = 50,
        offset: int = 0
    ) -> List[Resource]:
        """Get resources with filtering and sorting"""
        
        query = self.db.query(Resource)
        
        # Filters
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        
        if category:
            query = query.filter(Resource.category == category)
        
        if status:
            query = query.filter(Resource.status == status)
        else:
            # Default to published only
            query = query.filter(Resource.status == ResourceStatus.PUBLISHED)
        
        if min_price is not None:
            query = query.filter(Resource.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Resource.price <= max_price)
        
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                (Resource.title.ilike(search_pattern)) |
                (Resource.description.ilike(search_pattern))
            )
        
        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Resource.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Resource.price.desc())
        elif sort_by == "rating":
            query = query.order_by(Resource.rating.desc())
        elif sort_by == "popular":
            query = query.order_by(Resource.purchase_count.desc())
        else:
            query = query.order_by(Resource.created_at.desc())
        
        resources = query.offset(offset).limit(limit).all()
        
        return resources
    
    def get_resource(self, resource_id: str, increment_view: bool = True) -> Optional[Resource]:
        """Get a specific resource"""
        
        resource = self.db.query(Resource).filter(Resource.id == resource_id).first()
        
        if resource and increment_view:
            resource.view_count += 1
            self.db.commit()
        
        return resource
    
    def get_resource_by_slug(self, slug: str, increment_view: bool = True) -> Optional[Resource]:
        """Get resource by slug"""
        
        resource = self.db.query(Resource).filter(Resource.slug == slug).first()
        
        if resource and increment_view:
            resource.view_count += 1
            self.db.commit()
        
        return resource
    
    def purchase_resource(
        self,
        user_id: str,
        resource_id: str,
        payment_method: Optional[str] = None,
        transaction_id: Optional[str] = None
    ) -> Purchase:
        """Purchase a resource"""
        
        resource = self.get_resource(resource_id, increment_view=False)
        
        if not resource:
            raise ValueError("Resource not found")
        
        if resource.status != ResourceStatus.PUBLISHED:
            raise ValueError("Resource not available for purchase")
        
        # Check if already purchased
        existing_purchase = self.db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.resource_id == resource_id,
            Purchase.status == "completed"
        ).first()
        
        if existing_purchase:
            raise ValueError("Resource already purchased")
        
        # Create purchase
        purchase = Purchase(
            id=str(uuid.uuid4()),
            user_id=user_id,
            resource_id=resource_id,
            amount_paid=resource.price,
            currency=resource.currency,
            payment_method=payment_method,
            transaction_id=transaction_id,
            status="completed"
        )
        
        self.db.add(purchase)
        
        # Update resource stats
        resource.purchase_count += 1
        
        self.db.commit()
        self.db.refresh(purchase)
        
        return purchase
    
    def get_user_purchases(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Purchase]:
        """Get user's purchases"""
        
        purchases = self.db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.status == "completed"
        ).order_by(Purchase.purchased_at.desc()).offset(offset).limit(limit).all()
        
        return purchases
    
    def has_purchased(self, user_id: str, resource_id: str) -> bool:
        """Check if user has purchased a resource"""
        
        purchase = self.db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.resource_id == resource_id,
            Purchase.status == "completed"
        ).first()
        
        return purchase is not None
    
    def create_review(
        self,
        user_id: str,
        resource_id: str,
        rating: int,
        title: Optional[str] = None,
        comment: Optional[str] = None
    ) -> ResourceReview:
        """Create a review for a resource"""
        
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        # Check if user purchased the resource
        purchase = self.db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.resource_id == resource_id,
            Purchase.status == "completed"
        ).first()
        
        # Check if already reviewed
        existing_review = self.db.query(ResourceReview).filter(
            ResourceReview.user_id == user_id,
            ResourceReview.resource_id == resource_id
        ).first()
        
        if existing_review:
            raise ValueError("Already reviewed this resource")
        
        review = ResourceReview(
            id=str(uuid.uuid4()),
            resource_id=resource_id,
            user_id=user_id,
            purchase_id=purchase.id if purchase else None,
            rating=rating,
            title=title,
            comment=comment,
            is_verified_purchase=1 if purchase else 0
        )
        
        self.db.add(review)
        
        # Update resource rating
        resource = self.get_resource(resource_id, increment_view=False)
        if resource:
            self._update_resource_rating(resource)
        
        self.db.commit()
        self.db.refresh(review)
        
        return review
    
    def get_resource_reviews(
        self,
        resource_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[ResourceReview]:
        """Get reviews for a resource"""
        
        reviews = self.db.query(ResourceReview).filter(
            ResourceReview.resource_id == resource_id
        ).order_by(ResourceReview.created_at.desc()).offset(offset).limit(limit).all()
        
        return reviews
    
    def create_collection(
        self,
        creator_id: str,
        title: str,
        resource_ids: List[str],
        description: Optional[str] = None,
        price: float = 0.0,
        discount_percentage: int = 0
    ) -> Collection:
        """Create a resource collection"""
        
        collection = Collection(
            id=str(uuid.uuid4()),
            creator_id=creator_id,
            title=title,
            description=description,
            resource_ids=resource_ids,
            price=price,
            discount_percentage=discount_percentage
        )
        
        self.db.add(collection)
        self.db.commit()
        self.db.refresh(collection)
        
        return collection
    
    def get_featured_resources(self, limit: int = 10) -> List[Resource]:
        """Get featured/popular resources"""
        
        resources = self.db.query(Resource).filter(
            Resource.status == ResourceStatus.PUBLISHED
        ).order_by(
            Resource.rating.desc(),
            Resource.purchase_count.desc()
        ).limit(limit).all()
        
        return resources
    
    def get_creator_resources(
        self,
        creator_id: str,
        include_drafts: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Resource]:
        """Get resources by creator"""
        
        query = self.db.query(Resource).filter(Resource.creator_id == creator_id)
        
        if not include_drafts:
            query = query.filter(Resource.status == ResourceStatus.PUBLISHED)
        
        resources = query.order_by(Resource.created_at.desc()).offset(offset).limit(limit).all()
        
        return resources
    
    def _generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = slug.strip('-')
        
        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while self.db.query(Resource).filter(Resource.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def _update_resource_rating(self, resource: Resource):
        """Recalculate resource rating"""
        
        reviews = self.db.query(ResourceReview).filter(
            ResourceReview.resource_id == resource.id
        ).all()
        
        if reviews:
            total_rating = sum(r.rating for r in reviews)
            resource.rating = round(total_rating / len(reviews), 2)
            resource.review_count = len(reviews)
        else:
            resource.rating = 0.0
            resource.review_count = 0
