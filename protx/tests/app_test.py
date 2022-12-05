def test_dash_analytics(test_client, core_api_workbench_request):
    response = test_client.get('/protx/dash/analytics')
    assert response.status_code == 200


def test_dash_analytics_redirect_with_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    response = test_client.get('/protx/dash/analytics')
    assert response.status_code == 302
    assert response.location == 'http://localhost//protx/onboarding'


def test_dash_onboarding(test_client, core_api_workbench_request):
    response = test_client.get('/protx/onboarding')
    assert response.status_code == 200


def test_verify_user_redirect_with_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    response = test_client.get('/protx/verify-user')
    assert response.status_code == 302
    assert response.location == 'http://localhost//workbench/onboarding'


def test_verify_user_redirect_with_setup_complete_true(test_client, core_api_workbench_request):
    response = test_client.get('/protx/verify-user')
    assert response.status_code == 302
    assert response.location == 'http://localhost//analytics'
