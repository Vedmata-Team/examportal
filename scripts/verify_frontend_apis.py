import urllib.request
import urllib.parse
import json
import http.cookiejar
import sys

users = [
    {"email": "central_admin@exam.com", "role": "CENTRAL", "dashboard": "admin"},
    {"email": "state_admin_up@exam.com", "role": "STATE", "dashboard": "admin"},
    {"email": "district_admin_agra@exam.com", "role": "DISTRICT", "dashboard": "admin"},
    {"email": "inst_admin_aps@exam.com", "role": "INSTITUTION", "dashboard": "admin"},
    {"email": "student_agra@exam.com", "role": "STUDENT", "dashboard": "student"},
]

BASE_URL = "http://localhost:3000/api"

print("--- Starting Front-End API Verification ---")

success = True

for u in users:
    print(f"\nTesting Role: {u['role']} ({u['email']})")
    
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    
    try:
        # 1. Login
        login_data = json.dumps({
            "email": u["email"],
            "password": "password123"
        }).encode("utf-8")
        req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with opener.open(req) as res:
                print("  [OK] Login passed via NextJS proxy")
        except urllib.error.URLError as e:
            text = e.read().decode() if hasattr(e, 'read') else str(e)
            print(f"  [FAIL] Login failed: {text}")
            success = False
            continue

        # 2. Check /me
        req = urllib.request.Request(f"{BASE_URL}/me", method="GET")
        try:
            with opener.open(req) as res:
                me_data = json.loads(res.read().decode())
                if me_data.get("email") != u["email"]:
                    print(f"  [FAIL] Expected email {u['email']} but got {me_data.get('email')}")
                    success = False
                    continue
                print(f"  [OK] Profile data fetched: {me_data.get('name')} (Role: {me_data.get('role')})")
        except Exception as e:
            print(f"  [FAIL] /me failed: {e}")
            success = False
            continue

        # 3. Check Dashboard
        dashboard_path = "dashboard/admin/" if u["dashboard"] == "admin" else "dashboard/student/"
        req = urllib.request.Request(f"{BASE_URL}/{dashboard_path}", method="GET")
        try:
            with opener.open(req) as res:
                dash_data = json.loads(res.read().decode())
                print(f"  [OK] Dashboard accessible: keys {list(dash_data.keys())}")
        except Exception as e:
            text = e.read().decode() if hasattr(e, 'read') else str(e)
            print(f"  [FAIL] Dashboard failed: {text}")
            success = False

    except Exception as e:
        print(f"  [FAIL] Exception: {e}")
        success = False

print("\n--- Verification Complete ---")
if not success:
    sys.exit(1)
