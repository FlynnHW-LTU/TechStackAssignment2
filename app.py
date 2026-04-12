import os
from datetime import datetime
from functools import wraps
from bson import ObjectId
from flask import Flask, jsonify, request, session, send_from_directory
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


app = Flask(__name__)

# app config
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5mb

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# db connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
db_name = os.getenv("MONGO_DB_NAME", "skill_swap_hub")
mongo_client = MongoClient(mongo_uri)
db = mongo_client[db_name]

users_col = db["users"]
resources_col = db["resources"]
skill_requests_col = db["skill_requests"]


def ensure_indexes():
    # keep email unique
    users_col.create_index([("email", ASCENDING)], unique=True)
    # help common resource filters
    resources_col.create_index([("category", ASCENDING)])
    resources_col.create_index([("title", ASCENDING), ("description", ASCENDING)])
    resources_col.create_index([("created_at", DESCENDING)])
    # help request sorting
    skill_requests_col.create_index([("upvotes_count", DESCENDING)])


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def object_id_or_none(value):
    try:
        return ObjectId(value)
    except Exception:
        return None


def serialize_user(user_doc):
    # hide password hash in responses
    return {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "full_name": user_doc.get("full_name", ""),
        "bio": user_doc.get("bio", ""),
        "hobbies": user_doc.get("hobbies", []),
        "skills": user_doc.get("skills", []),
        "profile_photo_path": user_doc.get("profile_photo_path", ""),
        "bookmarks": [str(x) for x in user_doc.get("bookmarks", [])],
        "created_at": user_doc.get("created_at", ""),
    }


def serialize_resource(resource_doc):
    # shape resource for api responses
    comments = []
    for c in resource_doc.get("comments", []):
        comments.append(
            {
                "id": c.get("id"),
                "user_id": str(c.get("user_id")),
                "user_name": c.get("user_name", ""),
                "text": c.get("text", ""),
                "created_at": c.get("created_at", ""),
            }
        )

    ratings_map = resource_doc.get("ratings_by_user", {})
    ratings_values = list(ratings_map.values())
    rating_average = round(sum(ratings_values) / len(ratings_values), 2) if ratings_values else 0.0

    return {
        "id": str(resource_doc["_id"]),
        "title": resource_doc.get("title", ""),
        "link": resource_doc.get("link", ""),
        "description": resource_doc.get("description", ""),
        "category": resource_doc.get("category", ""),
        "user_id": str(resource_doc.get("user_id")),
        "user_name": resource_doc.get("user_name", ""),
        "created_at": resource_doc.get("created_at", ""),
        "upvotes_count": resource_doc.get("upvotes_count", 0),
        "upvoted_by": [str(x) for x in resource_doc.get("upvoted_by", [])],
        "ratings_by_user": ratings_map,
        "rating_average": rating_average,
        "comments": comments,
    }


def serialize_skill_request(request_doc):
    return {
        "id": str(request_doc["_id"]),
        "title": request_doc.get("title", ""),
        "description": request_doc.get("description", ""),
        "category": request_doc.get("category", ""),
        "created_by": str(request_doc.get("created_by")),
        "created_by_name": request_doc.get("created_by_name", ""),
        "created_at": request_doc.get("created_at", ""),
        "upvotes_count": request_doc.get("upvotes_count", 0),
        "upvoted_by": [str(x) for x in request_doc.get("upvoted_by", [])],
    }


def login_required(route_fn):
    # protect routes that need a logged in user
    @wraps(route_fn)
    def wrapped(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "authentication required"}), 401
        return route_fn(*args, **kwargs)

    return wrapped


def _allowed_cors_origins():
    # comma-separated list; defaults cover Vite on 3000 (this repo) and 5173
    raw = os.getenv(
        "FRONTEND_ORIGIN",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173",
    )
    return {o.strip() for o in raw.split(",") if o.strip()}


@app.after_request
def add_basic_cors_headers(response):
    # echo request Origin only if allowlisted (required when not using Vite proxy)
    origin = request.headers.get("Origin")
    if origin in _allowed_cors_origins():
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    return response


@app.route("/api/<path:any_path>", methods=["OPTIONS"])
def options_handler(any_path):
    # allow browser preflight
    return ("", 204)


@app.get("/api/health")
def health_check():
    # quick api check
    return jsonify({"ok": True, "message": "api is running"})


