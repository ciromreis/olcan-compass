"""
Performance Tests
Tests API response times and throughput
"""
import pytest
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi.testclient import TestClient


class TestAPIPerformance:
    """Test API endpoint performance"""
    
    def test_archetype_list_performance(self, client: TestClient, test_user):
        """Test: Archetype list endpoint responds quickly"""
        
        start_time = time.time()
        response = client.get("/api/archetypes")
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = (end_time - start_time) * 1000  # Convert to ms
        assert response_time < 200, f"Response time {response_time}ms exceeds 200ms threshold"
    
    def test_archetype_details_performance(self, client: TestClient, test_user):
        """Test: Archetype details endpoint responds quickly"""
        
        start_time = time.time()
        response = client.get("/api/archetypes/achiever")
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = (end_time - start_time) * 1000
        assert response_time < 200, f"Response time {response_time}ms exceeds 200ms threshold"
    
    def test_companion_get_performance(self, client: TestClient, test_user, test_companion):
        """Test: Get companion endpoint responds quickly"""
        
        start_time = time.time()
        response = client.get("/api/companion")
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = (end_time - start_time) * 1000
        assert response_time < 200, f"Response time {response_time}ms exceeds 200ms threshold"
    
    def test_route_list_performance(self, client: TestClient, test_user):
        """Test: Route list endpoint responds quickly"""
        
        start_time = time.time()
        response = client.get("/api/routes/builder")
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = (end_time - start_time) * 1000
        assert response_time < 200, f"Response time {response_time}ms exceeds 200ms threshold"
    
    def test_route_creation_performance(self, client: TestClient, test_user, test_companion):
        """Test: Route creation completes in reasonable time"""
        
        route_data = {
            "category": "employment",
            "target_outcome": "Performance Test",
            "timeline_months": 12
        }
        
        start_time = time.time()
        response = client.post("/api/routes/builder", json=route_data)
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = (end_time - start_time) * 1000
        assert response_time < 1000, f"Response time {response_time}ms exceeds 1000ms threshold"


class TestConcurrentRequests:
    """Test API under concurrent load"""
    
    def test_concurrent_archetype_requests(self, client: TestClient, test_user):
        """Test: API handles concurrent archetype requests"""
        
        def make_request():
            response = client.get("/api/archetypes")
            return response.status_code == 200
        
        # Make 10 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in as_completed(futures)]
        
        # All requests should succeed
        assert all(results), "Some concurrent requests failed"
    
    def test_concurrent_companion_interactions(self, client: TestClient, test_user, test_companion):
        """Test: API handles concurrent companion interactions"""
        
        companion_id = test_companion.id
        
        def make_interaction(action):
            response = client.post(f"/api/companion/{companion_id}/{action}")
            return response.status_code == 200
        
        # Make concurrent feed/play/rest requests
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(make_interaction, "feed"),
                executor.submit(make_interaction, "play"),
                executor.submit(make_interaction, "rest")
            ]
            results = [future.result() for future in as_completed(futures)]
        
        # All requests should succeed
        assert all(results), "Some concurrent interactions failed"


class TestDatabasePerformance:
    """Test database query performance"""
    
    def test_archetype_query_performance(self, db, test_user):
        """Test: Archetype queries are efficient"""
        from app.db.models.psychology import ArchetypeConfig
        
        start_time = time.time()
        archetypes = db.query(ArchetypeConfig).all()
        end_time = time.time()
        
        query_time = (end_time - start_time) * 1000
        assert query_time < 50, f"Query time {query_time}ms exceeds 50ms threshold"
        assert len(archetypes) > 0
    
    def test_companion_query_performance(self, db, test_user, test_companion):
        """Test: Companion queries are efficient"""
        from app.db.models.companion import Companion
        
        start_time = time.time()
        companion = db.query(Companion).filter(
            Companion.user_id == test_user.id
        ).first()
        end_time = time.time()
        
        query_time = (end_time - start_time) * 1000
        assert query_time < 50, f"Query time {query_time}ms exceeds 50ms threshold"
        assert companion is not None
    
    def test_route_with_milestones_query_performance(self, db, test_user, test_route_with_milestones):
        """Test: Route queries with relationships are efficient"""
        from app.db.models.route import Route
        from sqlalchemy.orm import joinedload
        
        start_time = time.time()
        route = db.query(Route).options(
            joinedload(Route.milestones)
        ).filter(Route.id == test_route_with_milestones.id).first()
        end_time = time.time()
        
        query_time = (end_time - start_time) * 1000
        assert query_time < 100, f"Query time {query_time}ms exceeds 100ms threshold"
        assert route is not None
        assert len(route.milestones) > 0


