from application import create_app, db
db.create_all(app=create_app())
