import requests
import json
import sys
import uuid

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

# Test property data
test_property = {
    "title": "Test Property",
    "description": "A beautiful test property",
    "price": "150000.00",
    "address": "123 Test Street",
    "location": "Test City",
    "property_status": "for_sale",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 1500
}

# Test data
tenant_data = {
    "email": "test_tenant@example.com",
    "username": "test_tenant",
    "password": "StrongPassword123!",
    "password2": "StrongPassword123!",
    "first_name": "Test",
    "last_name": "Tenant",
    "role": "tenant",
    "phone_number": "1234567890",
    "address": "123 Tenant St"
}

agent_data = {
    "email": "test_agent@example.com",
    "username": "test_agent",
    "password": "StrongPassword123!",
    "password2": "StrongPassword123!",
    "first_name": "Test",
    "last_name": "Agent",
    "role": "agent",
    "phone_number": "0987654321",
    "address": "456 Agent Ave",
    "bio": "Experienced real estate agent",
    "company": "Test Realty"
}

def register_user(user_data):
    """Register a new user with the provided data."""
    url = f"{BASE_URL}/users/register/"
    response = requests.post(url, json=user_data)
    print(f"Register {user_data['role']} response: {response.status_code}")
    if response.status_code == 201:
        print("Registration successful!")
        return response.json()
    else:
        print(f"Registration failed: {response.text}")
        return None

def login_user(username, password, role=None):
    """
    Login a user with the provided credentials.
    If role is provided, use the role-specific endpoint.
    Otherwise, use the general endpoint with automatic role detection.
    """
    if role:
        url = f"{BASE_URL}/users/{role}/login/"
        print(f"Using role-specific endpoint for {role}")
    else:
        url = f"{BASE_URL}/users/token/"
        print("Using general endpoint with automatic role detection")

    data = {"username": username, "password": password}
    response = requests.post(url, json=data)
    print(f"Login response: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        role_from_token = result.get('role', 'unknown')
        print(f"Login successful! Detected role: {role_from_token}")
        return result
    else:
        print(f"Login failed: {response.text}")
        return None

def test_cross_role_login(username, password, wrong_role):
    """Test logging in with the wrong role endpoint."""
    url = f"{BASE_URL}/users/{wrong_role}/login/"
    data = {"username": username, "password": password}
    response = requests.post(url, json=data)
    print(f"Cross-role login test (using {wrong_role} endpoint): {response.status_code}")
    if response.status_code != 200:
        print("Cross-role login correctly rejected!")
        return True
    else:
        print("Cross-role login incorrectly succeeded!")
        return False

def test_agent_property_creation(token):
    """Test property creation by an agent."""
    url = f"{BASE_URL}/properties/listings/"
    headers = {"Authorization": f"Bearer {token}"}

    # Create a unique property title to avoid conflicts
    unique_property = test_property.copy()
    unique_property["title"] = f"Test Property {uuid.uuid4()}"

    response = requests.post(url, json=unique_property, headers=headers)
    print(f"Agent property creation response: {response.status_code}")

    if response.status_code == 201:
        print("Property creation successful!")
        return response.json()
    else:
        print(f"Property creation failed: {response.text}")
        return None

def test_tenant_property_creation(token):
    """Test property creation by a tenant (should fail)."""
    url = f"{BASE_URL}/properties/listings/"
    headers = {"Authorization": f"Bearer {token}"}

    # Create a unique property title to avoid conflicts
    unique_property = test_property.copy()
    unique_property["title"] = f"Test Property {uuid.uuid4()}"

    response = requests.post(url, json=unique_property, headers=headers)
    print(f"Tenant property creation response: {response.status_code}")

    if response.status_code != 201:
        print("Tenant property creation correctly rejected!")
        return True
    else:
        print("Tenant property creation incorrectly succeeded!")
        return False

def test_tenant_favorite(token, property_id):
    """Test adding a property to favorites by a tenant."""
    url = f"{BASE_URL}/properties/favorites/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"house_id": property_id}

    response = requests.post(url, json=data, headers=headers)
    print(f"Tenant favorite creation response: {response.status_code}")

    if response.status_code == 201:
        print("Favorite creation successful!")
        return response.json()
    else:
        print(f"Favorite creation failed: {response.text}")
        return None

def test_agent_favorite(token, property_id):
    """Test adding a property to favorites by an agent (should fail)."""
    url = f"{BASE_URL}/properties/favorites/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"house_id": property_id}

    response = requests.post(url, json=data, headers=headers)
    print(f"Agent favorite creation response: {response.status_code}")

    if response.status_code != 201:
        print("Agent favorite creation correctly rejected!")
        return True
    else:
        print("Agent favorite creation incorrectly succeeded!")
        return False

def test_tenant_inquiry(token, property_id):
    """Test creating a property inquiry by a tenant."""
    url = f"{BASE_URL}/properties/inquiries/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "house_id": property_id,
        "message": "I'm interested in this property. Please contact me."
    }

    response = requests.post(url, json=data, headers=headers)
    print(f"Tenant inquiry creation response: {response.status_code}")

    if response.status_code == 201:
        print("Inquiry creation successful!")
        return response.json()
    else:
        print(f"Inquiry creation failed: {response.text}")
        return None

