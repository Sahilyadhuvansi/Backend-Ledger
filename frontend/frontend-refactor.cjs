const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const frontendSrc = path.join(__dirname, "src");

const fileMap = {
  // Config/Utils
  "utils/api.js": "core/utils/api.js",

  // Context
  "context/AuthContext.jsx": "core/context/AuthContext.jsx",
  "context/SocketContext.jsx": "core/context/SocketContext.jsx",

  // Shared Components
  "components/Navbar.jsx": "core/components/Navbar.jsx",
  "components/Layout.jsx": "core/components/Layout.jsx",

  // Auth Feature
  "pages/Login.jsx": "features/auth/Login.jsx",
  "pages/Register.jsx": "features/auth/Register.jsx",

  // Dashboard Feature
  "pages/Dashboard.jsx": "features/dashboard/Dashboard.jsx",

  // Accounts Feature
  "pages/AccountDetails.jsx": "features/accounts/AccountDetails.jsx",

  // Transactions Feature
  "pages/Transfer.jsx": "features/transactions/Transfer.jsx",
};

console.log("Creating directories...");
const dirsToCreate = [
  "core/utils",
  "core/context",
  "core/components",
  "features/auth",
  "features/dashboard",
  "features/accounts",
  "features/transactions",
];

dirsToCreate.forEach((dir) => {
  fs.mkdirSync(path.join(frontendSrc, dir), { recursive: true });
});

console.log("Moving files using git mv...");
for (const [oldPath, newPath] of Object.entries(fileMap)) {
  const fullOld = path.join(frontendSrc, oldPath);
  const fullNew = path.join(frontendSrc, newPath);
  if (fs.existsSync(fullOld)) {
    try {
      execSync(`git mv "${fullOld}" "${fullNew}"`);
      console.log(`Moved ${oldPath} -> ${newPath}`);
    } catch (e) {
      console.error(`Error moving ${oldPath}: ${e.message}`);
    }
  }
}

// Map logic
function resolveNewRequirePath(currentLogicalPath, requiredPath) {
  if (!requiredPath.startsWith(".")) return requiredPath;

  const absoluteCurrentOld = path.resolve(frontendSrc, currentLogicalPath);
  const absoluteRequiredOld = path.resolve(
    path.dirname(absoluteCurrentOld),
    requiredPath,
  );

  let targetOldLogicalPath = path
    .relative(frontendSrc, absoluteRequiredOld)
    .replace(/\\/g, "/");

  if (
    !targetOldLogicalPath.endsWith(".jsx") &&
    !targetOldLogicalPath.endsWith(".js")
  ) {
    if (fs.existsSync(path.join(frontendSrc, targetOldLogicalPath + ".jsx"))) {
      targetOldLogicalPath += ".jsx";
    } else if (
      fs.existsSync(path.join(frontendSrc, targetOldLogicalPath + ".js"))
    ) {
      targetOldLogicalPath += ".js";
    } else if (
      fs.existsSync(path.join(frontendSrc, targetOldLogicalPath, "index.js"))
    ) {
      targetOldLogicalPath += "/index.js";
    } else {
      // Sometimes imports omit extension. Let's try both mapping keys.
      let tryJSX = targetOldLogicalPath + ".jsx";
      let tryJS = targetOldLogicalPath + ".js";
      if (fileMap[tryJSX]) targetOldLogicalPath = tryJSX;
      else if (fileMap[tryJS]) targetOldLogicalPath = tryJS;
    }
  }

  const targetNewLogicalPath = fileMap[targetOldLogicalPath];
  if (!targetNewLogicalPath) return requiredPath; // Not moved

  const currentNewLogicalPath = fileMap[currentLogicalPath];
  if (!currentNewLogicalPath) return requiredPath;

  const absoluteCurrentNew = path.resolve(frontendSrc, currentNewLogicalPath);
  const absoluteTargetNew = path.resolve(frontendSrc, targetNewLogicalPath);

  let newRequirePath = path
    .relative(path.dirname(absoluteCurrentNew), absoluteTargetNew)
    .replace(/\\/g, "/");

  if (!newRequirePath.startsWith(".")) {
    newRequirePath = "./" + newRequirePath;
  }

  // Keep original extension omitted behaviour if it was omitted
  if (!requiredPath.endsWith(".jsx") && !requiredPath.endsWith(".js")) {
    if (newRequirePath.endsWith(".jsx") || newRequirePath.endsWith(".js")) {
      newRequirePath = newRequirePath.replace(/\.(jsx?)$/, "");
    }
  }

  return newRequirePath;
}

// 3. Rewrite `import` paths in all moved files
console.log("Rewriting import statements...");
for (const [oldPath, newPath] of Object.entries(fileMap)) {
  const fullNewPath = path.join(frontendSrc, newPath);
  if (fs.existsSync(fullNewPath)) {
    let content = fs.readFileSync(fullNewPath, "utf8");

    // Regex for import from ''
    content = content.replace(/from\s+['"](.*?)['"]/g, (match, p1) => {
      const newPathReq = resolveNewRequirePath(oldPath, p1);
      return `from "${newPathReq}"`;
    });

    fs.writeFileSync(fullNewPath, content, "utf8");
  }
}

// App.jsx
const appJsPath = path.join(frontendSrc, "App.jsx");
if (fs.existsSync(appJsPath)) {
  let content = fs.readFileSync(appJsPath, "utf8");
  content = content.replace(/from\s+['"](.*?)['"]/g, (match, p1) => {
    if (!p1.startsWith(".")) return match;
    const absPath = path.resolve(frontendSrc, p1);
    let targetOld = path.relative(frontendSrc, absPath).replace(/\\/g, "/");

    let tryJSX = targetOld + ".jsx";
    let tryJS = targetOld + ".js";
    const newTarget = fileMap[tryJSX] || fileMap[tryJS] || fileMap[targetOld];

    if (!newTarget) return match;
    let newReq = "./" + newTarget.replace(/\.(jsx?)$/, "");
    return `from "${newReq}"`;
  });
  fs.writeFileSync(appJsPath, content, "utf8");
}

console.log("Refactoring complete!");
