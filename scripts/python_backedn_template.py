"""
TUTRLY Student Bulk Processing Backend
This Flask/FastAPI server processes student Excel files uploaded to Vercel Blob
and upserts them to MongoDB.

Environment Variables Required:
- BLOB_READ_WRITE_TOKEN: Vercel Blob token
- MONGO_URI: MongoDB Atlas connection string
- BACKEND_SECRET: Secret key for API authentication (optional but recommended)
"""

import os
import sys
from io import BytesIO
from datetime import datetime, timezone as tz
from typing import Optional, Dict, List, Any
import pandas as pd
from pymongo import MongoClient
from bson import ObjectId
import requests

# =============================================
# FLASK SETUP (Choose Flask or FastAPI)
# =============================================

from flask import Flask, request, jsonify

app = Flask(__name__)

# =============================================
# CONFIG FROM ENV
# =============================================

BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")
MONGO_URI = os.getenv("MONGO_URI", "")
DB_NAME = os.getenv("MONGO_DB_NAME", "hobbytribe")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION_NAME", "students")
ACADEMY_ID = os.getenv("ACADEMY_ID", "")
ACADEMY_NAME = os.getenv("ACADEMY_NAME", "Ajivasan")
BACKEND_SECRET = os.getenv("BACKEND_SECRET", "")

print("✅ TUTRLY Student Processing Backend Started")
print(f"   Database: {DB_NAME}")
print(f"   Collection: {COLLECTION_NAME}")


# =============================================
# HELPER FUNCTIONS
# =============================================

def get_value(row: Dict, key: str) -> str:
    """Extract and clean value from row."""
    if key in row and pd.notna(row[key]):
        return str(row[key]).strip()
    return ""


def normalize_gender(value: str) -> str:
    """Normalize gender values."""
    val = str(value).strip().upper() if value else ""
    if val == "M":
        return "Male"
    elif val == "F":
        return "Female"
    return ""


def format_dob(value: Any) -> str:
    """Format date of birth to YYYY-MM-DD."""
    if pd.notna(value):
        try:
            return pd.to_datetime(value).strftime("%Y-%m-%d")
        except Exception:
            return ""
    return ""


def calculate_age(dob_str: str) -> Optional[int]:
    """Calculate age from DOB string."""
    try:
        birth_year = int(dob_str.split("-")[0])
        current_year = datetime.now().year
        return current_year - birth_year
    except Exception:
        return None


# =============================================
# STUDENT BUILDER
# =============================================

def build_student(row: Dict, index: int) -> tuple[Optional[Dict], Optional[str]]:
    """
    Build a student document from Excel row.
    Returns (student_doc, error_message)
    """
    errors = []

    # Name
    first = get_value(row, "FirstName")
    middle = get_value(row, "MiddleName")
    last = get_value(row, "LastName")
    full_name = " ".join(filter(None, [first, middle, last]))

    if not full_name:
        errors.append("Missing name")

    # Gender
    gender = normalize_gender(get_value(row, "Gender"))
    if not gender:
        errors.append("Invalid gender")

    # Phone
    phone = get_value(row, "FatherMobile")
    if not phone:
        errors.append("Missing phone")

    # DOB
    dob = format_dob(row.get("DOB"))

    # Age → studentType
    age = calculate_age(dob)
    student_type = "child" if (age is not None and age < 18) else "adult"

    # Parent
    parent_name = get_value(row, "FatherName")

    # Address
    address = " ".join(filter(None, [
        get_value(row, "Address"),
        get_value(row, "Address1"),
        get_value(row, "Address2")
    ]))

    # Location (city)
    location = get_value(row, "Address1")

    if errors:
        return None, f"Row {index}: {', '.join(errors)}"

    # Build student document
    student = {
        "academyIds": [
            {
                "academyId": ObjectId(ACADEMY_ID) if ACADEMY_ID else None,
                "academyIdStr": ACADEMY_ID,
                "academyName": ACADEMY_NAME
            }
        ],
        "studentType": student_type,
        "studentName": full_name,
        "parentName": parent_name,
        "dob": dob,
        "gender": gender,
        "callingNumber": phone,
        "studentImage": "",
        "location": location,
        "address": address,
        "status": "active",
        "accountNumber": "",
        "ifscCode": "",
        "beniName": "",
        "bankName": "",
        "updatedAt": datetime.now(tz.utc)
    }

    return student, None


