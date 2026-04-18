$users = @(
    @{email="central_admin@exam.com"; role="CENTRAL"; dashboard="admin"},
    @{email="state_admin_up@exam.com"; role="STATE"; dashboard="admin"},
    @{email="district_admin_agra@exam.com"; role="DISTRICT"; dashboard="admin"},
    @{email="inst_admin_aps@exam.com"; role="INSTITUTION"; dashboard="admin"},
    @{email="student_agra@exam.com"; role="STUDENT"; dashboard="student"}
)

Write-Host "--- Starting Standardized Multi-Role HTTP Verification ---" -ForegroundColor Cyan

foreach ($u in $users) {
    Write-Host "`nTesting Role: $($u.role) ($($u.email))" -ForegroundColor Yellow
    try {
        # 1. Login (Note the trailing slash)
        $loginRes = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
            -Method Post `
            -Body (@{email=$u.email; password="password123"} | ConvertTo-Json) `
            -ContentType "application/json" `
            -SessionVariable sess `
            -ErrorAction Stop
        
        Write-Host "  [OK] Login successful" -ForegroundColor Green

        # 2. Check Dashboard (Note the trailing slash)
        $dashboardPath = if ($u.dashboard -eq "admin") { "dashboard/admin/" } else { "dashboard/student/" }
        $dashRes = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/$dashboardPath" `
            -WebSession $sess `
            -ErrorAction Stop
        
        $data = $dashRes.Content | ConvertFrom-Json
        Write-Host "  [OK] Dashboard accessible" -ForegroundColor Green
        
        if ($u.role -eq "STUDENT") {
            Write-Host "  [DATA] Avg Score: $($data.averageScore)"
        } else {
            Write-Host "  [DATA] Total Users in Scope: $($data.totalUsers)"
        }

    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "  [BODY] $($_.Exception.Response.GetResponseStream())"
        }
    }
}

Write-Host "`n--- Verification Complete ---" -ForegroundColor Cyan
