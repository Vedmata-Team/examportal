import urllib.request
import urllib.parse
import json
import http.cookiejar

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Login
login_data = json.dumps({
    "email": "student_agra@exam.com",
    "password": "password123" # try this one first
}).encode("utf-8")

try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login/", data=login_data, headers={"Content-Type": "application/json"}, method="POST")
    with opener.open(req) as res:
        print("Login OK")
except urllib.error.HTTPError as e:
    # If 401, maybe password is Password@123
    print("Login with password123 failed, trying Password@123")
    login_data = json.dumps({
        "email": "student_agra@exam.com",
        "password": "Password@123"
    }).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/login/", data=login_data, headers={"Content-Type": "application/json"}, method="POST")
    with opener.open(req) as res:
        print("Login OK")

# 2. Hit Student Dashboard
req = urllib.request.Request("http://127.0.0.1:8000/api/dashboard/student/", method="GET")
try:
    with opener.open(req) as res:
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode())
