from . import db


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    token = db.Column(db.String(3000))
    name = db.Column(db.String(300))
    lesson_id = db.Column(db.Integer)
    lesson_name = db.Column(db.String(300))
    lesson_time = db.Column(db.Integer)
    job_id = db.Column(db.String(300))
    enrollment_time = db.Column(db.Integer)
    hide = db.Column(db.Integer, default=0)
    position = db.Column(db.Integer, default=-1)
    change_date = db.Column(db.String(40))

    def __init__(self, user_id=None, name=None, token=None, lesson_id=None, lesson_name=None, lesson_time=None, job_id=None, enrollment_time=None, change_date=None, positon=None):
        self.user_id = user_id
        self.name = name
        self.token = token
        self.lesson_id = lesson_id
        self.lesson_name = lesson_name
        self.lesson_time = lesson_time
        self.job_id = job_id
        self.enrollment_time = enrollment_time
        self.position = positon
        self.change_date = change_date

    def json(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "lesson_id": self.lesson_id,
            "lesson_name": self.lesson_name,
            "lesson_time": self.lesson_time,
            "job_id": self.job_id,
            "enrollment_time": self.enrollment_time,
            "position": self.position
        }