@app.post("/api/auth/register")
def register():
    # create a new user
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()
    full_name = str(data.get("full_name", "")).strip()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400
    if "@" not in email:
        return jsonify({"error": "invalid email format"}), 400
    if len(password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400

    user_doc = {
        "email": email,
        "password_hash": generate_password_hash(password),
        "full_name": full_name if full_name else email.split("@")[0],
        "bio": "",
        "hobbies": [],
        "skills": [],
        "profile_photo_path": "",
        "bookmarks": [],
        "created_at": now_iso(),
    }

    try:
        result = users_col.insert_one(user_doc)
    except DuplicateKeyError:
        return jsonify({"error": "email is already registered"}), 409

    session["user_id"] = str(result.inserted_id)
    saved_user = users_col.find_one({"_id": result.inserted_id})
    return jsonify({"message": "registration successful", "user": serialize_user(saved_user)}), 201


@app.post("/api/auth/login")
def login():
    # verify credentials and start session
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", "")).strip()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user_doc = users_col.find_one({"email": email})
    if not user_doc or not check_password_hash(user_doc["password_hash"], password):
        return jsonify({"error": "invalid email or password"}), 401

    session["user_id"] = str(user_doc["_id"])
    return jsonify({"message": "login successful", "user": serialize_user(user_doc)})


@app.post("/api/auth/logout")
def logout():
    # clear current session
    session.clear()
    return jsonify({"message": "logout successful"})


@app.get("/api/auth/me")
@login_required
def auth_me():
    # return current session user
    user_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_id})
    if not user_doc:
        session.clear()
        return jsonify({"error": "session is invalid"}), 401
    return jsonify({"user": serialize_user(user_doc)})


@app.get("/api/profile")
@login_required
def get_profile():
    # get logged in user profile
    user_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"profile": serialize_user(user_doc)})


@app.put("/api/profile")
@login_required
def update_profile():
    # update profile fields
    data = request.get_json(silent=True) or {}
    allowed_fields = ["full_name", "bio", "hobbies", "skills"]
    update_data = {}

    for key in allowed_fields:
        if key in data:
            update_data[key] = data[key]

    if "hobbies" in update_data and not isinstance(update_data["hobbies"], list):
        return jsonify({"error": "hobbies must be a list"}), 400
    if "skills" in update_data and not isinstance(update_data["skills"], list):
        return jsonify({"error": "skills must be a list"}), 400

    if not update_data:
        return jsonify({"error": "no valid fields to update"}), 400

    user_id = object_id_or_none(session.get("user_id"))
    users_col.update_one({"_id": user_id}, {"$set": update_data})
    user_doc = users_col.find_one({"_id": user_id})
    return jsonify({"message": "profile updated", "profile": serialize_user(user_doc)})


@app.post("/api/profile/photo")
@login_required
def upload_profile_photo():
    # upload profile image and save path
    if "photo" not in request.files:
        return jsonify({"error": "photo file is required"}), 400

    photo_file = request.files["photo"]
    if photo_file.filename == "":
        return jsonify({"error": "photo file is required"}), 400

    safe_name = secure_filename(photo_file.filename)
    if "." not in safe_name:
        return jsonify({"error": "invalid file name"}), 400

    extension = safe_name.rsplit(".", 1)[1].lower()
    allowed = {"png", "jpg", "jpeg", "gif", "webp"}
    if extension not in allowed:
        return jsonify({"error": "unsupported file type"}), 400

    user_id_str = session.get("user_id")
    final_name = f"user_{user_id_str}_{int(datetime.utcnow().timestamp())}.{extension}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], final_name)
    photo_file.save(save_path)

    user_id = object_id_or_none(user_id_str)
    users_col.update_one({"_id": user_id}, {"$set": {"profile_photo_path": save_path}})
    user_doc = users_col.find_one({"_id": user_id})
    return jsonify({"message": "profile photo uploaded", "profile": serialize_user(user_doc)})


