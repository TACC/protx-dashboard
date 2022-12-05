
ALLOWED_HOSTS = ['cep.test']
CEP_AUTH_VERIFICATION_ENDPOINT = 'http://core:6000'
DEBUG = True
LOGIN_URL = '/auth/agave/'
LOGIN_REDIRECT_URL = "/protx/verify-user"

# FP-1728: Remove once servers have RECAPTCHA_..._KEY settings
SILENCED_SYSTEM_CHECKS = ['captcha.recaptcha_test_key_error']
