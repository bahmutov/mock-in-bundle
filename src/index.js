/// <reference types="cypress" />
// @ts-check

export const mockInBundle = (
  localModuleName, // like "src/Board.js"
  mockedExports,
  jsResourcePattern = /\.js$/,
) => {
  if (!mockedExports) {
    throw new Error('mockedExports is required')
  }

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

      const namedExports = Cypress._.omit(mockedExports, ['default'])
      if (!Cypress._.isEmpty(namedExports)) {
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
