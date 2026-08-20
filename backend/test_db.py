import db_handler as db

print("1. Testing generate_employee_id...")
new_id = db.generate_employee_id()
print(f"   Generated: {new_id}")

print("\n2. Testing add_intern_row...")
test_intern = {
    "Employee_ID": new_id,
    "Full_Name": "Test Intern",
    "Gender": "Male",
    "Department": "IT",
    "Supervisor": "Test Supervisor",
    "StartDate": "2026-01-01",
    "EndDate": "2026-06-01",
    "Email": "test.intern@example.com",
    "Phone": "03001234567",
    "Status": "Active",
    "Tasks": ["Sample task 1", "Sample task 2"],
}
db.add_intern_row(test_intern)
print(f"   Added intern {new_id}")

print("\n3. Testing get_intern_by_id...")
fetched = db.get_intern_by_id(new_id)
print(f"   Fetched: {fetched}")

print("\n4. Testing get_all_interns...")
all_interns = db.get_all_interns()
print(f"   Total interns in DB: {len(all_interns)}")

print("\n5. Testing update_intern_row...")
db.update_intern_row(new_id, {"Full_Name": "Test Intern (Updated)", "Tasks": ["Updated task"]})
updated = db.get_intern_by_id(new_id)
print(f"   Updated name: {updated['Full_Name']}, Tasks: {updated['Tasks']}")

print("\n6. Testing attendance...")
db.upsert_attendance_record("2026-01-15", new_id, "Test Intern", "IT", "Present")
db.upsert_attendance_record("2026-01-16", new_id, "Test Intern", "IT", "Absent")
pct = db.get_attendance_percentage(new_id)
print(f"   Attendance percentage: {pct}%")

print("\n7. Testing delete_intern_row...")
deleted = db.delete_intern_row(new_id)
print(f"   Deleted: {deleted}")

confirm = db.get_intern_by_id(new_id)
print(f"   Confirm gone: {confirm is None}")

print("\n✅ All tests completed.")