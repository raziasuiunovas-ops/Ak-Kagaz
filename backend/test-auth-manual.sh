#!/bin/bash
# Manual Auth Testing Script

BASE_URL="http://localhost:3001"

echo "🧪 Testing Auth Module..."
echo ""

# Test 1: Register
echo "1️⃣ Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 2: Login
echo "2️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }')

echo "Response: $LOGIN_RESPONSE"
NEW_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""

# Test 3: Get Profile
echo "3️⃣ Testing Get Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $NEW_TOKEN")

echo "Response: $PROFILE_RESPONSE"
echo ""

# Test 4: Invalid Login
echo "4️⃣ Testing Invalid Login..."
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }')

echo "Response: $INVALID_LOGIN"
echo ""

echo "✅ Auth tests completed!"
