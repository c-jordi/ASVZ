from . import db
from .models import Enrollment
from .enrollment import get_position


def check_registration(event):
    job_id = event.job_id
    record = Enrollment.query.filter_by(
        job_id=job_id).first()

    if record:
        position, change_date = get_position(
            record.lesson_id, record.token)
        record.position = position
        record.change_date = change_date
        db.session.commit()


def job_error(event):
    pass
