/// <reference types="cypress" />
// @ts-check

// Cypress bundles Lodash library
const { _ } = Cypress

export const mockInBundle = (
  localModuleName, // like "src/Board.js"
  mockedExports,
  jsResourcePattern = /\.js$/,
) => {
  if (!mockedExports) {
    throw new Error('mockedExports is required')
  }

  // inject any function defined in the spec file
  mockedExports = _.mapValues(mockedExports, (value) =>
    _.isFunction(value) ? injectFn(value) : value,
  )

  cy.intercept(jsResourcePattern, (req) => {
    // remove caching
    delete req.headers['if-none-match']

    req.continue((res) => {
      // make sure not to cache the modified response
      delete res.headers.etag

      const moduleFileName = localModuleName + '":'
      const k = res.body.indexOf(moduleFileName)
      if (k === -1) {
        // could not the module in the script
        return
      }
      // give this interception an alias
      // to make it clear to see where we modified the JS code
      // NOTE: the alias is not shown in the command log yet
      // https://github.com/cypress-io/cypress/issues/17819

      const insertAt = k + moduleFileName.length
      const start = res.body.substring(0, insertAt)
      const finish = res.body.substring(insertAt)

      let namedExportsCode = ''

      const namedExports = _.omit(mockedExports, ['default'])
      if (!_.isEmpty(namedExports)) {
        Object.keys(namedExports).forEach((key) => {
          const value = namedExports[key]
          namedExportsCode += `
            __webpack_require__.d(__webpack_exports__, "${key}", function () { return ${value} });
          `
        })
      }

      let defaultExportCode = ''
      if (mockedExports.default) {
        defaultExportCode = `
          __webpack_exports__['default'] = ${JSON.stringify(
            mockedExports.default,
          )};
        `
      }

      res.body =
        start +
        `
          (function(module, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            ${namedExportsCode}
            ${defaultExportCode}
          })
          /* add OR to ignore the current module that follows */
          || ` +
        finish
    })
  })
}

export const injectFn = (fn) => {
  const randomFnId = Math.random().toString(36).substring(7)
  const winId = `__mockInBundle__${randomFnId}`
  const windowId = `window.${winId}`

  cy.on('window:before:load', (win) => {
    win[winId] = fn
  })

  return windowId
}
