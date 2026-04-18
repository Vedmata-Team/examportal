from apps.authentication.views import hash_password
from apps.users.models import User

def seed_admin():
    email = "admin@exam.com"
    password = "admin123"
    
    # Clean up existing
    User.objects.filter(email=email).delete()
    
    password_hash = hash_password(password)
    user = User.objects.create(
        name="Central Admin",
        email=email,
        clerk_id=email,
        password_hash=password_hash,
        role="CENTRAL",
    )
    print(f"Admin created successfully: {user.email}")

if __name__ == "__main__":
    seed_admin()
