import django
import os
import sys

# Setup django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.geo.models import State, District, Institution
from apps.academics.models import Class, Chapter, Content
from apps.users.models import User
from apps.quizzes.models import Quiz, QuizSection, Question
from apps.authentication.views import hash_password

def setup_hindi_regional():
    print("Starting Hindi Regional Data Setup for Uttar Pradesh...")

    # 1. Geography (Uttar Pradesh -> Agra -> Agra Public School)
    state, _ = State.objects.get_or_create(name="Uttar Pradesh", code="UP")
    district, _ = District.objects.get_or_create(name="Agra", state=state)
    inst, _ = Institution.objects.get_or_create(name="Agra Public School", district=district)
    print(f"Geography Setup: {state.name} > {district.name} > {inst.name}")

    # 2. Academy (Class 10th)
    cls_10, _ = Class.objects.get_or_create(name="Class 10th")
    print(f"Academic Setup: {cls_10.name}")

    # 3. Users (All Roles)
    pass_hash = hash_password("pass123")
    
    users = [
        {"name": "Central Admin User", "email": "central_admin@exam.com", "role": "CENTRAL"},
        {"name": "State Admin UP", "email": "state_admin_up@exam.com", "role": "STATE", "state_id": state.id},
        {"name": "District Admin Agra", "email": "district_admin_agra@exam.com", "role": "DISTRICT", "district_id": district.id},
        {"name": "Institution Admin APS", "email": "inst_admin_aps@exam.com", "role": "INSTITUTION", "institution_id": inst.id},
        {"name": "Student Agra", "email": "student_agra@exam.com", "role": "STUDENT", "institution_id": inst.id, "class_id": cls_10.id},
    ]

    for u_data in users:
        email = u_data["email"]
        User.objects.filter(email=email).delete()
        User.objects.create(
            name=u_data["name"],
            email=email,
            clerk_id=email,
            password_hash=pass_hash,
            role=u_data["role"],
            state_id=u_data.get("state_id"),
            district_id=u_data.get("district_id"),
            institution_id=u_data.get("institution_id"),
            class_id=u_data.get("class_id"),
        )
        print(f"User Created: {email} ({u_data['role']})")

    # 4. Hindi Content (Indian Culture and Philosophy)
    chapter_title = "भारतीय संस्कृति और दर्शन"
    chapter, _ = Chapter.objects.get_or_create(
        title=chapter_title,
        class_ref=cls_10,
        order_index=1
    )
    
    Content.objects.get_or_create(
        chapter=chapter,
        html_content="""
        <div class="space-y-4 text-hindi font-medium">
            <h1 class="text-2xl font-bold text-primary">भारतीय संस्कृति: एक परिचय</h1>
            <p>भारतीय संस्कृति विश्व की सबसे प्राचीन और समृद्ध संस्कृतियों में से एक है। 'वसुधैव कुटुंबकम' (पूरी दुनिया एक परिवार है) का दर्शन हमारी मूल पहचान है।</p>
            <h2 class="text-xl font-bold">दर्शन शास्त्र (Philosophy)</h2>
            <p>भारतीय दर्शन जीवन के गहरे सत्य को खोजने का प्रयास करता है। इसमें योग, न्याय, सांख्य और वेदांत जैसे महत्वपूर्ण अंग शामिल हैं।</p>
            <p>हमारी संस्कृति विविधता में एकता (Unity in Diversity) का उत्कृष्ट उदाहरण है।</p>
        </div>
        """,
        min_read_time=60,
        order_index=1
    )
    print("Hindi Chapter Created successfully.")

    # 5. Hindi Quiz
    quiz_title = "सांस्कृतिक प्रश्नोत्तरी"
    quiz, _ = Quiz.objects.get_or_create(
        title=quiz_title,
        description="भारतीय संस्कृति और दार्शनिक ज्ञान पर आधारित",
        time_limit_minutes=15,
        passing_percentage=50.0
    )

    section_title = "सामान्य ज्ञान"
    section, _ = QuizSection.objects.get_or_create(
        quiz=quiz,
        title=section_title,
        order_index=1
    )

    questions = [
        {
            "text": "भारतीय संस्कृति का मूल आधार क्या है?",
            "options": ["एकता में विविधता", "केवल भाषा", "केवल वेशभूषा", "केवल खान-पान"],
            "correct_option": 0
        },
        {
            "text": "'वसुधैव कुटुंबकम' का क्या अर्थ है?",
            "options": ["मेरा परिवार ही दुनिया है", "पूरी दुनिया एक परिवार है", "पड़ोसी मेरा परिवार है", "इनमें से कोई नहीं"],
            "correct_option": 1
        },
        {
            "text": "भारत के प्राचीन ग्रंथों के अनुसार 'सत्यमेव जयते' कहाँ से लिया गया है?",
            "options": ["ऋग्वेद", "सामवेद", "मुंडकोपनिषद", "पुराण"],
            "correct_option": 2
        }
    ]

    for i, q in enumerate(questions):
        Question.objects.get_or_create(
            section=section,
            text=q["text"],
            options=q["options"],
            correct_option=q["correct_option"],
            order_index=i + 1
        )
    print("Hindi Quiz and Questions Created Successfully!")

    print("\nSetup Completed Successfully!")

if __name__ == "__main__":
    setup_hindi_regional()
