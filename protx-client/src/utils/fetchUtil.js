import Cookies from 'js-cookie';

export class FetchError extends Error {
  constructor(json, response) {
    super(json.message);
    this.name = 'FetchError';
    this.status = response.status;
  }
}

function redirectToOnboarding() {
  window.location.replace(`${window.location.origin}/workbench/onboarding`);
}

export async function fetchUtil({ url, params, ...options }) {
  const request = new URL(url, window.location.origin);
  await Object.entries(params || {}).forEach(([key, val]) =>
    request.searchParams.append(key, val)
  );

  const fetchParams = {
    credentials: 'same-origin',
    ...options
  };
  fetchParams.headers = {
    'X-CSRFToken': Cookies.get('csrftoken'),
    ...fetchParams.headers
  };

  const response = await fetch(request, fetchParams);
  const json = await response.json();
  if (!response.ok) {
    if (response.status === 403 && json.message === 'onboarding incomplete') {
      redirectToOnboarding();
    } else {
      throw new FetchError(json, response);
    }
  }

  return json;
}
