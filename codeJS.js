var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v4.96");
console.log("=== codeJS.js LOADED ===", new Date().toISOString());

function createTextArea() {
    // Find the first element with class 'instanceHolder'
    var closeHolderDiv = document.querySelector('.instanceHolder');

    if (closeHolderDiv) {
      // Create the textarea
      var textarea = document.createElement('textarea');
      //textarea.id = 'console-output';
      
      // Optional: Set some default styles or attributes
      textarea.rows = 10;
      textarea.cols = 50;
      textarea.placeholder = 'Console output will appear here...';

      // Append the textarea to the div
      closeHolderDiv.appendChild(textarea);
    } else {
      console.warn('No element with class "instanceHolder" found.');
    }
}


function setItem_106(itemInstance, instanceObj) {
    console.log("=== setItem_106 START ===", new Date().toISOString());
    console.log("Item Instance:", {
        id: itemInstance.id,
        className: itemInstance.className,
        childNodes: itemInstance.childNodes.length,
        html: itemInstance.innerHTML.substring(0, 200) + "..."
    });
    console.log("Instance Object:", {
        iid: instanceObj.iid,
        type: instanceObj.type,
        keys: Object.keys(instanceObj)
    });
    
    // DETAILED DEBUGGING: Compare with NotebookInstance_Pyodide expectations
    console.log("=== EVALUATION DATA DEBUGGING ===");
    console.log("🔍 FULL instanceObj:", instanceObj);
    console.log("🔍 instanceObj.evaluation (raw):", instanceObj.evaluation);
    console.log("🔍 instanceObj.evaluation type:", typeof instanceObj.evaluation);
    
    // Check if evaluation exists but is in a different format
    Object.keys(instanceObj).forEach(key => {
        const value = instanceObj[key];
        console.log(`🔍 Property ${key}:`, value);
        
        // Try to parse if it looks like JSON
        if (typeof value === 'string') {
            if (value.includes('input') || value.includes('output') || value.includes('mark') || value.includes('evaluation')) {
                console.log(`🎯 Property ${key} might contain evaluation data:`, value);
                try {
                    const parsed = JSON.parse(value);
                    console.log(`🎯 Parsed ${key}:`, parsed);
                } catch (e) {
                    console.log(`❌ Could not parse ${key} as JSON:`, e.message);
                }
            }
        }
    });
    
    // COMPREHENSIVE DEBUGGING: Log ALL properties of instanceObj
    console.log("=== FULL INSTANCE OBJECT DEBUG ===");
    console.log("instanceObj:", instanceObj);
    console.log("instanceObj keys:", Object.keys(instanceObj));
    
    // Check specifically for evaluation-related properties
    console.log("=== EVALUATION DATA SEARCH ===");
    console.log("instanceObj.evaluation:", instanceObj.evaluation);
    console.log("instanceObj.evaluations:", instanceObj.evaluations);
    console.log("instanceObj.eval:", instanceObj.eval);
    console.log("instanceObj.tests:", instanceObj.tests);
    console.log("instanceObj.answer:", instanceObj.answer);
    console.log("instanceObj.solution:", instanceObj.solution);
    console.log("instanceObj.content:", instanceObj.content);
    console.log("instanceObj.itemcontent:", instanceObj.itemcontent);
    
    // Log all properties that might contain evaluation data
    Object.keys(instanceObj).forEach(key => {
        const value = instanceObj[key];
        if (typeof value === 'string' && value.includes('evaluation')) {
            console.log(`Property ${key} contains 'evaluation':`, value);
        }
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
                const parsed = JSON.parse(value);
                console.log(`Property ${key} contains JSON:`, parsed);
            } catch (e) {
                // Not JSON, ignore
            }
        }
    });
    
    // Store instanceObj for later use in testing
    itemInstance._instanceObj = instanceObj;
    
    // BASETYPE 19 FIX: For "Evaluation through JS" items, server doesn't provide evaluation data
    // We need to manually fetch it if missing
    console.log("=== BASETYPE 19 EVALUATION FIX ===");
    console.log(`Item basetype: ${instanceObj.basetype}, evaluation present: ${!!instanceObj.evaluation}`);
    
    if (instanceObj.basetype == 19 && !instanceObj.evaluation) {
        console.log("🔧 Basetype 19 missing evaluation data - attempting to load manually");
        
        // Try to fetch evaluation data from server
        attemptToLoadEvaluationData(itemInstance, instanceObj);
    }
    
    // Additional debugging: Check if this matches the EditionMode format
    console.log("=== COMPARING TO EDITIONMODE FORMAT ===");
    console.log("🔍 Expected EditionMode evaluation format:");
    console.log("   - Array of objects with: {input, output, mark, commentTrue, commentFalse}");
    console.log("   - Method name: evalPython");  
    console.log("   - Return type: return");
    console.log("🔍 Current instanceObj properties check:");
    
    // Look for properties that might contain evaluation in EditionMode format
    const potentialEvalProps = ['evaluation', 'evaluations', 'tests', 'testCases'];
    potentialEvalProps.forEach(prop => {
        if (instanceObj[prop]) {
            console.log(`✅ Found ${prop}:`, instanceObj[prop]);
            if (typeof instanceObj[prop] === 'string') {
                try {
                    const parsed = JSON.parse(instanceObj[prop]);
                    console.log(`✅ Parsed ${prop}:`, parsed);
                    if (Array.isArray(parsed)) {
                        console.log(`✅ ${prop} is array with ${parsed.length} items`);
                        parsed.forEach((item, index) => {
                            console.log(`   Item ${index}:`, item);
                        });
                    }
                } catch (e) {
                    console.log(`❌ Could not parse ${prop}:`, e.message);
                }
            }
        } else {
            console.log(`❌ Missing ${prop}`);
        }
    });
    
    // Get the answer element
    const answerElement = itemInstance.querySelector(".answer");
    console.log("Answer Element Details:", {
        found: !!answerElement,
        id: answerElement?.id,
        className: answerElement?.className,
        value: answerElement?.value?.substring(0, 50) + "...",
        parentNode: answerElement?.parentNode?.id
    });
    
    if (!answerElement) {
        console.error("No answer element found in:", {
            itemId: itemInstance.id,
            html: itemInstance.innerHTML.substring(0, 200) + "..."
        });
        return;
    }

    // DEBUGGING: Log initial state of answer element
    console.log("=== ANSWER ELEMENT INITIAL STATE ===");
    console.log("answerElement.value:", answerElement.value);
    console.log("answerElement.innerHTML:", answerElement.innerHTML);
    console.log("answerElement.textContent:", answerElement.textContent);
    
    // Store initial content before clearing
    const initialContent = answerElement.value.trim();
    const initialInnerHTML = answerElement.innerHTML.trim();
    
    // Clear any pre-filled content that might come from data-demo or other sources
    // Force clear both value and innerHTML to ensure clean start
    console.log("Clearing answer element to ensure clean start...");
    answerElement.value = "";
    answerElement.innerHTML = "";
    answerElement.textContent = "";
    
    // Handle existing answer (only if there was a legitimate saved answer)
    console.log("🔍 Checking for saved evaluation data:", {
        initialContent: initialContent.substring(0, 200),
        startsWithBrace: initialContent.startsWith("{"),
        length: initialContent.length
    });
    
    if (initialContent !== "" && initialContent.startsWith("{")) {
        try {
            const resp = JSON.parse(initialContent);
            
            // Set the code in the textarea
            if (resp.code) {
                answerElement.value = resp.code;
            }
            
            console.log("📋 Parsed saved answer:", {
                hasCode: !!resp.code,
                codeLength: resp.code?.length || 0,
                hasOutput: !!resp.output,
                outputLength: resp.output?.length || 0,
                hasMarks: resp.marks !== undefined,
                marks: resp.marks,
                maxPossibleMarks: resp.maxPossibleMarks,
                totalTests: resp.totalTests,
                evaluationCompleted: resp.evaluationCompleted,
                percentage: resp.percentage
            });
            
            // If there are previous marks, display them and restore test results
            if (resp.marks !== undefined && resp.marks !== null) {
                console.log("✅ Restoring previous evaluation results with marks:", resp.marks);
                
                // Restore the test results data
                itemInstance._testResults = {
                    totalMarks: resp.marks,
                    totalTests: resp.totalTests || 1,
                    maxPossibleMarks: resp.maxPossibleMarks || resp.marks,
                    testsRun: true
                };
                
                // Display the marks immediately after DOM setup completes
                setTimeout(() => {
                    console.log("🎯 Displaying restored marks");
                    displayMarksForSend(itemInstance, resp.marks, resp.maxPossibleMarks || resp.marks);
                }, 200); // Slightly longer delay to ensure DOM is ready
            } else {
                console.log("❌ No marks found in saved data");
            }
            
        } catch (e) {
            console.log("❌ Error parsing saved answer:", e);
            answerElement.value = "";
        }
    } else if (initialContent !== "") {
        console.log("📝 Found non-JSON content:", {
            value: initialContent.substring(0, 100),
            innerHTML: initialInnerHTML.substring(0, 100)
        });
        
        // Check if it's just plain code (not JSON) - restore as code
        answerElement.value = initialContent;
    }
    
    console.log("Final answer element state:", answerElement.value);
    
    // Create output div
    const itemid = itemInstance.id;
    console.log("Creating output div:", {
        id: "o" + itemid,
        parentId: answerElement.parentNode.id
    });
    
    const outputDiv = document.createElement("div");
    outputDiv.id = "o" + itemid;
    outputDiv.className = "itemContent viewAnswer";
    outputDiv.style.backgroundColor = "white";
    outputDiv.style.width = "50%";
    outputDiv.style.float = "right";
    
    // Insert output div before answer
    console.log("Inserting output div:", {
        before: answerElement.previousSibling?.id,
        after: answerElement.nextSibling?.id
    });
    answerElement.parentNode.insertBefore(outputDiv, answerElement);
    answerElement.style.width = "44%";
    answerElement.id = "t" + itemid;
    
    // Create buttons container
    console.log("Creating buttons container");
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "python-buttons";
    buttonsContainer.style.marginTop = "10px";
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.gap = "10px";
    console.log("Buttons container created:", {
        className: buttonsContainer.className,
        style: buttonsContainer.style.cssText
    });

    // Create Run button
    console.log("Creating Run button");
    const runButton = document.createElement("button");
    runButton.type = "button";
    runButton.className = "run-button";
    runButton.textContent = "Run Code";
    console.log("Run button created:", {
        type: runButton.type,
        className: runButton.className,
        textContent: runButton.textContent
    });
    
    runButton.onclick = async function() {
        console.log("Run button clicked");
        const originalText = this.textContent;
        this.textContent = "Running...";
        this.disabled = true;
        try {
            outputDiv.textContent = "";
            await runPython2(this);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
            
            setTimeout(() => {
                const divMatplotlib = obtenerUltimoDivMatplotlib();
                if (divMatplotlib) {
                    console.log('Found matplotlib div:', divMatplotlib.id);
                    document.body.insertBefore(divMatplotlib, document.getElementsByClassName("banner")[0]);
                }
            }, 100);
        }
    };

    // Create Test button
    console.log("Creating Test button");
    const testButton = document.createElement("button");
    testButton.type = "button";
    testButton.className = "test-button";
    testButton.textContent = "Run Tests";
    console.log("Test button created:", {
        type: testButton.type,
        className: testButton.className,
        textContent: testButton.textContent
    });
    
    testButton.onclick = async function() {
        console.log("Test button clicked");
        const originalText = this.textContent;
        this.textContent = "Testing...";
        this.disabled = true;
        try {
            outputDiv.textContent = "";
            
            // Get tests from evaluation data or fallback
            let tests = getTestsFromEvaluationData(itemInstance);
            
            // Show evaluation status immediately after getting tests
            let evaluationSource = "none";
            let statusMessage = "";
            
            if (tests.length > 0) {
                evaluationSource = "found";
                statusMessage = `✅ Found ${tests.length} tests - ready to run`;
            } else {
                evaluationSource = "none";  
                statusMessage = `❌ No evaluation data found - tests cannot run`;
            }
            
            // Show status with the debug info (this will be set by getTestsFromEvaluationData)
            showEvaluationStatus(itemInstance, statusMessage, tests, [], evaluationSource);
            
            await runPythonTests(this, tests);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    };

    // Add buttons to container
    console.log("Adding buttons to container");
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(testButton);
    console.log("Buttons added to container:", {
        childNodes: buttonsContainer.childNodes.length,
        firstChild: buttonsContainer.firstChild?.className,
        lastChild: buttonsContainer.lastChild?.className
    });
    
    // Add buttons immediately after answer textarea
    console.log("Inserting buttons after answer textarea:", {
        answerId: answerElement.id,
        nextSibling: answerElement.nextSibling?.id
    });
    answerElement.parentNode.insertBefore(buttonsContainer, answerElement.nextSibling);
    console.log("Buttons inserted:", {
        parentNode: buttonsContainer.parentNode?.id,
        previousSibling: buttonsContainer.previousSibling?.id,
        nextSibling: buttonsContainer.nextSibling?.id
    });

    // Add styles
    const styleId = 'python-buttons-style';
    if (!document.getElementById(styleId)) {
        console.log("Adding button styles");
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .python-buttons button {
                padding: 8px 16px;
                border: 1px solid #888;
                border-radius: 4px;
                cursor: pointer;
                font-weight: normal;
                background: #fff;
                color: #222;
                box-shadow: none;
                transition: background-color 0.2s, border-color 0.2s;
            }
            .python-buttons button:hover {
                background: #f0f0f0;
                border-color: #555;
            }
            .run-button, .test-button {
                /* No custom color, use default */
            }
            .run-button:disabled, .test-button:disabled {
                background-color: #eee;
                color: #aaa;
                border-color: #ccc;
                cursor: not-allowed;
            }
            
            /* Evaluation Status Styles */
            .evaluation-status {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #ddd;
                background: #f9f9f9;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
            }
            
            .status-text {
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .status-success {
                color: #10b981;
            }
            
            .status-warning {
                color: #f59e0b;
            }
            
            .status-error {
                color: #ef4444;
            }
            
            .debug-btn {
                padding: 4px 8px;
                font-size: 12px;
                background: #e5e7eb;
                border: 1px solid #d1d5db;
                border-radius: 3px;
                cursor: pointer;
                color: #374151;
            }
            
            .debug-btn:hover {
                background: #d1d5db;
            }
            
            .debug-info {
                margin-top: 8px;
                padding: 8px;
                background: #f3f4f6;
                border: 1px solid #d1d5db;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .debug-info h4 {
                margin: 0 0 8px 0;
                font-size: 13px;
                color: #374151;
            }
            
            .debug-info p {
                margin: 4px 0;
                color: #6b7280;
            }
            
            .debug-info pre {
                margin: 4px 0;
                padding: 8px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 3px;
                font-size: 11px;
                overflow-x: auto;
                max-height: 200px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
        console.log("Styles added to document head");
    }
    
    // Final verification
    console.log("Final DOM state:", {
        answerElement: {
            id: answerElement.id,
            nextSibling: answerElement.nextSibling?.className
        },
        buttonsContainer: {
            parentNode: buttonsContainer.parentNode?.id,
            childNodes: buttonsContainer.childNodes.length
        },
        outputDiv: {
            id: outputDiv.id,
            parentNode: outputDiv.parentNode?.id
        }
    });
    
    console.log("=== setItem_106 END ===", new Date().toISOString());
}

// Function to attempt loading evaluation data for basetype 19 items
async function attemptToLoadEvaluationData(itemInstance, instanceObj) {
    console.log("=== attemptToLoadEvaluationData START ===");
    
    const itemId = instanceObj.iid || instanceObj.id;
    console.log(`📡 Attempting to fetch evaluation data for item ${itemId}`);
    
    // Method 1: Try to fetch from EditionMode endpoint
    try {
        console.log("🔍 Method 1: Trying EditionMode endpoint...");
        const response = await fetch(`../edition/GetItem?iid=${itemId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const editionData = await response.json();
            console.log("📋 EditionMode response:", editionData);
            
            if (editionData && editionData.evaluation) {
                console.log("✅ Found evaluation data in EditionMode endpoint!");
                // Store the evaluation data in instanceObj
                instanceObj.evaluation = editionData.evaluation;
                itemInstance._instanceObj = instanceObj;
                console.log("✅ Evaluation data stored:", editionData.evaluation);
                return true;
            }
        } else {
            console.log("❌ EditionMode endpoint failed:", response.status);
        }
    } catch (e) {
        console.log("❌ EditionMode endpoint error:", e.message);
    }
    
    // Method 2: Try to fetch from main API with evaluation flag
    try {
        console.log("🔍 Method 2: Trying main API with evaluation flag...");
        const response = await fetch(`GetItem?iid=${itemId}&includeEvaluation=true`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const apiData = await response.json();
            console.log("📋 API response:", apiData);
            
            if (apiData && apiData.evaluation) {
                console.log("✅ Found evaluation data in main API!");
                instanceObj.evaluation = apiData.evaluation;
                itemInstance._instanceObj = instanceObj;
                console.log("✅ Evaluation data stored:", apiData.evaluation);
                return true;
            }
        } else {
            console.log("❌ Main API failed:", response.status);
        }
    } catch (e) {
        console.log("❌ Main API error:", e.message);
    }
    
    // Method 3: Try to check if evaluation data is embedded in HTML but not parsed
    try {
        console.log("🔍 Method 3: Searching HTML for embedded evaluation data...");
        
        // Look for evaluation data in script tags or data attributes
        const scriptTags = document.querySelectorAll('script');
        for (const script of scriptTags) {
            const scriptContent = script.textContent || script.innerHTML;
            if (scriptContent.includes(itemId) && scriptContent.includes('evaluation')) {
                console.log("🎯 Found script with item and evaluation:", scriptContent.substring(0, 200));
                
                // Try to extract evaluation data using regex
                const evalMatch = scriptContent.match(/"evaluation"\s*:\s*"([^"]+)"/);
                if (evalMatch) {
                    try {
                        const evalData = JSON.parse(evalMatch[1].replace(/\\"/g, '"'));
                        console.log("✅ Extracted evaluation from script:", evalData);
                        instanceObj.evaluation = JSON.stringify(evalData);
                        itemInstance._instanceObj = instanceObj;
                        return true;
                    } catch (e) {
                        console.log("❌ Failed to parse extracted evaluation:", e);
                    }
                }
            }
        }
        
        // Look for evaluation in itemInstance HTML
        const itemHTML = itemInstance.innerHTML;
        if (itemHTML.includes('evaluation') || itemHTML.includes('data-eval')) {
            console.log("🎯 Found evaluation-related content in item HTML");
            
            // Try to find data-evaluation attributes
            const evalElements = itemInstance.querySelectorAll('[data-evaluation]');
            if (evalElements.length > 0) {
                const evalData = evalElements[0].getAttribute('data-evaluation');
                console.log("✅ Found data-evaluation attribute:", evalData);
                instanceObj.evaluation = evalData;
                itemInstance._instanceObj = instanceObj;
                return true;
            }
        }
    } catch (e) {
        console.log("❌ HTML search error:", e.message);
    }
    
    // Method 4: Show user instructions for server fix
    console.log("❌ All methods failed - evaluation data not accessible");
    console.log("🔧 SERVER FIX NEEDED:");
    console.log("   1. Check server endpoint that loads items for basetype 19");
    console.log("   2. Ensure evaluation field is included in the SQL query");
    console.log("   3. Verify database contains evaluation data for this item");
    console.log("   4. Check if different API endpoints are used for basetype 19 vs 24");
    
    // Create a temporary fix notification
    showServerFixNotification(itemInstance);
    
    return false;
}

// Function to show server fix notification
function showServerFixNotification(itemInstance) {
    const instanceID = itemInstance.getAttribute("id");
    let notificationDiv = document.getElementById("server-fix-" + instanceID);
    
    if (!notificationDiv) {
        notificationDiv = document.createElement("div");
        notificationDiv.id = "server-fix-" + instanceID;
        notificationDiv.className = "server-fix-notification";
        notificationDiv.style.cssText = `
            margin: 10px 0;
            padding: 15px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            color: #856404;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;
        
        notificationDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">🔧 Server Configuration Issue</div>
            <div style="margin-bottom: 8px;">
                This item has <strong>basetype 19</strong> ("Evaluation through JS") but the server is not providing evaluation data.
                The evaluation data exists in EditionMode but is not loaded in regular view.
            </div>
            <div style="font-size: 12px; color: #6c757d;">
                <strong>Fix needed:</strong> Server must include evaluation field for basetype 19 items.<br/>
                <strong>Workaround:</strong> Change item to basetype 24 in EditionMode, or fix server query.
            </div>
        `;
        
        // Insert after the buttons container
        const buttonsContainer = itemInstance.querySelector(".python-buttons");
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.insertBefore(notificationDiv, buttonsContainer.nextSibling);
        } else {
            itemInstance.appendChild(notificationDiv);
        }
    }
}

// Function to parse evaluation data from HTML content (BASETYPE 19 FIX)
function parseEvaluationFromHTML(htmlContent, debugInfo) {
    const tests = [];
    debugInfo.push("🔍 BASETYPE 19: Starting HTML evaluation parsing...");
    
    try {
        // Method 1: Look for EditionMode-style evaluation data in HTML comments or script tags
        const evalCommentMatch = htmlContent.match(/<!--\s*EVALUATION:\s*(\[.*?\])\s*-->/s);
        if (evalCommentMatch) {
            try {
                const evaluationData = JSON.parse(evalCommentMatch[1]);
                debugInfo.push(`✅ Found evaluation in HTML comment: ${evaluationData.length} items`);
                return convertEditionModeToTests(evaluationData, debugInfo);
            } catch (e) {
                debugInfo.push(`❌ Error parsing evaluation comment: ${e.message}`);
            }
        }
        
        // Method 2: Look for evaluation data in script tags
        const scriptMatches = htmlContent.match(/<script[^>]*>(.*?)<\/script>/gs);
        if (scriptMatches) {
            for (const scriptContent of scriptMatches) {
                const evalMatch = scriptContent.match(/evaluation['"]\s*:\s*['"]([^'"]+)['"]/);
                if (evalMatch) {
                    try {
                        const evalData = JSON.parse(evalMatch[1].replace(/\\"/g, '"'));
                        debugInfo.push(`✅ Found evaluation in script tag: ${evalData.length} items`);
                        return convertEditionModeToTests(evalData, debugInfo);
                    } catch (e) {
                        debugInfo.push(`❌ Error parsing script evaluation: ${e.message}`);
                    }
                }
            }
        }
        
        // Method 3: Parse HTML tables that might contain evaluation data
        const tableMatches = htmlContent.match(/<table[^>]*>(.*?)<\/table>/gs);
        if (tableMatches) {
            for (const tableContent of tableMatches) {
                const tests = parseEvaluationTable(tableContent, debugInfo);
                if (tests.length > 0) {
                    debugInfo.push(`✅ Found evaluation in HTML table: ${tests.length} tests`);
                    return tests;
                }
            }
        }
        
        // Method 4: Look for evaluation patterns in div elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Check for elements with evaluation-related classes or data attributes
        const evalElements = tempDiv.querySelectorAll('[class*="eval"], [class*="test"], [data-eval], [data-test]');
        if (evalElements.length > 0) {
            debugInfo.push(`🎯 Found ${evalElements.length} elements with evaluation attributes`);
            
            for (const element of evalElements) {
                const evalData = element.getAttribute('data-eval') || element.getAttribute('data-test');
                if (evalData) {
                    try {
                        const parsed = JSON.parse(evalData);
                        if (Array.isArray(parsed)) {
                            debugInfo.push(`✅ Found evaluation in element attribute: ${parsed.length} items`);
                            return convertEditionModeToTests(parsed, debugInfo);
                        }
                    } catch (e) {
                        debugInfo.push(`❌ Error parsing element evaluation: ${e.message}`);
                    }
                }
            }
        }
        
        // Method 5: Extract function examples from text content and create tests
        const functionExamples = extractFunctionExamples(htmlContent, debugInfo);
        if (functionExamples.length > 0) {
            debugInfo.push(`✅ Created tests from function examples: ${functionExamples.length} tests`);
            return functionExamples;
        }
        
        // Method 6: Look for EditionMode evaluation format in HTML text
        const evaluationMatches = htmlContent.match(/input['"]\s*:\s*['"]([^'"]+)['"][^}]*output['"]\s*:\s*['"]([^'"]+)['"]/g);
        if (evaluationMatches) {
            const extractedTests = [];
            let testId = 1;
            
            for (const match of evaluationMatches) {
                const inputMatch = match.match(/input['"]\s*:\s*['"]([^'"]+)['"]/);
                const outputMatch = match.match(/output['"]\s*:\s*['"]([^'"]+)['"]/);
                
                if (inputMatch && outputMatch) {
                    const input = inputMatch[1];
                    const output = outputMatch[1];
                    
                    extractedTests.push({
                        id: testId++,
                        description: `Test: ${input}`,
                        test: `${input}\nassert str(result).strip() == "${output}", f"Expected '${output}', got '{result}'"`
                    });
                }
            }
            
            if (extractedTests.length > 0) {
                debugInfo.push(`✅ Created tests from evaluation text patterns: ${extractedTests.length} tests`);
                return extractedTests;
            }
        }
        
        // Method 7: Parse embedded evaluation data from HTML elements (handles the "<figure st..." error)
        const tests = parseEmbeddedEvaluationData(htmlContent, debugInfo);
        if (tests.length > 0) {
            debugInfo.push(`✅ Found embedded evaluation data: ${tests.length} tests`);
            return tests;
        }
        
        debugInfo.push("❌ No evaluation data found in HTML content");
        
    } catch (e) {
        debugInfo.push(`❌ Error in HTML evaluation parsing: ${e.message}`);
        console.log("Error parsing HTML evaluation:", e);
    }
    
    return tests;
}

// Helper function to parse evaluation from HTML tables
function parseEvaluationTable(tableContent, debugInfo) {
    const tests = [];
    
    try {
        // Look for table rows with Input/Output columns
        const rowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs);
        if (rowMatches) {
            let testId = 1;
            
            for (const row of rowMatches) {
                const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/gs);
                if (cellMatches && cellMatches.length >= 2) {
                    // Extract text content from cells
                    const input = cellMatches[0].replace(/<[^>]*>/g, '').trim();
                    const output = cellMatches[1].replace(/<[^>]*>/g, '').trim();
                    
                    // Skip header rows
                    if (input.toLowerCase().includes('input') || output.toLowerCase().includes('output')) {
                        continue;
                    }
                    
                    if (input && output) {
                        tests.push({
                            id: testId++,
                            description: `Test: ${input}`,
                            test: `${input}\nassert str(result).strip() == "${output}", f"Expected '${output}', got '{result}'"`
                        });
                    }
                }
            }
        }
    } catch (e) {
        debugInfo.push(`❌ Error parsing table: ${e.message}`);
    }
    
    return tests;
}

// Helper function to extract function examples from text and create tests
function extractFunctionExamples(htmlContent, debugInfo) {
    const tests = [];
    
    try {
        // Remove HTML tags for text analysis
        const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
        
        // Pattern 1: function_name(args) → result
        const arrowPattern = /(\w+)\s*\(\s*([^)]*)\s*\)\s*[→\->]\s*([^\s,;.]+)/g;
        let match;
        let testId = 1;
        
        while ((match = arrowPattern.exec(textContent)) !== null) {
            const [fullMatch, functionName, args, expectedResult] = match;
            
            // Clean up the expected result
            const cleanResult = expectedResult.trim().replace(/['"]/g, '');
            
            // Create test code
            let testCode;
            if (args.trim() === '') {
                testCode = `result = ${functionName}()\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            } else {
                testCode = `result = ${functionName}(${args})\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            }
            
            tests.push({
                id: testId++,
                description: `Test: ${functionName}(${args}) → ${cleanResult}`,
                test: testCode
            });
            
            debugInfo.push(`🎯 Extracted example: ${functionName}(${args}) → ${cleanResult}`);
        }
        
        // Pattern 2: function_name(args) should return result
        const shouldReturnPattern = /(\w+)\s*\(\s*([^)]*)\s*\)\s*should\s+return\s+([^\s,;.]+)/gi;
        
        while ((match = shouldReturnPattern.exec(textContent)) !== null) {
            const [fullMatch, functionName, args, expectedResult] = match;
            const cleanResult = expectedResult.trim().replace(/['"]/g, '');
            
            let testCode;
            if (args.trim() === '') {
                testCode = `result = ${functionName}()\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            } else {
                testCode = `result = ${functionName}(${args})\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            }
            
            tests.push({
                id: testId++,
                description: `Test: ${functionName}(${args}) should return ${cleanResult}`,
                test: testCode
            });
            
            debugInfo.push(`🎯 Extracted "should return": ${functionName}(${args}) → ${cleanResult}`);
        }
        
        // Pattern 3: Example: function_name(args) returns result
        const examplePattern = /example[:\s]+(\w+)\s*\(\s*([^)]*)\s*\)\s*(?:returns?|gives?|outputs?)\s*([^\s,;.]+)/gi;
        
        while ((match = examplePattern.exec(textContent)) !== null) {
            const [fullMatch, functionName, args, expectedResult] = match;
            const cleanResult = expectedResult.trim().replace(/['"]/g, '');
            
            let testCode;
            if (args.trim() === '') {
                testCode = `result = ${functionName}()\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            } else {
                testCode = `result = ${functionName}(${args})\nassert str(result) == "${cleanResult}", f"Expected '${cleanResult}', got '{result}'"`;
            }
            
            tests.push({
                id: testId++,
                description: `Example: ${functionName}(${args}) → ${cleanResult}`,
                test: testCode
            });
            
            debugInfo.push(`🎯 Extracted example: ${functionName}(${args}) → ${cleanResult}`);
        }
        
    } catch (e) {
        debugInfo.push(`❌ Error extracting function examples: ${e.message}`);
    }
    
    return tests;
}

// Helper function to convert EditionMode evaluation format to test format
function convertEditionModeToTests(evaluationData, debugInfo) {
    const tests = [];
    
    try {
        if (Array.isArray(evaluationData)) {
            evaluationData.forEach((evaluation, index) => {
                if (evaluation.input && evaluation.output) {
                    const input = evaluation.input.trim();
                    const expectedOutput = evaluation.output.trim();
                    
                    let testCode;
                    if (input.includes('(') && input.includes(')')) {
                        // Function call
                        testCode = `${input}\nassert str(result).strip() == "${expectedOutput}", f"Expected '${expectedOutput}', got '{result}'"`;
                    } else {
                        // Direct code execution
                        testCode = `${input}\nassert str(result).strip() == "${expectedOutput}", f"Expected '${expectedOutput}', got '{result}'"`;
                    }
                    
                    tests.push({
                        id: index + 1,
                        description: evaluation.commentTrue || `Test ${index + 1}: ${input}`,
                        test: testCode,
                        mark: evaluation.mark || 1
                    });
                    
                    debugInfo.push(`✅ Converted evaluation ${index + 1}: ${input} → ${expectedOutput}`);
                }
            });
        }
    } catch (e) {
        debugInfo.push(`❌ Error converting EditionMode evaluation: ${e.message}`);
    }
    
    return tests;
}

// Helper function to parse embedded evaluation data from HTML elements (handles specific basetype 19 format)
function parseEmbeddedEvaluationData(htmlContent, debugInfo) {
    const tests = [];
    
    try {
        debugInfo.push("🔍 Method 7: Parsing embedded evaluation data...");
        
        // Create a temporary DOM to parse HTML safely
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Look for figure elements, div elements, or any elements that might contain evaluation data
        const allElements = tempDiv.querySelectorAll('*');
        
        for (const element of allElements) {
            // Check text content for evaluation patterns
            const textContent = element.textContent || '';
            const innerHTML = element.innerHTML || '';
            
            // Pattern 1: Look for JSON-like evaluation data in text content
            const jsonPattern = /\[\s*\{[^}]*["']input["'][^}]*["']output["'][^}]*\}\s*\]/g;
            const jsonMatch = textContent.match(jsonPattern);
            
            if (jsonMatch) {
                for (const match of jsonMatch) {
                    try {
                        // Clean up the match and try to parse as JSON
                        const cleanMatch = match.replace(/'/g, '"').replace(/\s+/g, ' ');
                        const evalData = JSON.parse(cleanMatch);
                        
                        if (Array.isArray(evalData)) {
                            const convertedTests = convertEditionModeToTests(evalData, debugInfo);
                            if (convertedTests.length > 0) {
                                debugInfo.push(`✅ Found JSON evaluation in element: ${convertedTests.length} tests`);
                                return convertedTests;
                            }
                        }
                    } catch (e) {
                        debugInfo.push(`❌ Error parsing JSON evaluation: ${e.message}`);
                    }
                }
            }
            
            // Pattern 2: Look for individual input/output pairs in element content
            if (textContent.includes('input') && textContent.includes('output')) {
                const inputOutputTests = extractInputOutputPairs(textContent, debugInfo);
                if (inputOutputTests.length > 0) {
                    tests.push(...inputOutputTests);
                }
            }
            
            // Pattern 3: Check data attributes for evaluation info
            for (const attr of element.attributes) {
                if (attr.name.includes('eval') || attr.name.includes('test')) {
                    try {
                        const attrValue = attr.value;
                        if (attrValue.startsWith('[') || attrValue.startsWith('{')) {
                            const parsed = JSON.parse(attrValue);
                            const convertedTests = convertEditionModeToTests(Array.isArray(parsed) ? parsed : [parsed], debugInfo);
                            if (convertedTests.length > 0) {
                                debugInfo.push(`✅ Found evaluation in attribute ${attr.name}: ${convertedTests.length} tests`);
                                return convertedTests;
                            }
                        }
                    } catch (e) {
                        debugInfo.push(`❌ Error parsing attribute ${attr.name}: ${e.message}`);
                    }
                }
            }
        }
        
        // Pattern 4: Look for specific EditionMode HTML structure
        const evalSections = tempDiv.querySelectorAll('.eval, .evaluation, [class*="test"]');
        for (const section of evalSections) {
            const sectionTests = extractTestsFromEvalSection(section, debugInfo);
            if (sectionTests.length > 0) {
                tests.push(...sectionTests);
            }
        }
        
    } catch (e) {
        debugInfo.push(`❌ Error in parseEmbeddedEvaluationData: ${e.message}`);
    }
    
    return tests;
}

// Helper function to extract input/output pairs from text content
function extractInputOutputPairs(textContent, debugInfo) {
    const tests = [];
    
    try {
        // Pattern: input: "something", output: "result"
        const pairPattern = /input\s*:\s*["']([^"']+)["'][^,]*,\s*output\s*:\s*["']([^"']+)["']/gi;
        let match;
        let testId = 1;
        
        while ((match = pairPattern.exec(textContent)) !== null) {
            const [fullMatch, input, output] = match;
            
            tests.push({
                id: testId++,
                description: `Test: ${input}`,
                test: `${input}\nassert str(result).strip() == "${output}", f"Expected '${output}', got '{result}'"`
            });
            
            debugInfo.push(`🎯 Extracted input/output pair: ${input} → ${output}`);
        }
        
        // Alternative pattern: "input" -> "output"
        const arrowPairPattern = /["']([^"']+)["']\s*->\s*["']([^"']+)["']/g;
        
        while ((match = arrowPairPattern.exec(textContent)) !== null) {
            const [fullMatch, input, output] = match;
            
            // Only add if it looks like code (contains parentheses or is a function call)
            if (input.includes('(') || input.includes('=')) {
                tests.push({
                    id: testId++,
                    description: `Test: ${input}`,
                    test: `${input}\nassert str(result).strip() == "${output}", f"Expected '${output}', got '{result}'"`
                });
                
                debugInfo.push(`🎯 Extracted arrow pair: ${input} → ${output}`);
            }
        }
        
    } catch (e) {
        debugInfo.push(`❌ Error extracting input/output pairs: ${e.message}`);
    }
    
    return tests;
}

// Helper function to extract tests from evaluation sections
function extractTestsFromEvalSection(sectionElement, debugInfo) {
    const tests = [];
    
    try {
        const textContent = sectionElement.textContent || '';
        const innerHTML = sectionElement.innerHTML || '';
        
        // Look for input and output fields or labels
        const inputs = sectionElement.querySelectorAll('input[name*="input"], textarea[name*="input"], [class*="input"]');
        const outputs = sectionElement.querySelectorAll('input[name*="output"], textarea[name*="output"], [class*="output"]');
        
        // If we find matching input/output elements, extract their values
        const minLength = Math.min(inputs.length, outputs.length);
        for (let i = 0; i < minLength; i++) {
            const inputValue = inputs[i].value || inputs[i].textContent || '';
            const outputValue = outputs[i].value || outputs[i].textContent || '';
            
            if (inputValue.trim() && outputValue.trim()) {
                tests.push({
                    id: tests.length + 1,
                    description: `Test: ${inputValue}`,
                    test: `${inputValue}\nassert str(result).strip() == "${outputValue}", f"Expected '${outputValue}', got '{result}'"`
                });
                
                debugInfo.push(`🎯 Extracted from eval section: ${inputValue} → ${outputValue}`);
            }
        }
        
    } catch (e) {
        debugInfo.push(`❌ Error extracting from eval section: ${e.message}`);
    }
    
    return tests;
}

// Function to convert EditionMode evaluation data to test format (Enhanced version from clonedx)
function getTestsFromEvaluationData(itemInstance) {
    console.log("=== getTestsFromEvaluationData START ===");
    
    const instanceObj = itemInstance._instanceObj;
    let tests = [];
    let statusMessage = "";
    let debugInfo = [];
    
    debugInfo.push("Starting test search...");
    
    // Method 1: Try to get from data-tests attribute
    const problemElem = itemInstance.querySelector(".problem");
    debugInfo.push(`Found .problem element: ${!!problemElem}`);
    
    if (problemElem) {
        const testCases = problemElem.getAttribute("data-tests");
        debugInfo.push(`Found data-tests attribute: ${!!testCases}`);
        debugInfo.push(`data-tests content length: ${testCases?.length || 0}`);
        
        if (testCases) {
            try {
                tests = JSON.parse(testCases);
                console.log("✅ Found tests in data-tests attribute:", tests.length);
                statusMessage = `✅ Tests loaded from data-tests attribute (${tests.length} tests)`;
                return tests;
            } catch (e) {
                debugInfo.push(`Error parsing data-tests: ${e.message}`);
                console.log("Error parsing data-tests attribute:", e);
            }
        }
        
        // Method 2: Try data-test-cases attribute (simple format)
        const testCasesSimple = problemElem.getAttribute("data-test-cases");
        debugInfo.push(`Found data-test-cases attribute: ${!!testCasesSimple}`);
        
        if (testCasesSimple) {
            try {
                const testPairs = testCasesSimple.split('|');
                tests = testPairs.map((pair, index) => {
                    const [functionCall, expectedResult] = pair.split(':');
                    if (functionCall && expectedResult !== undefined) {
                        return {
                            id: index + 1,
                            description: `Test ${functionCall.trim()}`,
                            test: `result = ${functionCall.trim()}\nassert result == ${expectedResult.trim()}, f"Expected ${expectedResult.trim()}, got {result}"`
                        };
                    }
                    return null;
                }).filter(test => test !== null);
                
                if (tests.length > 0) {
                    console.log("✅ Generated tests from data-test-cases:", tests.length);
                    statusMessage = `✅ Tests generated from data-test-cases attribute (${tests.length} tests)`;
                    return tests;
                }
            } catch (e) {
                debugInfo.push(`Error processing data-test-cases: ${e.message}`);
                console.log("Error processing data-test-cases:", e);
            }
        }
    }
    
    // Method 3: Try parsing HTML content from itemcontent (ENHANCED FOR BASETYPE 19)
    if (instanceObj && instanceObj.itemcontent) {
        debugInfo.push("Parsing itemcontent HTML...");
        try {
            console.log("🔍 Raw itemcontent for basetype 19:", instanceObj.itemcontent.substring(0, 500));
            
            // BASETYPE 19 FIX: Parse evaluation data from HTML content
            tests = parseEvaluationFromHTML(instanceObj.itemcontent, debugInfo);
            
            if (tests.length > 0) {
                console.log("✅ Successfully parsed evaluation data from HTML:", tests.length);
                statusMessage = `✅ Tests extracted from HTML content (${tests.length} tests)`;
                return tests;
            }
            
            // Fallback to original method
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = instanceObj.itemcontent;
            
            const problemElementFromContent = tempDiv.querySelector('.problem');
            debugInfo.push(`Found .problem in itemcontent: ${!!problemElementFromContent}`);
            
            if (problemElementFromContent) {
                const testCasesFromContent = problemElementFromContent.getAttribute("data-tests");
                if (testCasesFromContent) {
                    try {
                        tests = JSON.parse(testCasesFromContent);
                        console.log("✅ Found tests in itemcontent data-tests:", tests.length);
                        statusMessage = `✅ Tests loaded from itemcontent data-tests (${tests.length} tests)`;
                        return tests;
                    } catch (e) {
                        debugInfo.push(`Error parsing itemcontent data-tests: ${e.message}`);
                    }
                }
                
                const testCasesSimpleFromContent = problemElementFromContent.getAttribute("data-test-cases");
                if (testCasesSimpleFromContent) {
                    try {
                        const testPairs = testCasesSimpleFromContent.split('|');
                        tests = testPairs.map((pair, index) => {
                            const [functionCall, expectedResult] = pair.split(':');
                            if (functionCall && expectedResult !== undefined) {
                                return {
                                    id: index + 1,
                                    description: `Test ${functionCall.trim()}`,
                                    test: `result = ${functionCall.trim()}\nassert result == ${expectedResult.trim()}, f"Expected ${expectedResult.trim()}, got {result}"`
                                };
                            }
                            return null;
                        }).filter(test => test !== null);
                        
                        if (tests.length > 0) {
                            console.log("✅ Generated tests from itemcontent data-test-cases:", tests.length);
                            statusMessage = `✅ Tests generated from itemcontent data-test-cases (${tests.length} tests)`;
                            return tests;
                        }
                    } catch (e) {
                        debugInfo.push(`Error processing itemcontent data-test-cases: ${e.message}`);
                    }
                }
            }
        } catch (e) {
            debugInfo.push(`Error parsing itemcontent HTML: ${e.message}`);
        }
    }
    
    // Method 4: Try to get evaluation data from instanceObj properties (ENHANCED SEARCH)
    debugInfo.push("Searching instanceObj properties...");
    if (instanceObj) {
        const searchProperties = ['evaluation', 'evaluations', 'eval', 'tests', 'answer', 'solution', 'content', 'itemcontent', 'data', 'metadata', 'config', 'settings'];
        debugInfo.push(`Searching properties: ${searchProperties.join(', ')}`);
        debugInfo.push(`All instanceObj keys: ${Object.keys(instanceObj).join(', ')}`);
        
        for (const prop of searchProperties) {
            if (instanceObj[prop]) {
                debugInfo.push(`Found data in ${prop} property`);
                console.log(`🔍 Found evaluation data in instanceObj.${prop}`);
                let evaluationData;
                
                try {
                    // Parse evaluation data if it's a string
                    if (typeof instanceObj[prop] === 'string') {
                        evaluationData = JSON.parse(instanceObj[prop]);
                    } else {
                        evaluationData = instanceObj[prop];
                    }
                    
                    console.log("📋 Parsed evaluation data:", evaluationData);
                    debugInfo.push(`Parsed evaluation data type: ${typeof evaluationData}`);
                    
                    // Convert EditionMode evaluation format to test format
                    if (Array.isArray(evaluationData)) {
                        tests = evaluationData.map((evaluation, index) => {
                            let testCode = '';
                            
                            // Handle different evaluation types
                            if (evaluation.input && evaluation.output) {
                                // Build test code that runs the input and checks the output
                                const input = evaluation.input.trim();
                                const expectedOutput = evaluation.output.trim();
                                
                                // If input contains function calls, use that directly
                                if (input.includes('(') && input.includes(')')) {
                                    testCode = `
${input}
result = locals().get('result', None)
expected = "${expectedOutput}"
if str(result).strip() == expected:
    pass  # Test passed
else:
    assert False, f"Expected '{expected}', got '{result}'"`;
                                } else {
                                    // Simple variable assignment test
                                    testCode = `
${input}
expected = "${expectedOutput}"
assert str(result).strip() == expected, f"Expected '{expected}', got '{result}'"`;
                                }
                            } else if (evaluation.input) {
                                // Just run the input code and assume it contains assertions
                                testCode = evaluation.input;
                            } else {
                                // Skip malformed evaluations
                                return null;
                            }
                            
                            return {
                                id: index + 1,
                                description: evaluation.commentTrue || `Test ${index + 1}`,
                                test: testCode.trim(),
                                mark: evaluation.mark || 1
                            };
                        }).filter(test => test !== null); // Remove null tests
                        
                        if (tests.length > 0) {
                            console.log("✅ Converted evaluations to tests:", tests.length);
                            statusMessage = `✅ Tests converted from instanceObj.${prop} (${tests.length} tests)`;
                            return tests;
                        }
                    }
                } catch (e) {
                    debugInfo.push(`Error processing ${prop}: ${e.message}`);
                    console.log(`Error processing evaluation data from ${prop}:`, e);
                }
            }
        }
    }
    
    // Method 5: Extract examples from HTML content as fallback
    if (instanceObj && instanceObj.itemcontent && tests.length === 0) {
        debugInfo.push("Attempting to extract examples from HTML content...");
        try {
            const content = instanceObj.itemcontent;
            const examplePattern = /(\w+)\(([^)]+)\)\s*→\s*([^<\n\r]+)/g;
            let match;
            const extractedTests = [];
            let testId = 1;
            
            while ((match = examplePattern.exec(content)) !== null) {
                const [fullMatch, functionName, args, expectedResult] = match;
                const cleanResult = expectedResult.trim().replace(/[<>]/g, '');
                const testCode = `result = ${functionName}(${args})\nassert result == ${cleanResult}, f"Expected ${cleanResult}, got {result}"`;
                
                extractedTests.push({
                    id: testId++,
                    description: `Test: ${functionName}(${args}) → ${cleanResult}`,
                    test: testCode
                });
                
                console.log(`📝 Extracted: ${functionName}(${args}) → ${cleanResult}`);
            }
            
            if (extractedTests.length > 0) {
                tests = extractedTests;
                console.log("✅ Extracted tests from HTML examples:", tests.length);
                statusMessage = `✅ Tests extracted from HTML examples (${tests.length} tests)`;
                return tests;
            }
        } catch (e) {
            debugInfo.push(`Error extracting from HTML: ${e.message}`);
        }
    }
    
    // No evaluation data found
    if (tests.length === 0) {
        console.log("⚠️ No evaluation data found anywhere");
        console.log("🔍 Diagnosis:");
        console.log("   - instanceObj.evaluation:", instanceObj?.evaluation || "MISSING");
        console.log("   - instanceObj keys:", Object.keys(instanceObj || {}));
        console.log("   - itemtypeid:", instanceObj?.itemtypeid);
        console.log("   - basetype:", instanceObj?.basetype);
        
        // Provide specific guidance based on basetype
        if (instanceObj?.basetype == 19) {
            statusMessage = "🔧 Basetype 19 Server Issue: Evaluation data exists but server not loading it";
            debugInfo.push("❌ BASETYPE 19 ISSUE: Server not providing evaluation data");
            debugInfo.push("✅ Evaluation data exists in EditionMode but not loaded in regular view");
            debugInfo.push("🔧 SOLUTION: Server must include evaluation field for basetype 19 items");
            debugInfo.push("🔄 WORKAROUND: Change item to basetype 24 in EditionMode");
            debugInfo.push("📡 ATTEMPTED: Automatic evaluation data fetching from server endpoints");
        } else {
            statusMessage = "⚠️ No evaluation data found - tests will not run";
            debugInfo.push("❌ CRITICAL: No evaluation data found in any location");
            debugInfo.push("📋 This item needs evaluation data created in EditionMode");
            debugInfo.push("🔧 Or check if the server is loading evaluation data properly");
        }
    }
    
    console.log("=== getTestsFromEvaluationData END ===", tests.length, "tests");
    return tests;
}

// Function to show evaluation status with debug information
function showEvaluationStatus(itemInstance, statusMessage, tests, debugInfo, source) {
    const instanceID = itemInstance.getAttribute("id");
    let statusDiv = document.getElementById("eval-status-" + instanceID);
    
    if (!statusDiv) {
        statusDiv = document.createElement("div");
        statusDiv.id = "eval-status-" + instanceID;
        statusDiv.className = "evaluation-status";
        
        // Insert after the buttons
        const buttonsContainer = itemInstance.querySelector(".python-buttons");
        if (buttonsContainer && buttonsContainer.parentNode) {
            buttonsContainer.parentNode.insertBefore(statusDiv, buttonsContainer.nextSibling);
        }
    }
    
    const debugToggle = document.createElement("button");
    debugToggle.type = "button";
    debugToggle.className = "debug-btn";
    debugToggle.textContent = "Debug Info";
    debugToggle.onclick = () => toggleEvaluationDebug(instanceID);
    
    statusDiv.innerHTML = `
        <div class="status-text">${statusMessage}</div>
        <div id="debug-info-${instanceID}" class="debug-info" style="display: none;">
            <h4>Debug Information:</h4>
            <p><strong>Source:</strong> ${source}</p>
            <p><strong>Test Count:</strong> ${tests.length}</p>
            <p><strong>Debug Log:</strong></p>
            <ul>${debugInfo.map(info => `<li>• ${info}</li>`).join('')}</ul>
            <p><strong>Tests:</strong></p>
            <pre>${JSON.stringify(tests, null, 2)}</pre>
        </div>
    `;
    
    statusDiv.appendChild(debugToggle);
}

function toggleEvaluationDebug(instanceID) {
    const debugDiv = document.getElementById("debug-info-" + instanceID);
    if (debugDiv) {
        debugDiv.style.display = debugDiv.style.display === "none" ? "block" : "none";
    }
}

function obtenerUltimoDivMatplotlib() {
    var divsEnBody = document.body.querySelectorAll('body > div');
    
    if (divsEnBody.length > 0) {
        var ultimoDiv = divsEnBody[divsEnBody.length - 1];
        
        if (ultimoDiv.id && ultimoDiv.id.startsWith('matplotlib')) {
            return ultimoDiv;
        }
    }
    
    return null;
}

async function runPython2(button) {
  var pyodide = await pyodideReadyPromise;
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackage("matplotlib");
  //var code = document.getElementById("python-code").value;

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;

  // Redirige stdout
  //let outputDiv = document.getElementById("console-output");
  let outputDiv = document.getElementById("o" + instanceID);
  outputDiv.textContent = "";

  pyodide.setStdout({
    batched: (s) => outputDiv.textContent += s,
  });

  pyodide.setStderr({
    batched: (s) => outputDiv.textContent += s,
  });

  try {
    await pyodide.runPythonAsync(pyCode);
  } catch (err) {
    outputDiv.textContent += "\n" + err;
  }
}

function displayMarksForSend(itemInstance, totalMarks, maxPossibleMarks) {
    // Display marks immediately when Send button is clicked or when restoring from saved data
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    
    console.log("🎯 displayMarksForSend called:", {
        instanceID,
        totalMarks,
        maxPossibleMarks,
        outputDivExists: !!outputDiv
    });
    
    // Create or update marks display
    let marksDiv = document.getElementById("marks-" + instanceID);
    if (!marksDiv) {
        marksDiv = document.createElement("div");
        marksDiv.id = "marks-" + instanceID;
        marksDiv.className = "marks-summary";
        marksDiv.style.cssText = `
            margin: 10px 0;
            padding: 15px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
            font-weight: bold;
            color: #155724;
            font-size: 16px;
            clear: both;
        `;
        
        // Insert after the output div if it exists, otherwise after the buttons
        if (outputDiv && outputDiv.parentNode) {
            outputDiv.parentNode.insertBefore(marksDiv, outputDiv.nextSibling);
        } else {
            // Fallback: insert after buttons container
            const buttonsContainer = itemInstance.querySelector(".python-buttons");
            if (buttonsContainer && buttonsContainer.parentNode) {
                buttonsContainer.parentNode.insertBefore(marksDiv, buttonsContainer.nextSibling);
            } else {
                // Last resort: append to item instance
                itemInstance.appendChild(marksDiv);
            }
        }
        
        console.log("✅ Created new marks div:", marksDiv.id);
    } else {
        console.log("♻️ Using existing marks div:", marksDiv.id);
    }
    
    // Show the final marks
    const percentage = Math.round((totalMarks / maxPossibleMarks) * 100);
    marksDiv.innerHTML = `
        <div>✅ <strong>Evaluation Complete!</strong></div>
        <div>Score: <strong>${totalMarks}/${maxPossibleMarks}</strong> marks (${percentage}%)</div>
    `;
    
    // Make sure it's visible
    marksDiv.style.display = "block";
    
    console.log(`🎉 Marks displayed: ${totalMarks}/${maxPossibleMarks} (${percentage}%)`);
}

function saveAnswer_106(button) {
    var respObject = {};
    itemInstance = button.closest(".itemInstance");
    pyCode = itemInstance.querySelector(".answer").value;
    respObject.code = pyCode;

    // Get the output div and its content
    let outputDiv = document.getElementById("o" + itemInstance.id);
    if (outputDiv) {
        output = outputDiv.textContent;
        respObject.output = output;
    } else {
        respObject.output = "";
    }
    
    // Include evaluation data if tests were run
    if (itemInstance._testResults) {
        const { totalMarks, totalTests, maxPossibleMarks } = itemInstance._testResults;
        respObject.marks = totalMarks;
        respObject.totalTests = totalTests;
        respObject.maxPossibleMarks = maxPossibleMarks;
        respObject.percentage = Math.round((totalMarks / maxPossibleMarks) * 100);
        respObject.evaluationCompleted = true;
        
        // Display marks immediately when Send is clicked
        displayMarksForSend(itemInstance, totalMarks, maxPossibleMarks);
    } else {
        // No tests run yet
        respObject.evaluationCompleted = false;
        respObject.message = "Tests not run - click 'Run Tests' first for evaluation";
    }
    
    // Don't modify the textarea - saveSendAnswer calls this function directly
    // and uses the return value. The textarea should only contain user's code.
    console.log("Returning evaluation data:", respObject);
    return JSON.stringify(respObject);
}

async function runPythonTests(button, tests) {
    const itemInstance = button.closest(".itemInstance");
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    const pyCode = itemInstance.querySelector(".answer").value;
    
    // Check if tests are available
    if (!tests || tests.length === 0) {
        outputDiv.textContent = "❌ NO EVALUATION DATA FOUND\n\n🔍 DIAGNOSIS:\ninstanceObj.evaluation is missing or empty\n\n🔧 REQUIRED ACTION:\n\n1. 📝 Open this item in EditionMode\n2. ➕ Create evaluation data (input/output test cases)\n3. 💾 Save the item with evaluation data\n4. 🔄 Refresh this page\n5. 🧪 Verify instanceObj.evaluation contains test data\n\n⚠️  IMPORTANT: Tests cannot run without proper evaluation data from EditionMode.\n\n👆 Check the Debug Info below for technical details.";
        return;
    }
    
    // Don't show marks during Run Tests - only during Send

    // Clear previous output
    outputDiv.textContent = "";
    
    const pyodide = await pyodideReadyPromise;
    let totalMarks = 0;
    let maxPossibleMarks = 0;
    
    // Set up stdout/stderr redirection for first test only
    pyodide.setStdout({
        batched: (s) => outputDiv.textContent += s,
    });
    pyodide.setStderr({
        batched: (s) => outputDiv.textContent += s,
    });
    
    try {
        // Calculate total possible marks
        maxPossibleMarks = tests.reduce((sum, test) => sum + (test.mark || 1), 0);
        
        // Run first test immediately
        let firstTestPassed = false;
        const firstTestMark = tests[0].mark || 1;
        try {
            await pyodide.runPythonAsync(pyCode);
            await pyodide.runPythonAsync(tests[0].test);
            totalMarks += firstTestMark;
            firstTestPassed = true;
        } catch (error) {
            outputDiv.textContent += `\n${error}`;
        }
        // Don't show marks - just continue testing silently
        
        // Disable output for remaining tests by setting null handlers
        pyodide.setStdout({
            batched: (s) => {}, // Ignore output
        });
        pyodide.setStderr({
            batched: (s) => {}, // Ignore errors
        });
        
        // Run remaining tests asynchronously (do not update outputDiv)
        if (tests.length > 1) {
            const remainingTests = tests.slice(1);
            for (const test of remainingTests) {
                const testMark = test.mark || 1;
                try {
                    await pyodide.runPythonAsync(pyCode);
                    await pyodide.runPythonAsync(test.test);
                    totalMarks += testMark;
                } catch (error) {
                    // Do not update outputDiv, just ignore or log
                    console.log(`Test ${test.id} failed:`, error);
                }
                // Don't show marks during testing - only store results
            }
        }
    } catch (error) {
        outputDiv.textContent += `\nError running tests: ${error}`;
    }
    
    // Store test results for Send button
    itemInstance._testResults = {
        totalMarks: totalMarks,
        totalTests: tests.length,
        maxPossibleMarks: maxPossibleMarks,
        testsRun: true
    };
    
    // Show completion message without revealing marks
    outputDiv.textContent += `\n\n✅ Tests completed successfully!\n📝 Click 'Send' to submit your answer and see your score.`;
}

// Add styles only if they don't exist
(function() {
    const styleId = 'python-test-result-style-v2';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .test-status {
                margin: 10px 0;
                padding: 8px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            .test-list {
                margin-top: 10px;
            }
            .test-result {
                margin: 5px 0;
                padding: 5px;
                font-family: monospace;
                white-space: pre-wrap;
            }
        `;
        document.head.appendChild(style);
    }
})();
