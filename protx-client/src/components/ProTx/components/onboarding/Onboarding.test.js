import React from 'react';
import Onboarding from './Onboarding';
import { render } from '@testing-library/react';

describe('Onboarding', () => {
  it('has message and link', () => {
    const { getByText } = render(<Onboarding/>);
    expect(getByText(/Your account has not be configured. Please check status by clicking/)).toBeDefined();
    expect(
        getByText(/here/)
          .closest('a')
          .getAttribute('href')
      ).toBe('/workbench/onboarding');
    });
});
