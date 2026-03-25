const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            if (element === '.env.example' || element.includes('package-lock.json')) return;
            fs.copyFileSync(fromPath, toPath);
            console.log('Copied File: ', toPath);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

const p = 'c:/SAHIL YADAV FOLDER/VS Code/YT - COMPLETE BACKEND/BACKEND-LEDGER';
const srcBackend = path.join(p, '__zip_extract__/enhanced-projects/Backend-Ledger-AI-Enhanced/backend/src');
const destBackend = path.join(p, 'backend/src');

const srcFrontend = path.join(p, '__zip_extract__/enhanced-projects/Backend-Ledger-AI-Enhanced/frontend/src');
const destFrontend = path.join(p, 'frontend/src');

copyFolderSync(srcBackend, destBackend);
copyFolderSync(srcFrontend, destFrontend);

// Ensure index.js has ai routes
let indexJsPath = path.join(destBackend, 'index.js');
let indexJs = fs.readFileSync(indexJsPath, 'utf8');
if(!indexJs.includes('ai.routes')) {
    indexJs = indexJs.replace('const transactionRoutes = require("./modules/transactions/transaction.routes");', 'const transactionRoutes = require("./modules/transactions/transaction.routes");\nconst aiRoutes = require("./modules/ai/ai.routes");');
    indexJs = indexJs.replace('app.use("/api/transactions", apiLimiter, transactionRoutes);', 'app.use("/api/transactions", apiLimiter, transactionRoutes);\napp.use("/api/ai", apiLimiter, aiRoutes);');
    fs.writeFileSync(indexJsPath, indexJs);
}

// Restore transaction models
let txModelPath = path.join(destBackend, 'modules/transactions/transaction.model.js');
let txModel = fs.readFileSync(txModelPath, 'utf8');
if(!txModel.includes('category: {')) {
    txModel = txModel.replace('    note: {', '    category: { type: String, default: "other", trim: true },\n    isFlagged: { type: Boolean, default: false },\n    isFraud: { type: Boolean, default: false },\n    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },\n    note: {');
    fs.writeFileSync(txModelPath, txModel);
}

// Ensure Dashboard has AIAssistant
let dashboardPath = path.join(destFrontend, 'features/dashboard/Dashboard.jsx');
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
if(!dashboard.includes('import AIAssistant')) {
    dashboard = dashboard.replace('import InvestmentCard from "./components/InvestmentCard";', 'import InvestmentCard from "./components/InvestmentCard";\nimport AIAssistant from "./components/AIAssistant";');
    dashboard = dashboard.replace('{/* FOOTER SPACE */}', '{/* AI ASSISTANT PANEL */}\n      <AIAssistant />\n\n      {/* FOOTER SPACE */}');
    fs.writeFileSync(dashboardPath, dashboard);
}

// Ensure ai.routes.js is fixed to authMiddleware.protect
let aiRoutesPath = path.join(destBackend, 'modules/ai/ai.routes.js');
if (fs.existsSync(aiRoutesPath)) {
    let aiRoutesStr = fs.readFileSync(aiRoutesPath, 'utf8');
    aiRoutesStr = aiRoutesStr.replace('router.use(authMiddleware);', 'router.use(authMiddleware.protect);');
    fs.writeFileSync(aiRoutesPath, aiRoutesStr);
}

console.log('DONE COPYING BACKEND-LEDGER IMPROVEMENTS');
