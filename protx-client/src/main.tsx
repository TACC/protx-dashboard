import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import LoadingSpinner from '_common/LoadingSpinner';
import App from './App';
import './index.css';
import store from './redux/store';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <Provider store={store}>
        <Suspense fallback={<LoadingSpinner />}>
          <App />
        </Suspense>
      </Provider>
    </React.StrictMode>
  </QueryClientProvider>,
  document.getElementById('root')
);
