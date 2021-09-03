/// <reference types="cypress" />
// @ts-check

// Cypress bundles Lodash library
const { _ } = Cypress

/**
 * Takes each function in the given object
 * and replaces it with injected one.
 * This allows functions defined in the spec file
 * to be used inside the application.
 */
const injectFunctions = (mockedExports) => {
  return _.mapValues(mockedExports, (value) =>
    _.isFunction(value) ? injectFn(value) : value,
  )
}

const replaceModules = (localModuleName, mockedExports, body) => {
  // body is the JavaScript bundle returned by the server
  const moduleFileName = localModuleName + '":'
  const k = body.indexOf(moduleFileName)
  if (k === -1) {
    // could not the module in the script
    return
  }
  // give this interception an alias
  // to make it clear to see where we modified the JS code
  // NOTE: the alias is not shown in the command log yet
  // https://github.com/cypress-io/cypress/issues/17819

  const insertAt = k + moduleFileName.length
  const start = body.substring(0, insertAt)
  const finish = body.substring(insertAt)

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

  const str =
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

  return str
}

const mockSingleModule = (
  localModuleName, // like "src/Board.js"
  mockedExports,
  jsResourcePattern = /\.js$/,
) => {
  if (!mockedExports) {
    throw new Error('mockedExports is required')
  }

  // inject any function defined in the spec file
  mockedExports = injectFunctions(mockedExports)

  cy.intercept(jsResourcePattern, (req) => {
    // remove caching
    delete req.headers['if-none-match']

    req.continue((res) => {
      // make sure not to cache the modified response
      delete res.headers.etag

      res.body = replaceModules(localModuleName, mockedExports, res.body)
    })
  })
}

export const mockInBundle = (
  localModuleName, // like "src/Board.js"
  mockedExports,
  jsResourcePattern = /\.js$/,
) => {
  if (_.isString(localModuleName)) {
    return mockSingleModule(localModuleName, mockedExports, jsResourcePattern)
  }

  // mocking multiple modules from the bundle
  jsResourcePattern = mockedExports
  const modulesToMock = _.mapValues(localModuleName, (mockedExports) => {
    return injectFunctions(mockedExports)
  })

  cy.intercept(jsResourcePattern, (req) => {
    // remove caching
    delete req.headers['if-none-match']

    req.continue((res) => {
      // make sure not to cache the modified response
      delete res.headers.etag

      let jsBody = res.body
      Object.keys(modulesToMock).forEach((moduleName) => {
        debugger
        const moduleMocks = modulesToMock[moduleName]
        jsBody = replaceModules(moduleName, moduleMocks, jsBody)
      })

      res.body = jsBody
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
