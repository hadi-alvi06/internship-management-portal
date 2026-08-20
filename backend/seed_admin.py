import getpass
import db_handler as db
from auth import hash_password

print("=== Create Admin Account ===")
username = input("Admin username: ").strip()
password = getpass.getpass("Admin password: ")

if db.get_user_by_username(username):
    print(f"A user named '{username}' already exists.")
else:
    db.create_user(username, hash_password(password), role="admin")
    print(f"✅ Admin account '{username}' created successfully.")