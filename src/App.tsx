import Layout from '@/components/Layout';
import Home from '@/components/Main';
import { store } from '@/lib/context/store';
import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

const Setting = lazy(() => import('@/components/Setting'));

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="setting"
            element={
              <Suspense>
                <Setting />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Provider>
  );
}

export default App;
