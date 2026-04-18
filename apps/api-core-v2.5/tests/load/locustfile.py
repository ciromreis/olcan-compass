"""
Load Testing with Locust
Olcan Compass v2.5 API

Run with: locust -f locustfile.py --host=http://localhost:8000
"""

from locust import HttpUser, task, between
import random
import json


class CompassUser(HttpUser):
    """Simulates a typical Olcan Compass user"""
    
    wait_time = between(1, 5)  # Wait 1-5 seconds between tasks
    
    def on_start(self):
        """Setup: Create user session"""
        self.user_id = random.randint(1, 1000)
        self.archetype_id = None
        self.companion_id = None
        self.route_id = None
    
    @task(10)
    def view_archetypes(self):
        """Most common: Browse archetypes"""
        self.client.get("/api/archetypes")
    
    @task(8)
    def get_archetype_detail(self):
        """View specific archetype"""
        archetype_id = random.randint(1, 12)
        self.client.get(f"/api/archetypes/{archetype_id}")
    
    @task(5)
    def compare_archetypes(self):
        """Compare two archetypes"""
        ids = random.sample(range(1, 13), 2)
        self.client.get(f"/api/archetypes/compare?ids={ids[0]}&ids={ids[1]}")
    
    @task(7)
    def view_companion(self):
        """Check companion status"""
        if not self.companion_id:
            self.companion_id = random.randint(1, 100)
        
        self.client.get(f"/api/companion/{self.companion_id}")
    
    @task(4)
    def feed_companion(self):
        """Feed companion"""
        if not self.companion_id:
            self.companion_id = random.randint(1, 100)
        
        self.client.post(f"/api/companion/{self.companion_id}/feed")
    
    @task(3)
    def play_with_companion(self):
        """Play with companion"""
        if not self.companion_id:
            self.companion_id = random.randint(1, 100)
        
        self.client.post(f"/api/companion/{self.companion_id}/play")
    
    @task(6)
    def list_routes(self):
        """View user's routes"""
        self.client.get(f"/api/routes?user_id={self.user_id}")
    
    @task(3)
    def get_route_categories(self):
        """Get available route categories"""
        self.client.get("/api/routes/builder/categories")
    
    @task(2)
    def preview_route(self):
        """Preview route configuration"""
        category = random.choice([
            "career_transition",
            "skill_development",
            "business_launch",
            "personal_growth",
            "financial_planning"
        ])
        
        payload = {
            "category": category,
            "title": f"Test Route {random.randint(1, 1000)}",
            "description": "Load test route",
            "timeline": random.choice(["1_month", "3_months", "6_months", "1_year"]),
            "budget_range": random.choice(["low", "medium", "high"]),
            "risk_tolerance": random.choice(["conservative", "moderate", "aggressive"])
        }
        
        self.client.post(
            "/api/routes/builder/preview",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
    
    @task(1)
    def create_route(self):
        """Create a new route (less frequent)"""
        category = random.choice([
            "career_transition",
            "skill_development",
            "business_launch",
            "personal_growth",
            "financial_planning"
        ])
        
        payload = {
            "user_id": self.user_id,
            "category": category,
            "title": f"Load Test Route {random.randint(1, 1000)}",
            "description": "Load test route",
            "timeline": random.choice(["1_month", "3_months", "6_months", "1_year"]),
            "budget_range": random.choice(["low", "medium", "high"]),
            "risk_tolerance": random.choice(["conservative", "moderate", "aggressive"])
        }
        
        response = self.client.post(
            "/api/routes/builder/create",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.route_id = data.get("route_id")
    
    @task(4)
    def get_route_detail(self):
        """View route details"""
        if not self.route_id:
            self.route_id = random.randint(1, 100)
        
        self.client.get(f"/api/routes/{self.route_id}")
    
    @task(3)
    def get_companion_messages(self):
        """Check companion messages"""
        if not self.companion_id:
            self.companion_id = random.randint(1, 100)
        
        self.client.get(f"/api/companion/{self.companion_id}/messages")


class HeavyUser(HttpUser):
    """Simulates a power user with more intensive usage"""
    
    wait_time = between(0.5, 2)
    
    def on_start(self):
        self.user_id = random.randint(1, 1000)
        self.companion_id = random.randint(1, 100)
    
    @task(5)
    def rapid_companion_checks(self):
        """Frequently check companion"""
        self.client.get(f"/api/companion/{self.companion_id}")
    
    @task(3)
    def multiple_route_views(self):
        """View multiple routes quickly"""
        for _ in range(3):
            route_id = random.randint(1, 100)
            self.client.get(f"/api/routes/{route_id}")
    
    @task(2)
    def batch_archetype_comparisons(self):
        """Compare multiple archetype pairs"""
        for _ in range(2):
            ids = random.sample(range(1, 13), 2)
            self.client.get(f"/api/archetypes/compare?ids={ids[0]}&ids={ids[1]}")


class SpikeUser(HttpUser):
    """Simulates sudden traffic spike"""
    
    wait_time = between(0.1, 0.5)
    
    @task
    def spike_traffic(self):
        """Generate spike load"""
        endpoints = [
            "/api/archetypes",
            f"/api/companion/{random.randint(1, 100)}",
            f"/api/routes?user_id={random.randint(1, 1000)}",
        ]
        
        endpoint = random.choice(endpoints)
        self.client.get(endpoint)


# Load test scenarios
class LoadTestScenarios:
    """
    Recommended test scenarios:
    
    1. Normal Load (Baseline):
       locust -f locustfile.py --host=http://localhost:8000 --users 50 --spawn-rate 5
    
    2. Peak Load:
       locust -f locustfile.py --host=http://localhost:8000 --users 200 --spawn-rate 20
    
    3. Stress Test:
       locust -f locustfile.py --host=http://localhost:8000 --users 500 --spawn-rate 50
    
    4. Spike Test:
       locust -f locustfile.py --host=http://localhost:8000 --users 1000 --spawn-rate 100 --run-time 2m
    
    5. Endurance Test:
       locust -f locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 1h
    
    Performance Targets:
    - 95th percentile response time < 500ms
    - 99th percentile response time < 1000ms
    - Error rate < 1%
    - Throughput > 100 requests/second
    """
    pass
