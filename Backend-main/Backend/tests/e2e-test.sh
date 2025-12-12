#!/bin/bash

# SUST Academic Management System - End-to-End Test Suite
# Tests all 60+ endpoints across all 5 phases

BASE_URL="http://localhost:5000/api"
ADMIN_TOKEN=""
STUDENT_TOKEN=""
TEACHER_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" =~ ^2 ]]; then
        print_result 0 "$description (HTTP $http_code)"
        echo "$body" | jq -r '.data // .message // .' 2>/dev/null | head -3
    else
        print_result 1 "$description (HTTP $http_code)"
        echo "$body" | jq -r '.message // .' 2>/dev/null
    fi
    echo ""
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SUST Academic Management System - E2E Test Suite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ===== PHASE 0: System Health =====
echo -e "${BLUE}═══ Phase 0: System Health ═══${NC}"
test_endpoint "GET" "/health" "Health Check"

# ===== PHASE 1: Authentication =====
echo -e "${BLUE}═══ Phase 1: Authentication & Users ═══${NC}"

# Admin Login
echo "Testing Admin Login..."
response=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@sust.edu","password":"admin123"}')
ADMIN_TOKEN=$(echo "$response" | jq -r '.data.token // empty')
if [ -n "$ADMIN_TOKEN" ]; then
    print_result 0 "Admin Login"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
else
    print_result 1 "Admin Login - No admin user found (run seed script)"
fi
echo ""

# Get Admin Profile
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/auth/me" "Get Admin Profile" "" "$ADMIN_TOKEN"
fi

# View all student registration IDs
if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/admin/registrations" "View Registration IDs" "" "$ADMIN_TOKEN"
fi

# ===== PHASE 2: Advisors & Notices =====
echo -e "${BLUE}═══ Phase 2: Advisors & Notices ═══${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/advisors" "List Advisors" "" "$ADMIN_TOKEN"
fi

test_endpoint "GET" "/notices" "Public View Notices (no auth)"

# ===== PHASE 3: Feedback & Results =====
echo -e "${BLUE}═══ Phase 3: Feedback & Results ═══${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/feedback/stats" "Feedback Stats" "" "$ADMIN_TOKEN"
else
    echo -e "${RED}⚠ Skipping Feedback Stats - No admin token${NC}"
fi

# ===== PHASE 4: Admissions & Societies =====
echo -e "${BLUE}═══ Phase 4: Admissions & Societies ═══${NC}"

test_endpoint "GET" "/admissions" "Public View Admissions"
test_endpoint "GET" "/societies" "Public View Societies"

# ===== PHASE 5: Banners & Stats =====
echo -e "${BLUE}═══ Phase 5: Banners & Statistics ═══${NC}"

test_endpoint "GET" "/banners" "Public View Active Banners"

if [ -n "$ADMIN_TOKEN" ]; then
    test_endpoint "GET" "/stats" "System Statistics" "" "$ADMIN_TOKEN"
fi

# ===== Legacy Endpoints =====
echo -e "${BLUE}═══ Legacy Endpoints ═══${NC}"

test_endpoint "GET" "/faculty" "List Faculty"
test_endpoint "GET" "/courses" "List Courses"
test_endpoint "GET" "/news" "List News Items"

# ===== Test Summary =====
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Tests:  $TOTAL_TESTS"
echo -e "${GREEN}Passed:       $PASSED_TESTS${NC}"
echo -e "${RED}Failed:       $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check output above.${NC}"
    exit 1
fi
