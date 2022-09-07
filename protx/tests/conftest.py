import pytest
from protx.app import app


@pytest.fixture()
def test_client():
    with app.app_context():
        yield app.test_client()


WORKBENCH_PATH = "/api/workbench"


@pytest.fixture
def core_api_workbench_request_unauthed(requests_mock):
    requests_mock.get(WORKBENCH_PATH, text='No auth', reason='No auth', status_code=403)


@pytest.fixture
def core_api_workbench_request_setup_complete_false(requests_mock):
    requests_mock.get(WORKBENCH_PATH, json={"response": {"setupComplete": False}})


@pytest.fixture
def core_api_workbench_request(requests_mock):
    requests_mock.get(WORKBENCH_PATH, json={"response": {"setupComplete": True}})