@app.delete("/api/profile/photo")
@login_required
def delete_profile_photo():
    user_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    old_path = user_doc.get("profile_photo_path") or ""
    if old_path:
        if os.path.isfile(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass
        elif os.path.isfile(os.path.join(app.config["UPLOAD_FOLDER"], os.path.basename(old_path))):
            try:
                os.remove(os.path.join(app.config["UPLOAD_FOLDER"], os.path.basename(old_path)))
            except OSError:
                pass

    users_col.update_one({"_id": user_id}, {"$set": {"profile_photo_path": ""}})
    user_doc = users_col.find_one({"_id": user_id})
    return jsonify({"message": "profile photo removed", "profile": serialize_user(user_doc)})


@app.get("/uploads/<path:filename>")
def serve_upload(filename):
    # serve uploaded files
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.post("/api/resources")
@login_required
def create_resource():
    # create a new skill swap resource
    data = request.get_json(silent=True) or {}
    required_fields = ["title", "link", "description", "category"]
    missing = [f for f in required_fields if not str(data.get(f, "")).strip()]
    if missing:
        return jsonify({"error": f"missing required fields: {', '.join(missing)}"}), 400

    link = str(data.get("link", "")).strip()
    if not (link.startswith("http://") or link.startswith("https://")):
        return jsonify({"error": "link must start with http:// or https://"}), 400

    user_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    resource_doc = {
        "title": str(data["title"]).strip(),
        "link": link,
        "description": str(data["description"]).strip(),
        "category": str(data["category"]).strip(),
        "user_id": user_id,
        "user_name": user_doc.get("full_name", user_doc["email"]),
        "created_at": now_iso(),
        "upvotes_count": 0,
        "upvoted_by": [],
        "ratings_by_user": {},
        "comments": [],
    }

    result = resources_col.insert_one(resource_doc)
    saved = resources_col.find_one({"_id": result.inserted_id})
    return jsonify({"message": "resource created", "resource": serialize_resource(saved)}), 201


@app.get("/api/resources")
def list_resources():
    # list resources with optional category and search
    category = request.args.get("category", "").strip()
    query = request.args.get("q", "").strip()

    mongo_query = {}
    if category:
        mongo_query["category"] = category
    if query:
        mongo_query["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
        ]

    docs = list(resources_col.find(mongo_query).sort("created_at", DESCENDING))
    return jsonify({"resources": [serialize_resource(d) for d in docs]})


@app.get("/api/resources/<resource_id>")
def get_resource(resource_id):
    # get one resource by id
    obj_id = object_id_or_none(resource_id)
    if not obj_id:
        return jsonify({"error": "invalid resource id"}), 400

    doc = resources_col.find_one({"_id": obj_id})
    if not doc:
        return jsonify({"error": "resource not found"}), 404
    return jsonify({"resource": serialize_resource(doc)})


@app.post("/api/resources/<resource_id>/upvote")
@login_required
def upvote_resource(resource_id):
    # toggle upvote for current user
    resource_obj_id = object_id_or_none(resource_id)
    if not resource_obj_id:
        return jsonify({"error": "invalid resource id"}), 400

    user_obj_id = object_id_or_none(session.get("user_id"))
    resource_doc = resources_col.find_one({"_id": resource_obj_id})
    if not resource_doc:
        return jsonify({"error": "resource not found"}), 404

    has_upvoted = user_obj_id in resource_doc.get("upvoted_by", [])
    if has_upvoted:
        resources_col.update_one(
            {"_id": resource_obj_id},
            {"$pull": {"upvoted_by": user_obj_id}, "$inc": {"upvotes_count": -1}},
        )
    else:
        resources_col.update_one(
            {"_id": resource_obj_id},
            {"$addToSet": {"upvoted_by": user_obj_id}, "$inc": {"upvotes_count": 1}},
        )

    updated = resources_col.find_one({"_id": resource_obj_id})
    return jsonify({"message": "upvote updated", "resource": serialize_resource(updated)})


@app.post("/api/resources/<resource_id>/rating")
@login_required
def rate_resource(resource_id):
    # set user rating from 1 to 5
    resource_obj_id = object_id_or_none(resource_id)
    if not resource_obj_id:
        return jsonify({"error": "invalid resource id"}), 400

    data = request.get_json(silent=True) or {}
    rating_value = data.get("rating")
    if not isinstance(rating_value, int) or rating_value < 1 or rating_value > 5:
        return jsonify({"error": "rating must be an integer from 1 to 5"}), 400

    user_id_str = session.get("user_id")
    result = resources_col.update_one(
        {"_id": resource_obj_id},
        {"$set": {f"ratings_by_user.{user_id_str}": rating_value}},
    )
    if result.matched_count == 0:
        return jsonify({"error": "resource not found"}), 404

    updated = resources_col.find_one({"_id": resource_obj_id})
    return jsonify({"message": "rating updated", "resource": serialize_resource(updated)})


@app.post("/api/resources/<resource_id>/comments")
@login_required
def add_comment(resource_id):
    # add comment to one resource
    resource_obj_id = object_id_or_none(resource_id)
    if not resource_obj_id:
        return jsonify({"error": "invalid resource id"}), 400

    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "comment text is required"}), 400

    user_obj_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_obj_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    comment_doc = {
        "id": str(ObjectId()),
        "user_id": user_obj_id,
        "user_name": user_doc.get("full_name", user_doc["email"]),
        "text": text,
        "created_at": now_iso(),
    }

    result = resources_col.update_one({"_id": resource_obj_id}, {"$push": {"comments": comment_doc}})
    if result.matched_count == 0:
        return jsonify({"error": "resource not found"}), 404

    updated = resources_col.find_one({"_id": resource_obj_id})
    return jsonify({"message": "comment added", "resource": serialize_resource(updated)}), 201


