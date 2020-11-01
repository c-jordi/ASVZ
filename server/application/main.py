from flask import Blueprint, request, jsonify, Response, make_response
from werkzeug.security import generate_password_hash
import os
import json
from time import time

from . import db
from .models import Enrollment
from .enrollment import add_target, get_targets, remove_target, hide_target
from .auth import is_whitelisted


main = Blueprint('main', __name__)


@main.route("/load", methods=["POST"])
def load():
    data = request.get_json()
    is_wl = is_whitelisted(**data)
    if not is_wl:
        return jsonify({"is_auth": is_wl})
    targets = get_targets(**data)
    return jsonify({"is_auth": is_wl, "targets": targets})


@main.route("/add", methods=["POST"])
def add():
    data = request.get_json()
    is_wl = is_whitelisted(**data)
    if not is_wl:
        return jsonify({"is_auth": is_wl})
    return jsonify(add_target(**data))


@main.route("/remove", methods=["POST"])
def remove():
    data = request.get_json()
    is_wl = is_whitelisted(**data)
    if not is_wl:
        return jsonify({"is_auth": is_wl})
    return jsonify(remove_target(**data))


@main.route("/hide", methods=["POST"])
def hide():
    data = request.get_json()
    is_wl = is_whitelisted(**data)
    if not is_wl:
        return jsonify({"is_auth": is_wl})
    return jsonify(hide_target(**data))
