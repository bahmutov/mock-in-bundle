/// <reference types="cypress" />

import { mockInBundle } from '../..'

it('mocks inside Webpack dev JS bundle', () => {
  expect(mockInBundle).to.be.a('function')
})