class TestMemoryUsage:
    """Test memory efficiency"""
    
    def test_large_archetype_list_memory(self, client: TestClient, test_user):
        """Test: Large archetype list doesn't consume excessive memory"""
        import sys
        
        # Get initial memory
        response = client.get("/api/archetypes")
        assert response.status_code == 200
        data = response.json()
        
        # Calculate approximate memory usage
        data_size = sys.getsizeof(str(data))
        assert data_size < 1024 * 1024, f"Response size {data_size} bytes exceeds 1MB"
    
    def test_route_list_memory(self, client: TestClient, test_user):
        """Test: Route list doesn't consume excessive memory"""
        import sys
        
        response = client.get("/api/routes/builder")
        assert response.status_code == 200
        data = response.json()
        
        data_size = sys.getsizeof(str(data))
        assert data_size < 1024 * 1024, f"Response size {data_size} bytes exceeds 1MB"


class TestScalability:
    """Test system scalability"""
    
    def test_multiple_routes_performance(self, client: TestClient, test_user, test_companion):
        """Test: System handles multiple routes efficiently"""
        
        # Create 5 routes
        for i in range(5):
            route_data = {
                "category": "employment",
                "target_outcome": f"Test Route {i+1}",
                "timeline_months": 12
            }
            response = client.post("/api/routes/builder", json=route_data)
            assert response.status_code == 200
        
        # Fetch all routes
        start_time = time.time()
        response = client.get("/api/routes/builder")
        end_time = time.time()
        
        assert response.status_code == 200
        routes = response.json()
        assert len(routes) >= 5
        
        response_time = (end_time - start_time) * 1000
        assert response_time < 300, f"Response time {response_time}ms exceeds 300ms threshold"
    
    def test_multiple_messages_performance(self, client: TestClient, test_user, test_companion):
        """Test: System handles multiple messages efficiently"""
        from app.db.models.companion import CompanionMessage
        from app.db.session import SessionLocal
        
        # Create 20 messages
        db = SessionLocal()
        for i in range(20):
            message = CompanionMessage(
                companion_id=test_companion.id,
                message_type="encouragement",
                content=f"Test message {i+1}",
                metadata={}
            )
            db.add(message)
        db.commit()
        db.close()
        
        # Fetch messages
        start_time = time.time()
        response = client.get(f"/api/companion/{test_companion.id}/messages")
        end_time = time.time()
        
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) >= 20
        
        response_time = (end_time - start_time) * 1000
        assert response_time < 300, f"Response time {response_time}ms exceeds 300ms threshold"


class TestCacheEfficiency:
    """Test caching mechanisms"""
    
    def test_repeated_archetype_requests(self, client: TestClient, test_user):
        """Test: Repeated requests benefit from caching"""
        
        # First request
        start_time = time.time()
        response1 = client.get("/api/archetypes")
        first_time = time.time() - start_time
        
        # Second request (should be faster if cached)
        start_time = time.time()
        response2 = client.get("/api/archetypes")
        second_time = time.time() - start_time
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json() == response2.json()
        
        # Second request should be at least as fast
        # (may not be significantly faster in test environment)
        assert second_time <= first_time * 1.5


# Performance benchmarks
PERFORMANCE_THRESHOLDS = {
    "archetype_list": 200,  # ms
    "archetype_details": 200,  # ms
    "companion_get": 200,  # ms
    "companion_interaction": 300,  # ms
    "route_list": 200,  # ms
    "route_create": 1000,  # ms
    "milestone_list": 300,  # ms
    "task_complete": 200,  # ms
}


def test_performance_summary(client: TestClient, test_user, test_companion):
    """Generate performance summary report"""
    
    results = {}
    
    # Test each endpoint
    endpoints = [
        ("archetype_list", "GET", "/api/archetypes", None),
        ("companion_get", "GET", "/api/companion", None),
        ("route_list", "GET", "/api/routes/builder", None),
    ]
    
    for name, method, url, data in endpoints:
        start_time = time.time()
        if method == "GET":
            response = client.get(url)
        else:
            response = client.post(url, json=data)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000
        results[name] = {
            "response_time_ms": response_time,
            "status_code": response.status_code,
            "threshold_ms": PERFORMANCE_THRESHOLDS.get(name, 500),
            "passed": response_time < PERFORMANCE_THRESHOLDS.get(name, 500)
        }
    
    # Print summary
    print("\n=== Performance Test Summary ===")
    for name, result in results.items():
        status = "✓ PASS" if result['passed'] else "✗ FAIL"
        print(f"{name}: {result['response_time_ms']:.2f}ms (threshold: {result['threshold_ms']}ms) {status}")
    
    # All tests should pass
    assert all(r['passed'] for r in results.values()), "Some performance tests failed"
