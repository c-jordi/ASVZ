from . import db, scheduler
from .models import Enrollment
from uuid import uuid1
import requests
import json

from datetime import timedelta, datetime
import time


def get_targets(user_id, name):
    records = Enrollment.query.filter_by(
        user_id=user_id, name=name, hide=0
    ).all()
    targets = []
    for record in records:
        targets.append(record.json())
    return targets


def add_target(user_id, name, access_token, target, **kargs):
    record = Enrollment.query.filter_by(
        user_id=user_id, lesson_id=target["lesson_id"], lesson_time=target["lesson_time"]
    ).first()
    if record:
        print("ASVZ Entry already exists")
        return {"added": False, "msg": "Already exists."}
    job_id = add_job(
        access_token, target["lesson_id"], target["enrollment_from"])

    new_enroll = Enrollment(user_id=user_id, name=name, token=access_token, lesson_id=target["lesson_id"], job_id=job_id,
                            lesson_name=target["lesson_name"], lesson_time=target["lesson_time"], enrollment_time=target["enrollment_from"])

    print("Added ASVZ entry:", user_id, name, " -> ",
          target["lesson_id"], target["lesson_name"])
    db.session.add(new_enroll)
    db.session.commit()
    return {'added': True}


def add_job(token, lesson_id, enrollment_from):
    job_id = uuid1().hex
    scheduler.add_job(enroll_request, trigger="date", args=[token, lesson_id,
                                                            enrollment_from], id=job_id, run_date=datetime.fromtimestamp(enrollment_from/1000))
    return job_id


def enroll_request(token, lesson_id, current_time):
    HEADERS = {
        "Accept": 'application/json, text/plain, */*',
        "Authorization": "Bearer " + token.strip(),
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
        "Content_Type": "application/json",
        "Host": 'schalter.asvz.ch',
        "Cache-Control": "no-cache",
        "Pragma": 'no-cache',
        "Referer": f'https://schalter.asvz.ch/tn/lessons/{lesson_id}'
    }
    endpoint = f"https://schalter.asvz.ch/tn-api/api/Lessons/{lesson_id}/enroll??t={current_time}"
    rq = requests.post(endpoint, data={}, headers=HEADERS)
    print("request status:", rq.status_code, rq.text,)


def remove_target(user_id, name, lesson_time, job_id, lesson_id, **kargs):
    record = Enrollment.query.filter_by(
        user_id=user_id, lesson_id=lesson_id, job_id=job_id, name=name, lesson_time=lesson_time
    ).first()
    if record:
        job_id = record.job_id
        db.session.delete(record)
        db.session.commit()
        scheduler.remove_job(job_id)
        return {'removed': True}
    return {"removed": False, "msg": "Record doesn't exist"}


def hide_target(user_id, name, lesson_time, job_id, lesson_id, **kargs):
    record = Enrollment.query.filter_by(
        user_id=user_id, lesson_id=lesson_id, job_id=job_id, name=name, lesson_time=lesson_time
    ).first()
    if record:
        record.hide = 1
        db.session.commit()
        return {'hidden': True}
    return {"hidden": False, "msg": "Record doesn't exist"}


def get_position(lesson_id, token):
    current_time = int(round(time.time() * 1000))  # in ms
    HEADERS = {
        "Accept": 'application/json, text/plain, */*',
        "Authorization": "Bearer " + token.strip(),
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
        "Content_Type": "application/json",
        "Host": 'schalter.asvz.ch',
        "Cache-Control": "no-cache",
        "Pragma": 'no-cache',
        "Referer": f'https://schalter.asvz.ch/tn/lessons/{lesson_id}'
    }
    endpoint = f"https://schalter.asvz.ch/tn-api/api/Lessons/{lesson_id}/MyEnrollment??t={current_time}"
    rq = requests.get(endpoint, headers=HEADERS)
    if rq.status_code == 200:
        data = rq.json()
        return data["data"]["placeNumber"], data["data"]["changeDate"]
    return 0, None
