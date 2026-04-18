import django
import os
import sys

# Setup django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.geo.models import State, District, Institution
from apps.academics.models import Class, Chapter, Content
from apps.quizzes.models import Quiz, QuizSection, Question

def setup_everything():
    print("Starting corrected comprehensive data setup...")

    # 1. Geo Data
    up, _ = State.objects.get_or_create(name="Uttar Pradesh", code="UP")
    delhi, _ = State.objects.get_or_create(name="Delhi", code="DL")
    
    lucknow, _ = District.objects.get_or_create(name="Lucknow", state=up)
    new_delhi, _ = District.objects.get_or_create(name="New Delhi", state=delhi)
    
    Institution.objects.get_or_create(name="Lucknow Public School", district=lucknow)
    Institution.objects.get_or_create(name="Delhi International School", district=new_delhi)

    # 2. Academic Structure (Classes 6-12)
    classes = {}
    for i in range(6, 13):
        cls, _ = Class.objects.get_or_create(name=f"Class {i}")
        classes[i] = cls

    # 3. Sample Quiz for Class 10
    cls_10 = classes[10]
    chapter, _ = Chapter.objects.get_or_create(title="Algebra Fundamentals", class_ref=cls_10, order_index=1)
    
    Content.objects.get_or_create(
        chapter=chapter,
        html_content="<h1>Algebra Basics</h1><p>An introduction to variables and constants.</p>",
        min_read_time=10,
        order_index=1
    )

    # Note: Quiz in this schema is standalone or linked via UI logic, 
    # but the models show Quiz doesn't have a direct FK to Chapter.
    quiz, _ = Quiz.objects.get_or_create(
        title="Mathematics Mock Test 2026",
        description="A comprehensive assessment of numerical ability.",
        time_limit_minutes=30,
        passing_percentage=40.0
    )

    section, _ = QuizSection.objects.get_or_create(
        quiz=quiz,
        title="Primary Section",
        order_index=1
    )

    Question.objects.get_or_create(
        section=section,
        text="What is the value of x in 3x = 12?",
        options=["2", "3", "4", "6"],
        correct_option=2, # Index 2 is "4"
        explanation="Dividing 12 by 3 gives 4.",
        order_index=1
    )

    print("Setup completed successfully!")

if __name__ == "__main__":
    setup_everything()
