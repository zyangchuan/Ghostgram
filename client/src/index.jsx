import { root } from '@lynx-js/react';
import { MemoryRouter, Routes, Route } from 'react-router';

import { App } from './App.jsx';
import Layout from './components/Layout.jsx';
import Home from './screens/Home.jsx';
import Post from './screens/Post.jsx';

root.render(
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<Layout><Home /></Layout>} />
      <Route path="/post" element={<Layout><Post /></Layout>} />
    </Routes>
  </MemoryRouter>,
);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}