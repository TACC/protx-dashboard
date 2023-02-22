########################
# DJANGO SETTINGS COMMON
########################

_DEBUG = False

# Namespace for portal
_PORTAL_NAMESPACE = 'Protx'
_PORTAL_DOMAIN = 'Protx Portal'

# NOTE: set _WH_BASE_URL to ngrok redirect for local dev testing (i.e. _WH_BASE_URL = 'https://12345.ngrock.io', see https://ngrok.com/)
_WH_BASE_URL = 'https://pprd.frontera-portal.tacc.utexas.edu'

# Unorganized
_LOGIN_REDIRECT_URL = '/remote/login/'
_LOGOUT_REDIRECT_URL = '/cms/logout/'
_SYSTEM_MONITOR_DISPLAY_LIST = ['frontera.tacc.utexas.edu', 'lonestar6.tacc.utexas.edu', 'stampede2.tacc.utexas.edu',
                                'maverick2.tacc.utexas.edu', 'longhorn.tacc.utexas.edu']

########################
# DJANGO SETTINGS LOCAL
########################

_RT_QUEUE = 'Web & Mobile Apps'
_RT_TAG = 'ProTX_portal'

########################
# AGAVE SETTINGS
########################

_AGAVE_STORAGE_SYSTEM = 'protx.storage.default'
_AGAVE_DEFAULT_TRASH_NAME = 'Trash'

_AGAVE_JWT_HEADER = 'HTTP_X_JWT_ASSERTION_PORTALS'

########################
# ELASTICSEARCH SETTINGS
########################

_COMMUNITY_INDEX_SCHEDULE = {}

########################
# DJANGO APP: WORKSPACE
########################

_PORTAL_APPS_METADATA_NAMES = ["frontera_apps", "frontera_apps_dev"]
_PORTAL_ALLOCATION = ''
_PORTAL_APPS_DEFAULT_TAB = 'Data Processing'

########################
# DJANGO APP: DATA DEPOT
########################

_PORTAL_KEYS_MANAGER = 'portal.apps.accounts.managers.ssh_keys.KeysManager'

_PORTAL_JUPYTER_URL = "https://jupyter.tacc.cloud"
_PORTAL_JUPYTER_SYSTEM_MAP = {
    "frontera.home.{username}": "/frontera-home",
}

_PORTAL_KEY_SERVICE_ACTOR_ID = "mg06LLyrkG4Rv"
_PORTAL_DATA_DEPOT_LOCAL_STORAGE_SYSTEM_DEFAULT = 'frontera'
_PORTAL_DATA_DEPOT_LOCAL_STORAGE_SYSTEMS = {
    'frontera': {
        'name': 'My Data (Frontera)',
        'description': 'My Data on Frontera for {username}',
        'site': 'cep',
        'systemId': 'frontera.home.{username}',
        'host': 'frontera.tacc.utexas.edu',
        'rootDir': '/home1/{tasdir}',
        'port': 22,
        'icon': None,
    },
    'longhorn': {
        'name': 'My Data (Longhorn)',
        'description': 'My Data on Longhorn for {username}',
        'site': 'cep',
        'systemId': 'longhorn.home.{username}',
        'host': 'longhorn.tacc.utexas.edu',
        'rootDir': '/home/{tasdir}',
        'port': 22,
        'requires_allocation': 'longhorn3',
        'icon': None,
    }
}

_PORTAL_DATAFILES_STORAGE_SYSTEMS = [
    {
        'name': 'Shared Workspaces',
        'scheme': 'projects',
        'api': 'tapis',
        'icon': 'publications'
    },
    {
        'name': 'Google Drive',
        'system': 'googledrive',
        'scheme': 'private',
        'api': 'googledrive',
        'icon': None,
        'integration': 'portal.apps.googledrive_integration'
    }
]

########################
# DJANGO APP: ONBOARDING
########################
_PORTAL_USER_ACCOUNT_SETUP_STEPS = [
    {
        'step': 'portal.apps.onboarding.steps.mfa.MFAStep',
        'settings': {}
    },
    {
        'step': 'portal.apps.onboarding.steps.project_membership.ProjectMembershipStep',
        'settings': {
            'project_sql_id': 57877,
            'rt_queue': 'Web & Mobile Apps'
        }
    }
]

#######################
# PROJECTS SETTINGS
#######################

_PORTAL_PROJECTS_SYSTEM_PREFIX = 'protxlocal.project'
_PORTAL_PROJECTS_ID_PREFIX = 'LOCAL-PROTX'
_PORTAL_PROJECTS_ROOT_DIR = '/corral-repl/tacc/aci/PROTX/projects'
_PORTAL_PROJECTS_ROOT_SYSTEM_NAME = 'protx.project.root'
_PORTAL_PROJECTS_ROOT_HOST = 'cloud.corral.tacc.utexas.edu'
_PORTAL_PROJECTS_SYSTEM_PORT = "2222"
_PORTAL_PROJECTS_FS_EXEC_SYSTEM_ID = "cep.project.admin.data.cli"
_PORTAL_PROJECTS_PEMS_APP_ID = "cep.cloud.admin-pems-0.1"

########################
# Custom Portal Template Assets
# Asset path root is static files output dir.
# {% static %} won't work in conjunction with {{ VARIABLE }} so use full paths.
########################

# No Art.
# _PORTAL_ICON_FILENAME=''                 # Empty string yields NO icon.

# Default Art.
_PORTAL_ICON_FILENAME = '/static/protx_cms/img/org_logos/favicon.ico'

########################
# GOOGLE ANALYTICS
########################

# Using test account under personal email.
# To use during dev, Tracking Protection in browser needs to be turned OFF.
# Need to setup an admin account to aggregate tracking properties for portals.
# NOTE: Use the _AGAVE_TENANT_ID URL value when setting up the tracking property.
_GOOGLE_ANALYTICS_PROPERTY_ID = ''

########################
# WORKBENCH SETTINGS
########################
"""
This setting dictionary is a catch-all space for simple configuration
flags that will be passed to the frontend to determine what non-standard
components to render.
"""
_WORKBENCH_SETTINGS = {
    "debug": _DEBUG,
    "makeLink": True,
    "viewPath": True,
    "compressApp": 'zippy',
    "extractApp": 'extract',
    "makePublic": False,
    "hideApps": True,
    "hideDataFiles": True,
    "onboardingCompleteRedirect": '/data-and-analysis'
}