def test_agent_inquiry_response(token, inquiry_id):
    """Test responding to an inquiry by an agent."""
    url = f"{BASE_URL}/properties/inquiries/{inquiry_id}/respond/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "response": "Thank you for your interest. I'll contact you soon."
    }

    response = requests.post(url, json=data, headers=headers)
    print(f"Agent inquiry response: {response.status_code}")

    if response.status_code == 200:
        print("Inquiry response successful!")
        return response.json()
    else:
        print(f"Inquiry response failed: {response.text}")
        return None

def main():
    # Register a tenant
    print("\n=== Registering a tenant ===")
    tenant_result = register_user(tenant_data)

    # Register an agent
    print("\n=== Registering an agent ===")
    agent_result = register_user(agent_data)

    if not tenant_result or not agent_result:
        print("Registration tests failed. Exiting.")
        sys.exit(1)

    # Login as tenant using role-specific endpoint
    print("\n=== Logging in as tenant using role-specific endpoint ===")
    tenant_login = login_user(tenant_data["username"], tenant_data["password"], "tenant")

    # Login as agent using role-specific endpoint
    print("\n=== Logging in as agent using role-specific endpoint ===")
    agent_login = login_user(agent_data["username"], agent_data["password"], "agent")

    if not tenant_login or not agent_login:
        print("Role-specific login tests failed. Exiting.")
        sys.exit(1)

    # Login as tenant using automatic role detection
    print("\n=== Logging in as tenant using automatic role detection ===")
    tenant_auto_login = login_user(tenant_data["username"], tenant_data["password"])

    # Login as agent using automatic role detection
    print("\n=== Logging in as agent using automatic role detection ===")
    agent_auto_login = login_user(agent_data["username"], agent_data["password"])

    if not tenant_auto_login or not agent_auto_login:
        print("Automatic role detection login tests failed. Exiting.")
        sys.exit(1)

    # Verify that the detected roles are correct
    tenant_role = tenant_auto_login.get('role')
    agent_role = agent_auto_login.get('role')

    if tenant_role != 'tenant' or agent_role != 'agent':
        print(f"Role detection failed. Expected 'tenant' and 'agent', got '{tenant_role}' and '{agent_role}'")
        sys.exit(1)
    else:
        print("\n=== Automatic role detection working correctly! ===")

    # Test cross-role login (tenant trying to use agent endpoint)
    print("\n=== Testing cross-role login (tenant using agent endpoint) ===")
    tenant_cross_test = test_cross_role_login(tenant_data["username"], tenant_data["password"], "agent")

    # Test cross-role login (agent trying to use tenant endpoint)
    print("\n=== Testing cross-role login (agent using tenant endpoint) ===")
    agent_cross_test = test_cross_role_login(agent_data["username"], agent_data["password"], "tenant")

    if not tenant_cross_test or not agent_cross_test:
        print("Cross-role login tests failed. Exiting.")
        sys.exit(1)

    # Get tokens for further tests
    tenant_token = tenant_auto_login.get('access')
    agent_token = agent_auto_login.get('access')

    # Test role-based features
    print("\n=== Testing role-based features ===")

    # Test property creation by agent (should succeed)
    print("\n=== Testing property creation by agent ===")
    property_result = test_agent_property_creation(agent_token)

    if not property_result:
        print("Agent property creation test failed. Exiting.")
        sys.exit(1)

    property_id = property_result.get('id')

    # Test property creation by tenant (should fail)
    print("\n=== Testing property creation by tenant (should fail) ===")
    tenant_property_test = test_tenant_property_creation(tenant_token)

    if not tenant_property_test:
        print("Tenant property creation restriction test failed. Exiting.")
        sys.exit(1)

    # Test adding property to favorites by tenant (should succeed)
    print("\n=== Testing adding property to favorites by tenant ===")
    favorite_result = test_tenant_favorite(tenant_token, property_id)

    if not favorite_result:
        print("Tenant favorite creation test failed. Exiting.")
        sys.exit(1)

    # Test adding property to favorites by agent (should fail)
    print("\n=== Testing adding property to favorites by agent (should fail) ===")
    agent_favorite_test = test_agent_favorite(agent_token, property_id)

    if not agent_favorite_test:
        print("Agent favorite restriction test failed. Exiting.")
        sys.exit(1)

    # Test creating inquiry by tenant (should succeed)
    print("\n=== Testing creating inquiry by tenant ===")
    inquiry_result = test_tenant_inquiry(tenant_token, property_id)

    if not inquiry_result:
        print("Tenant inquiry creation test failed. Exiting.")
        sys.exit(1)

    inquiry_id = inquiry_result.get('id')

    # Test responding to inquiry by agent (should succeed)
    print("\n=== Testing responding to inquiry by agent ===")
    response_result = test_agent_inquiry_response(agent_token, inquiry_id)

    if not response_result:
        print("Agent inquiry response test failed. Exiting.")
        sys.exit(1)

    print("\nAll tests passed successfully!")

if __name__ == "__main__":
    main()
