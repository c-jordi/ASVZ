from .params import sniper_access_key, whitelist_on, whitelist
import yaml


def is_whitelisted(user_id=None, name=None, **kargs):
    user_id = int(user_id)
    with open("./application/whitelist.yml", "r") as f:
        whitelist = yaml.load(f, Loader=yaml.FullLoader).get("whitelist")

    if user_id in whitelist:
        print(f"Connection from {user_id} {name}: Whitelisted")
        return True
    print(f"Connection from {user_id} {name}: Not whitelisted")
    return False
