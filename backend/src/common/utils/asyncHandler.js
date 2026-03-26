// ─── Commit: The Async Safety Net ───
// What this does: Wraps your API functions in a "Safety bubble".
// Why it exists: In Node.js, if an 'async' function crashes, it often kills the whole server unless you use try/catch. This utility automates that so you don't have to type try/catch 100 times.
// How it works: It takes your function (requestHandler) and returns a new function that automatically '.catch()'s any error and sends it to the Global Error Handler.
// Interview insight: This is a form of the "Higher-Order Function" (HOF) pattern. It takes a function as input and returns a function as output.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
