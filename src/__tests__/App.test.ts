import '@testing-library/jest-dom'

import {render, fireEvent, screen, waitFor} from '@testing-library/svelte'

import App from '../App.svelte'

//TODO: This test is failing and need to add more test.
test('shows loading page', () => {
  const wrapper = render(App);
  const heading = screen.findByText(/Loading/);
  expect(heading).toBeInTheDocument();
})