@app.post("/api/users/bookmarks/<resource_id>")
@login_required
def toggle_bookmark(resource_id):
    # toggle saved resource for current user
    resource_obj_id = object_id_or_none(resource_id)
    if not resource_obj_id:
        return jsonify({"error": "invalid resource id"}), 400

    resource_exists = resources_col.find_one({"_id": resource_obj_id}, {"_id": 1})
    if not resource_exists:
        return jsonify({"error": "resource not found"}), 404

    user_obj_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_obj_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    has_bookmark = resource_obj_id in user_doc.get("bookmarks", [])
    if has_bookmark:
        users_col.update_one({"_id": user_obj_id}, {"$pull": {"bookmarks": resource_obj_id}})
        action = "removed"
    else:
        users_col.update_one({"_id": user_obj_id}, {"$addToSet": {"bookmarks": resource_obj_id}})
        action = "added"

    updated = users_col.find_one({"_id": user_obj_id})
    return jsonify({"message": f"bookmark {action}", "bookmarks": [str(x) for x in updated.get("bookmarks", [])]})


@app.get("/api/users/bookmarks")
@login_required
def list_bookmarks():
    # list saved resources for user
    user_obj_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_obj_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    bookmark_ids = user_doc.get("bookmarks", [])
    docs = list(resources_col.find({"_id": {"$in": bookmark_ids}}))
    return jsonify({"resources": [serialize_resource(d) for d in docs]})


@app.get("/api/recommendations/ai-tools")
def ai_tools():
    # highlight ai tool resources
    docs = list(resources_col.find({"category": {"$regex": "^ai-tools$", "$options": "i"}}).sort("created_at", DESCENDING))
    return jsonify({"resources": [serialize_resource(d) for d in docs]})


@app.get("/api/recommendations/popular-in-hobbies")
@login_required
def popular_in_hobbies():
    # suggest popular resources from user hobbies
    user_obj_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_obj_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    hobbies = user_doc.get("hobbies", [])
    if not hobbies:
        return jsonify({"resources": [], "message": "add hobbies to get recommendations"})

    docs = list(
        resources_col.find({"category": {"$in": hobbies}})
        .sort("upvotes_count", DESCENDING)
        .limit(10)
    )
    return jsonify({"resources": [serialize_resource(d) for d in docs]})


@app.post("/api/skill-requests")
@login_required
def create_skill_request():
    # create a community skill request
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    category = str(data.get("category", "")).strip()

    if not title or not category:
        return jsonify({"error": "title and category are required"}), 400

    user_obj_id = object_id_or_none(session.get("user_id"))
    user_doc = users_col.find_one({"_id": user_obj_id})
    if not user_doc:
        return jsonify({"error": "user not found"}), 404

    request_doc = {
        "title": title,
        "description": description,
        "category": category,
        "created_by": user_obj_id,
        "created_by_name": user_doc.get("full_name", user_doc["email"]),
        "created_at": now_iso(),
        "upvoted_by": [],
        "upvotes_count": 0,
    }
    result = skill_requests_col.insert_one(request_doc)
    saved = skill_requests_col.find_one({"_id": result.inserted_id})
    return jsonify({"message": "skill request created", "skill_request": serialize_skill_request(saved)}), 201


@app.get("/api/skill-requests")
def list_skill_requests():
    # list requests sorted by votes
    docs = list(skill_requests_col.find().sort("upvotes_count", DESCENDING))
    return jsonify({"skill_requests": [serialize_skill_request(d) for d in docs]})


@app.post("/api/skill-requests/<request_id>/vote")
@login_required
def vote_skill_request(request_id):
    # toggle vote on a skill request
    request_obj_id = object_id_or_none(request_id)
    if not request_obj_id:
        return jsonify({"error": "invalid request id"}), 400

    user_obj_id = object_id_or_none(session.get("user_id"))
    request_doc = skill_requests_col.find_one({"_id": request_obj_id})
    if not request_doc:
        return jsonify({"error": "skill request not found"}), 404

    has_voted = user_obj_id in request_doc.get("upvoted_by", [])
    if has_voted:
        skill_requests_col.update_one(
            {"_id": request_obj_id},
            {"$pull": {"upvoted_by": user_obj_id}, "$inc": {"upvotes_count": -1}},
        )
    else:
        skill_requests_col.update_one(
            {"_id": request_obj_id},
            {"$addToSet": {"upvoted_by": user_obj_id}, "$inc": {"upvotes_count": 1}},
        )

    updated = skill_requests_col.find_one({"_id": request_obj_id})
    return jsonify({"message": "vote updated", "skill_request": serialize_skill_request(updated)})


@app.errorhandler(404)
def not_found_error(error):
    # central 404 handler
    return jsonify({"error": "route not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    # central 500 handler
    return jsonify({"error": "internal server error"}), 500


if __name__ == "__main__": # actually run the thing
    ensure_indexes()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
