from apps.geo.models import State, District, Institution
from apps.academics.models import Class, Chapter, Content

def seed_data():
    # 1. Geo Data
    state, _ = State.objects.get_or_create(name="Delhi", code="DL")
    district, _ = District.objects.get_or_create(name="New Delhi", state=state)
    institution, _ = Institution.objects.get_or_create(name="Central Academy", district=district)
    print(f"Geo data seeded: {state.name} -> {district.name} -> {institution.name}")

    # 2. Academics Data
    cls_10, _ = Class.objects.get_or_create(name="Class 10")
    cls_12, _ = Class.objects.get_or_create(name="Class 12")
    
    # Mathematics for Class 10
    math_ch1, _ = Chapter.objects.get_or_create(
        title="Number Systems", 
        class_ref=cls_10, 
        order_index=1
    )
    
    Content.objects.get_or_create(
        chapter=math_ch1,
        html_content="<p>Real numbers are the set of numbers that can be represented on a number line.</p>",
        min_read_time=30,
        order_index=1
    )
    
    print(f"Academic data seeded: {cls_10.name}, {cls_12.name}")

if __name__ == "__main__":
    seed_data()
