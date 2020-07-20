// TODO: Remove this file once using actual profile data
import { copyObject } from '@/utils.js';

export const userIsAuthenticated = true;
export const testProfileData = {
    "username": "eng",
    "email": "eng@lco.global",
    "profile": {
        "education_user": false,
        "notifications_enabled": false,
        "notifications_on_authored_only": false,
        "simple_interface": false,
        "view_authored_requests_only": false,
        "staff_view": false,
    },
    "proposals": [
        {
            "id": "current",
            "title": "Proposal is current",
            "current": true
        },
        {
            "id": "non_current",
            "title": "Proposal is not current",
            "current": false
        }
    ]
}

export function getTestProfileData(query) {
    if (query.loggedIn === 'true') {
        console.log('Setting logged in');
        let data = copyObject(testProfileData);
        if (query.authoredRequestsOnly === 'true') {
            console.log('Setting authored requests only');
            data.profile.view_authored_requests_only = true;
        }
        if (query.simpleInterface === 'true') {
            console.log('Setting simple interface');
            data.profile.simple_interface = true;
        }
        if (query.noProposals === 'true') {
            console.log('Setting no proposals');
            data.proposals = [];
        }
        if (query.noCurrentProposals === 'true') {
            console.log('Setting no current proposals');
            data.proposals = [
                {
                    "id": "non_current",
                    "title": "Proposal is not current",
                    "current": false
                }
            ]
        }
        return [data, true];
    } else {
        console.log('Not logged in');
        return [{}, false];
    }
}

export default { testProfileData, userIsAuthenticated, getTestProfileData }
