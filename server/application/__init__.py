
import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

import atexit

from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore


db = SQLAlchemy()
scheduler = BackgroundScheduler(
    jobstores={"default": SQLAlchemyJobStore(url='sqlite:///jobs.sqlite')})
atexit.register(lambda: scheduler.shutdown())


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = '9OLWxND4ojghvygfyfvykgjbv5ergd4d456d5uvi7iuh'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'

    db.init_app(app)

    from .stats import check_registration

    def job_listener(event):
        with app.app_context():
            return check_registration(event)

    scheduler.add_listener(job_listener,
                           EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
    scheduler.start()

    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    return app