# =============================================
# BLOB FILE READER
# =============================================

def read_excel_from_blob(pathname: str, blob_token: str) -> pd.DataFrame:
    """
    Read Excel file from Vercel Blob private storage.
    
    Args:
        pathname: The pathname from Blob (e.g., "uploads/students.xlsx")
        blob_token: BLOB_READ_WRITE_TOKEN for authentication
    
    Returns:
        DataFrame with Excel data
    """
    # Construct Blob download URL
    blob_url = f"https://blob.vercel-storage.com/{pathname}"
    
    headers = {
        "Authorization": f"Bearer {blob_token}"
    }
    
    print(f"📥 Reading file from Blob: {pathname}")
    
    # Download file from Blob
    response = requests.get(blob_url, headers=headers, timeout=30)
    
    if response.status_code != 200:
        raise Exception(f"Failed to read file from Blob: {response.status_code}")
    
    # Read Excel from bytes
    df = pd.read_excel(BytesIO(response.content))
    
    # Clean column names
    df.columns = [col.strip() for col in df.columns]
    
    print(f"✅ Columns found: {df.columns.tolist()}")
    print(f"✅ Rows: {len(df)}")
    
    return df


# =============================================
# PROCESS ENDPOINT
# =============================================

@app.route("/process-students", methods=["POST"])
def process_students():
    """
    Main endpoint to process student Excel file.
    
    Expected JSON:
    {
        "blobPathname": "uploads/students.xlsx",
        "filename": "students.xlsx",
        "blobToken": "..."
    }
    """
    try:
        # Verify authentication
        if BACKEND_SECRET:
            auth_header = request.headers.get("Authorization", "")
            if auth_header != f"Bearer {BACKEND_SECRET}":
                return jsonify({"error": "Unauthorized"}), 401
        
        body = request.get_json()
        blob_pathname = body.get("blobPathname")
        filename = body.get("filename")
        blob_token = body.get("blobToken")
        
        if not blob_pathname or not blob_token:
            return jsonify({"error": "Missing blobPathname or blobToken"}), 400
        
        print(f"\n🚀 Processing started: {filename}")
        
        # Step 1: Read Excel from Blob
        df = read_excel_from_blob(blob_pathname, blob_token)
        
        # Step 2: Build student documents
        students = []
        errors_log = []
        
        for idx, row in df.iterrows():
            student, error = build_student(row, idx + 1)
            if error:
                errors_log.append(error)
            else:
                students.append(student)
        
        print(f"✅ Valid students: {len(students)}")
        print(f"⚠️ Skipped rows: {len(errors_log)}")
        
        for err in errors_log[:5]:
            print(f"   ❌ {err}")
        
        # Step 3: Connect to MongoDB and upsert
        if not MONGO_URI:
            raise Exception("MONGO_URI not configured")
        
        client = MongoClient(MONGO_URI, tls=True, serverSelectionTimeoutMS=30000)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        print(f"✅ Connected to MongoDB: {DB_NAME}.{COLLECTION_NAME}")
        
        success_count = 0
        
        for student in students:
            try:
                result = collection.update_one(
                    {
                        "studentName": student["studentName"],
                        "callingNumber": student["callingNumber"]
                    },
                    {
                        "$set": student,
                        "$setOnInsert": {"createdAt": datetime.now(tz.utc)}
                    },
                    upsert=True
                )
                
                if result.upserted_id or result.modified_count > 0:
                    success_count += 1
            except Exception as e:
                print(f"   ❌ Error upserting student: {e}")
                errors_log.append(f"Upsert error: {str(e)}")
        
        client.close()
        
        print(f"🚀 Successfully upserted {success_count}/{len(students)} students")
        print("✅ Processing completed\n")
        
        return jsonify({
            "success": True,
            "message": "Student data processed successfully",
            "stats": {
                "total_rows": len(df),
                "valid_students": len(students),
                "upserted_count": success_count,
                "errors": len(errors_log),
                "error_log": errors_log[:10]  # Return first 10 errors
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            "error": "Processing failed",
            "message": str(e)
        }), 500


# =============================================
# HEALTH CHECK
# =============================================

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "TUTRLY Student Processing"}), 200


# =============================================
# RUN SERVER
# =============================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
