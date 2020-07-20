// TODO: Remove this file once using actual profile data

export const userIsAuthenticated = true;
export const testProfileData = {
    "username": "isaac newton",
    "email": "isaac@lco.global",
    "profile": {
        "education_user": false,
        "notifications_enabled": false,
        "notifications_on_authored_only": false,
        "simple_interface": false,
        "view_authored_requests_only": false,
        "staff_view": true,
    },
    "proposals": [
        {
            "id": "auto_focus",
            "title": "LCOGT Autofocus",
            "current": true
        },
        {
            "id": "calibrate",
            "title": "LCOGT calibrations",
            "current": false
        }
    ]
}


export default { testProfileData, userIsAuthenticated }
